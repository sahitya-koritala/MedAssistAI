import os
import time
import json
from groq import Groq

# Language names mapping
LANGUAGES = {
    "ar": "Arabic",
    "as": "Assamese",
    "bn": "Bengali",
    "de": "German",
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "gu": "Gujarati",
    "hi": "Hindi",
    "it": "Italian",
    "ja": "Japanese",
    "kn": "Kannada",
    "ko": "Korean",
    "ml": "Malayalam",
    "mr": "Marathi",
    "or": "Odia",
    "pa": "Punjabi",
    "pt": "Portuguese",
    "ru": "Russian",
    "ta": "Tamil",
    "te": "Telugu",
    "ur": "Urdu",
    "zh": "Chinese"
}

def sync_translations():
    locales_dir = os.path.join(os.path.dirname(__file__), "frontend", "src", "locales")
    en_file_path = os.path.join(locales_dir, "en", "common.json")
    
    with open(en_file_path, 'r', encoding='utf-8') as f:
        en_data = json.load(f)

    # Initialize Groq client
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        from dotenv import load_dotenv
        load_dotenv(os.path.join(os.path.dirname(__file__), "flask_backend", ".env"))
        api_key = os.environ.get("GROQ_API_KEY")

    if not api_key:
        print("GROQ_API_KEY is not set.")
        return

    client = Groq(api_key=api_key)

    def extract_missing_keys(source, target, path=""):
        missing = {}
        for k, v in source.items():
            if isinstance(v, dict):
                sub_missing = extract_missing_keys(v, target.get(k, {}), path + k + ".")
                if sub_missing:
                    missing[k] = sub_missing
            else:
                if k not in target:
                    missing[k] = v
        return missing

    def apply_translations(target, translations):
        for k, v in translations.items():
            if isinstance(v, dict):
                if k not in target:
                    target[k] = {}
                apply_translations(target[k], v)
            else:
                target[k] = v

    for lang_code in os.listdir(locales_dir):
        if lang_code == "en":
            continue
            
        lang_dir = os.path.join(locales_dir, lang_code)
        if not os.path.isdir(lang_dir):
            continue
            
        lang_file = os.path.join(lang_dir, "common.json")
        if not os.path.exists(lang_file):
            continue
            
        with open(lang_file, 'r', encoding='utf-8') as f:
            lang_data = json.load(f)
            
        missing = extract_missing_keys(en_data, lang_data)
        
        if missing:
            print(f"Missing keys for {lang_code} ({LANGUAGES.get(lang_code, lang_code)}):")
            
            prompt = f"""
            Translate the following JSON values from English to {LANGUAGES.get(lang_code, lang_code)}. 
            Keep the exact same JSON structure and keys, only translate the values.
            Ensure the output is valid JSON without any markdown formatting or extra text.
            CRITICAL: Output raw UTF-8 characters. DO NOT use Unicode escape sequences (like \\uXXXX).
            
            JSON to translate:
            {json.dumps(missing, indent=2)}
            """
            
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    chat_completion = client.chat.completions.create(
                        messages=[{"role": "user", "content": prompt}],
                        model="llama-3.1-8b-instant",
                        temperature=0.3
                    )
                    
                    text = chat_completion.choices[0].message.content.strip()
                    if text.startswith('```json'): text = text[7:]
                    if text.startswith('```'): text = text[3:]
                    if text.endswith('```'): text = text[:-3]
                    
                    translated_missing = json.loads(text.strip(), strict=False)
                    
                    apply_translations(lang_data, translated_missing)
                    
                    with open(lang_file, 'w', encoding='utf-8') as f:
                        json.dump(lang_data, f, ensure_ascii=False, indent=2)
                        
                    print(f"Successfully synced {lang_code}")
                    time.sleep(3) # Throttle to prevent rate limit
                    break # Exit retry loop on success
                    
                except Exception as e:
                    err_msg = str(e)
                    if "429" in err_msg or "rate limit" in err_msg.lower():
                        wait_time = (2 ** attempt) * 10
                        print(f"Rate limited on {lang_code}. Waiting {wait_time}s...")
                        time.sleep(wait_time)
                    else:
                        print(f"Error translating {lang_code}: {e}")
                        break
            else:
                print(f"Failed to translate {lang_code} after max retries")
        else:
            print(f"{lang_code} is up to date.")

if __name__ == "__main__":
    sync_translations()
