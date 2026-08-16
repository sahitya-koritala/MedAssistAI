import os
from flask import Blueprint, request, jsonify
import google.generativeai as genai
from groq import Groq
from utils.auth import token_required
import json

gemini_bp = Blueprint('gemini', __name__)

# Configure Gemini
gemini_key = os.getenv("GEMINI_API_KEY")
has_gemini = False
if gemini_key and gemini_key != "YOUR_GEMINI_API_KEY_HERE":
    try:
        genai.configure(api_key=gemini_key)
        has_gemini = True
    except Exception as e:
        print("Failed to configure Gemini API:", e)

# Configure Groq (Free, Lightning-Fast Open-Source Models)
groq_key = os.getenv("GROQ_API_KEY")
has_groq = False
client = None
model_name = None
if groq_key and groq_key != "YOUR_GROQ_API_KEY_HERE":
    try:
        client = Groq(api_key=groq_key)
        # Using Llama 3.1 8b as default fast model
        model_name = "llama-3.1-8b-instant"
        has_groq = True
    except Exception as e:
        print("Failed to configure Groq API:", e)

def generate_ai_response(prompt, system_instruction=None, is_json=False):
    """
    Tries Gemini first if configured, otherwise falls back to Groq.
    If neither is configured or both fail, raises an Exception.
    """
    # 1. Try Gemini
    if has_gemini:
        try:
            model_name_gemini = 'gemini-1.5-flash'
            config = {}
            if is_json:
                config['response_mime_type'] = 'application/json'
            
            if system_instruction:
                model = genai.GenerativeModel(
                    model_name_gemini,
                    generation_config=config,
                    system_instruction=system_instruction
                )
            else:
                model = genai.GenerativeModel(model_name_gemini, generation_config=config)
                
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Gemini call failed, attempting Groq fallback: {e}")

    # 2. Try Groq
    if has_groq:
        try:
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})
            
            response_format = {"type": "json_object"} if is_json else None
            
            chat_completion = client.chat.completions.create(
                messages=messages,
                model=model_name,
                response_format=response_format
            )
            return chat_completion.choices[0].message.content.strip()
        except Exception as e:
            print(f"Groq call failed: {e}")
            raise e

    raise Exception("No active AI provider (Gemini or Groq) is configured or available.")

