import React, { useState, useEffect } from "react";
import { PlayCircle, CheckCircle, RefreshCw, User, Stethoscope, Clock } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import * as api from "../../services/appointmentApi";

const PatientQueue = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch doctors on mount
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await api.getDoctors();
        const docs = res.data?.data || [];
        setDoctors(docs);
        if (docs.length > 0) {
          setSelectedDoctorId(docs[0].id);
        }
      } catch (err) {
        console.error("Failed to load doctors:", err);
      }
    };
    loadDoctors();
  }, []);

  // 2. Fetch queue when selected doctor changes
  useEffect(() => {
    if (!selectedDoctorId) return;
    fetchQueue();
    // Refresh queue every 15 seconds
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, [selectedDoctorId]);

  const fetchQueue = async () => {
    if (!selectedDoctorId) return;
    try {
      const res = await api.getQueue(selectedDoctorId);
      setQueue(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch queue.");
      console.error("Error fetching queue:", err);
    }
  };

  const handleMarkAsServed = async (apptId) => {
    try {
      await api.completeAppointment(apptId);
      toast.success("Patient marked as served");
      fetchQueue();
    } catch (err) {
      toast.error("Failed to mark patient as served");
      console.error("Error marking patient as served:", err);
    }
  };

  const handleStartConsultation = async (apptId) => {
    try {
      await api.startAppointment(apptId);
      toast.success("Consultation started");
      fetchQueue();
    } catch (err) {
      toast.error("Failed to start consultation");
      console.error("Error starting consultation:", err);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Today's Live Queue</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage waiting lists for active consultants.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 flex-1 sm:w-64">
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-[#0F5C3A] focus:ring-2 focus:ring-[#0F5C3A]/10 transition"
            >
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} ({doc.specialty || doc.specialization})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchQueue}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition"
            title="Refresh Queue"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {queue.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
            No patients currently waiting in queue for this doctor.
          </div>
        ) : (
          queue.map((appt, index) => {
            const isServing = appt.status === "in-progress";
            return (
              <div
                key={appt.id}
                className={`p-6 rounded-[2rem] shadow-sm border transition-all ${
                  isServing
                    ? "bg-emerald-50/50 border-emerald-500/30 ring-1 ring-emerald-500/10"
                    : "bg-white border-gray-100"
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                      isServing ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{appt.patientName}</h3>
                        {isServing && (
                          <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full animate-pulse">
                            Active Consultation
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Patient ID: {appt.patient?.id || appt.patientId}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400" /> Appt: {appt.appointmentTime || appt.time}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                        <span>Reason: {appt.reason || "General Visit"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    {!isServing ? (
                      <button
                        onClick={() => handleStartConsultation(appt.id)}
                        className="flex-1 sm:flex-none h-10 px-4 bg-[#0F5C3A] hover:bg-[#0A3E2A] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/5 hover:scale-105 transition"
                      >
                        <PlayCircle className="w-4 h-4" /> Start Consultation
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkAsServed(appt.id)}
                        className="flex-1 sm:flex-none h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/5 hover:scale-105 transition"
                      >
                        <CheckCircle className="w-4 h-4" /> Complete Visit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PatientQueue;
