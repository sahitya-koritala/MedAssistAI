import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Stethoscope,
  Clock,
  Calendar,
  FileText,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/common/Button";
import { addHospitalStaff } from "../../lib/api";

// ==================== Main Component ====================
export default function AddDoctor() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    about: "",
  });

  // Time slots state
  const [timeSlots, setTimeSlots] = useState([
    { id: 1, from: "09:00", to: "13:00" },
    { id: 2, from: "14:00", to: "18:00" },
    { id: 3, from: "18:30", to: "21:00" },
  ]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Specializations (common list)
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTimeSlot = () => {
    const newId = Math.max(...timeSlots.map(s => s.id), 0) + 1;
    setTimeSlots([...timeSlots, { id: newId, from: "09:00", to: "13:00" }]);
  };

  const removeTimeSlot = (id) => {
    if (timeSlots.length === 1) {
      setSubmitError("At least one time slot is required.");
      return;
    }
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const updateTimeSlot = (id, field, value) => {
    setTimeSlots(timeSlots.map(slot =>
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return "Full name is required";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Valid email is required";
    if (!formData.phone.trim() || formData.phone.length < 10) return "Valid phone number is required";
    if (!formData.specialization) return "Specialization is required";
    if (!formData.experience || isNaN(parseFloat(formData.experience)) || parseFloat(formData.experience) < 0)
      return "Valid experience in years is required";
    if (timeSlots.length === 0) return "At least one time slot is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setSubmitError(error);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      // 1. Save to MongoDB Centralized Database using our hospital staff registration API
      const staffPayload = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: "Doctor",
        department: formData.specialization,
        status: "Active"
      };

      await addHospitalStaff(staffPayload);

      // 2. Synchronize to "careplus_users" local storage key so it displays in Super Admin User Management list
      const newSystemUser = {
        id: `USR-${Date.now()}`,
        name: formData.fullName,
        email: formData.email,
        role: "Doctor",
        department: formData.specialization,
        status: "Active",
        lastLogin: "Never",
        ip: "0.0.0.0",
        isOnline: false,
        personalInfo: {
          email: formData.email,
          mobile: formData.phone,
          gender: "Not specified",
          dateOfBirth: "Not provided",
          address: "Not provided",
          username: formData.email.split('@')[0],
          lastLogin: "Never",
          ipAddress: "0.0.0.0",
          assignedClinics: formData.specialization,
          assignedDepartments: formData.specialization,
          permissions: ["View own patients", "Prescriptions", "Appointments"]
        }
      };
      
      const existingUsers = JSON.parse(localStorage.getItem("careplus_users") || "[]");
      localStorage.setItem("careplus_users", JSON.stringify([...existingUsers, newSystemUser]));

      // 3. Synchronize to "medico_doctors" local storage key so it displays in standard doctors lists
      const newDoctor = {
        id: `DOC-${Date.now()}`,
        name: formData.fullName,
        specialization: formData.specialization,
        experience: parseFloat(formData.experience),
        about: formData.about,
        availabilitySlots: timeSlots,
        createdAt: new Date().toISOString(),
      };

      const existingDoctors = JSON.parse(localStorage.getItem("medico_doctors") || "[]");
      localStorage.setItem("medico_doctors", JSON.stringify([...existingDoctors, newDoctor]));

      setSubmitSuccess("Doctor registered and synchronized successfully!");
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Failed to add doctor:", err);
      setSubmitError(err.message || "Failed to register doctor. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header with back button */}
      <div>
        <h1 className="text-3xl font-black text-primary-dark tracking-tighter italic">Add Doctor</h1>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
          Doctors &gt; Add Doctor
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="space-y-6">
            {/* Basic Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Basic Information
                </h2>
              </div>
              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. doctor@medassist.com"
                      className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.specialization}
                    onChange={(e) => handleChange("specialization", e.target.value)}
                    required
                  >
                    <option value="">Select specialization</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Experience (Years) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Enter years of experience"
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.experience}
                    onChange={(e) => handleChange("experience", e.target.value)}
                    required
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* About Doctor Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  About Doctor
                </h2>
              </div>
              <div className="p-6">
                <textarea
                  rows={4}
                  placeholder="Enter brief description about the doctor..."
                  className="w-full p-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  value={formData.about}
                  onChange={(e) => handleChange("about", e.target.value)}
                />
              </div>
            </motion.div>

            {/* Time Slots Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Availability Slots
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {timeSlots.map((slot, index) => (
                  <div key={slot.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-16">Slot {index + 1}</span>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <input
                        type="time"
                        className="h-10 px-3 bg-gray-50 border-none rounded-lg text-xs font-semibold outline-none"
                        value={slot.from}
                        onChange={(e) => updateTimeSlot(slot.id, "from", e.target.value)}
                      />
                      <input
                        type="time"
                        className="h-10 px-3 bg-gray-50 border-none rounded-lg text-xs font-semibold outline-none"
                        value={slot.to}
                        onChange={(e) => updateTimeSlot(slot.id, "to", e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(slot.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="w-full h-10 border-2 border-dashed border-gray-200 hover:border-primary text-gray-500 hover:text-primary rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Time Slot
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Submit Messages */}
        {submitError && (
          <div className="bg-red-50 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {submitError}
          </div>
        )}
        {submitSuccess && (
          <div className="bg-emerald-50 rounded-xl p-4 text-emerald-700 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {submitSuccess}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4 justify-end bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/dashboard")}
            className="h-12 px-6 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-8 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? "Saving..." : "Save Doctor"}
          </Button>
        </div>
      </form>
    </div>
  );
}