from flask import Blueprint, request, jsonify
from db import mongo
from utils.auth import token_required, hash_password
import uuid
import datetime

hospital_bp = Blueprint('hospital', __name__)

DEFAULT_DEPARTMENTS = [
    { "id": "dept-1", "name": "General Medicine", "status": "Active" },
    { "id": "dept-2", "name": "Cardiology", "status": "Active" },
    { "id": "dept-3", "name": "Pediatrics", "status": "Active" },
    { "id": "dept-4", "name": "Orthopedics", "status": "Active" },
    { "id": "dept-5", "name": "Ophthalmology", "status": "Active" },
    { "id": "dept-6", "name": "Dermatology", "status": "Active" }
]

MOCK_STAFF = [
    {"id": "doc-3", "name": "Dr. Alexander Smith (Demo Doctor)", "email": "doctor@medassist.ai", "phone": "9876543211", "role": "Doctor", "department": "General Medicine", "status": "Active"},
    {"id": "lab-1", "name": "Lab Assistant (Demo)", "email": "lab@medassist.ai", "phone": "9876543212", "role": "Lab Technician", "department": "Pathology", "status": "Active"},
    {"id": "rec-1", "name": "Receptionist (Demo)", "email": "receptionist@medassist.ai", "phone": "9876543213", "role": "Receptionist", "department": "Front Desk", "status": "Active"},
    {"id": "pharm-1", "name": "Pharmacy Manager (Demo)", "email": "pharmacy@medassist.ai", "phone": "9876543214", "role": "Pharmacist", "department": "Dispensary", "status": "Active"}
]

def seed_departments_if_empty():
    try:
        if mongo.db.departments.count_documents({}) == 0:
            mongo.db.departments.insert_many(DEFAULT_DEPARTMENTS)
    except Exception as e:
        print("Database offline, skipping seeding departments:", e)

# ======================================================
# STAFF ROUTES
# ======================================================

@hospital_bp.route('/staff', methods=['GET'])
@token_required
def get_staff(current_user):
    try:
        # Retrieve all users who are not patients and not super admins
        staff_users = list(mongo.db.users.find(
            {"role": {"$in": ["doctor", "appointment", "lab", "pharmacy"]}},
            {"_id": 0, "password": 0}
        ))
        
        # Normalize roles for UI display
        role_mapping = {
            "doctor": "Doctor",
            "appointment": "Receptionist",
            "lab": "Lab Technician",
            "pharmacy": "Pharmacist"
        }
        
        normalized = []
        for s in staff_users:
            item = s.copy()
            item["role"] = role_mapping.get(s.get("role", ""), s.get("role", ""))
            item["department"] = s.get("department") or s.get("specialization") or "Hospital Admin"
            item["status"] = "Active" if s.get("isActive", True) is not False else "Inactive"
            normalized.append(item)
            
        return jsonify(normalized), 200
    except Exception as e:
        print("Database offline, returning mock staff list:", e)
        return jsonify(MOCK_STAFF), 200

@hospital_bp.route('/staff', methods=['POST'])
@token_required
def add_staff(current_user):
    name = None
    email = None
    phone = None
    role_label = None
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone')
        role_label = data.get('role')
        department = data.get('department')
        status = data.get('status', 'Active')
        
        if not name or not email or not phone or not role_label:
            return jsonify({'success': False, 'message': 'Missing mandatory staff fields'}), 400
            
        # Map UI role label back to database roles
        role_mapping = {
            "Doctor": "doctor",
            "Receptionist": "appointment",
            "Lab Technician": "lab",
            "Pharmacist": "pharmacy"
        }
        role = role_mapping.get(role_label, role_label.lower())
        
        # Check if user already exists
        existing = mongo.db.users.find_one({'$or': [{'email': email}, {'phone': phone}]})
        if existing:
            return jsonify({'success': False, 'message': 'A user with this email or phone already exists'}), 400
            
        staff_id = f"staff-{str(uuid.uuid4())[:8]}"
        new_staff = {
            'id': staff_id,
            'name': name,
            'email': email,
            'phone': phone,
            'role': role,
            'password': hash_password('123456'), # default password
            'department': department,
            'specialization': department if role == 'doctor' else '',
            'specialty': department if role == 'doctor' else '',
            'consultantType': 'doctor' if role == 'doctor' else '',
            'isActive': status == 'Active',
            'profileCompleted': True,
            'createdAt': datetime.datetime.utcnow()
        }
        
        mongo.db.users.insert_one(new_staff)
        
        # Return normalized staff item
        ret = new_staff.copy()
        if '_id' in ret: del ret['_id']
        if 'password' in ret: del ret['password']
        ret["role"] = role_label
        ret["status"] = status
        
        return jsonify({'success': True, 'data': ret}), 201
    except Exception as e:
        print("Database offline, simulating add staff:", e)
        if not name or not email or not phone or not role_label:
            return jsonify({'success': False, 'message': 'Missing mandatory staff fields'}), 400
        staff_id = f"staff-{str(uuid.uuid4())[:8]}"
        ret = {
            'id': staff_id,
            'name': name,
            'email': email,
            'phone': phone,
            'role': role_label,
            'department': department or "General Medicine",
            'status': status
        }
        MOCK_STAFF.append(ret)
        return jsonify({'success': True, 'data': ret}), 201

