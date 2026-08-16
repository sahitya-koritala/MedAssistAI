import { apiRequest } from './api';
import { hospitalDataService } from './hospitalDataService';

const wrapResponse = (data) => ({ data });

// ─── Appointments ──────────────────────────────────────────
export const createAppointment = async (data) => {
  const res = await apiRequest('/appointments', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (res.success && res.data) {
    hospitalDataService.addAppointment(res.data);
  }
  return wrapResponse(res);
};

export const getTodayAppointments = async (doctorId) => {
  const query = doctorId && doctorId !== 'all' ? `?doctorId=${doctorId}` : '';
  const res = await apiRequest(`/appointments${query}`);
  
  if (res.success && res.data) {
    // Sync with local storage
    const localData = JSON.parse(localStorage.getItem("medassist_hospital_data") || "{}");
    localData.appointments = res.data;
    localStorage.setItem("medassist_hospital_data", JSON.stringify(localData));
  }
  return wrapResponse(res);
};

export const cancelAppointment = async (id) => {
  const res = await apiRequest(`/appointments/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'Cancelled' })
  });
  if (res.success && res.data) {
    hospitalDataService.updateAppointmentStatus(id, 'Cancelled');
  }
  return wrapResponse(res);
};

export const startAppointment = async (id) => {
  const res = await apiRequest(`/appointments/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'in-progress' })
  });
  if (res.success && res.data) {
    hospitalDataService.updateAppointmentStatus(id, 'in-progress');
  }
  return wrapResponse(res);
};

export const completeAppointment = async (id) => {
  const res = await apiRequest(`/appointments/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'completed' })
  });
  if (res.success && res.data) {
    hospitalDataService.updateAppointmentStatus(id, 'completed');
  }
  return wrapResponse(res);
};

export const skipAppointment = async (id) => {
  const res = await apiRequest(`/appointments/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'skipped' })
  });
  if (res.success && res.data) {
    hospitalDataService.updateAppointmentStatus(id, 'skipped');
  }
  return wrapResponse(res);
};

// ─── Slots ────────────────────────────────────────────────
export const getAvailableSlots = async (doctorId, date) => {
  const res = await apiRequest(`/appointments/slots?doctorId=${doctorId}&date=${date}`);
  return wrapResponse(res);
};

export const generateSlots = async (data) => {
  return wrapResponse({ success: true });
};

// ─── Queue ────────────────────────────────────────────────
export const getQueue = async (doctorId, date) => {
  const queryDate = date ? `&date=${date}` : '';
  const res = await apiRequest(`/appointments/queue?doctorId=${doctorId}${queryDate}`);
  return wrapResponse(res);
};

export const getQueueStats = async (doctorId, date) => {
  const queryDate = date ? `&date=${date}` : '';
  const res = await apiRequest(`/appointments/queue/stats?doctorId=${doctorId}${queryDate}`);
  return wrapResponse(res);
};

// ─── Availability ─────────────────────────────────────────
export const getAvailability = async (doctorId) => {
  return wrapResponse({
    success: true,
    data: {
      doctorId,
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      slots: ["09:00 AM - 01:00 PM", "02:00 PM - 05:00 PM"]
    }
  });
};

// ─── Patients ─────────────────────────────────────────────
export const searchPatients = async (keyword) => {
  const res = await apiRequest('/users/patients');
  if (res.success && res.data) {
    const keywordLower = keyword.toLowerCase();
    const filtered = res.data.filter(p => 
      p.name?.toLowerCase().includes(keywordLower) || 
      p.phone?.toLowerCase().includes(keywordLower) ||
      p.email?.toLowerCase().includes(keywordLower)
    );
    return wrapResponse({ success: true, data: filtered });
  }
  return wrapResponse({ success: false, data: [] });
};

export const createPatient = async (data) => {
  const res = await apiRequest('/users/patients', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  if (res.success && res.data) {
    hospitalDataService.addPatient(res.data);
  }
  return wrapResponse(res);
};

// ─── Doctors ──────────────────────────────────────────────
export const getDoctors = async () => {
  const res = await apiRequest('/users/doctors');
  if (res.success && res.data) {
    const docs = res.data.map(d => ({
      ...d,
      consultantType: d.consultantType || 'doctor'
    }));
    return wrapResponse({ success: true, data: docs });
  }
  return wrapResponse(res);
};

const API = {
  createAppointment,
  getTodayAppointments,
  cancelAppointment,
  startAppointment,
  completeAppointment,
  skipAppointment,
  getAvailableSlots,
  generateSlots,
  getQueue,
  getQueueStats,
  getAvailability,
  searchPatients,
  createPatient,
  getDoctors
};

export default API;
