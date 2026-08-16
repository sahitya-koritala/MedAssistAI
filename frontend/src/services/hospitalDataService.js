
// Centralized Hospital Data Service
// This service manages shared data that all roles access

const STORAGE_KEY = "medassist_hospital_data";

// Initialize default data structure if none exists
const getInitialData = () => ({
  patients: [
    {
      id: "patient-1",
      name: "Alice Cooper",
      email: "alice.cooper@email.com",
      phone: "9876543210",
      role: "patient",
      profileCompleted: true,
      gender: "Female",
      age: 34,
      address: "Medical District, Hyderabad",
      emergencyContactName: "Bob Cooper",
      emergencyContactNumber: "9876543211",
      createdAt: new Date().toISOString()
    }
  ],
  doctors: [
    {id: "doc-1", name:"Dr. Sarah Johnson", specialization:"General Medicine", phone:"+1234567890"},
    {id: "doc-2", name:"Dr. Michael Chen", specialization:"Cardiology", phone:"+0987654321"},
    {id: "doc-3", name:"Dr. Alexander Smith", specialization:"General Medicine", phone:"+9998887776"}
  ],
  appointments: [
    { id: "appt-1", patientId: "patient-1", patientName: "Alice Cooper", doctorId: "doc-3", doctorName: "Dr. Alexander Smith", date: new Date().toISOString().split("T")[0], time: "09:30 AM", reason: "General Checkup", status: "Waiting", consultantType: "doctor", createdAt: new Date().toISOString() }
  ],
  labReports: [],
  prescriptions: [],
  medications: [
    { id: "med-1", name: "Paracetamol 500mg", quantity: 100, available: true, price:10 },
    { id: "med-2", name: "Ibuprofen 400mg", quantity: 50, available: true, price:15 },
    { id: "med-3", name: "Amoxicillin 250mg", quantity: 75, available: true, price:20 },
    { id: "med-4", name: "Vitamin D3", quantity: 200, available: true, price:8 }
  ],
  notifications: [],
  patientMedicalRecords: {
    "patient-1": {
      personalProfile: {
        id: "patient-1",
        name: "Alice Cooper",
        email: "alice.cooper@email.com",
        phone: "9876543210",
        role: "patient",
        profileCompleted: true,
        gender: "Female",
        age: 34,
        address: "Medical District, Hyderabad",
        emergencyContactName: "Bob Cooper",
        emergencyContactNumber: "9876543211"
      },
      medicalHistory: [
        {
          id: "hist-1",
          date: new Date().toISOString().split("T")[0],
          time: "09:00 AM",
          type: "Diagnosis",
          details: "Seasonal Allergies",
          items: ["Sneezing, watery eyes", "Avoid pollen"],
          doctor: "Dr. Sarah Johnson",
          doctorSpecialty: "General Medicine",
          note: "Antihistamines prescribed."
        }
      ],
      uploadedReports: [],
      aiSymptomAnalyses: [],
      diseasePredictions: [],
      medicalImageAnalyses: [],
      aiRecommendations: [],
      doctorNotes: [],
      prescriptions: [],
      appointments: [],
      emergencyDetails: { name: "Bob Cooper", phone: "9876543211" }
    }
  },
  aiPredictions: [
    {
      id: "pred-1",
      patientId: "patient-1",
      patientName: "Alice Cooper",
      symptoms: ["Fever", "Cough", "Fatigue"],
      prediction: "Viral Infection",
      confidence: 87,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      recommendedSpecialist: "General Physician",
      suggestedTests: ["CBC", "Chest X-ray"],
      precautions: ["Rest and hydrate", "Avoid cold drinks"],
      aiRecommendations: ["Monitor temperature", "Isolate if contagious"]
    }
  ],
  imageAnalyses: [
    {
      id: "img-1",
      patientId: "patient-1",
      patientName: "Alice Cooper",
      type: "X-ray",
      date: new Date().toISOString().split("T")[0],
      status: "AI Processed",
      aiFinding: "Mild opacity in lower right lung field",
      confidence: 91,
      severity: "Moderate",
      explanation: "Features consistent with early pneumonia.",
      suggestedSpecialist: "Pulmonologist",
      followUpRecommendation: "Repeat X-ray in 2 weeks"
    }
  ],
  auditLogs: []
});

