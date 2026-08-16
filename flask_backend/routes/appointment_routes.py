import datetime
import random
from flask import Blueprint, request, jsonify
from db import mongo
from utils.auth import token_required

appointment_bp = Blueprint('appointment', __name__)

# Standard available timeslots
ALL_SLOTS = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", 
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"
]

MOCK_APPOINTMENTS = [
    {
        "id": "appt-1",
        "patientId": "patient-1",
        "patientName": "Alice Cooper",
        "patientPhone": "9876543210",
        "doctorId": "doc-3",
        "doctorName": "Dr. Alexander Smith",
        "date": datetime.date.today().isoformat(),
        "time": "09:30 AM",
        "scheduledTime": "09:30 AM",
        "reason": "General Checkup",
        "status": "Waiting",
        "consultantType": "doctor",
        "tokenNumber": 1,
        "priority": "normal",
        "notes": "Regular checkup",
        "createdAt": datetime.datetime.utcnow().isoformat()
    }
]

def seed_appointments_if_empty():
    try:
        if mongo.db.appointments.count_documents({}) == 0:
            mongo.db.appointments.insert_one(MOCK_APPOINTMENTS[0])
    except Exception as e:
        print("Database offline, skipping seeding appointments:", e)

@appointment_bp.route('', methods=['GET'])
@token_required
def get_appointments(current_user):
    try:
        seed_appointments_if_empty()
        
        doctor_id = request.args.get('doctorId')
        patient_id = request.args.get('patientId')
        date = request.args.get('date')
        
        query = {}
        if doctor_id:
            query['doctorId'] = doctor_id
        if patient_id:
            query['patientId'] = patient_id
        if date:
            query['date'] = date
            
        appts = list(mongo.db.appointments.find(query).sort('time', 1))
        for a in appts:
            if '_id' in a:
                a['_id'] = str(a['_id'])
            a['scheduledTime'] = a.get('time', '')
        return jsonify({'success': True, 'data': appts}), 200
    except Exception as e:
        print("Database offline, returning mock appointments:", e)
        # Filter mock appointments in memory
        doctor_id = request.args.get('doctorId')
        patient_id = request.args.get('patientId')
        date = request.args.get('date')
        
        filtered = []
        for appt in MOCK_APPOINTMENTS:
            match = True
            if doctor_id and appt['doctorId'] != doctor_id:
                match = False
            if patient_id and appt['patientId'] != patient_id:
                match = False
            if date and appt['date'] != date:
                match = False
            if match:
                filtered.append(appt)
        return jsonify({'success': True, 'data': filtered}), 200

