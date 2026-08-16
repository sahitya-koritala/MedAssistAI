import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, User, Clock, Search, RefreshCw, XCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import * as api from "../../services/appointmentApi";

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getTodayAppointments("all");
      setAppointments(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      toast.error("Failed to load appointment history");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (apptId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.cancelAppointment(apptId);
      toast.success("Appointment cancelled successfully");
      fetchHistory();
    } catch (err) {
      toast.error("Failed to cancel appointment");
    }
  };

  const filtered = appointments.filter(
    (a) =>
      a.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (s === "cancelled") return "bg-rose-50 text-rose-700 border-rose-100";
    if (s === "in-progress") return "bg-blue-50 text-blue-700 border-blue-100";
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment History</h1>
          <p className="text-sm text-gray-500 mt-1">View, track, and manage all scheduled and completed appointments.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patient, doctor, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-[#0F5C3A] focus:ring-2 focus:ring-[#0F5C3A]/10 transition"
            />
          </div>
          <button
            onClick={fetchHistory}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition"
            title="Refresh List"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading appointment records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No appointment records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Appointment ID</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{appt.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex flex-col">
                        <span>{appt.patientName}</span>
                        <span className="text-xs text-gray-400 font-mono">{appt.patientId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex flex-col">
                        <span>{appt.doctorName}</span>
                        <span className="text-xs text-gray-400 capitalize">{appt.consultantType || "Doctor"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {appt.date}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3.5 h-3.5 text-gray-400" /> {appt.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{appt.reason || appt.notes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold capitalize ${getStatusStyle(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {appt.status?.toLowerCase() !== "cancelled" && appt.status?.toLowerCase() !== "completed" && (
                        <button
                          onClick={() => handleCancel(appt.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Cancel Appointment"
                        >
                          <XCircle className="w-5 h-5" />
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

export default AppointmentHistory;