@hospital_bp.route('/staff/<id>', methods=['PUT'])
@token_required
def update_staff(current_user, id):
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone')
        role_label = data.get('role')
        department = data.get('department')
        status = data.get('status')
        
        # Find existing staff
        staff_member = mongo.db.users.find_one({'id': id})
        if not staff_member:
            return jsonify({'success': False, 'message': 'Staff member not found'}), 404
            
        role_mapping = {
            "Doctor": "doctor",
            "Receptionist": "appointment",
            "Lab Technician": "lab",
            "Pharmacist": "pharmacy"
        }
        
        updates = {}
        if name is not None: updates['name'] = name
        if email is not None: updates['email'] = email
        if phone is not None: updates['phone'] = phone
        if role_label is not None:
            role = role_mapping.get(role_label, role_label.lower())
            updates['role'] = role
            if role == 'doctor' and department is not None:
                updates['specialization'] = department
                updates['specialty'] = department
                updates['consultantType'] = 'doctor'
        if department is not None:
            updates['department'] = department
            if staff_member.get('role') == 'doctor' or updates.get('role') == 'doctor':
                updates['specialization'] = department
                updates['specialty'] = department
                
        if status is not None:
            updates['isActive'] = (status == 'Active')
            
        mongo.db.users.update_one({'id': id}, {'$set': updates})
        
        updated_staff = mongo.db.users.find_one({'id': id}, {'_id': 0, 'password': 0})
        
        # Normalize roles for UI display
        ret_role = role_label or role_mapping.get(updated_staff.get('role', ''), updated_staff.get('role', ''))
        ret = updated_staff.copy()
        ret["role"] = ret_role
        ret["department"] = updated_staff.get("department") or updated_staff.get("specialization") or "Hospital Admin"
        ret["status"] = "Active" if updated_staff.get("isActive", True) is not False else "Inactive"
        
        return jsonify({'success': True, 'data': ret}), 200
    except Exception as e:
        print("Database offline, simulating update staff:", e)
        # Update in mock staff list
        for s in MOCK_STAFF:
            if s['id'] == id:
                if name is not None: s['name'] = name
                if email is not None: s['email'] = email
                if phone is not None: s['phone'] = phone
                if role_label is not None: s['role'] = role_label
                if department is not None: s['department'] = department
                if status is not None: s['status'] = status
                return jsonify({'success': True, 'data': s}), 200
        return jsonify({'success': False, 'message': 'Staff member not found in mock'}), 404

@hospital_bp.route('/staff/<id>', methods=['DELETE'])
@token_required
def delete_staff(current_user, id):
    try:
        result = mongo.db.users.delete_one({'id': id})
        if result.deleted_count == 0:
            return jsonify({'success': False, 'message': 'Staff member not found'}), 404
            
        return jsonify({'success': True, 'message': 'Staff member deleted successfully'}), 200
    except Exception as e:
        print("Database offline, simulating delete staff:", e)
        # Delete from mock list
        for idx, s in enumerate(MOCK_STAFF):
            if s['id'] == id:
                del MOCK_STAFF[idx]
                return jsonify({'success': True, 'message': 'Staff member deleted successfully'}), 200
        return jsonify({'success': False, 'message': 'Staff member not found in mock'}), 404


# ======================================================
# DEPARTMENTS ROUTES
# ======================================================

