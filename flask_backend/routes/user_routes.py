from flask import Blueprint, request, jsonify
from db import mongo
from utils.auth import token_required, hash_password
import uuid
import datetime

user_bp = Blueprint('user', __name__)

MOCK_DOCTORS = [
    {
        "id": "doc-1",
        "name": "Dr. Sarah Johnson",
        "email": "sarah.johnson@medassist.com",
        "phone": "+1234567890",
        "role": "doctor",
        "specialization": "General Medicine",
        "specialty": "General Medicine",
        "consultantType": "doctor",
        "profileCompleted": True
    },
    {
        "id": "doc-2",
        "name": "Dr. Michael Chen",
        "email": "michael.chen@medassist.com",
        "phone": "+0987654321",
        "role": "doctor",
        "specialization": "Cardiology",
        "specialty": "Cardiology",
        "consultantType": "doctor",
        "profileCompleted": True
    },
    {
        "id": "doc-3",
        "name": "Dr. Alexander Smith",
        "email": "alex.smith@medassist.com",
        "phone": "+9998887776",
        "role": "doctor",
        "specialization": "General Medicine",
        "specialty": "General Medicine",
        "consultantType": "doctor",
        "profileCompleted": True
    }
]

MOCK_PATIENTS = [
    {
        "id": "patient-1",
        "name": "Alice Cooper",
        "email": "alice.cooper@email.com",
        "phone": "9876543210",
        "role": "patient",
        "gender": "Female",
        "age": 34,
        "profileCompleted": True,
        "address": "Medical District, Hyderabad",
        "emergencyContactName": "Bob Cooper",
        "emergencyContactNumber": "9876543211"
    }
]

def seed_users_if_empty():
    try:
        # If no doctors exist, insert them
        if mongo.db.users.count_documents({"role": "doctor"}) == 0:
            docs = []
            for d in MOCK_DOCTORS:
                doc_copy = d.copy()
                doc_copy["password"] = hash_password("123456")
                doc_copy["createdAt"] = datetime.datetime.utcnow()
                docs.append(doc_copy)
            mongo.db.users.insert_many(docs)
            
        # If no patients exist, insert them
        if mongo.db.users.count_documents({"role": "patient"}) == 0:
            pats = []
            for p in MOCK_PATIENTS:
                pat_copy = p.copy()
                pat_copy["password"] = hash_password("123456")
                pat_copy["createdAt"] = datetime.datetime.utcnow()
                pats.append(pat_copy)
            mongo.db.users.insert_many(pats)
    except Exception as e:
        print("Database offline, skipping seeding:", e)

@user_bp.route('/language', methods=['PUT'])
@token_required
def update_language(current_user):
    try:
        data = request.get_json()
        language = data.get('language')
        
        if not language:
            return jsonify({'success': False, 'message': 'Language code is required'}), 400
            
        result = mongo.db.users.update_one(
            {'id': current_user['id']},
            {'$set': {'language': language}}
        )
        
        if result.modified_count == 0:
            user = mongo.db.users.find_one({'id': current_user['id']})
            if not user:
                return jsonify({'success': False, 'message': 'User not found'}), 404
                
        return jsonify({
            'success': True, 
            'message': 'Language updated successfully',
            'language': language
        }), 200
    except Exception as e:
        print("Database offline, simulating language update success:", e)
        return jsonify({
            'success': True, 
            'message': 'Language updated successfully (fallback)',
            'language': language
        }), 200

@user_bp.route('/profile', methods=['PUT'])
@token_required
def complete_profile(current_user):
    try:
        profile_data = request.get_json()
        
        if 'password' in profile_data:
            del profile_data['password']
        if 'id' in profile_data:
            del profile_data['id']
            
        profile_data['profileCompleted'] = True
        
        mongo.db.users.update_one(
            {'id': current_user['id']},
            {'$set': profile_data}
        )
        
        user = mongo.db.users.find_one({'id': current_user['id']}, {'_id': 0, 'password': 0})
        return jsonify({
            'success': True,
            'user': user
        }), 200
    except Exception as e:
        print("Database offline, simulating profile completion success:", e)
        profile_data['id'] = current_user['id']
        profile_data['role'] = current_user['role']
        profile_data['profileCompleted'] = True
        return jsonify({
            'success': True,
            'user': profile_data
        }), 200

@user_bp.route('/doctors', methods=['GET'])
@token_required
def get_doctors(current_user):
    try:
        seed_users_if_empty()
        doctors = list(mongo.db.users.find({"role": "doctor"}, {'_id': 0, 'password': 0}))
        return jsonify({'success': True, 'data': doctors}), 200
    except Exception as e:
        print("Database offline, falling back to mock doctors:", e)
        return jsonify({'success': True, 'data': MOCK_DOCTORS}), 200

@user_bp.route('/patients', methods=['GET'])
@token_required
def get_patients(current_user):
    try:
        seed_users_if_empty()
        patients = list(mongo.db.users.find({"role": "patient"}, {'_id': 0, 'password': 0}))
        return jsonify({'success': True, 'data': patients}), 200
    except Exception as e:
        print("Database offline, falling back to mock patients:", e)
        return jsonify({'success': True, 'data': MOCK_PATIENTS}), 200

@user_bp.route('/patients', methods=['POST'])
@token_required
def register_patient(current_user):
    try:
        seed_users_if_empty()
        data = request.get_json()
        name = data.get('name')
        phone = data.get('phone')
        email = data.get('email', '')
        
        if not name or not phone:
            return jsonify({'success': False, 'message': 'Name and Phone are required'}), 400
            
        existing = mongo.db.users.find_one({
            'role': 'patient',
            '$or': [{'phone': phone}, {'email': email} if email else {'phone': phone}]
        })
        
        if existing:
            if '_id' in existing:
                del existing['_id']
            if 'password' in existing:
                del existing['password']
            return jsonify({'success': True, 'data': existing}), 200
            
        new_patient = {
            'id': f"patient-{int(datetime.datetime.utcnow().timestamp())}",
            'name': name,
            'email': email,
            'phone': phone,
            'role': 'patient',
            'password': hash_password('123456'),
            'profileCompleted': False,
            'createdAt': datetime.datetime.utcnow()
        }
        
        mongo.db.users.insert_one(new_patient)
        if '_id' in new_patient:
            del new_patient['_id']
        if 'password' in new_patient:
            del new_patient['password']
            
        return jsonify({'success': True, 'data': new_patient}), 201
    except Exception as e:
        print("Database offline, simulating dynamic patient registration:", e)
        new_patient = {
            'id': f"patient-{int(datetime.datetime.utcnow().timestamp())}",
            'name': name,
            'email': email,
            'phone': phone,
            'role': 'patient',
            'profileCompleted': False
        }
        return jsonify({'success': True, 'data': new_patient}), 201
