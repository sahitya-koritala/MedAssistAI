import os
import time
from groq import Groq

def process_file(file_path, client):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip files that are already wrapped
    if 'useTranslation' in content and 't(' in content:
        print(f"Skipping {file_path} (already translated)")
        return True

    print(f"Translating {file_path}...")
    
    prompt = """
    You are an expert React developer. I need you to implement react-i18next translation for the following React component.
    
    Instructions:
    1. Import the hook: `import { useTranslation } from "react-i18next";` at the top (if not already imported).
    2. Add `const { t } = useTranslation();` inside the component(s).
    3. Identify all user-facing English text strings in the JSX (e.g. <h1>Dashboard</h1>, placeholder="Search", title="Action", etc.).
    4. Wrap them using the `t` function. Use descriptive keys in camelCase based on the file name and content. For example, in PatientDashboard.jsx: <h1>{t('patientDashboard.dashboardTitle', 'Dashboard')}</h1>
    5. For placeholders or standard attributes, do `placeholder={t('patientDashboard.search', 'Search')}`
    6. DO NOT change ANY logic, styles, props, or imports other than i18next. 
    7. Return ONLY the raw modified source code without any markdown formatting, explanations, or code blocks. Just the raw code.
    
    Code:
    ```javascript
    """ + content + """
    ```
    """

    max_retries = 5
    for attempt in range(max_retries):
        try:
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.1-8b-instant",
                temperature=0.1
            )
            
            result = chat_completion.choices[0].message.content.strip()
            
            # Clean up markdown if AI still adds it
            if result.startswith("```javascript"): result = result[13:]
            if result.startswith("```jsx"): result = result[6:]
            if result.startswith("```"): result = result[3:]
            if result.endswith("```"): result = result[:-3]
            
            result = result.strip()
            
            if not result or len(result) < len(content) * 0.5:
                raise Exception("Response too short, likely failed.")
                
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(result)
                
            return True
            
        except Exception as e:
            err_msg = str(e)
            if "429" in err_msg or "rate limit" in err_msg.lower():
                wait_time = (2 ** attempt) * 5
                print(f"Rate limited. Waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"Error on {file_path}: {e}")
                return False
                
    return False

def main():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        from dotenv import load_dotenv
        load_dotenv(os.path.join(os.path.dirname(__file__), "flask_backend", ".env"))
        api_key = os.environ.get("GROQ_API_KEY")

    client = Groq(api_key=api_key)
    
    pages_dir = os.path.join(os.path.dirname(__file__), "frontend", "src", "pages")
    
    directories_to_process = [
        os.path.join(pages_dir, "dashboard"),
        os.path.join(pages_dir, "patient"),
        os.path.join(pages_dir, "doctor"),
        os.path.join(pages_dir, "lab")
    ]
    
    # Process only specific highly-visible directories first to avoid running out of tokens
    count = 0
    for target_dir in directories_to_process:
        if not os.path.exists(target_dir):
            continue
            
        for root, _, files in os.walk(target_dir):
            for file in files:
                if file.endswith(".jsx"):
                    file_path = os.path.join(root, file)
                    success = process_file(file_path, client)
                    if success:
                        count += 1
                        time.sleep(3) # Throttle to avoid rate limits
                        
    print(f"Successfully wrapped {count} files.")

if __name__ == "__main__":
    main()
