import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../../services/appointmentApi";
import toast, { Toaster } from "react-hot-toast";

const AppointmentScheduler = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.getTodayAppointments("all");
      setAppointments(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load appointments");
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await api.cancelAppointment(appointmentId);
        toast.success("Appointment cancelled");
        fetchAppointments();
      } catch (err) {
        toast.error("Failed to cancel appointment");
        setError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Scheduler</h1>
          <p className="text-sm text-gray-500 mt-1">Review scheduled consultations and track booking updates.</p>
        </div>
        <button
          onClick={() => navigate("/appointment/add")}
          className="px-4 py-2 bg-[#0F5C3A] text-white rounded-lg hover:bg-[#0A3E2A] transition text-sm font-semibold"
        >
          Schedule Appointment
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {appointments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No appointments scheduled. Click 'Schedule Appointment' to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-900">Patient</th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-900">Doctor</th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-900">Date & Time</th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-900">Reason</th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id || appointment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-semibold">{appointment.patientName}</div>
                      <div className="text-xs text-gray-400 font-mono">{appointment.patientId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{appointment.doctorName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{appointment.date}</div>
                      <div className="text-xs text-gray-400">{appointment.time || appointment.scheduledTime}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {appointment.reason || appointment.notes}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          appointment.status?.toLowerCase() === "completed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status?.toLowerCase() === "cancelled"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      {appointment.status?.toLowerCase() !== "cancelled" && appointment.status?.toLowerCase() !== "completed" && (
                        <button
                          onClick={() => handleCancelAppointment(appointment.id || appointment._id)}
                          className="text-rose-600 hover:text-rose-900 transition font-bold"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentScheduler;
