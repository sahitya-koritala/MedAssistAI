import { useState, useEffect } from "react";
import { Calendar, Search, Clock, CheckCircle, XCircle, User } from "lucide-react";
import { hospitalDataService } from "../../services/hospitalDataService";
import { useTranslation } from "react-i18next";

export default function DoctorAppointments() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("Today");
  const [search, setSearch] = useState("");
  const [appointments, setAppointments] = useState([
    { id: 1, patient: "Alice Cooper", time: "09:00 AM", status: "Completed", reason: "General Checkup" },
    { id: 2, patient: "John Doe", time: "10:00 AM", status: "Confirmed", reason: "Follow-up" },
    { id: 3, patient: "Sarah Miller", time: "11:00 AM", status: "Pending", reason: "Consultation" },
    { id: 4, patient: "Robert Brown", time: "02:00 PM", status: "Cancelled", reason: "Blood Pressure" },
  ]);

  const loadAppointments = () => {
    const list = hospitalDataService.getAppointments();
    const mapped = list.map(a => ({
      id: a.id,
      patient: a.patientName,
      time: `${a.date} at ${a.time}`,
      status: a.status,
      reason: a.reason
    }));
    if (mapped.length > 0) {
      setAppointments(mapped);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const filteredAppointments = appointments.filter(a => 
    (a.patient || "").toLowerCase().includes(search.toLowerCase()) || 
    (a.reason || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = (id, status) => {
    if (String(id).startsWith("appt-")) {
      hospitalDataService.updateAppointmentStatus(id, status);
      loadAppointments();
    } else {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    }
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('doctorAppointments.appointmentManagementTitle', 'Appointment Management')}</h1>
          <p className="text-gray-500">{t('doctorAppointments.manageAppointments', 'Manage your patient appointments')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-wrap gap-2 mb-4">
              {["Today", "Upcoming", "Completed", "Cancelled"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                    activeTab === tab
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('doctorAppointments.searchAppointments', 'Search appointments...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">{t('doctorAppointments.patient', 'Patient')}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">{t('doctorAppointments.time', 'Time')}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">{t('doctorAppointments.reason', 'Reason')}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">{t('doctorAppointments.status', 'Status')}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">{t('doctorAppointments.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="font-semibold text-gray-900">{appt.patient}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4" />
                        {appt.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{appt.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        appt.status === "Completed" ? "bg-green-100 text-green-700" :
                        appt.status === "Confirmed" ? "bg-blue-100 text-blue-700" :
                        appt.status === "Cancelled" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {appt.status === "Pending" && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(appt.id, "Confirmed")}
                              className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleStatusChange(appt.id, "Cancelled")}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}