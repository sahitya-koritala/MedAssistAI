import { useState, useEffect } from "react";
import { Search, User, Plus, Edit, Trash2, FileText, Calendar, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { fetchPatients, addPatient } from "../../lib/api";
import { hospitalDataService } from "../../services/hospitalDataService";

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    age: "",
    gender: "Male",
    address: ""
  });

  useEffect(() => {
    loadPatientsList();
  }, []);

  const loadPatientsList = async () => {
    try {
      setLoading(true);
      const res = await fetchPatients();
      const patientList = res.data || res || [];
      setPatients(patientList);
      
      // Update local storage representation in hospitalDataService
      patientList.forEach(p => {
        const existing = hospitalDataService.getPatients().find(ep => ep.phone === p.phone || ep.email === p.email);
        if (!existing) {
          hospitalDataService.addPatient({
            id: p.id,
            name: p.name,
            phone: p.phone,
            email: p.email,
            gender: p.gender || "Male",
            age: p.age || 30,
            address: p.address || "Medical District"
          });
        }
      });
    } catch (err) {
      console.error("Failed to load patients:", err);
      // Fallback to local storage
      setPatients(hospitalDataService.getPatients());
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      age: "",
      gender: "Male",
      address: ""
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Name and Phone number are required.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        age: formData.age ? parseInt(formData.age) : 30,
        gender: formData.gender,
        address: formData.address || "Medical District"
      };

      const res = await addPatient(payload);
      if (res.success || res) {
        toast.success("Patient registered successfully!");
        
        // Push to local store
        hospitalDataService.addPatient({
          id: res.data?.id || `patient-${Date.now()}`,
          ...payload
        });

        loadPatientsList();
        setModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to add patient:", err);
      toast.error(err.message || "Failed to register patient.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    (p.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (p.phone || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Management</h1>
            <p className="text-gray-500 font-medium">View and manage all patients in the system</p>
          </div>
          <button 
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-6 py-3 bg-[#06402B] text-white rounded-xl font-bold hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/10 hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Patient
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients by name, phone, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-gray-500 font-semibold">Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-20 text-center text-gray-500">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-gray-700">No patients found</p>
              <p className="text-sm text-gray-400 mt-1">Register a patient to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Patient</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Last Visit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id || patient.phone} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 rounded-xl">
                            <User className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{patient.name}</p>
                            <p className="text-xs text-gray-400 font-medium">
                              {patient.age ? `${patient.age} years` : "30 years"} • {patient.gender || "Male"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{patient.phone}</td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{patient.email || "—"}</td>
                      <td className="px-6 py-4 flex items-center gap-2 text-gray-600 font-semibold">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {patient.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Register New Patient</h3>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Alice Cooper"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. alice.cooper@email.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="e.g. 34"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white transition"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Residential Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. Medical District, Hyderabad"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-3 rounded-xl border border-gray-200 font-semibold text-gray-500 hover:bg-gray-100 transition active:scale-95 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-[#06402B] text-white font-bold hover:bg-emerald-800 transition shadow-lg shadow-emerald-950/15 disabled:opacity-50 active:scale-95 text-sm flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Register Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
