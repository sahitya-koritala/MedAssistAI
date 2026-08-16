from flask import Blueprint, request, jsonify
from utils.disease_predictor import DiseasePredictor

prediction_bp = Blueprint('prediction', __name__)

@prediction_bp.route('/predict-disease', methods=['POST'])
def predict_disease():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Invalid request body"}), 400
            
        symptoms = data.get('symptoms', [])
        if not symptoms or not isinstance(symptoms, list):
            return jsonify({"success": False, "message": "Symptoms must be a non-empty list"}), 400
            
        predictor = DiseasePredictor()
        result = predictor.predict(symptoms)
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error in predict_disease endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": "An error occurred during disease prediction"}), 500
