// ======================================================
// ROLE ENUMERATION
// ======================================================

export const Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  HOSPITAL_ADMIN: "HOSPITAL_ADMIN",
  DOCTOR: "DOCTOR",
  LAB_ASSISTANT: "LAB_ASSISTANT",
  PHARMACY: "PHARMACY",
  PATIENT: "PATIENT",
};

// ======================================================
// MOCK USERS DATABASE
// ======================================================

export const users = [

  // ======================================================
  // SUPER ADMIN
  // ======================================================

  {
    id: "admin-1",
    name: "System Admin",
    email: "admin.medassist",
    phone: "9001000001",
    password: "assistadmin",
    role: Role.SUPER_ADMIN,
    profileCompleted: true,
    isActive: true,
  },

  // ======================================================
  // DOCTOR
  // ======================================================

  {
    id: "doctor-1",
    name: "Dr. Alexander Smith",
    email: "doctor.medassist",
    phone: "9001000002",
    password: "assistdoctor",
    role: Role.DOCTOR,
    profileCompleted: true,
    isActive: true,
  },

  // ======================================================
  // LAB ASSISTANT
  // ======================================================

  {
    id: "lab-1",
    name: "Lab Assistant",
    email: "lab.medassist",
    phone: "9001000003",
    password: "assistlab",
    role: Role.LAB_ASSISTANT,
    profileCompleted: true,
    isActive: true,
  },

  // ======================================================
  // PHARMACY
  // ======================================================

  {
    id: "pharmacy-1",
    name: "Pharmacy Manager",
    email: "pharmacy.medassist",
    phone: "9001000004",
    password: "assistpharmacy",
    role: Role.PHARMACY,
    profileCompleted: true,
    isActive: true,
  },

  // ======================================================
  // HOSPITAL ADMIN
  // ======================================================

  {
    id: "hospital-1",
    name: "Hospital Admin",
    email: "adminhospital.medassist",
    phone: "9001000005",
    password: "assistadminhosp",
    role: Role.HOSPITAL_ADMIN,
    profileCompleted: true,
    isActive: true,
  },

  // ======================================================
  // PATIENT
  // ======================================================

  {
    id: "patient-1",
    name: "Sarah Williams",
    email: "patient.medassist",
    phone: "9001000006",
    password: "assistpatient",
    role: Role.PATIENT,
    profileCompleted: false,
    isActive: true,
  },

];

// ======================================================
// PATIENTS
// ======================================================

export const initialPatients = [
  {
    id: "1",
    name: "Alice Cooper",
    age: 34,
    gender: "Female",
    status: "In-patient",
    lastVisit: "2024-03-10",
  },

  {
    id: "2",
    name: "Bob Marley",
    age: 45,
    gender: "Male",
    status: "Out-patient",
    lastVisit: "2024-03-12",
  },

  {
    id: "3",
    name: "Charlie Sheen",
    age: 52,
    gender: "Male",
    status: "Emergency",
    lastVisit: "2024-03-14",
  },

  {
    id: "4",
    name: "Diana Ross",
    age: 29,
    gender: "Female",
    status: "In-patient",
    lastVisit: "2024-03-15",
  },
];