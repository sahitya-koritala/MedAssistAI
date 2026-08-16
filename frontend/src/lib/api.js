import { reportsStore } from "./reports-store.js";
import { testsStore } from "./tests-store.js";
const BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "https://medassistai-5.onrender.com";

const TOKEN_KEY = "medico_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Auth
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: () => request("/auth/me"),

  // Patients
  listPatients: () => request("/patients"),
  // Appointments
  listAppointments: (patientId) =>
    request(`/appointments${patientId ? `?patient=${patientId}` : ""}`),
  // Services
  listServices: () => request("/services"),
  // Bills
  listBills: () => request("/bills"),
  getBill: (id) => request(`/bills/${id}`),
  createBill: (data) => request("/bills", { method: "POST", body: JSON.stringify(data) }),
  deleteBill: (id) => request(`/bills/${id}`, { method: "DELETE" }),
  payBill: (id, data) => request(`/bills/${id}/payments`, { method: "POST", body: JSON.stringify(data) }),

  // Reports
  reportSummary: (from, to) =>
    request(`/reports/summary${from || to ? `?from=${from || ""}&to=${to || ""}` : ""}`),

  // AI
  analyzeSymptoms: (symptoms) => request("/ai/analyze-symptoms", { method: "POST", body: JSON.stringify({ symptoms }) }),
  predictDisease: (symptoms) => request("/ai/predict-disease", { method: "POST", body: JSON.stringify({ symptoms }) }),
  analyzeReport: (reportContent) => request("/ai/analyze-report", { method: "POST", body: JSON.stringify({ reportContent }) }),
  analyzeImage: (imageData) => request("/ai/analyze-image", { method: "POST", body: JSON.stringify({ imageData }) }),
  getRecommendations: (healthData) => request("/ai/get-recommendations", { method: "POST", body: JSON.stringify({ healthData }) }),
};
// Simulate API delays for realistic UX
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchReports() {
  try {
    const res = await request("/reports");
    const list = Array.isArray(res) ? res : (res.data || []);
    reportsStore.set(list);
    return list;
  } catch (error) {
    console.error("Failed to fetch reports from backend", error);
    return reportsStore.get();
  }
}

export async function fetchPendingReports() {
  try {
    const res = await request("/reports");
    const list = Array.isArray(res) ? res : (res.data || []);
    reportsStore.set(list);
    return list.filter((r) => r.status !== "Completed");
  } catch (error) {
    console.error("Failed to fetch pending reports from backend", error);
    return reportsStore.get().filter((r) => r.status !== "Completed");
  }
}

export async function fetchTests() {
  await delay(300);
  return testsStore.get();
}

export async function createTest(payload) {
  await delay(400);
  const test = { id: `T-${String(testsStore.get().length + 1).padStart(3, "0")}`, ...payload };
  testsStore.add(payload);
  return test;
}

export async function updateTest(id, payload) {
  await delay(400);
  testsStore.update(id, payload);
  const tests = testsStore.get();
  return tests.find((t) => t.id === id);
}

export async function deleteTest(id) {
  await delay(400);
  testsStore.remove(id);
  return undefined;
}

export async function uploadReportRecord(payload) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${BASE}/reports/upload`;
    
    xhr.open("POST", url, true);
    
    // Set authorization header if exists
    const token = getToken();
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    
    // Track actual upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        payload.onProgress?.(percent);
      }
    };
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.success) {
            reportsStore.update(payload.recordId, res.report);
            resolve(res.report);
          } else {
            reject(new Error(res.message || "Upload failed"));
          }
        } catch (e) {
          reject(new Error("Invalid server response format"));
        }
      } else {
        reject(new Error(`Server returned error: ${xhr.status} ${xhr.statusText}`));
      }
    };
    
    xhr.onerror = () => {
      reject(new Error("Network error during report upload"));
    };
    
    // Create FormData and append fields
    const fd = new FormData();
    fd.append("recordId", payload.recordId);
    fd.append("status", payload.status);
    fd.append("notes", payload.notes || "");
    fd.append("testValues", payload.testValues || "");
    
    // Metadata if creating a new report dynamically
    if (payload.patientName) fd.append("patientName", payload.patientName);
    if (payload.patientId) fd.append("patientId", payload.patientId);
    if (payload.testName) fd.append("testName", payload.testName);
    if (payload.testType) fd.append("testType", payload.testType);
    if (payload.doctor) fd.append("doctor", payload.doctor);
    if (payload.doctorSpecialty) fd.append("doctorSpecialty", payload.doctorSpecialty);
    
    // Attach selected files
    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((f) => {
        fd.append("file", f);
      });
    }
    
    xhr.send(fd);
  });
}

export async function updateReportStatus(id, status, notes = "") {
  await delay(400);
  reportsStore.update(id, {
    status,
    notes,
    reportDate: status === "Completed" ? new Date().toISOString().split("T")[0] : "—",
  });
  const reports = reportsStore.get();
  return reports.find((r) => r.id === id);
}

// ======================================================
// HOSPITAL STAFF MANAGEMENT
// ======================================================

export async function fetchHospitalStaff() {
  return request("/hospital/staff");
}

export async function addHospitalStaff(payload) {
  return request("/hospital/staff", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateHospitalStaff(id, payload) {
  return request(`/hospital/staff/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteHospitalStaff(id) {
  return request(`/hospital/staff/${id}`, {
    method: "DELETE"
  });
}

// ======================================================
// HOSPITAL DEPARTMENTS MANAGEMENT
// ======================================================

export async function fetchHospitalDepartments() {
  return request("/hospital/departments");
}

export async function addHospitalDepartment(payload) {
  return request("/hospital/departments", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateHospitalDepartment(id, payload) {
  return request(`/hospital/departments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteHospitalDepartment(id) {
  return request(`/hospital/departments/${id}`, {
    method: "DELETE"
  });
}

// ======================================================
// CENTRALIZED PATIENTS API
// ======================================================

export async function fetchPatients() {
  return request("/users/patients");
}

export async function addPatient(payload) {
  return request("/users/patients", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
