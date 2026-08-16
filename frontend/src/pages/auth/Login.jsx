
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Phone, Mail, AlertCircle, Lock, Loader2, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Role } from "../../types";
import { useTranslation } from "react-i18next";
import "./Login.css";
import logoMedAssist from "../../assets/medassist-logo.png";

const METHODS = [
  { key: "phone", label: "Username Login", description: "Sign in with your username.", icon: User },
  { key: "email", label: "Email Login", description: "Use your email for secure access.", icon: Mail },
];

const ROLES = [
  { key: Role.PATIENT, label: "Patient" },
  { key: Role.DOCTOR, label: "Doctor" },
  { key: Role.PHARMACY, label: "Pharmacy" },
  { key: Role.APPOINTMENT, label: "Receptionist" },
  { key: Role.HOSPITAL_ADMIN, label: "Hospital Admin" },
  { key: Role.SUPER_ADMIN, label: "Super Admin" },
];

export default function Login() {
  const [authMethod, setAuthMethod] = useState("phone");
  const [selectedRole, setSelectedRole] = useState(Role.PATIENT);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const navigate = useNavigate();
  const { login, user: authenticatedUser } = useAuth();
  const { t } = useTranslation();

  const TRANSLATED_METHODS = [
    { key: "phone", label: t("auth.usernameLogin", "Username Login"), description: t("auth.usernameDesc", "Sign in with your username."), icon: User },
    { key: "email", label: t("auth.emailLogin", "Email Login"), description: t("auth.emailDesc", "Use your email for secure access."), icon: Mail },
  ];

  const TRANSLATED_ROLES = [
    { key: Role.PATIENT, label: t("roles.patient", "Patient") },
    { key: Role.DOCTOR, label: t("roles.doctor", "Doctor") },
    { key: Role.PHARMACY, label: t("roles.pharmacist", "Pharmacy") },
    { key: Role.APPOINTMENT, label: t("roles.receptionist", "Receptionist") },
    { key: Role.HOSPITAL_ADMIN, label: t("roles.admin", "Hospital Admin") },
    { key: Role.SUPER_ADMIN, label: t("roles.superAdmin", "Super Admin") },
  ];

  const DEMO_ACCOUNTS = {
    "patient": { role: Role.PATIENT },
    "patient@medassist.ai": { role: Role.PATIENT },
    "doctor": { role: Role.DOCTOR },
    "doctor@medassist.ai": { role: Role.DOCTOR },
    "lab": { role: Role.LAB_ASSISTANT },
    "lab@medassist.ai": { role: Role.LAB_ASSISTANT },
    "receptionist": { role: Role.APPOINTMENT },
    "receptionist@medassist.ai": { role: Role.APPOINTMENT },
    "pharmacy": { role: Role.PHARMACY },
    "pharmacy@medassist.ai": { role: Role.PHARMACY },
    "hospitaladmin": { role: Role.HOSPITAL_ADMIN },
    "admin@medassist.ai": { role: Role.HOSPITAL_ADMIN },
    "superadmin": { role: Role.SUPER_ADMIN },
    "superadmin@medassist.ai": { role: Role.SUPER_ADMIN }
  };

  const handlePhoneChange = (val) => {
    setPhone(val);
    const demo = DEMO_ACCOUNTS[val.trim().toLowerCase()];
    if (demo) {
      setSelectedRole(demo.role);
    }
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    const demo = DEMO_ACCOUNTS[val.trim().toLowerCase()];
    if (demo) {
      setSelectedRole(demo.role);
    }
  };

  useEffect(() => {
    if (authenticatedUser) {
      if (authenticatedUser.profileCompleted) {
        navigate("/dashboard");
      } else {
        navigate("/profile-setup");
      }
    }
  }, [authenticatedUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      let identifier;

      if (authMethod === "phone") {
        if (!phone.trim()) {
          throw new Error("Enter your username to continue.");
        }
        identifier = phone.trim();
      } else {
        if (!email.trim()) {
          throw new Error("Enter your email address to continue.");
        }
        identifier = email.trim().toLowerCase();
      }

      if (!otp.trim()) {
        throw new Error("Enter your password to continue.");
      }

      const isDemo = DEMO_ACCOUNTS[identifier.toLowerCase()];
      let roleToUse = selectedRole;

      if (isDemo) {
        roleToUse = isDemo.role;
      }

      await login({
        identifier,
        password: otp.trim(),
        role: roleToUse,
      });

    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ backgroundColor: "#eef7f2" }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.18]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='92' viewBox='0 0 80 92'%3E%3Cpolygon points='40,2 78,22 78,62 40,82 2,62 2,22' fill='none' stroke='%2334a86a' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "90px 104px",
        }}
        aria-hidden="true"
      />

      <div className="fixed left-0 bottom-0 w-72 h-96 pointer-events-none opacity-60" aria-hidden="true">
        <svg viewBox="0 0 280 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M60 370 Q80 260 160 180" stroke="#6abf8a" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <ellipse cx="100" cy="290" rx="70" ry="28" fill="#a8d8b9" opacity="0.7" transform="rotate(-40 100 290)"/>
          <ellipse cx="140" cy="230" rx="80" ry="30" fill="#7ec99a" opacity="0.65" transform="rotate(-55 140 230)"/>
          <ellipse cx="80" cy="340" rx="60" ry="22" fill="#b8e2c8" opacity="0.5" transform="rotate(-25 80 340)"/>
          <path d="M0 340 Q60 300 130 330 Q180 350 280 310 L280 380 L0 380Z" fill="#b8e4c9" opacity="0.5"/>
          <path d="M0 360 Q80 330 160 350 Q220 365 280 340 L280 380 L0 380Z" fill="#d0eedb" opacity="0.6"/>
        </svg>
      </div>

      <div className="fixed right-0 bottom-0 w-72 h-96 pointer-events-none opacity-60" aria-hidden="true">
        <svg viewBox="0 0 280 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M220 370 Q200 260 120 180" stroke="#6abf8a" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <ellipse cx="180" cy="290" rx="70" ry="28" fill="#a8d8b9" opacity="0.7" transform="rotate(40 180 290)"/>
          <ellipse cx="140" cy="230" rx="80" ry="30" fill="#7ec99a" opacity="0.65" transform="rotate(55 140 230)"/>
          <ellipse cx="200" cy="340" rx="60" ry="22" fill="#b8e2c8" opacity="0.5" transform="rotate(25 200 340)"/>
          <path d="M280 340 Q220 300 150 330 Q100 350 0 310 L0 380 L280 380Z" fill="#b8e4c9" opacity="0.5"/>
          <path d="M280 360 Q200 330 120 350 Q60 365 0 340 L0 380 L280 380Z" fill="#d0eedb" opacity="0.6"/>
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 mb-8"
      >
        <Link to="/">
          <img
            src={logoMedAssist}
            alt="MedAssist AI"
            className="h-16 object-contain"
          />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-xl border border-white overflow-hidden"
      >
        <div className="px-10 pt-10 pb-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{t("auth.welcome", "Welcome to MedAssist AI")}</h2>
            <p className="text-sm text-gray-400">{t("auth.secureAccess", "Secure access for patients and care teams.")}</p>
          </div>

          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 block mb-3">{t("auth.selectRole", "Select your Role")}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TRANSLATED_ROLES.map((role) => (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => setSelectedRole(role.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedRole === role.key
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300"
                  } border`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {TRANSLATED_METHODS.map((method) => {
              const Icon = method.icon;
              const isActive = authMethod === method.key;
              return (
                <button
                  key={method.key}
                  type="button"
                  onClick={() => {
                    setAuthMethod(method.key);
                    setError("");
                    setCodeSent(false);
                    setOtp("");
                  }}
                  className={`rounded-3xl p-4 text-left border transition-all ${isActive ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-gray-200 bg-white hover:border-emerald-200"}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{method.label}</p>
                      <p className="text-xs text-gray-500">{method.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {authMethod === "phone" ? (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">{t("auth.username", "Username")}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="patient"
                    className="w-full h-14 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">{t("auth.email", "Email Address")}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="you@medassist.ai"
                    className="w-full h-14 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">{t("auth.enterPassword", "Enter Password")}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 mt-2"
              style={{ background: "linear-gradient(135deg, #1a6b3a 0%, #1a5c32 100%)" }}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  {t("auth.login", "Sign In")}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mx-6 mb-6 px-5 py-4 rounded-2xl flex items-center gap-4" style={{ backgroundColor: "#f5faf7" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#e0f0e8" }}>
            <ShieldCheck className="w-4 h-4" style={{ color: "#1a6b3a" }} />
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {t("auth.secureDemo", "Secure demo access. All data is stored locally on your browser.")}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
