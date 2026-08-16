import os
import joblib
import pickle
import pandas as pd

class DiseasePredictor:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(DiseasePredictor, cls).__new__(cls, *args, **kwargs)
            cls._instance.load_model()
        return cls._instance

    def load_model(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        models_dir = os.path.join(base_dir, "..", "models")
        
        model_path = os.path.join(models_dir, "best_decision_tree_model.pkl")
        encoder_path = os.path.join(models_dir, "disease_label_encoder.pkl")
        features_path = os.path.join(models_dir, "feature_columns.pkl")
        
        print(f"Loading Disease Prediction model from: {model_path}")
        self.model = joblib.load(model_path)
        self.encoder = joblib.load(encoder_path)
        
        with open(features_path, 'rb') as f:
            self.features = pickle.load(f)
            
        print("Disease Prediction model and features loaded successfully.")

    def predict(self, selected_symptoms):
        if not selected_symptoms:
            return {
                "success": False,
                "message": "Symptoms list cannot be empty."
            }

        # 1. Initialize input vector
        input_vector = [0] * len(self.features)
        
        # 2. Comprehensive symptom mapping dictionary
        symptom_map = {
            # General
            "fever": "fever",
            "chills": "chills",
            "fatigue": "fatigue",
            "weakness": "weakness",
            "weight loss": "recent weight loss",
            "weight gain": "weight gain",
            "night sweats": "sweating",
            "loss of appetite": "decreased appetite",
            "insomnia": "insomnia",
            "dizziness": "dizziness",
            "lightheadedness": "dizziness",
            "fainting": "fainting",
            "general pain": "ache all over",
            "malaise": "feeling ill",
            
            # Respiratory
            "cough": "cough",
            "shortness of breath": "shortness of breath",
            "wheezing": "wheezing",
            "chest pain": "sharp chest pain",
            "chest tightness": "chest tightness",
            "runny nose": "coryza",
            "stuffy nose": "nasal congestion",
            "sneezing": "sneezing",
            "sore throat": "sore throat",
            "hoarseness": "hoarse voice",
            "nasal congestion": "nasal congestion",
            "difficulty breathing": "difficulty breathing",
            "painful breathing": "hurts to breath",
            "cough with mucus": "coughing up sputum",
            "dry cough": "cough",
            
            # Cardiovascular
            "chest pressure": "sharp chest pain",
            "palpitations": "palpitations",
            "rapid heartbeat": "increased heart rate",
            "slow heartbeat": "decreased heart rate",
            "swelling in legs": "leg swelling",
            "swelling in ankles": "ankle swelling",
            "swelling in feet": "foot or toe swelling",
            "high blood pressure": "increased heart rate",
            "low blood pressure": "decreased heart rate",
            "irregular heartbeat": "irregular heartbeat",
            "pain in arm": "arm pain",
            "pain in jaw": "jaw pain",
            "lightheadedness with chest discomfort": "dizziness",
            
            # Digestive
            "abdominal pain": "sharp abdominal pain",
            "nausea": "nausea",
            "vomiting": "vomiting",
            "diarrhea": "diarrhea",
            "constipation": "constipation",
            "bloating": "stomach bloating",
            "gas": "flatulence",
            "heartburn": "heartburn",
            "indigestion": "regurgitation",
            "change in appetite": "decreased appetite",
            "difficulty swallowing": "difficulty in swallowing",
            "painful swallowing": "throat irritation",
            "blood in stool": "blood in stool",
            "black stool": "melena",
            "diarrhea with blood": "blood in stool",
            "jaundice": "jaundice",
            "yellow skin": "jaundice",
            "yellow eyes": "jaundice",
            
            # Neurological
            "headache": "headache",
            "migraine": "headache",
            "vertigo": "dizziness",
            "seizures": "seizures",
            "tremors": "abnormal involuntary movements",
            "numbness": "paresthesia",
            "tingling": "paresthesia",
            "weakness in arms": "arm weakness",
            "weakness in legs": "leg weakness",
            "memory loss": "disturbance of memory",
            "confusion": "emotional symptoms",
            "loss of consciousness": "fainting",
            "memory problems": "disturbance of memory",
            "difficulty speaking": "difficulty speaking",
            "slurred speech": "slurring words",
            "vision changes": "diminished vision",
            "double vision": "double vision",
            "loss of balance": "problems with movement",
            "difficulty walking": "problems with movement",
            
            # Skin
            "rash": "skin rash",
            "itching": "itching of skin",
            "hives": "skin irritation",
            "dry skin": "skin dryness, peeling, scaliness, or roughness",
            "redness": "skin irritation",
            "swelling": "skin swelling",
            "bruising": "abnormal appearing skin",
            "rose spots": "skin lesion",
            "pimples": "acne or pimples",
            "blisters": "skin lesion",
            "warts": "warts",
            "skin discoloration": "abnormal appearing skin",
            "skin lesions": "skin lesion",
            "hair loss": "too little hair",
            "nail changes": "irregular appearing nails",
            "dry hair": "too little hair",
            
            # Eye
            "eye pain": "pain in eye",
            "eye redness": "eye redness",
            "eye itching": "itchiness of eye",
            "eye discharge": "white discharge from eye",
            "blurred vision": "diminished vision",
            "sensitivity to light": "cloudy eye",
            "dry eyes": "symptoms of eye",
            "watery eyes": "lacrimation",
            "eye swelling": "eyelid swelling",
            "blind spot": "blindness",
            "flashes of light": "spots or clouds in vision",
            "floaters": "spots or clouds in vision",
            
            # ENT
            "ear pain": "ear pain",
            "ear discharge": "pus draining from ear",
            "hearing loss": "diminished hearing",
            "ringing in ears": "ringing in ear",
            "ear fullness": "plugged feeling in ear",
            "nosebleeds": "nosebleed",
            "loss of smell": "disturbance of smell or taste",
            "loss of taste": "disturbance of smell or taste",
            "mouth pain": "mouth pain",
            "tooth pain": "toothache",
            "gum bleeding": "bleeding gums",
            "gum swelling": "pain in gums",
            "mouth ulcers": "mouth ulcer",
            "dry mouth": "mouth dryness",
            "bad breath": "throat irritation",
            
            # Urinary
            "painful urination": "painful urination",
            "frequent urination": "frequent urination",
            "urgent urination": "involuntary urination",
            "blood in urine": "blood in urine",
            "dark urine": "unusual color or odor to urine",
            "cloudy urine": "pus in urine",
            "foul-smelling urine": "unusual color or odor to urine",
            "incontinence": "involuntary urination",
            "difficulty urinating": "retention of urine",
            "weak urine stream": "retention of urine",
            "pain in lower abdomen": "lower abdominal pain",
            "pain in back": "back pain",
            "pain in groin": "groin pain",
            
            # Mental Health
            "anxiety": "anxiety and nervousness",
            "depression": "depression",
            "mood swings": "emotional symptoms",
            "irritability": "emotional symptoms",
            "difficulty concentrating": "disturbance of memory",
            "sleep problems": "insomnia",
            "sleeping too much": "sleepiness",
            "loss of interest": "low self-esteem",
            "feelings of hopelessness": "depression",
            "panic attacks": "anxiety and nervousness",
            "phobias": "fears and phobias",
            "obsessions": "obsessions and compulsions",
            "compulsions": "obsessions and compulsions",
            "hallucinations": "delusions or hallucinations",
            "delusions": "delusions or hallucinations",
            
            # Musculoskeletal
            "joint pain": "joint pain",
            "muscle pain": "muscle pain",
            "back pain": "back pain",
            "neck pain": "neck pain",
            "shoulder pain": "shoulder pain",
            "knee pain": "knee pain",
            "hip pain": "hip pain",
            "swelling in joints": "joint swelling",
            "stiffness": "stiffness all over",
            "limited range of motion": "stiffness all over",
            "muscle weakness": "muscle weakness",
            "muscle cramps": "muscle cramps, contractures, or spasms",
            "muscle spasms": "muscle cramps, contractures, or spasms",
            "bone pain": "bones are painful",
            "arthritic symptoms": "joint pain",
            
            # Infectious Diseases
            "body aches": "ache all over",
            "muscle aches": "muscle pain",
            "swollen lymph nodes": "swollen lymph nodes",
            
            # Women's Health
            "menstrual cramps": "painful menstruation",
            "irregular periods": "unpredictable menstruation",
            "heavy periods": "heavy menstrual flow",
            "painful periods": "painful menstruation",
            "missed periods": "absence of menstruation",
            "vaginal discharge": "vaginal discharge",
            "vaginal itching": "vaginal itching",
            "vaginal pain": "vaginal pain",
            "pelvic pain": "pelvic pain",
            "breast pain": "pain or soreness of breast",
            "breast lumps": "lump or mass of breast",
            "hot flashes": "hot flashes",
            "pain during intercourse": "pain during intercourse",
        }
        
        # 3. Populate feature vector
        for selected in selected_symptoms:
            normalized = selected.strip().lower()
            mapped = symptom_map.get(normalized)
            if mapped and mapped in self.features:
                idx = self.features.index(mapped)
                input_vector[idx] = 1
            else:
                # Substring matching fallback
                for idx, feat in enumerate(self.features):
                    if normalized == feat or (len(normalized) > 3 and normalized in feat):
                        input_vector[idx] = 1
                        break
                        
        # 4. Predict using Pandas DataFrame to avoid feature name warnings
        df = pd.DataFrame([input_vector], columns=self.features)
        prediction_encoded = self.model.predict(df)
        disease = self.encoder.inverse_transform(prediction_encoded)[0]
        
        # 5. Predict probabilities
        probs = self.model.predict_proba(df)[0]
        confidence = float(max(probs) * 100)
        
        # 6. Format Top predicted diseases
        class_probs = list(zip(self.encoder.classes_, probs))
        class_probs.sort(key=lambda x: x[1], reverse=True)
        
        top_diseases = []
        for d_name, prob in class_probs[:5]:
            risk = self.get_risk_level(d_name)
            top_diseases.append({
                "name": d_name.title(),
                "confidence": round(float(prob * 100), 2),
                "risk": risk
            })
            
        primary_disease = disease.lower()
        risk_level = self.get_risk_level(primary_disease)
        specialist = self.get_recommended_specialist(primary_disease)
        tests = self.get_suggested_tests(primary_disease)
        precautions = self.get_precautions(primary_disease)
        recommendations = self.get_ai_recommendations(primary_disease, risk_level)
        
        return {
            "success": True,
            "disease": disease.title(),
            "confidence": round(confidence, 2),
            "risk": risk_level,
            "topDiseases": top_diseases,
            "recommendedSpecialist": specialist,
            "suggestedTests": tests,
            "precautions": precautions,
            "aiRecommendations": recommendations
        }

    def get_risk_level(self, disease):
        disease = disease.lower()
        high_risk_keywords = [
            "heart attack", "cardiac", "stroke", "aneurysm", "embolism", "hemorrhage", 
            "shock", "meningitis", "appendicitis", "peritonitis", "sepsis", "poisoning",
            "leukemia", "cancer", "tumor", "infarction", "respiratory arrest", "internal bleeding"
        ]
        medium_risk_keywords = [
            "pneumonia", "fracture", "diabetes", "hypertension", "infection", "bronchitis", 
            "ulcer", "kidney", "migraine", "depression", "arthritis", "cholera", "dengue", 
            "malaria", "tuberculosis", "hepatitis", "anemia", "asthma", "gout", "ulcerative colitis",
            "thyroiditis", "hernia", "angina", "otitis"
        ]
        
        if any(kw in disease for kw in high_risk_keywords):
            return "High"
        elif any(kw in disease for kw in medium_risk_keywords):
            return "Medium"
        return "Low"

    def get_recommended_specialist(self, disease):
        disease = disease.lower()
        if any(kw in disease for kw in ["heart", "cardiac", "angina", "infarction"]):
            return "Cardiologist"
        elif any(kw in disease for kw in ["skin", "lesion", "rash", "acne", "mole", "warts"]):
            return "Dermatologist"
        elif any(kw in disease for kw in ["ear", "nose", "throat", "tonsils", "pharynx", "otitis", "sinus"]):
            return "ENT Specialist"
        elif any(kw in disease for kw in ["eye", "vision", "blindness", "eyelid"]):
            return "Ophthalmologist"
        elif any(kw in disease for kw in ["kidney", "urine", "bladder", "urination", "prostate"]):
            return "Nephrologist / Urologist"
        elif any(kw in disease for kw in ["depression", "anxiety", "phobias", "behavior", "hallucinations"]):
            return "Psychiatrist / Psychologist"
        elif any(kw in disease for kw in ["diabetes", "thyroid", "menopause"]):
            return "Endocrinologist"
        elif any(kw in disease for kw in ["pregnancy", "vaginal", "menstrual", "uterine", "vulva"]):
            return "Gynecologist"
        elif any(kw in disease for kw in ["joint", "arthritis", "bone", "back pain", "neck pain", "knee pain"]):
            return "Orthopedic Specialist / Rheumatologist"
        elif any(kw in disease for kw in ["infant", "child", "diaper"]):
            return "Pediatrician"
        return "General Physician"

    def get_suggested_tests(self, disease):
        disease = disease.lower()
        tests = ["Complete Blood Count (CBC)", "Basic Metabolic Panel (BMP)"]
        
        if any(kw in disease for kw in ["heart", "cardiac", "angina"]):
            tests += ["Electrocardiogram (ECG)", "Echocardiogram", "Troponin Test"]
        elif any(kw in disease for kw in ["ear", "nose", "throat", "otitis", "sinus"]):
            tests += ["Tympanometry", "Sinus CT Scan", "Throat Swab Culture"]
        elif any(kw in disease for kw in ["eye", "vision"]):
            tests += ["Visual Acuity Test", "Ophthalmoscopy", "Tonometry"]
        elif any(kw in disease for kw in ["kidney", "urine", "bladder"]):
            tests += ["Urinalysis", "Kidney Function Test (BUN/Creatinine)", "Renal Ultrasound"]
        elif any(kw in disease for kw in ["pregnancy", "vaginal", "menstrual"]):
            tests += ["Pregnancy Test (hCG)", "Pelvic Ultrasound", "Hormone Level Panel"]
        elif any(kw in disease for kw in ["joint", "bone", "fracture", "back pain", "neck pain"]):
            tests += ["X-ray", "MRI of affected joint", "Rheumatoid Factor Test"]
        elif any(kw in disease for kw in ["pneumonia", "bronchitis", "lung"]):
            tests += ["Chest X-ray", "Sputum Culture", "Pulmonary Function Test"]
        elif any(kw in disease for kw in ["diabetes"]):
            tests += ["HbA1c Test", "Fasting Blood Sugar Test"]
        return tests[:3]

    def get_precautions(self, disease):
        disease = disease.lower()
        precautions = ["Rest and stay hydrated", "Monitor symptoms regularly"]
        
        if any(kw in disease for kw in ["heart", "cardiac", "angina"]):
            precautions += ["Avoid strenuous physical activity", "Seek immediate emergency help if chest pain intensifies", "Take prescribed nitroglycerin if applicable"]
        elif any(kw in disease for kw in ["ear", "otitis"]):
            precautions += ["Keep the ear completely dry", "Avoid putting cotton swabs or objects in the ear canal", "Avoid swimming"]
        elif any(kw in disease for kw in ["skin", "rash", "dermatitis"]):
            precautions += ["Avoid scratching the affected area", "Use mild, fragrance-free soaps", "Apply a cool compress to relieve itching"]
        elif any(kw in disease for kw in ["diabetes"]):
            precautions += ["Monitor blood glucose levels frequently", "Adhere to a low-sugar, balanced diet", "Carry a source of fast-acting sugar in case of hypoglycemia"]
        elif any(kw in disease for kw in ["infection", "fever"]):
            precautions += ["Complete the full course of any prescribed antibiotics", "Take fever-reducing medications like paracetamol", "Isolate if contagious"]
        elif any(kw in disease for kw in ["joint", "back pain", "neck pain", "arthritis"]):
            precautions += ["Avoid heavy lifting", "Apply heat or cold packs to the painful area", "Practice gentle stretching exercises"]
        else:
            precautions += ["Eat a balanced, nutritious diet", "Ensure 7-8 hours of restful sleep"]
            
        return precautions[:4]

    def get_ai_recommendations(self, disease, risk_level):
        if risk_level == "High":
            recs = [
                "This is a potentially serious condition. Please seek immediate emergency medical care.",
                "Do not attempt to drive yourself to the hospital; call emergency services immediately.",
                "Avoid taking any unprescribed medications as they may complicate your symptoms.",
                "Keep a record of your symptoms and when they started to share with the emergency team."
            ]
        elif risk_level == "Medium":
            recs = [
                "Please schedule an appointment with a healthcare professional/specialist within the next 24-48 hours.",
                "Avoid self-treatment or ignoring the symptoms, as they require professional medical assessment.",
                "If your symptoms worsen or you develop new warning signs (e.g. high fever, severe pain), go to urgent care.",
                "Keep yourself comfortable, hydrated, and rest as much as possible."
            ]
        else:
            recs = [
                "Your symptoms suggest a low-risk condition, but monitoring is advised.",
                "Continue to monitor your symptoms closely for the next 24-48 hours.",
                "Stay hydrated by drinking plenty of water and get sufficient rest.",
                "If symptoms do not improve after a few days, or if they worsen, consult a general physician."
            ]
        return recs