def generate_offline_chatbot_response(prompt):
    prompt_lower = prompt.lower()
    
    # 1. Diabetes
    if "diabetes" in prompt_lower or "diabetic" in prompt_lower:
        return (
            "Diabetes mellitus is a chronic metabolic disorder characterized by high blood glucose levels. "
            "Common symptoms include:\n"
            "- Increased thirst (polydipsia) and frequent urination (polyuria)\n"
            "- Extreme fatigue, blurred vision, and unexplained weight loss\n"
            "- Slow-healing sores or frequent infections.\n\n"
            "Management involves regular blood sugar monitoring, a low-glycemic index diet, regular physical exercise, "
            "and medication (such as insulin or oral hypoglycemics) as prescribed by your physician."
        )
        
    # 2. Hypertension
    elif "hypertension" in prompt_lower or "high blood pressure" in prompt_lower:
        return (
            "Hypertension (high blood pressure) is a common cardiovascular condition where the force of blood "
            "against the artery walls is consistently too high (typically 130/80 mmHg or above).\n"
            "Key recommendations include:\n"
            "- Adhering to the DASH diet (high in vegetables, fruits, and lean protein; low in sodium)\n"
            "- Engaging in moderate aerobic exercise (150 minutes per week)\n"
            "- Stress reduction techniques and avoiding smoking.\n\n"
            "Please monitor your blood pressure regularly and consult a cardiologist for therapeutic management."
        )
        
    # 3. Anemia
    elif "anemia" in prompt_lower or "iron deficiency" in prompt_lower:
        return (
            "Anemia is a condition characterized by a deficiency in red blood cells or hemoglobin, "
            "leading to reduced oxygen flow to the body's organs. Symptoms include fatigue, weakness, pale skin, "
            "and cold hands/feet.\n"
            "Common causes include:\n"
            "- Iron, folate, or Vitamin B12 deficiency\n"
            "- Chronic inflammatory diseases or blood loss.\n\n"
            "Management typically involves dietary adjustments (consuming iron-rich foods like spinach, red meat, and lentils), "
            "vitamin supplementation, and medical diagnosis to treat underlying causes."
        )
        
    # 4. Healthy diet
    elif "diet" in prompt_lower or "healthy food" in prompt_lower or "nutrition" in prompt_lower:
        return (
            "A healthy, balanced diet is fundamental to maintaining optimal health and preventing chronic diseases. "
            "Key guidelines:\n"
            "- Incorporate a variety of whole foods: vegetables, fruits, whole grains, and legumes\n"
            "- Select lean protein sources: fish, poultry, tofu, and nuts\n"
            "- Restrict intake of highly processed foods, refined sugars, trans fats, and excess sodium\n"
            "- Stay well-hydrated by drinking 2-3 liters of water daily.\n\n"
            "Tailor your caloric intake based on your BMI, physical activity level, and specific metabolic requirements."
        )
        
    # 5. Fever
    elif "fever" in prompt_lower or "temperature" in prompt_lower or "cold" in prompt_lower:
        return (
            "A fever is a temporary elevation in body temperature, often in response to an infection. "
            "General supportive measures:\n"
            "- Get plenty of rest and sleep to help your body recover\n"
            "- Drink abundant fluids (water, herbal teas, broth) to prevent dehydration\n"
            "- Use over-the-counter antipyretics (like paracetamol or ibuprofen) as directed by a healthcare professional.\n\n"
            "Seek immediate medical attention if the fever exceeds 39.4°C (103°F) or is accompanied by a severe headache, stiff neck, or breathing difficulty."
        )
        
    # 6. HbA1c
    elif "hba1c" in prompt_lower:
        return (
            "The HbA1c test measures your average blood sugar levels over the past 3 months.\n"
            "- Normal: Below 5.7%\n"
            "- Prediabetes: 5.7% to 6.4%\n"
            "- Diabetes: 6.5% or higher.\n\n"
            "Regular monitoring is recommended for individuals with diabetic risk factors."
        )
        
    # General fallback response
    else:
        return (
            "Hello! I am your MedAssist AI consultant. I can provide health information on symptoms, chronic conditions, "
            "and general wellness (e.g. diabetes, hypertension, anemia, healthy diet, fever). Please note that my advice "
            "is for informational purposes. Always consult a licensed medical professional for formal diagnosis."
        )

@gemini_bp.route('/chat', methods=['POST'])
@token_required
def chat(current_user):
    data = request.get_json()
    prompt = data.get('prompt')
    
    if not prompt:
        return jsonify({'success': False, 'message': 'Prompt is required'}), 400
        
    print(f"[CHAT LOG] Received user message: {prompt}")
    
    try:
        chat_context = "You are MedAssistAI, a helpful AI healthcare assistant. Please provide helpful, safe medical information. Always advise users to consult a real doctor for serious conditions.\n\n"
        
        if not client:
            raise Exception("Groq client not initialized. Please verify GROQ_API_KEY.")
            
        print(f"[CHAT LOG] Groq request prompt: {prompt}")
        
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": chat_context},
                {"role": "user", "content": prompt}
            ],
            model=model_name or "llama-3.1-8b-instant",
        )
        
        response_text = chat_completion.choices[0].message.content.strip()
        print(f"[CHAT LOG] Groq response: {response_text[:200]}...")
        
        return jsonify({
            'success': True,
            'response': response_text
        }), 200
    except Exception as e:
        print(f"[CHAT LOG] Groq error occurred: {e}. Generating offline fallback response...")
        # Resolve via smart offline medical assistant
        response_text = generate_offline_chatbot_response(prompt)
        print(f"[CHAT LOG] Groq fallback response: {response_text[:200]}...")
        
        return jsonify({
            'success': True,
            'response': response_text
        }), 200

