from flask import Blueprint, request, jsonify
from db import mongo
from utils.auth import hash_password, check_password, generate_token, token_required
import uuid
import datetime

auth_bp = Blueprint('auth', __name__)

def normalize_role(role_name):
    if not role_name:
        return 'PATIENT'
    role = str(role_name).upper().strip()
    role_map = {
        'PATIENT': 'PATIENT',
        'DOCTOR': 'DOCTOR',
        'LAB_ASSISTANT': 'LAB_ASSISTANT',
        'LAB ASSISTANT': 'LAB_ASSISTANT',
        'LAB': 'LAB_ASSISTANT',
        'PHARMACY': 'PHARMACY',
        'PHARMACIST': 'PHARMACY',
        'CLINIC': 'PHARMACY',
        'APPOINTMENT': 'APPOINTMENT',
        'RECEPTIONIST': 'APPOINTMENT',
        'HOSPITAL_ADMIN': 'HOSPITAL_ADMIN',
        'HOSPITAL ADMIN': 'HOSPITAL_ADMIN',
        'SUPER_ADMIN': 'SUPER_ADMIN',
        'SUPER ADMIN': 'SUPER_ADMIN',
        'ADMIN': 'SUPER_ADMIN'
    }
    return role_map.get(role, role)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # We will use email or phone as identifier
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password', '123456') # Default password if not provided by mock frontend
    role = normalize_role(data.get('role', 'patient'))
    
    if not email and not phone:
        return jsonify({'success': False, 'message': 'Email or Phone is required'}), 400
        
    identifier = email if email else phone
    
    # Check if user exists
    existing_user = mongo.db.users.find_one({'$or': [{'email': identifier}, {'phone': identifier}]})
    if existing_user:
        return jsonify({'success': False, 'message': 'User already exists'}), 400
        
    new_user = {
        'id': str(uuid.uuid4()),
        'name': data.get('name', f'User {identifier}'),
        'email': email,
        'phone': phone,
        'password': hash_password(password),
        'role': role,
        'profileCompleted': False,
        'language': 'en', # Default language
        'createdAt': datetime.datetime.utcnow()
    }
    
    mongo.db.users.insert_one(new_user)
    
    # Generate token
    token = generate_token(new_user['id'], role)
    
    return jsonify({
        'success': True,
        'token': token,
        'user': {
            'id': new_user['id'],
            'name': new_user['name'],
            'email': new_user['email'],
            'phone': new_user['phone'],
            'role': new_user['role'],
            'profileCompleted': new_user['profileCompleted'],
            'language': new_user['language']
        }
    }), 201

# Fixed predefined demo accounts credentials
FIXED_DEMO_ACCOUNTS = {
    "patient": {"role": "PATIENT", "name": "Sarah Williams (Demo Patient)", "email": "patient@medassist.ai", "phone": "9876543210", "password": "Patient@123", "id": "demo-patient-uuid"},
    "patient@medassist.ai": {"role": "PATIENT", "name": "Sarah Williams (Demo Patient)", "email": "patient@medassist.ai", "phone": "9876543210", "password": "Patient@123", "id": "demo-patient-uuid"},
    
    "doctor": {"role": "DOCTOR", "name": "Dr. Alexander Smith (Demo Doctor)", "email": "doctor@medassist.ai", "phone": "9876543211", "password": "Doctor@123", "id": "demo-doctor-uuid"},
    "doctor@medassist.ai": {"role": "DOCTOR", "name": "Dr. Alexander Smith (Demo Doctor)", "email": "doctor@medassist.ai", "phone": "9876543211", "password": "Doctor@123", "id": "demo-doctor-uuid"},
    
    "lab": {"role": "LAB_ASSISTANT", "name": "Lab Assistant (Demo)", "email": "lab@medassist.ai", "phone": "9876543212", "password": "Lab@123", "id": "demo-lab-uuid"},
    "lab@medassist.ai": {"role": "LAB_ASSISTANT", "name": "Lab Assistant (Demo)", "email": "lab@medassist.ai", "phone": "9876543212", "password": "Lab@123", "id": "demo-lab-uuid"},
    
    "receptionist": {"role": "APPOINTMENT", "name": "Receptionist (Demo)", "email": "receptionist@medassist.ai", "phone": "9876543213", "password": "Reception@123", "id": "demo-receptionist-uuid"},
    "receptionist@medassist.ai": {"role": "APPOINTMENT", "name": "Receptionist (Demo)", "email": "receptionist@medassist.ai", "phone": "9876543213", "password": "Reception@123", "id": "demo-receptionist-uuid"},
    
    "pharmacy": {"role": "PHARMACY", "name": "Pharmacy Manager (Demo)", "email": "pharmacy@medassist.ai", "phone": "9876543214", "password": "Pharmacy@123", "id": "demo-pharmacy-uuid"},
    "pharmacy@medassist.ai": {"role": "PHARMACY", "name": "Pharmacy Manager (Demo)", "email": "pharmacy@medassist.ai", "phone": "9876543214", "password": "Pharmacy@123", "id": "demo-pharmacy-uuid"},
    
    "hospitaladmin": {"role": "HOSPITAL_ADMIN", "name": "Hospital Admin (Demo)", "email": "admin@medassist.ai", "phone": "9876543215", "password": "Admin@123", "id": "demo-admin-uuid"},
    "admin@medassist.ai": {"role": "HOSPITAL_ADMIN", "name": "Hospital Admin (Demo)", "email": "admin@medassist.ai", "phone": "9876543215", "password": "Admin@123", "id": "demo-admin-uuid"},
    
    "superadmin": {"role": "SUPER_ADMIN", "name": "Super Admin (Demo)", "email": "superadmin@medassist.ai", "phone": "9876543216", "password": "SuperAdmin@123", "id": "demo-superadmin-uuid"},
    "superadmin@medassist.ai": {"role": "SUPER_ADMIN", "name": "Super Admin (Demo)", "email": "superadmin@medassist.ai", "phone": "9876543216", "password": "SuperAdmin@123", "id": "demo-superadmin-uuid"}
}

