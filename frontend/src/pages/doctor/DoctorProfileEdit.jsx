import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import { hospitalDataService } from "../../services/hospitalDataService";
import { 
  User, Mail, Phone, Stethoscope, Clock, Save, 
  Plus, Trash2, AlertCircle, CheckCircle2, RefreshCw 
} from "lucide-react";
import toast from "react-hot-toast";

export default function DoctorProfileEdit() {
  const { user, refresh } = useAuth();
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    department: "General Medicine",
    experience: "5",
    about: "",
  });

  const [timeSlots, setTimeSlots] = useState([
    { id: 1, from: "09:00", to: "13:00" },
    { id: 2, from: "14:00", to: "18:00" }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const specializations = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Dermatology",
    "Psychiatry",
    "Radiology",
    "General Medicine",
    "Gastroenterology",
    "Endocrinology",
    "Ophthalmology",
    "ENT",
  ];

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "General Medicine",
        experience: String(user.experience || "5"),
        about: user.about || "",
      });
      if (user.availabilitySlots && Array.isArray(user.availabilitySlots)) {
        setTimeSlots(user.availabilitySlots);
      }
    }
  }, [user]);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addTimeSlot = () => {
    const newId = Math.max(...timeSlots.map(s => s.id), 0) + 1;
    setTimeSlots([...timeSlots, { id: newId, from: "09:00", to: "13:00" }]);
  };

  const removeTimeSlot = (id) => {
    if (timeSlots.length === 1) {
      toast.error("At least one time slot is required.");
      return;
    }
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const updateTimeSlot = (id, field, value) => {
    setTimeSlots(timeSlots.map(slot =>
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }
    if (!profile.phone.trim()) {
      setErrorMessage("Phone number is required.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updatedPayload = {
        ...profile,
        experience: parseFloat(profile.experience) || 5,
        availabilitySlots: timeSlots,
        role: user.role
      };

      // 1. Save to MongoDB via authService
      const res = await authService.completeProfile(user.id, updatedPayload);

      // 2. Synchronize user management local cache (so they show in user list under Super Admin)
      const existingUsers = JSON.parse(localStorage.getItem("careplus_users") || "[]");
      const updatedUsers = existingUsers.map(u => {
        if (u.email === user.email || u.id === user.id) {
          return {
            ...u,
            name: profile.name,
            email: profile.email,
            department: profile.department,
            personalInfo: {
              ...u.personalInfo,
              mobile: profile.phone,
              email: profile.email,
              assignedClinics: profile.department,
              assignedDepartments: profile.department
            }
          };
        }
        return u;
      });
      localStorage.setItem("careplus_users", JSON.stringify(updatedUsers));

      // 3. Synchronize doctor mock data (so they show in doctor listings elsewhere)
      const existingDoctors = JSON.parse(localStorage.getItem("medico_doctors") || "[]");
      let matchedDoc = false;
      const updatedDoctors = existingDoctors.map(d => {
        if (d.email === user.email || d.id === user.id || d.name === user.name) {
          matchedDoc = true;
          return {
            ...d,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            specialization: profile.department,
            experience: parseFloat(profile.experience),
            about: profile.about,
            availabilitySlots: timeSlots
          };
        }
        return d;
      });
      
      if (!matchedDoc) {
        updatedDoctors.push({
          id: user.id || `DOC-${Date.now()}`,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          specialization: profile.department,
          experience: parseFloat(profile.experience),
          about: profile.about,
          availabilitySlots: timeSlots
        });
      }
      localStorage.setItem("medico_doctors", JSON.stringify(updatedDoctors));

      // Refresh Auth Context session
      await refresh();

      toast.success("Profile saved successfully!");
      setSuccessMessage("Your profile changes have been saved and synchronized across all roles!");
    } catch (err) {
      console.error("Save profile error:", err);
      setErrorMessage(err.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#06402B] tracking-tight italic">My Profile</h1>
        <p className="text-gray-500 font-medium mt-1">Configure and manage your clinical details, specialization, and availability slots.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - General Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-[#06402B] flex items-center gap-2 border-b pb-3">
                <User className="w-5 h-5 text-emerald-600" />
                Personal Information
              </h2>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name *</label>
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
                  <User className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    placeholder="Enter full name"
                    className="bg-transparent flex-1 outline-none text-[#06402B] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                  <div className="flex items-center gap-3 bg-gray-100 px-4 py-3 rounded-xl cursor-not-allowed">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      placeholder="email@example.com"
                      className="bg-transparent flex-1 outline-none text-gray-500 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number *</label>
                  <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      required
                      placeholder="e.g. 9876543210"
                      className="bg-transparent flex-1 outline-none text-[#06402B] text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-[#06402B] flex items-center gap-2 border-b pb-3">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                Clinical Specialization
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Specialty Department</label>
                  <select
                    value={profile.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="w-full h-11 px-4 bg-gray-50 rounded-xl text-sm font-semibold text-[#06402B] border-none outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={profile.experience}
                    onChange={(e) => handleChange("experience", e.target.value)}
                    placeholder="e.g. 8"
                    className="w-full h-11 px-4 bg-gray-50 rounded-xl text-sm font-semibold text-[#06402B] border-none outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Biography / About</label>
                <textarea
                  rows={4}
                  value={profile.about}
                  onChange={(e) => handleChange("about", e.target.value)}
                  placeholder="Tell patients about your medical background..."
                  className="w-full p-4 bg-gray-50 rounded-xl text-sm text-[#06402B] border-none outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Availability Slots */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-[#06402B] flex items-center gap-2 border-b pb-3">
                <Clock className="w-5 h-5 text-emerald-600" />
                Working Hours
              </h2>

              <div className="space-y-4">
                {timeSlots.map((slot, idx) => (
                  <div key={slot.id} className="flex items-center gap-2">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={slot.from}
                        onChange={(e) => updateTimeSlot(slot.id, "from", e.target.value)}
                        className="h-10 px-3 bg-gray-50 border-none rounded-lg text-xs font-semibold outline-none"
                      />
                      <input
                        type="time"
                        value={slot.to}
                        onChange={(e) => updateTimeSlot(slot.id, "to", e.target.value)}
                        className="h-10 px-3 bg-gray-50 border-none rounded-lg text-xs font-semibold outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(slot.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="w-full h-10 border-2 border-dashed border-gray-200 hover:border-emerald-600 text-gray-500 hover:text-emerald-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Time Slot
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Errors & Alerts */}
        {errorMessage && (
          <div className="bg-red-50 p-4 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-50 p-4 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {successMessage}
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-[#06402B] hover:bg-emerald-800 text-white rounded-xl font-bold transition flex items-center gap-2 active:scale-95 disabled:opacity-50 text-sm shadow-md"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