@gemini_bp.route('/predict', methods=['POST'])
@token_required
def predict_disease(current_user):
    data = request.get_json()
    symptoms = data.get('symptoms', [])
    
    if not symptoms:
        return jsonify({'success': False, 'message': 'Symptoms are required'}), 400
        
    # Default fallbacks
    mock_predictions = {
        'success': True,
        'predictions': [
            {'disease': 'Common Cold', 'confidence': 0.85, 'risk': 'Low', 'specialist': 'General Practitioner'},
            {'disease': 'Seasonal Allergies', 'confidence': 0.72, 'risk': 'Low', 'specialist': 'Allergist'}
        ],
        'tests': ['Complete Blood Count (CBC)'],
        'precautions': ['Rest', 'Stay hydrated'],
        'recommendations': ['Over-the-counter pain relievers']
    }
        
    try:
        prompt = f"""
        Given the following symptoms: {', '.join(symptoms)}
        Please provide a JSON response with the following structure:
        {{
            "predictions": [
                {{"disease": "Name", "confidence": 0.0-1.0, "risk": "Low/Medium/High", "specialist": "Specialist Type"}}
            ],
            "tests": ["test1", "test2"],
            "precautions": ["precaution1", "precaution2"],
            "recommendations": ["recommendation1", "recommendation2"]
        }}
        Make sure the response is valid JSON only, without markdown code blocks.
        """
        
        res_text = generate_ai_response(prompt, is_json=True)
        if res_text.startswith('```json'):
            res_text = res_text[7:]
        if res_text.endswith('```'):
            res_text = res_text[:-3]
            
        result = json.loads(res_text)
        
        return jsonify({
            'success': True,
            **result
        }), 200
    except Exception as e:
        print("Symptom prediction model failed, using mock fallback:", e)
        return jsonify(mock_predictions), 200

def extract_text_from_pdf(file_path):
    from pypdf import PdfReader
    try:
        reader = PdfReader(file_path)
        if reader.is_encrypted:
            raise Exception("PDF is password protected or encrypted.")
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        raise Exception(f"Corrupted or invalid PDF: {str(e)}")

def extract_text_from_image(file_path):
    import requests
    try:
        url = "https://api.ocr.space/parse/image"
        with open(file_path, 'rb') as f:
            payload = {
                'apikey': 'helloworld',
                'language': 'eng',
                'isOverlayRequired': False
            }
            files = {'file': f}
            response = requests.post(url, data=payload, files=files, timeout=20)
            
        if response.status_code != 200:
            raise Exception(f"OCR server returned status {response.status_code}")
            
        data = response.json()
        parsed_results = data.get("ParsedResults", [])
        if parsed_results:
            text = parsed_results[0].get("ParsedText", "")
            return text
        else:
            raise Exception("No text detected in the image.")
    except Exception as e:
        raise Exception(f"OCR analysis failed: {str(e)}")

def check_if_medical_report(text):
    text_lower = text.lower()
    
    # 1. Strong heuristic safeguard
    strong_medical_keywords = [
        "patient", "doctor", "clinic", "hospital", "laboratory", "prescription", 
        "diagnostic", "findings", "symptoms", "treatment", "medicine", "medication",
        "blood", "urine", "cbc", "hba1c", "hemoglobin", "cholesterol", "glucose", "thyroid"
    ]
    has_rx = "rx" in text_lower
    matched_keywords = [kw for kw in strong_medical_keywords if kw in text_lower]
    
    # If it contains "rx" and patient/doctor/hospital/medication, or at least 2 strong keywords, it's medical
    if (has_rx and len(matched_keywords) >= 1) or len(matched_keywords) >= 2:
        return True
        
    if not client:
        return False
        
    try:
        prompt = f"""
        Analyze the following text extracted from an uploaded document.
        Determine if this document is a medical report, laboratory test, health summary, clinic note, or prescription.
        Exclude documents like resumes, ID cards, notes, tickets, bills, movie texts, etc.
        
        Document Text:
        \"\"\"{text[:2000]}\"\"\"
        
        Respond strictly in JSON format (no markdown code blocks, no backticks, just raw JSON):
        {{
            "is_medical_report": true or false,
            "reason": "Brief explanation"
        }}
        """
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=model_name,
            response_format={"type": "json_object"}
        )
        
        res_text = chat_completion.choices[0].message.content.strip()
        result = json.loads(res_text)
        return bool(result.get("is_medical_report", False))
        
    except Exception as e:
        print(f"Error in check_if_medical_report LLM classification: {e}")
        return len(matched_keywords) >= 1

