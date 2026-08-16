import { useState, useEffect } from "react";
import { Search, MapPin, Plus, Edit, Trash2, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const initialHospitals = [
  { id: 1, name: "City General Hospital", location: "New York, NY", departments: 8, doctors: 24, status: "Active" },
  { id: 2, name: "Medicare Health Center", location: "Los Angeles, CA", departments: 6, doctors: 18, status: "Active" },
  { id: 3, name: "Wellness Clinic", location: "Chicago, IL", departments: 4, doctors: 10, status: "Inactive" },
];

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    departments: "",
    doctors: "",
    status: "Active"
  });

  useEffect(() => {
    // Load from local storage
    const saved = localStorage.getItem("medassist_hospitals");
    if (saved) {
      setHospitals(JSON.parse(saved));
    } else {
      setHospitals(initialHospitals);
      localStorage.setItem("medassist_hospitals", JSON.stringify(initialHospitals));
    }
    setLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAddModal = () => {
    setEditingHospital(null);
    setFormData({
      name: "",
      location: "",
      departments: "",
      doctors: "",
      status: "Active"
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (hosp) => {
    setEditingHospital(hosp);
    setFormData({
      name: hosp.name,
      location: hosp.location,
      departments: hosp.departments.toString(),
      doctors: hosp.doctors.toString(),
      status: hosp.status
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) {
      toast.error("Name and Location are required.");
      return;
    }

    const payload = {
      name: formData.name,
      location: formData.location,
      departments: parseInt(formData.departments) || 0,
      doctors: parseInt(formData.doctors) || 0,
      status: formData.status
    };

    let updatedHospitals = [];
    if (editingHospital) {
      // Update
      updatedHospitals = hospitals.map(h => 
        h.id === editingHospital.id ? { ...h, ...payload } : h
      );
      toast.success("Hospital details updated successfully!");
    } else {
      // Create
      const newHosp = {
        id: Date.now(),
        ...payload
      };
      updatedHospitals = [...hospitals, newHosp];
      toast.success("Hospital registered successfully!");
    }

    setHospitals(updatedHospitals);
    localStorage.setItem("medassist_hospitals", JSON.stringify(updatedHospitals));
    setModalOpen(false);
  };

  const handleDelete = (hospId) => {
    if (!window.confirm("Are you sure you want to delete this hospital registration?")) return;
    
    const updated = hospitals.filter(h => h.id !== hospId);
    setHospitals(updated);
    localStorage.setItem("medassist_hospitals", JSON.stringify(updated));
    toast.success("Hospital registration deleted successfully.");
  };

  const filteredHospitals = hospitals.filter(h => 
    (h.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (h.location || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hospitals Management</h1>
            <p className="text-gray-500 font-medium">Manage registered hospitals</p>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-[#06402B] text-white rounded-xl font-bold hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/10 hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Hospital
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search hospitals by name or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-gray-500 font-semibold">Loading hospitals list...</p>
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div className="p-20 text-center text-gray-500">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-gray-700">No hospitals found</p>
              <p className="text-sm text-gray-400 mt-1">Register a new hospital location to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Hospital Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Departments</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Doctors</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHospitals.map((hospital) => (
                    <tr key={hospital.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 rounded-xl">
                            <MapPin className="w-5 h-5 text-emerald-600" />
                          </div>
                          <span className="font-bold text-gray-900">{hospital.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{hospital.location}</td>
                      <td className="px-6 py-4 text-gray-600 font-semibold">{hospital.departments}</td>
                      <td className="px-6 py-4 text-gray-600 font-semibold">{hospital.doctors}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          hospital.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {hospital.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(hospital)}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit Hospital"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(hospital.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Hospital"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                <h3 className="text-xl font-bold text-gray-900">
                  {editingHospital ? "Edit Hospital Registration" : "Register New Hospital"}
                </h3>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Hospital Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. City General Hospital"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location / City *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. New York, NY"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Departments</label>
                    <input
                      type="number"
                      name="departments"
                      value={formData.departments}
                      onChange={handleInputChange}
                      placeholder="e.g. 8"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Doctors</label>
                    <input
                      type="number"
                      name="doctors"
                      value={formData.doctors}
                      onChange={handleInputChange}
                      placeholder="e.g. 24"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Operating Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white transition"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
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
                className="px-6 py-3 rounded-xl bg-[#06402B] text-white font-bold hover:bg-emerald-800 transition shadow-lg shadow-emerald-950/15 active:scale-95 text-sm"
              >
                {editingHospital ? "Save Changes" : "Register Hospital"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
