import os
import datetime
from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from db import mongo
from utils.auth import token_required

report_bp = Blueprint('report', __name__)

UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'uploads'))
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Mock reports seed data
MOCK_REPORTS = [
    {
        "id": "LR-10241",
        "patientName": "Aarav Sharma",
        "patientId": "P-2041",
        "patientAge": 34,
        "patientGender": "Male",
        "testName": "Complete Blood Count",
        "testType": "Hematology",
        "doctor": "Dr. Meera Iyer",
        "doctorSpecialty": "General Physician",
        "sampleDate": "2026-05-14",
        "reportDate": "2026-05-15",
        "status": "Completed",
        "notes": "All values within normal range.",
        "history": [
            { "date": "2026-05-14 09:12", "event": "Sample collected" },
            { "date": "2026-05-14 11:30", "event": "Sample received in lab" },
            { "date": "2026-05-15 08:45", "event": "Analysis completed" },
            { "date": "2026-05-15 10:20", "event": "Report verified & released" }
        ],
        "attachments": []
    },
    {
        "id": "LR-10242",
        "patientName": "Priya Nair",
        "patientId": "P-2042",
        "patientAge": 28,
        "patientGender": "Female",
        "testName": "Lipid Profile",
        "testType": "Biochemistry",
        "doctor": "Dr. Rohan Mehta",
        "doctorSpecialty": "Cardiologist",
        "sampleDate": "2026-05-15",
        "reportDate": "—",
        "status": "Pending",
        "history": [{ "date": "2026-05-15 08:00", "event": "Sample collected" }],
        "attachments": []
    },
    {
        "id": "LR-10243",
        "patientName": "Vikram Singh",
        "patientId": "P-2043",
        "patientAge": 45,
        "patientGender": "Male",
        "testName": "Thyroid Function (TSH, T3, T4)",
        "testType": "Endocrinology",
        "doctor": "Dr. Anjali Rao",
        "doctorSpecialty": "Endocrinologist",
        "sampleDate": "2026-05-15",
        "reportDate": "—",
        "status": "In Progress",
        "history": [
            { "date": "2026-05-15 07:40", "event": "Sample collected" },
            { "date": "2026-05-15 09:10", "event": "Analysis in progress" }
        ],
        "attachments": []
    },
    {
        "id": "LR-10244",
        "patientName": "Sneha Kapoor",
        "patientId": "P-2044",
        "patientAge": 31,
        "patientGender": "Female",
        "testName": "HbA1c",
        "testType": "Biochemistry",
        "doctor": "Dr. Karan Verma",
        "doctorSpecialty": "Diabetologist",
        "sampleDate": "2026-05-13",
        "reportDate": "2026-05-14",
        "status": "Completed",
        "notes": "Within target range.",
        "history": [
            { "date": "2026-05-13 10:00", "event": "Sample collected" },
            { "date": "2026-05-14 09:30", "event": "Report released" }
        ],
        "attachments": []
    }
]

def seed_db_if_empty():
    try:
        if mongo.db.reports.count_documents({}) == 0:
            mongo.db.reports.insert_many(MOCK_REPORTS)
    except Exception as e:
        print("Database offline, skipping seeding reports:", e)

@report_bp.route('', methods=['GET'])
@token_required
def get_reports(current_user):
    try:
        seed_db_if_empty()
        reports = list(mongo.db.reports.find({}, {'_id': 0}))
        return jsonify(reports), 200
    except Exception as e:
        print("Database offline, returning mock reports:", e)
        return jsonify(MOCK_REPORTS), 200

@report_bp.route('/uploads/<filename>', methods=['GET'])
def get_uploaded_file(filename):
    return send_from_directory(UPLOADS_DIR, filename)