def find_fixed_demo_by_uuid(uuid_val):
    for identifier, info in FIXED_DEMO_ACCOUNTS.items():
        if info['id'] == uuid_val:
            return {
                'id': info['id'],
                'name': info['name'],
                'email': info['email'],
                'phone': info['phone'],
                'role': normalize_role(info['role']),
                'profileCompleted': True,
                'language': 'en'
            }
    return None

def register_demo_user(demo_info):
    role_normalized = normalize_role(demo_info['role'])
    new_user = {
        'id': demo_info['id'],
        'name': demo_info['name'],
        'email': demo_info['email'],
        'phone': demo_info['phone'],
        'password': hash_password(demo_info['password']),
        'role': role_normalized,
        'profileCompleted': True,
        'language': 'en',
        'createdAt': datetime.datetime.utcnow()
    }
    mongo.db.users.insert_one(new_user)
    return new_user

def seed_demo_accounts():
    try:
        # Only keep unique users based on email
        unique_users = {}
        for identifier, info in FIXED_DEMO_ACCOUNTS.items():
            unique_users[info['email']] = info
            
        for email, info in unique_users.items():
            role_normalized = normalize_role(info['role'])
            existing_user = mongo.db.users.find_one({
                '$or': [{'email': info['email']}, {'phone': info['phone']}]
            })
            if not existing_user:
                register_demo_user(info)
                print(f"Seeded demo account: {info['name']} ({info['email']})")
            else:
                # Ensure existing demo accounts have correct normalized roles and details
                if existing_user.get('role') != role_normalized or not existing_user.get('profileCompleted') or existing_user.get('id') != info['id']:
                    mongo.db.users.update_one(
                        {'id': existing_user['id']},
                        {'$set': {
                            'id': info['id'],
                            'role': role_normalized,
                            'profileCompleted': True,
                            'name': info['name'],
                            'email': info['email'],
                            'phone': info['phone']
                        }}
                    )
                    print(f"Normalized existing demo account: {info['name']} ({info['email']})")
    except Exception as e:
        print("Database offline, skipping seeding of fixed demo accounts:", e)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        identifier = data.get('identifier')
        password = data.get('password')
        role = normalize_role(data.get('role', 'patient'))
        
        if not identifier or not password:
            return jsonify({'success': False, 'message': 'Identifier and password are required'}), 400
            
        identifier_clean = str(identifier).lower().strip()
        demo_info = FIXED_DEMO_ACCOUNTS.get(identifier_clean)
        
        if demo_info:
            if password != demo_info['password']:
                return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
                
            role = normalize_role(demo_info['role'])
            
            # Try to register/sync to database if available
            try:
                user = mongo.db.users.find_one({
                    '$or': [{'email': demo_info['email']}, {'phone': demo_info['phone']}]
                })
                if not user:
                    user = {
                        'id': demo_info['id'],
                        'name': demo_info['name'],
                        'email': demo_info['email'],
                        'phone': demo_info['phone'],
                        'password': hash_password(password),
                        'role': role,
                        'profileCompleted': True,
                        'language': 'en',
                        'createdAt': datetime.datetime.utcnow()
                    }
                    mongo.db.users.insert_one(user)
                else:
                    # Sync role & profileCompleted
                    if user.get('role') != role or not user.get('profileCompleted') or user.get('id') != demo_info['id']:
                        mongo.db.users.update_one(
                            {'id': user['id']},
                            {'$set': {'id': demo_info['id'], 'role': role, 'profileCompleted': True}}
                        )
                        user['id'] = demo_info['id']
                        user['role'] = role
                        user['profileCompleted'] = True
            except Exception as e:
                print("Database offline during demo login, using fallback:", e)
                # Construct fallback user dict
                user = {
                    'id': demo_info['id'],
                    'name': demo_info['name'],
                    'email': demo_info['email'],
                    'phone': demo_info['phone'],
                    'role': role,
                    'profileCompleted': True,
                    'language': 'en'
                }
        else:
            # Regular user authentication
            try:
                user = mongo.db.users.find_one({
                    '$or': [{'email': identifier}, {'phone': identifier}]
                })
                if not user:
                    # Automatically register normal users on first login
                    role = normalize_role(role)
                    user = {
                        'id': str(uuid.uuid4()),
                        'name': f'User {identifier}',
                        'email': identifier if '@' in identifier else '',
                        'phone': identifier if '@' not in identifier else '',
                        'password': hash_password(password),
                        'role': role,
                        'profileCompleted': role != 'PATIENT',
                        'language': 'en',
                        'createdAt': datetime.datetime.utcnow()
                    }
                    mongo.db.users.insert_one(user)
                else:
                    # Verify password
                    if not check_password(password, user['password']):
                        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
            except Exception as e:
                print("Database offline during normal login, cannot authenticate:", e)
                return jsonify({'success': False, 'message': 'Database connection failed. Unable to authenticate new users.'}), 500
                
        user['role'] = normalize_role(user.get('role', 'PATIENT'))
        token = generate_token(user['id'], user['role'])
        
        user_data = {k: v for k, v in user.items() if k not in ['_id', 'password']}
        return jsonify({
            'success': True,
            'token': token,
            'user': user_data
        }), 200
        
    except Exception as e:
        print("Login exception:", e)
        return jsonify({'success': False, 'message': str(e)}), 500