@hospital_bp.route('/departments', methods=['GET'])
@token_required
def get_departments(current_user):
    try:
        seed_departments_if_empty()
        departments = list(mongo.db.departments.find({}, {'_id': 0}))
        
        # Calculate live doctor and staff count dynamically
        enriched = []
        for d in departments:
            dept_name = d.get("name", "")
            # Doctors count
            doctors_count = mongo.db.users.count_documents({
                "role": "doctor",
                "$or": [{"department": dept_name}, {"specialization": dept_name}]
            })
            # Total staff count in department
            staff_count = mongo.db.users.count_documents({
                "role": {"$in": ["doctor", "appointment", "lab", "pharmacy"]},
                "$or": [{"department": dept_name}, {"specialization": dept_name}]
            })
            
            item = d.copy()
            item["doctors"] = doctors_count
            item["staff"] = staff_count
            enriched.append(item)
            
        return jsonify(enriched), 200
    except Exception as e:
        print("Database offline, returning fallback departments:", e)
        # Construct fallback enriched departments list
        enriched = []
        for d in DEFAULT_DEPARTMENTS:
            item = d.copy()
            item["doctors"] = 1
            item["staff"] = 2
            enriched.append(item)
        return jsonify(enriched), 200

@hospital_bp.route('/departments', methods=['POST'])
@token_required
def add_department(current_user):
    name = None
    status = "Active"
    try:
        data = request.get_json()
        name = data.get('name')
        status = data.get('status', 'Active')
        
        if not name:
            return jsonify({'success': False, 'message': 'Department name is required'}), 400
            
        # Check if department already exists
        existing = mongo.db.departments.find_one({'name': name})
        if existing:
            return jsonify({'success': False, 'message': 'Department already exists'}), 400
            
        dept_id = f"dept-{str(uuid.uuid4())[:8]}"
        new_dept = {
            'id': dept_id,
            'name': name,
            'status': status
        }
        
        mongo.db.departments.insert_one(new_dept)
        
        ret = new_dept.copy()
        if '_id' in ret: del ret['_id']
        ret["doctors"] = 0
        ret["staff"] = 0
        
        return jsonify({'success': True, 'data': ret}), 201
    except Exception as e:
        print("Database offline, simulating add department:", e)
        if not name:
            return jsonify({'success': False, 'message': 'Department name is required'}), 400
        dept_id = f"dept-{str(uuid.uuid4())[:8]}"
        ret = {
            'id': dept_id,
            'name': name,
            'status': status,
            'doctors': 0,
            'staff': 0
        }
        DEFAULT_DEPARTMENTS.append(ret)
        return jsonify({'success': True, 'data': ret}), 201

@hospital_bp.route('/departments/<id>', methods=['PUT'])
@token_required
def update_department(current_user, id):
    try:
        data = request.get_json()
        name = data.get('name')
        status = data.get('status')
        
        dept = mongo.db.departments.find_one({'id': id})
        if not dept:
            return jsonify({'success': False, 'message': 'Department not found'}), 404
            
        updates = {}
        if name is not None: updates['name'] = name
        if status is not None: updates['status'] = status
        
        mongo.db.departments.update_one({'id': id}, {'$set': updates})
        
        updated_dept = mongo.db.departments.find_one({'id': id}, {'_id': 0})
        
        # Calculate counts
        dept_name = updated_dept.get("name", "")
        doctors_count = mongo.db.users.count_documents({
            "role": "doctor",
            "$or": [{"department": dept_name}, {"specialization": dept_name}]
        })
        staff_count = mongo.db.users.count_documents({
            "role": {"$in": ["doctor", "appointment", "lab", "pharmacy"]},
            "$or": [{"department": dept_name}, {"specialization": dept_name}]
        })
        
        ret = updated_dept.copy()
        ret["doctors"] = doctors_count
        ret["staff"] = staff_count
        
        return jsonify({'success': True, 'data': ret}), 200
    except Exception as e:
        print("Database offline, simulating update department:", e)
        for d in DEFAULT_DEPARTMENTS:
            if d['id'] == id:
                if name is not None: d['name'] = name
                if status is not None: d['status'] = status
                ret = d.copy()
                ret['doctors'] = 1
                ret['staff'] = 2
                return jsonify({'success': True, 'data': ret}), 200
        return jsonify({'success': False, 'message': 'Department not found in mock'}), 404

@hospital_bp.route('/departments/<id>', methods=['DELETE'])
@token_required
def delete_department(current_user, id):
    try:
        result = mongo.db.departments.delete_one({'id': id})
        if result.deleted_count == 0:
            return jsonify({'success': False, 'message': 'Department not found'}), 404
            
        return jsonify({'success': True, 'message': 'Department deleted successfully'}), 200
    except Exception as e:
        print("Database offline, simulating delete department:", e)
        for idx, d in enumerate(DEFAULT_DEPARTMENTS):
            if d['id'] == id:
                del DEFAULT_DEPARTMENTS[idx]
                return jsonify({'success': True, 'message': 'Department deleted successfully'}), 200
        return jsonify({'success': False, 'message': 'Department not found in mock'}), 404