@report_bp.route('/upload', methods=['POST'])
@token_required
def upload_report(current_user):
    record_id = None
    status = 'Completed'
    notes = ''
    test_values = ''
    try:
        seed_db_if_empty()
        
        record_id = request.form.get('recordId')
        status = request.form.get('status', 'Completed')
        notes = request.form.get('notes', '')
        test_values = request.form.get('testValues', '')
        
        if not record_id:
            return jsonify({'success': False, 'message': 'Record ID is required'}), 400
            
        report = mongo.db.reports.find_one({'id': record_id})
        if not report:
            # Create a new record dynamically if it doesn't exist
            patient_name = request.form.get('patientName', 'Unknown Patient')
            patient_id = request.form.get('patientId', 'P-Unknown')
            test_name = request.form.get('testName', 'General Lab Test')
            test_type = request.form.get('testType', 'Biochemistry')
            doctor_name = request.form.get('doctor', 'Dr. General')
            doctor_spec = request.form.get('doctorSpecialty', 'General Physician')
            
            report = {
                'id': record_id,
                'patientName': patient_name,
                'patientId': patient_id,
                'patientAge': int(request.form.get('patientAge', 30)),
                'patientGender': request.form.get('patientGender', 'Female'),
                'testName': test_name,
                'testType': test_type,
                'doctor': doctor_name,
                'doctorSpecialty': doctor_spec,
                'sampleDate': datetime.date.today().isoformat(),
                'reportDate': '—',
                'status': status,
                'notes': notes,
                'testValues': test_values,
                'history': [{
                    'date': datetime.datetime.now().strftime('%Y-%m-%d %H:%M'),
                    'event': 'Report record created'
                }],
                'attachments': []
            }
            mongo.db.reports.insert_one(report)
            report = mongo.db.reports.find_one({'id': record_id})
    except Exception as e:
        print("Database offline during report check, simulating local structure:", e)
        # Find in mock reports
        report = None
        for r in MOCK_REPORTS:
            if r['id'] == record_id:
                report = r
                break
        if not report:
            patient_name = request.form.get('patientName', 'Unknown Patient')
            patient_id = request.form.get('patientId', 'P-Unknown')
            test_name = request.form.get('testName', 'General Lab Test')
            test_type = request.form.get('testType', 'Biochemistry')
            doctor_name = request.form.get('doctor', 'Dr. General')
            doctor_spec = request.form.get('doctorSpecialty', 'General Physician')
            
            report = {
                'id': record_id,
                'patientName': patient_name,
                'patientId': patient_id,
                'patientAge': int(request.form.get('patientAge', 30)),
                'patientGender': request.form.get('patientGender', 'Female'),
                'testName': test_name,
                'testType': test_type,
                'doctor': doctor_name,
                'doctorSpecialty': doctor_spec,
                'sampleDate': datetime.date.today().isoformat(),
                'reportDate': '—',
                'status': status,
                'notes': notes,
                'testValues': test_values,
                'history': [{
                    'date': datetime.datetime.now().strftime('%Y-%m-%d %H:%M'),
                    'event': 'Report record created'
                }],
                'attachments': []
            }
            MOCK_REPORTS.append(report)

    # Handle file upload
    attachments = []
    if 'file' in request.files:
        files = request.files.getlist('file')
        for file in files:
            if file and file.filename:
                orig_name = file.filename
                # Generate unique secure filename
                timestamp = int(datetime.datetime.now().timestamp())
                secure_name = f"{timestamp}_{secure_filename(orig_name)}"
                file_path = os.path.join(UPLOADS_DIR, secure_name)
                try:
                    file.save(file_path)
                    file_size = os.path.getsize(file_path)
                except Exception as ex:
                    print("Error saving uploaded file locally:", ex)
                    file_size = 0
                
                # Expose access path
                rel_path = f"/api/reports/uploads/{secure_name}"
                
                attachments.append({
                    'originalName': orig_name,
                    'filename': secure_name,
                    'path': rel_path,
                    'mimetype': file.mimetype or 'application/octet-stream',
                    'size': file_size,
                    'uploadedAt': datetime.datetime.now().isoformat()
                })

    # Update history events
    new_history = list(report.get('history', []))
    now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    new_history.append({
        'date': now_str,
        'event': f"Status changed to {status}"
    })
    for att in attachments:
        new_history.append({
            'date': now_str,
            'event': f"File attached: {att['originalName']}"
        })

    # Combine attachments
    old_attachments = report.get('attachments', [])
    updated_attachments = old_attachments + attachments

    # Update document in MongoDB / Fallback
    try:
        mongo.db.reports.update_one(
            {'id': record_id},
            {'$set': {
                'status': status,
                'notes': notes,
                'testValues': test_values,
                'reportDate': datetime.date.today().isoformat() if status == 'Completed' else '—',
                'attachments': updated_attachments,
                'history': new_history,
                'labAssistant': current_user.get('name', 'Lab Assistant')
            }}
        )
        updated_report = mongo.db.reports.find_one({'id': record_id}, {'_id': 0})
    except Exception as e:
        print("Database offline, updating in-memory mock reports instead:", e)
        # Update in-memory mock list
        for r in MOCK_REPORTS:
            if r['id'] == record_id:
                r['status'] = status
                r['notes'] = notes
                r['testValues'] = test_values
                r['reportDate'] = datetime.date.today().isoformat() if status == 'Completed' else '—'
                r['attachments'] = updated_attachments
                r['history'] = new_history
                r['labAssistant'] = current_user.get('name', 'Lab Assistant')
                updated_report = r.copy()
                break
                
    return jsonify({
        'success': True,
        'message': 'Report saved and uploaded successfully',
        'report': updated_report
    }), 200