def register_from_login(data):
    identifier = data.get('identifier')
    role = normalize_role(data.get('role', 'patient'))
    login_method = data.get('loginMethod', 'email')
    
    email = identifier if login_method == 'email' else ''
    phone = identifier if login_method == 'phone' else ''
    password = data.get('password', '123456')
    
    new_user = {
        'id': str(uuid.uuid4()),
        'name': f'User {identifier}',
        'email': email,
        'phone': phone,
        'password': hash_password(password),
        'role': role,
        'profileCompleted': role != 'PATIENT',
        'language': 'en',
        'createdAt': datetime.datetime.utcnow()
    }
    
    mongo.db.users.insert_one(new_user)
    token = generate_token(new_user['id'], role)
    
    user_data = {k: v for k, v in new_user.items() if k not in ['_id', 'password']}
    return jsonify({
        'success': True,
        'token': token,
        'user': user_data
    }), 201

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me(current_user):
    try:
        user = mongo.db.users.find_one({'id': current_user['id']})
        if not user:
            demo_user = find_fixed_demo_by_uuid(current_user['id'])
            if demo_user:
                user = demo_user
            else:
                return jsonify({'success': False, 'message': 'User not found'}), 404
    except Exception as e:
        print("Database offline during /me check, seeking fallback:", e)
        demo_user = find_fixed_demo_by_uuid(current_user['id'])
        if demo_user:
            user = demo_user
        else:
            user = {
                'id': current_user['id'],
                'name': f"User {current_user['id'][:8]}",
                'email': 'fallback@medassist.ai',
                'phone': '9876543210',
                'role': current_user['role'],
                'profileCompleted': True,
                'language': 'en'
            }
            
    user['role'] = normalize_role(user.get('role', 'PATIENT'))
    user_data = {k: v for k, v in user.items() if k not in ['_id', 'password']}
    return jsonify({
        'success': True,
        'user': user_data
    }), 200
