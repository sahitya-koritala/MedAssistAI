import { useState, useEffect } from "react";
import { Search, ShieldCheck, Plus, Edit, Trash2, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchHospitalDepartments,
  addHospitalDepartment,
  updateHospitalDepartment,
  deleteHospitalDepartment
} from "../../lib/api";

export default function HospitalDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    status: "Active"
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchHospitalDepartments();
      setDepartments(data || []);
    } catch (err) {
      console.error("Failed to load departments:", err);
      toast.error("Error loading departments data.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingDept(null);
    setFormData({
      name: "",
      status: "Active"
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      status: dept.status
    });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Department name is required.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingDept) {
        // Update department
        const res = await updateHospitalDepartment(editingDept.id, formData);
        if (res.success || res) {
          toast.success("Department details updated successfully!");
          loadData();
          setModalOpen(false);
        }
      } else {
        // Add department
        const res = await addHospitalDepartment(formData);
        if (res.success || res) {
          toast.success("Department created successfully!");
          loadData();
          setModalOpen(false);
        }
      }
    } catch (err) {
      console.error("Failed to save department:", err);
      toast.error(err.message || "Failed to save department.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (deptId) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    try {
      await deleteHospitalDepartment(deptId);
      toast.success("Department deleted successfully!");
      loadData();
    } catch (err) {
      console.error("Failed to delete department:", err);
      toast.error("Failed to delete department.");
    }
  };

  const filteredDepartments = departments.filter(d => 
    (d.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Departments Management</h1>
            <p className="text-gray-500 font-medium">Configure departments, clinical units, and active medical specialties.</p>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-[#06402B] text-white rounded-xl font-bold hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/10 hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Department
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search departments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-gray-500 font-semibold">Loading departments data...</p>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="p-20 text-center text-gray-500">
              <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-gray-700">No departments found</p>
              <p className="text-sm text-gray-400 mt-1">Add a new department to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Department Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Doctors Count</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Total Staff</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDepartments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 rounded-xl">
                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                          </div>
                          <span className="font-bold text-gray-900">{dept.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-semibold">{dept.doctors}</td>
                      <td className="px-6 py-4 text-gray-600 font-semibold">{dept.staff}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          dept.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {dept.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(dept)}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit Department"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(dept.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Department"
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
                  {editingDept ? "Edit Department" : "Create New Department"}
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
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Department Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Cardiology"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</label>
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
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-[#06402B] text-white font-bold hover:bg-emerald-800 transition shadow-lg shadow-emerald-950/15 disabled:opacity-50 active:scale-95 text-sm flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingDept ? "Save Changes" : "Create Department"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