@gemini_bp.route('/analyze_report', methods=['POST'])
@token_required
def analyze_report(current_user):
    extracted_text = ""
    
    # 1. Handle file upload (multipart/form-data)
    if 'file' in request.files:
        file = request.files['file']
        if not file or file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected for upload'}), 400
            
        filename = file.filename
        ext = os.path.splitext(filename)[1].lower()
        
        # Check upload format validation
        if ext not in ['.pdf', '.png', '.jpg', '.jpeg']:
            return jsonify({
                'success': False, 
                'message': 'Unsupported file format. Please upload a PDF, PNG, JPG, or JPEG file.'
            }), 400
            
        try:
            uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'uploads'))
            os.makedirs(uploads_dir, exist_ok=True)
            from werkzeug.utils import secure_filename
            import datetime
            timestamp = int(datetime.datetime.now().timestamp())
            secure_name = f"{timestamp}_{secure_filename(filename)}"
            temp_path = os.path.join(uploads_dir, secure_name)
            file.save(temp_path)
            
            # Extract text
            if ext == '.pdf':
                extracted_text = extract_text_from_pdf(temp_path)
            else:
                extracted_text = extract_text_from_image(temp_path)
                
            # Delete temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
        except Exception as e:
            if 'temp_path' in locals() and os.path.exists(temp_path):
                os.remove(temp_path)
            return jsonify({
                'success': False, 
                'message': f'Failed to process file: {str(e)}'
            }), 400
            
    # 2. Handle JSON payload (backward compatibility)
    else:
        data = request.get_json(silent=True) or {}
        extracted_text = data.get('reportText', '')
        
    if not extracted_text or len(extracted_text.strip()) < 10:
        return jsonify({
            'success': False, 
            'message': 'The uploaded file could not be read, is empty, or password-protected. Please ensure it is a valid document.'
        }), 400
        
    try:
        # Check if the document is a medical report
        is_medical = check_if_medical_report(extracted_text)
        if not is_medical:
            return jsonify({
                'success': False,
                'message': 'The uploaded file is not recognized as a valid medical report. Please upload a healthcare-related report.'
            }), 400
            
        if not client:
            # Fallback to mock data if no API key is provided
            return jsonify({
                'success': True,
                'summary': "Patient is a 35-year-old male with mild anemia and slightly elevated white blood cell count.",
                'medicalTerms': [
                    {"term": "Hemoglobin", "explanation": "A protein in red blood cells that carries oxygen."}
                ],
                'abnormalValues': [
                    {"test": "Hemoglobin", "value": "11.2", "normal": "12-16", "status": "Low"}
                ],
                'recommendations': ["Follow up with GP in 2 weeks"],
                'healthAssessment': "Mild anemia."
            }), 200

        prompt = f"""
        Analyze this medical report and provide:
        1. A comprehensive summary of the report in simple English
        2. Explanation of difficult medical terms in simple language
        3. Highlight any abnormal values or concerning findings
        4. Generate specific supportive health recommendations based on the results (e.g. consult physician, specialist clinic, lifestyle/diet changes)
        5. Overall health assessment. You MUST include a "Risk Assessment" (Low, Medium, or High Risk, explaining why) and a "Disease Prediction" (possible diseases/conditions like Diabetes, Hypertension, Anemia, Fatty Liver, Thyroid, Infection, Kidney Disease, etc.) ONLY when sufficient evidence exists.
        
        Medical Report Content:
        {extracted_text}
        
        Provide the response strictly in JSON format (no markdown code blocks, no backticks, just raw JSON):
        {{
            "summary": "String summary of the report",
            "medicalTerms": [
                {{"term": "Term Name", "explanation": "Explanation in simple language"}}
            ],
            "abnormalValues": [
                {{"test": "Test Name", "value": "Result", "normal": "Normal Range", "status": "High/Low/Abnormal"}}
            ],
            "recommendations": [
                "Recommendation 1",
                "Recommendation 2"
            ],
            "healthAssessment": "Overall health assessment including Risk Assessment and Disease Prediction with evidence."
        }}
        """
        
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model=model_name,
            response_format={"type": "json_object"}
        )
        
        res_text = chat_completion.choices[0].message.content.strip()
        result = json.loads(res_text)
        
        return jsonify({
            'success': True,
            **result
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

def generate_recommendations_fallback(age, gender, height, weight, bmi, bmi_category, activity_level, health_conditions):
    # Programmatic default calculations
    # Underweight vs Normal vs Overweight vs Obese
    if bmi_category == "Underweight":
        calories = int(2300 + (weight * 10))
        foods_include = ["Whole grains", "Nuts and seeds", "Avocado", "Full-fat dairy", "Lean protein", "Healthy oils"]
        foods_avoid = ["Empty calories", "Sugary drinks", "Excessive caffeine", "Low-calorie fillers"]
        weekly = [
            {"day": "Monday", "type": "Strength", "duration": "30 minutes", "activity": "Light resistance training"},
            {"day": "Tuesday", "type": "Rest", "duration": "-", "activity": "Complete rest"},
            {"day": "Wednesday", "type": "Strength", "duration": "30 minutes", "activity": "Bodyweight exercises"},
            {"day": "Thursday", "type": "Rest", "duration": "-", "activity": "Stretching"},
            {"day": "Friday", "type": "Strength", "duration": "30 minutes", "activity": "Light weight training"},
            {"day": "Saturday", "type": "Rest", "duration": "-", "activity": "Light walking"},
            {"day": "Sunday", "type": "Rest", "duration": "-", "activity": "Rest day"}
        ]
        steps = 6000
    elif bmi_category == "Normal":
        calories = int(2000 + (weight * 10))
        foods_include = ["Leafy greens", "Lean proteins", "Whole grains", "Fruits", "Vegetables", "Healthy fats"]
        foods_avoid = ["Processed foods", "Excess sugar", "Fried foods", "High sodium foods"]
        weekly = [
            {"day": "Monday", "type": "Cardio", "duration": "30 minutes", "activity": "Brisk walking or jogging"},
            {"day": "Tuesday", "type": "Strength", "duration": "45 minutes", "activity": "Full body workout"},
            {"day": "Wednesday", "type": "Cardio", "duration": "30 minutes", "activity": "Cycling or swimming"},
            {"day": "Thursday", "type": "Rest", "duration": "-", "activity": "Light stretching or yoga"},
            {"day": "Friday", "type": "Strength", "duration": "45 minutes", "activity": "Upper body focus"},
            {"day": "Saturday", "type": "Cardio", "duration": "45 minutes", "activity": "HIIT or sports"},
            {"day": "Sunday", "type": "Rest", "duration": "-", "activity": "Complete rest day"}
        ]
        steps = 10000
    else: # Overweight or Obese
        calories = int(1500 + (weight * 5))
        foods_include = ["High-fiber vegetables", "Lean chicken/fish", "Legumes", "Berries", "Water with lemon", "Chia seeds"]
        foods_avoid = ["Refined carbohydrates", "Sweetened beverages", "Butter & lard", "Processed meats"]
        weekly = [
            {"day": "Monday", "type": "Cardio", "duration": "30 minutes", "activity": "Low-impact walking"},
            {"day": "Tuesday", "type": "Rest", "duration": "-", "activity": "Active recovery stretching"},
            {"day": "Wednesday", "type": "Cardio", "duration": "35 minutes", "activity": "Stationary cycling"},
            {"day": "Thursday", "type": "Strength", "duration": "30 minutes", "activity": "Light resistance training"},
            {"day": "Friday", "type": "Cardio", "duration": "30 minutes", "activity": "Swimming or water aerobics"},
            {"day": "Saturday", "type": "Cardio", "duration": "40 minutes", "activity": "Brisk outdoor walking"},
            {"day": "Sunday", "type": "Rest", "duration": "-", "activity": "Complete rest day"}
        ]
        steps = 8000
        
    return {
        "bmi": str(bmi),
        "bmiCategory": bmi_category,
        "dietPlan": {
            "calories": calories,
            "meals": [
                {"time": "Breakfast (7-8 AM)", "foods": ["Oatmeal with chia seeds", "Boiled eggs or tofu scramble", "Green tea"]},
                {"time": "Mid-Morning Snack (10 AM)", "foods": ["A handful of mixed nuts", "Apple or pear"]},
                {"time": "Lunch (12-1 PM)", "foods": ["Grilled chicken or chickpeas", "Quinoa or brown rice", "Mixed salad"]},
                {"time": "Evening Snack (4 PM)", "foods": ["Greek yogurt", "Berries"]},
                {"time": "Dinner (7-8 PM)", "foods": ["Baked salmon or baked tempeh", "Steamed broccoli", "Vegetable broth"]}
            ],
            "foodsToInclude": foods_include,
            "foodsToAvoid": foods_avoid
        },
        "exercisePlan": {
            "weeklySchedule": weekly,
            "dailySteps": steps,
            "workoutTips": [
                "Stay hydrated before, during, and after workouts",
                "Warm up for 5-10 minutes before starting any high intensity exercises",
                "Listen to your body and stop immediately if you feel pain or dizziness",
                "Consistency is key—even 15 minutes of light movement counts"
            ]
        },
        "lifestyle": {
            "waterIntake": f"{round(weight * 0.033, 1)} liters daily",
            "sleep": "7-9 hours per night",
            "stressManagement": ["Practice 5 minutes of deep breathing", "Limit screen time 1 hour before sleep", "Maintain social support"],
            "habits": ["Maintain regular eating schedule", "Avoid sitting for more than 1 hour continuously", "Sleep in a dark, quiet room"]
        },
        "followUpReminder": {
            "nextCheckup": "3 months",
            "recommendedTests": ["Fast blood glucose", "Lipid panel check", "Complete blood count", "Blood pressure monitoring"],
            "monitoring": ["Check body weight weekly under identical conditions", "Check energy and fatigue levels daily"]
        }
    }

@gemini_bp.route('/recommendations', methods=['POST'])
@token_required
def get_recommendations(current_user):
    age = 30
    weight = 70.0
    height = 170.0
    gender = 'male'
    activity_level = 'moderate'
    health_conditions = ''
    try:
        data = request.get_json()
        age = int(data.get('age', 30))
        weight = float(data.get('weight', 70.0))
        height = float(data.get('height', 170.0))
        gender = str(data.get('gender', 'male'))
        activity_level = str(data.get('activityLevel', 'moderate'))
        health_conditions = str(data.get('healthConditions', ''))
        
        # Calculate BMI
        height_in_meters = height / 100.0
        bmi = round(weight / (height_in_meters * height_in_meters), 1)
        
        # Determine BMI category
        if bmi < 18.5:
            bmi_category = "Underweight"
        elif bmi < 25.0:
            bmi_category = "Normal"
        elif bmi < 30.0:
            bmi_category = "Overweight"
        else:
            bmi_category = "Obese"
            
        # Create prompt for custom recommendations
        prompt = f"""
        Generate personalized health, diet, and lifestyle recommendations for a patient with the following metrics:
        - Age: {age} years old
        - Gender: {gender}
        - Height: {height} cm
        - Weight: {weight} kg
        - Calculated BMI: {bmi} ({bmi_category})
        - Activity Level: {activity_level}
        - Existing Health Conditions: {health_conditions or 'None reported'}
        
        The recommendation must be highly tailored to these metrics. For example, diet caloric needs, meal contents, exercise duration, and daily steps should match their BMI category, activity levels, and medical conditions.
        
        Provide the response strictly in JSON format matching the following structure:
        {{
            "bmi": "{bmi}",
            "bmiCategory": "{bmi_category}",
            "dietPlan": {{
                "calories": 2000,
                "meals": [
                    {{"time": "Breakfast (7-8 AM)", "foods": ["Food 1", "Food 2"]}},
                    {{"time": "Mid-Morning Snack (10 AM)", "foods": ["Food 3"]}},
                    {{"time": "Lunch (12-1 PM)", "foods": ["Food 4", "Food 5"]}},
                    {{"time": "Evening Snack (4 PM)", "foods": ["Food 6"]}},
                    {{"time": "Dinner (7-8 PM)", "foods": ["Food 7", "Food 8"]}}
                ],
                "foodsToInclude": ["Food A", "Food B"],
                "foodsToAvoid": ["Food C", "Food D"]
            }},
            "exercisePlan": {{
                "weeklySchedule": [
                    {{"day": "Monday", "type": "Cardio", "duration": "30 minutes", "activity": "walking"}},
                    {{"day": "Tuesday", "type": "Strength", "duration": "45 minutes", "activity": "strength"}},
                    {{"day": "Wednesday", "type": "Cardio", "duration": "30 minutes", "activity": "swimming"}},
                    {{"day": "Thursday", "type": "Rest", "duration": "-", "activity": "stretching"}},
                    {{"day": "Friday", "type": "Strength", "duration": "45 minutes", "activity": "upper body"}},
                    {{"day": "Saturday", "type": "Cardio", "duration": "45 minutes", "activity": "HIIT"}},
                    {{"day": "Sunday", "type": "Rest", "duration": "-", "activity": "rest"}}
                ],
                "dailySteps": 10000,
                "workoutTips": ["Tip 1", "Tip 2"]
            }},
            "lifestyle": {{
                "waterIntake": "3 liters daily",
                "sleep": "7-9 hours per night",
                "stressManagement": ["Meditation", "Breathing"],
                "habits": ["Regular timing", "Limit screen"]
            }},
            "followUpReminder": {{
                "nextCheckup": "3 months",
                "recommendedTests": ["CBC", "Blood sugar"],
                "monitoring": ["Weight weekly"]
            }}
        }}
        
        Make sure the response is valid JSON only, without markdown code blocks, backticks, or any trailing/leading text.
        """
        
        res_text = generate_ai_response(prompt, is_json=True)
        if res_text.startswith('```json'):
            res_text = res_text[7:]
        if res_text.endswith('```'):
            res_text = res_text[:-3]
            
        result = json.loads(res_text)
        return jsonify(result), 200
        
    except Exception as e:
        print("Failed to generate AI recommendations, using programmatic fallback:", e)
        # Calculate BMI parameters again for safety
        height_in_meters = height / 100.0
        bmi = round(weight / (height_in_meters * height_in_meters), 1)
        if bmi < 18.5:
            bmi_category = "Underweight"
        elif bmi < 25.0:
            bmi_category = "Normal"
        elif bmi < 30.0:
            bmi_category = "Overweight"
        else:
            bmi_category = "Obese"
            
        fallback_data = generate_recommendations_fallback(
            age, gender, height, weight, bmi, bmi_category, activity_level, health_conditions
        )
        return jsonify(fallback_data), 200

