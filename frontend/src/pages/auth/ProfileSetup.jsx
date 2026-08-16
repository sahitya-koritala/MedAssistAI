import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import logoMedAssist from "../../assets/medassist-logo.png";
import { Role } from "../../types";
import { useTranslation } from "react-i18next";

export default function ProfileSetup() {
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    dateOfBirth: "",
    bloodGroup: "",
    height: "",
    weight: "",
    allergies: "",
    existingDiseases: "",
    currentMedications: "",
    previousSurgeries: "",
    familyMedicalHistory: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pinCode: "",
    profileImage: "",
    smoking: "",
    alcohol: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const { t } = useTranslation();

  // If user is not a Patient, redirect to dashboard
  useEffect(() => {
    if (user && user.role !== Role.PATIENT) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        age: user.age || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth || "",
        bloodGroup: user.bloodGroup || "",
        height: user.height || "",
        weight: user.weight || "",
        allergies: user.allergies || "",
        existingDiseases: user.existingDiseases || "",
        currentMedications: user.currentMedications || "",
        previousSurgeries: user.previousSurgeries || "",
        familyMedicalHistory: user.familyMedicalHistory || "",
        emergencyContactName: user.emergencyContactName || "",
        emergencyContactNumber: user.emergencyContactNumber || "",
        address: user.address || "",
        country: user.country || "",
        state: user.state || "",
        city: user.city || "",
        pinCode: user.pinCode || "",
        profileImage: user.profileImage || "",
        smoking: user.smoking || "",
        alcohol: user.alcohol || "",
      });
    }
  }, [user]);

  const validateForm = () => {
    if (!profileForm.name.trim()) {
      setError("Full Name is required.");
      return false;
    }
    if (!profileForm.age || parseInt(profileForm.age) < 0 || parseInt(profileForm.age) > 150) {
      setError("Please enter a valid age (0-150).");
      return false;
    }
    if (!profileForm.gender) {
      setError("Gender is required.");
      return false;
    }
    if (!profileForm.phone.trim() || profileForm.phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone number.");
      return false;
    }
    if (!profileForm.bloodGroup) {
      setError("Blood Group is required.");
      return false;
    }
    if (!profileForm.emergencyContactNumber.trim() || profileForm.emergencyContactNumber.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid emergency contact number.");
      return false;
    }
    return true;
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.completeProfile(user.id, {
        ...profileForm,
        role: user.role,
      });
      await refresh();
      navigate("/dashboard");
    } catch (err) {
      setError("Unable to complete profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: "#eef7f2" }}>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 mb-8"
      >
        <Link to="/">
          <img src={logoMedAssist} alt="MedAssist AI" className="h-16 object-contain" />
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-white overflow-hidden"
      >
        <div className="px-10 pt-10 pb-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{t("profile.completeProfile", "Complete Your MedAssist Profile")}</h2>
            <p className="text-sm text-gray-400">{t("profile.oneLastStep", "One last step before you can access your clinical workspace.")}</p>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm mb-5"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
          <form onSubmit={handleCompleteProfile} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("profile.personalInfo", "Personal Information")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">{t("profile.fullName", "Full Name")} *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">{t("auth.email", "Email Address")}</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">{t("profile.age", "Age")} *</label>
                  <input
                    type="number"
                    required
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">{t("profile.gender", "Gender")} *</label>
                  <select
                    required
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  >
                    <option value="">{t("common.select", "Select")}</option>
                    <option value="Male">{t("profile.male", "Male")}</option>
                    <option value="Female">{t("profile.female", "Female")}</option>
                    <option value="Other">{t("profile.other", "Other")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">{t("profile.dateOfBirth", "Date of Birth")}</label>
                  <input
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">{t("profile.phone", "Phone Number")} *</label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("profile.medicalInfo", "Medical Information")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">{t("profile.bloodGroup", "Blood Group")} *</label>
                  <select
                    required
                    value={profileForm.bloodGroup}
                    onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  >
                    <option value="">{t("common.select", "Select")}</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">{t("profile.height", "Height (cm)")}</label>
                  <input
                    type="number"
                    value={profileForm.height}
                    onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">{t("profile.weight", "Weight (kg)")}</label>
                  <input
                    type="number"
                    value={profileForm.weight}
                    onChange={(e) => setProfileForm({ ...profileForm, weight: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">{t("profile.smoking", "Smoking")}</label>
                  <select
                    value={profileForm.smoking}
                    onChange={(e) => setProfileForm({ ...profileForm, smoking: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  >
                    <option value="">{t("common.select", "Select")}</option>
                    <option value="Never">{t("profile.never", "Never")}</option>
                    <option value="Occasionally">{t("profile.occasionally", "Occasionally")}</option>
                    <option value="Regularly">{t("profile.regularly", "Regularly")}</option>
                    <option value="Former">{t("profile.former", "Former")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">{t("profile.alcohol", "Alcohol")}</label>
                  <select
                    value={profileForm.alcohol}
                    onChange={(e) => setProfileForm({ ...profileForm, alcohol: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  >
                    <option value="">{t("common.select", "Select")}</option>
                    <option value="Never">{t("profile.never", "Never")}</option>
                    <option value="Occasionally">{t("profile.occasionally", "Occasionally")}</option>
                    <option value="Regularly">{t("profile.regularly", "Regularly")}</option>
                    <option value="Former">{t("profile.former", "Former")}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <label className="text-sm font-semibold text-gray-700 block">{t("profile.allergies", "Allergies")}</label>
                <textarea
                  value={profileForm.allergies}
                  onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                  placeholder="List any known allergies"
                  rows="2"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>
              <div className="space-y-2 mt-4">
                <label className="text-sm font-semibold text-gray-700 block">{t("profile.chronicDiseases", "Existing Diseases")}</label>
                <textarea
                  value={profileForm.existingDiseases}
                  onChange={(e) => setProfileForm({ ...profileForm, existingDiseases: e.target.value })}
                  placeholder="List any existing medical conditions"
                  rows="2"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>
              <div className="space-y-2 mt-4">
                <label className="text-sm font-semibold text-gray-700 block">{t("profile.currentMedications", "Current Medications")}</label>
                <textarea
                  value={profileForm.currentMedications}
                  onChange={(e) => setProfileForm({ ...profileForm, currentMedications: e.target.value })}
                  placeholder="List current medications"
                  rows="2"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>
              <div className="space-y-2 mt-4">
                <label className="text-sm font-semibold text-gray-700 block">{t("profile.previousSurgeries", "Previous Surgeries")}</label>
                <textarea
                  value={profileForm.previousSurgeries}
                  onChange={(e) => setProfileForm({ ...profileForm, previousSurgeries: e.target.value })}
                  placeholder="List any previous surgeries"
                  rows="2"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>
              <div className="space-y-2 mt-4">
                <label className="text-sm font-semibold text-gray-700 block">{t("profile.familyHistory", "Family Medical History")}</label>
                <textarea
                  value={profileForm.familyMedicalHistory}
                  onChange={(e) => setProfileForm({ ...profileForm, familyMedicalHistory: e.target.value })}
                  placeholder="List family medical history (e.g., diabetes, hypertension)"
                  rows="2"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            {/* Emergency Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("profile.emergencyContact", "Emergency Information")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">{t("profile.emergencyContactName", "Emergency Contact Name")}</label>
                  <input
                    type="text"
                    value={profileForm.emergencyContactName}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyContactName: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">{t("profile.emergencyContactPhone", "Emergency Contact Number")} *</label>
                  <input
                    type="tel"
                    required
                    value={profileForm.emergencyContactNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyContactNumber: e.target.value })}
                    placeholder="Emergency contact number"
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <label className="text-sm font-semibold text-gray-700 block">{t("profile.address", "Address")}</label>
                <textarea
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="Your address"
                  rows="2"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">{t("profile.country", "Country")}</label>
                  <input
                    type="text"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">{t("profile.state", "State")}</label>
                  <input
                    type="text"
                    value={profileForm.state}
                    onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">{t("profile.city", "City")}</label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">{t("profile.pincode", "PIN Code")}</label>
                  <input
                    type="text"
                    value={profileForm.pinCode}
                    onChange={(e) => setProfileForm({ ...profileForm, pinCode: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 h-12 rounded-xl font-bold text-base text-gray-700 bg-white border border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {t("common.cancel", "Cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #1a6b3a 0%, #1a5c32 100%)" }}
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t("common.save", "Save & Continue")}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