const getHospitalData = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  const initial = getInitialData();
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      return {
        ...initial,
        ...parsed,
        patients: parsed.patients || initial.patients,
        doctors: parsed.doctors || initial.doctors,
        appointments: parsed.appointments || initial.appointments,
        labReports: parsed.labReports || initial.labReports,
        prescriptions: parsed.prescriptions || initial.prescriptions,
        medications: parsed.medications || initial.medications,
        patientMedicalRecords: parsed.patientMedicalRecords || initial.patientMedicalRecords,
        notifications: parsed.notifications || initial.notifications,
        auditLogs: parsed.auditLogs || initial.auditLogs
      };
    } catch (e) {
      console.error("Failed to parse hospital data:", e);
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const saveHospitalData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const hospitalDataService = {
  // Patients
  getPatients: () => getHospitalData().patients,
  addPatient: (patient) => {
    const data = getHospitalData();
    const newPatient = { id: patient.id || `patient-${Date.now()}`, ...patient, createdAt: new Date().toISOString() };
    data.patients.push(newPatient);
    data.patientMedicalRecords[newPatient.id] = {
      personalProfile: newPatient,
      medicalHistory: [],
      uploadedReports: [],
      aiSymptomAnalyses: [],
      diseasePredictions: [],
      medicalImageAnalyses: [],
      aiRecommendations: [],
      doctorNotes: [],
      prescriptions: [],
      appointments: [],
      emergencyDetails: { name: patient.emergencyContactName, phone: patient.emergencyContactNumber }
    };
    saveHospitalData(data);
    return newPatient;
  },
  updatePatient: (patientId, updates) => {
    const data = getHospitalData();
    const idx = data.patients.findIndex(p => p.id === patientId);
    if (idx >= 0) {
      data.patients[idx] = { ...data.patients[idx], ...updates };
      if (!data.patientMedicalRecords[patientId]) {
        data.patientMedicalRecords[patientId] = { medicalHistory: [], uploadedReports: [], prescriptions: [], appointments: [] };
      }
      data.patientMedicalRecords[patientId].personalProfile = { ...data.patientMedicalRecords[patientId].personalProfile, ...updates };
      saveHospitalData(data);
      return data.patients[idx];
    }
    return null;
  },
  getPatientById: (patientId) => getHospitalData().patients.find(p => p.id === patientId),
  getPatientMedicalRecord: (patientId) => getHospitalData().patientMedicalRecords[patientId] || null,
  
  // Doctors
  getDoctors: () => getHospitalData().doctors,
  
  // Appointments
  getAppointments: () => getHospitalData().appointments,
  addAppointment: (appointment) => {
    const data = getHospitalData();
    const newAppointment = { id: appointment.id || `appt-${Date.now()}`, ...appointment, createdAt: new Date().toISOString(), status: appointment.status || "Scheduled" };
    data.appointments.push(newAppointment);
    
    // Add to patient's record
    if (!data.patientMedicalRecords[appointment.patientId]) {
      data.patientMedicalRecords[appointment.patientId] = { medicalHistory: [], uploadedReports: [], prescriptions: [], appointments: [] };
    }
    data.patientMedicalRecords[appointment.patientId].appointments = data.patientMedicalRecords[appointment.patientId].appointments || [];
    data.patientMedicalRecords[appointment.patientId].appointments.push(newAppointment);
    
    // Create notification
    hospitalDataService.addNotification({
      title: "New Appointment Scheduled",
      message: `Appointment with ${appointment.doctorName} scheduled for ${appointment.date}`,
      type: "info",
      targetRoles: ["DOCTOR", "PATIENT", "SUPER_ADMIN", "HOSPITAL_ADMIN"],
      targetIds: [appointment.doctorId, appointment.patientId]
    });
    saveHospitalData(data);
    return newAppointment;
  },
  updateAppointment: (appointmentId, updates) => {
    const data = getHospitalData();
    const idx = data.appointments.findIndex(a => a.id === appointmentId);
    if (idx >= 0) {
      data.appointments[idx] = { ...data.appointments[idx], ...updates };
      saveHospitalData(data);
      return data.appointments[idx];
    }
    return null;
  },
  updateAppointmentStatus: (appointmentId, status) => {
    return hospitalDataService.updateAppointment(appointmentId, { status });
  },

  // Lab Reports
  getLabReports: () => getHospitalData().labReports,
  addLabReport: (report) => {
    const data = getHospitalData();
    const newReport = { id: report.id || `lab-${Date.now()}`, ...report, createdAt: new Date().toISOString(), status: "Available" };
    data.labReports.push(newReport);
    if (!data.patientMedicalRecords[report.patientId]) {
      data.patientMedicalRecords[report.patientId] = { medicalHistory: [], uploadedReports: [], prescriptions: [], appointments: [] };
    }
    data.patientMedicalRecords[report.patientId].uploadedReports = data.patientMedicalRecords[report.patientId].uploadedReports || [];
    data.patientMedicalRecords[report.patientId].uploadedReports.push(newReport);
    
    // Create notification
    hospitalDataService.addNotification({
      title: "New Lab Report Available",
      message: `A new ${report.type} report is available for ${report.patientName}`,
      type: "info",
      targetRoles: ["DOCTOR", "PATIENT", "SUPER_ADMIN", "HOSPITAL_ADMIN"],
      targetIds: [report.doctorId, report.patientId]
    });
    saveHospitalData(data);
    return newReport;
  },

  // Prescriptions
  getPrescriptions: () => getHospitalData().prescriptions,
  addPrescription: (prescription) => {
    const data = getHospitalData();
    const newPrescription = { id: prescription.id || `rx-${Date.now()}`, ...prescription, createdAt: new Date().toISOString(), status: "Pending" };
    data.prescriptions.push(newPrescription);
    if (!data.patientMedicalRecords[prescription.patientId]) {
      data.patientMedicalRecords[prescription.patientId] = { medicalHistory: [], uploadedReports: [], prescriptions: [], appointments: [] };
    }
    data.patientMedicalRecords[prescription.patientId].prescriptions = data.patientMedicalRecords[prescription.patientId].prescriptions || [];
    data.patientMedicalRecords[prescription.patientId].prescriptions.push(newPrescription);
    
    // Notify pharmacy and patient
    hospitalDataService.addNotification({
      title: "New Prescription Received",
      message: `New prescription from ${prescription.doctorName} for ${prescription.patientName}`,
      type: "info",
      targetRoles: ["PHARMACY", "PATIENT", "SUPER_ADMIN", "HOSPITAL_ADMIN"],
      targetIds: [prescription.patientId]
    });
    saveHospitalData(data);
    return newPrescription;
  },
  updatePrescriptionStatus: (prescriptionId, status, dispensedBy=null) => {
    const data = getHospitalData();
    const idx = data.prescriptions.findIndex(rx => rx.id === prescriptionId);
    if (idx >= 0) {
      data.prescriptions[idx].status = status;
      if (dispensedBy) data.prescriptions[idx].dispensedBy = dispensedBy;
      data.prescriptions[idx].dispensedAt = new Date().toISOString();
      
      // Notify doctor and patient
      hospitalDataService.addNotification({
        title: "Prescription Updated",
        message: `Prescription status changed to ${status}`,
        type: "success",
        targetRoles: ["DOCTOR", "PATIENT", "SUPER_ADMIN", "HOSPITAL_ADMIN"],
        targetIds: [data.prescriptions[idx].doctorId, data.prescriptions[idx].patientId]
      });
      saveHospitalData(data);
      return data.prescriptions[idx];
    }
    return null;
  },

  // Medications / Inventory
  getMedications: () => getHospitalData().medications,
  updateMedication: (medId, updates) => {
    const data = getHospitalData();
    const idx = data.medications.findIndex(m => m.id === medId);
    if (idx >= 0) {
      data.medications[idx] = { ...data.medications[idx], ...updates };
      if (data.medications[idx].quantity <= 0) data.medications[idx].available = false;
      saveHospitalData(data);
      return data.medications[idx];
    }
    return null;
  },

  // AI Predictions
  getAIPredictions: () => getHospitalData().aiPredictions || [],
  addAIPrediction: (prediction) => {
    const data = getHospitalData();
    data.aiPredictions = data.aiPredictions || [];
    const newPred = { id: prediction.id || `pred-${Date.now()}`, ...prediction, status: prediction.status || "Pending", createdAt: new Date().toISOString() };
    data.aiPredictions.push(newPred);
    saveHospitalData(data);
    return newPred;
  },
  updateAIPredictionStatus: (id, status, finalDiagnosis, notes = "") => {
    const data = getHospitalData();
    const idx = data.aiPredictions.findIndex(p => p.id === id);
    if (idx >= 0) {
      data.aiPredictions[idx].status = status;
      if (finalDiagnosis) data.aiPredictions[idx].finalDiagnosis = finalDiagnosis;
      if (notes) data.aiPredictions[idx].notes = notes;
      
      const pred = data.aiPredictions[idx];
      saveHospitalData(data);

      // Add to patient diagnosis history
      hospitalDataService.addDiagnosisRecord({
        patientId: pred.patientId,
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "Diagnosis",
        details: finalDiagnosis || pred.prediction,
        items: [
          `AI Prediction: ${pred.prediction} (Confidence: ${pred.confidence}%)`,
          `Symptom Review Status: ${status}`
        ],
        doctor: "Dr. Alexander Smith",
        doctorSpecialty: "General Practitioner",
        note: notes || `AI prediction reviewed and marked as ${status}.`
      });
      
      return data.aiPredictions[idx];
    }
    return null;
  },

  // Image Analyses
  getImageAnalyses: () => getHospitalData().imageAnalyses || [],
  addImageAnalysis: (analysis) => {
    const data = getHospitalData();
    data.imageAnalyses = data.imageAnalyses || [];
    const newAnalysis = { id: analysis.id || `img-${Date.now()}`, ...analysis, createdAt: new Date().toISOString() };
    data.imageAnalyses.push(newAnalysis);
    saveHospitalData(data);
    return newAnalysis;
  },

  // Diagnosis History
  addDiagnosisRecord: (record) => {
    const data = getHospitalData();
    const patientId = record.patientId;
    if (!data.patientMedicalRecords[patientId]) {
      const patient = data.patients.find(p => p.id === patientId);
      data.patientMedicalRecords[patientId] = {
        personalProfile: patient || { id: patientId, name: record.patientName || "Unknown Patient" },
        medicalHistory: [],
        uploadedReports: [],
        prescriptions: [],
        appointments: []
      };
    }
    const newRecord = { id: `hist-${Date.now()}`, ...record };
    data.patientMedicalRecords[patientId].medicalHistory = data.patientMedicalRecords[patientId].medicalHistory || [];
    data.patientMedicalRecords[patientId].medicalHistory.push(newRecord);
    saveHospitalData(data);
    return newRecord;
  },

  // Aggregated timeline for a patient
  getPatientTimeline: (patientId) => {
    const record = hospitalDataService.getPatientMedicalRecord(patientId);
    if (!record) return [];

    const timeline = [];

    // 1. Diagnoses
    if (record.medicalHistory) {
      record.medicalHistory.forEach(h => {
        timeline.push({
          ...h,
          eventDate: new Date(h.date),
          type: "Diagnosis",
          title: "Doctor Diagnosis",
          description: h.details,
          items: h.items || [],
          notes: h.note,
          doctorName: h.doctor,
          doctorSpecialty: h.doctorSpecialty
        });
      });
    }

    // 2. Prescriptions
    const prescriptions = hospitalDataService.getPrescriptions().filter(p => p.patientId === patientId);
    prescriptions.forEach(p => {
      const medList = p.medications ? p.medications.map(m => `${m.medicine} (${m.dosage}, ${m.frequency})`) : [];
      timeline.push({
        id: p.id,
        date: new Date(p.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        time: new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        eventDate: new Date(p.createdAt),
        type: "Rx",
        title: "Prescription (Rx)",
        description: p.diagnosis || "Medical Prescription",
        items: medList,
        notes: p.notes || "Complete course as instructed.",
        doctorName: p.doctorName || "Dr. Alexander Smith",
        doctorSpecialty: p.doctorSpecialty || "General Practitioner"
      });
    });

    // 3. Lab Reports
    const labReports = hospitalDataService.getLabReports().filter(r => r.patientId === patientId);
    labReports.forEach(r => {
      timeline.push({
        id: r.id,
        date: new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        time: new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        eventDate: new Date(r.createdAt),
        type: "Lab Report",
        title: `Lab Report: ${r.type}`,
        description: r.notes || "Report processed",
        items: [
          r.cbc ? `CBC: ${r.cbc}` : null,
          r.sugar ? `Sugar Level: ${r.sugar}` : null,
          r.cholesterol ? `Cholesterol: ${r.cholesterol}` : null,
          r.hemoglobin ? `Hemoglobin: ${r.hemoglobin}` : null,
          r.findings ? `Findings: ${r.findings}` : null
        ].filter(Boolean),
        notes: r.comments || "",
        doctorName: "Laboratory Technican",
        doctorSpecialty: "Diagnostic Lab"
      });
    });

    // 4. Image Analyses
    const imageAnalyses = hospitalDataService.getImageAnalyses().filter(i => i.patientId === patientId);
    imageAnalyses.forEach(i => {
      timeline.push({
        id: i.id,
        date: new Date(i.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        time: new Date(i.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        eventDate: new Date(i.createdAt),
        type: "Imaging Report",
        title: `AI Scan: ${i.type}`,
        description: i.aiFinding,
        items: [`Confidence: ${i.confidence}%`, `Severity: ${i.severity}`, i.followUpRecommendation],
        notes: i.explanation || "",
        doctorName: "AI Scanner Subsystem",
        doctorSpecialty: "Radiology AI"
      });
    });

    // 5. Appointments
    const appointments = hospitalDataService.getAppointments().filter(a => a.patientId === patientId);
    appointments.forEach(a => {
      timeline.push({
        id: a.id,
        date: new Date(a.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        time: a.time,
        eventDate: new Date(a.createdAt),
        type: "Appointment",
        title: "Appointment Booked",
        description: `${a.reason} (${a.status})`,
        items: [`Doctor: ${a.doctorName}`, `Time slot: ${a.time}`, `Date scheduled: ${a.date}`],
        notes: "",
        doctorName: a.doctorName,
        doctorSpecialty: "General Medicine"
      });
    });

    // Sort descending by event date
    return timeline.sort((a, b) => b.eventDate - a.eventDate);
  },

  // Notifications
  getNotifications: () => getHospitalData().notifications,
  addNotification: (notification) => {
    const data = getHospitalData();
    data.notifications = data.notifications || [];
    const newNotification = { id: `notif-${Date.now()}`, ...notification, createdAt: new Date().toISOString(), read: false };
    data.notifications.push(newNotification);
    saveHospitalData(data);
    return newNotification;
  },
  markNotificationRead: (notificationId) => {
    const data = getHospitalData();
    const notif = data.notifications.find(n => n.id === notificationId);
    if (notif) { notif.read = true; saveHospitalData(data); }
  },

  // Audit Logs
  getAuditLogs: () => getHospitalData().auditLogs,
  addAuditLog: (log) => {
    const data = getHospitalData();
    data.auditLogs.push({ id: `log-${Date.now()}`, ...log, timestamp: new Date().toISOString() });
    saveHospitalData(data);
  }
};