@appointment_bp.route('', methods=['POST'])
@token_required
def create_appointment(current_user):
    patient_id = None
    patient_name = None
    patient_phone = ""
    doctor_id = None
    doctor_name = None
    appt_date = None
    appt_time = "09:00 AM"
    reason = "Regular consultation"
    priority = "normal"
    consultant_type = "doctor"
    try:
        seed_appointments_if_empty()
        
        data = request.get_json()
        patient_id = data.get('patientId')
        patient_name = data.get('patientName')
        patient_phone = data.get('patientPhone', '')
        doctor_id = data.get('doctorId')
        doctor_name = data.get('doctorName')
        appt_date = data.get('date')
        appt_time = data.get('time') or data.get('slot') or "09:00 AM"
        reason = data.get('reason') or data.get('notes') or "Regular consultation"
        priority = data.get('priority', 'normal')
        consultant_type = data.get('consultantType', 'doctor')
        
        if not patient_id or not patient_name or not doctor_id or not appt_date:
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
            
        # Check for double booking (excluding cancelled appointments)
        existing_appt = mongo.db.appointments.find_one({
            'doctorId': doctor_id,
            'date': appt_date,
            'time': appt_time,
            'status': {'$nin': ['cancelled', 'Cancelled']}
        })
        if existing_appt:
            return jsonify({'success': False, 'message': 'This slot is already booked for this doctor'}), 409
            
        # Generate token number
        today_count = mongo.db.appointments.count_documents({
            'doctorId': doctor_id,
            'date': appt_date
        })
        token_number = today_count + 1
        
        appt_id = f"appt-{int(datetime.datetime.utcnow().timestamp())}-{random.randint(1000, 9999)}"
        
        new_appt = {
            "id": appt_id,
            "patientId": patient_id,
            "patientName": patient_name,
            "patientPhone": patient_phone,
            "doctorId": doctor_id,
            "doctorName": doctor_name,
            "date": appt_date,
            "time": appt_time,
            "scheduledTime": appt_time,
            "reason": reason,
            "status": "Waiting",
            "consultantType": consultant_type,
            "tokenNumber": token_number,
            "priority": priority,
            "notes": reason,
            "createdAt": datetime.datetime.utcnow().isoformat()
        }
        
        mongo.db.appointments.insert_one(new_appt)
        if '_id' in new_appt:
            new_appt['_id'] = str(new_appt['_id'])
            
        return jsonify({'success': True, 'data': new_appt}), 201
    except Exception as e:
        print("Database offline, simulating appointment booking:", e)
        if not patient_id or not patient_name or not doctor_id or not appt_date:
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        appt_id = f"appt-{int(datetime.datetime.utcnow().timestamp())}-{random.randint(1000, 9999)}"
        new_appt = {
            "id": appt_id,
            "patientId": patient_id,
            "patientName": patient_name,
            "patientPhone": patient_phone,
            "doctorId": doctor_id,
            "doctorName": doctor_name,
            "date": appt_date,
            "time": appt_time,
            "scheduledTime": appt_time,
            "reason": reason,
            "status": "Waiting",
            "consultantType": consultant_type,
            "tokenNumber": random.randint(1, 10),
            "priority": priority,
            "notes": reason,
            "createdAt": datetime.datetime.utcnow().isoformat()
        }
        # Save to mock in-memory array so it is returned on subsequent GETs
        MOCK_APPOINTMENTS.append(new_appt)
        return jsonify({'success': True, 'data': new_appt}), 201

@appointment_bp.route('/<appt_id>/status', methods=['PUT'])
@token_required
def update_status(current_user, appt_id):
    try:
        seed_appointments_if_empty()
        
        data = request.get_json()
        status = data.get('status')
        
        if not status:
            return jsonify({'success': False, 'message': 'Status is required'}), 400
            
        result = mongo.db.appointments.update_one(
            {'id': appt_id},
            {'$set': {'status': status}}
        )
        
        if result.matched_count == 0:
            return jsonify({'success': False, 'message': 'Appointment not found'}), 404
            
        updated = mongo.db.appointments.find_one({'id': appt_id})
        if updated and '_id' in updated:
            updated['_id'] = str(updated['_id'])
            updated['scheduledTime'] = updated.get('time', '')
        return jsonify({'success': True, 'data': updated}), 200
    except Exception as e:
        print("Database offline, simulating status change:", e)
        # Find in mock
        for appt in MOCK_APPOINTMENTS:
            if appt['id'] == appt_id:
                appt['status'] = status
                return jsonify({'success': True, 'data': appt}), 200
        return jsonify({'success': False, 'message': 'Appointment not found in fallback'}), 404

@appointment_bp.route('/slots', methods=['GET'])
@token_required
def get_available_slots(current_user):
    try:
        seed_appointments_if_empty()
        
        doctor_id = request.args.get('doctorId')
        date = request.args.get('date')
        
        if not doctor_id or not date:
            return jsonify({'success': False, 'message': 'Doctor ID and Date are required'}), 400
            
        # Get all active bookings for this doctor on this day
        booked_appts = list(mongo.db.appointments.find({
            'doctorId': doctor_id,
            'date': date,
            'status': {'$nin': ['cancelled', 'Cancelled']}
        }, {'time': 1, '_id': 0}))
        
        booked_times = {appt['time'] for appt in booked_appts}
        
        available_slots = [slot for slot in ALL_SLOTS if slot not in booked_times]
        return jsonify({'success': True, 'data': available_slots}), 200
    except Exception as e:
        print("Database offline, returning all slots as available:", e)
        return jsonify({'success': True, 'data': ALL_SLOTS}), 200

@appointment_bp.route('/queue', methods=['GET'])
@token_required
def get_queue(current_user):
    try:
        seed_appointments_if_empty()
        
        doctor_id = request.args.get('doctorId')
        date = request.args.get('date')
        
        if not doctor_id:
            return jsonify({'success': False, 'message': 'Doctor ID is required'}), 400
            
        if not date:
            date = datetime.date.today().isoformat()
            
        appts = list(mongo.db.appointments.find({
            'doctorId': doctor_id,
            'date': date,
            'status': {'$in': ['Waiting', 'Scheduled', 'in-progress', 'waiting', 'scheduled']}
        }, {'_id': 0}).sort('time', 1))
        
        queue_items = []
        for idx, appt in enumerate(appts):
            status_lower = appt['status'].lower()
            queue_items.append({
                "id": appt['id'],
                "patientName": appt['patientName'],
                "appointmentTime": appt['time'],
                "time": appt['time'],
                "reason": appt['reason'],
                "status": 'in-progress' if status_lower == 'in-progress' else 'waiting',
                "patient": {"name": appt['patientName'], "id": appt['patientId']},
                "queueNumber": idx + 1
            })
            
        return jsonify({'success': True, 'data': queue_items}), 200
    except Exception as e:
        print("Database offline, filtering queue in-memory:", e)
        doctor_id = request.args.get('doctorId')
        date = request.args.get('date') or datetime.date.today().isoformat()
        
        filtered = []
        for idx, appt in enumerate(MOCK_APPOINTMENTS):
            status_lower = appt.get('status', 'waiting').lower()
            if appt['doctorId'] == doctor_id and appt['date'] == date and status_lower in ['waiting', 'scheduled', 'in-progress']:
                filtered.append({
                    "id": appt['id'],
                    "patientName": appt['patientName'],
                    "appointmentTime": appt['time'],
                    "time": appt['time'],
                    "reason": appt['reason'],
                    "status": 'in-progress' if status_lower == 'in-progress' else 'waiting',
                    "patient": {"name": appt['patientName'], "id": appt['patientId']},
                    "queueNumber": len(filtered) + 1
                })
        return jsonify({'success': True, 'data': filtered}), 200

@appointment_bp.route('/queue/stats', methods=['GET'])
@token_required
def get_queue_stats(current_user):
    try:
        seed_appointments_if_empty()
        
        doctor_id = request.args.get('doctorId')
        date = request.args.get('date')
        
        if not doctor_id:
            return jsonify({'success': False, 'message': 'Doctor ID is required'}), 400
            
        if not date:
            date = datetime.date.today().isoformat()
            
        appts = list(mongo.db.appointments.find({
            'doctorId': doctor_id,
            'date': date
        }))
        
        waiting = len([a for a in appts if a.get('status') in ['Waiting', 'Scheduled', 'waiting', 'scheduled']])
        in_progress = len([a for a in appts if a.get('status') in ['in-progress', 'In Consultation']])
        completed = len([a for a in appts if a.get('status') in ['completed', 'Completed']])
        
        return jsonify({
            'success': True,
            'data': {
                'waiting': waiting,
                'inProgress': in_progress,
                'completed': completed,
                'estimatedWaitMinutes': waiting * 15
            }
        }), 200
    except Exception as e:
        print("Database offline, returning queue stats fallback:", e)
        doctor_id = request.args.get('doctorId')
        date = request.args.get('date') or datetime.date.today().isoformat()
        
        waiting = 0
        in_progress = 0
        completed = 0
        for appt in MOCK_APPOINTMENTS:
            if appt['doctorId'] == doctor_id and appt['date'] == date:
                status_lower = appt.get('status', 'waiting').lower()
                if status_lower in ['waiting', 'scheduled']:
                    waiting += 1
                elif status_lower in ['in-progress', 'in consultation']:
                    in_progress += 1
                elif status_lower in ['completed']:
                    completed += 1
        return jsonify({
            'success': True,
            'data': {
                'waiting': waiting,
                'inProgress': in_progress,
                'completed': completed,
                'estimatedWaitMinutes': waiting * 15
            }
        }), 200
