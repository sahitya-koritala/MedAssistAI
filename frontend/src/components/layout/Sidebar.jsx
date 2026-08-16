import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Settings,
  LogOut,
  ClipboardList,
  Pill,
  ReceiptIndianRupee,
  BarChart3,
  ShieldCheck,
  FileText,
  ChevronDown,
  Plus,
  History,
  Microscope,
  Upload,
  Calendar,
  Receipt,
  UserPlus,
  Activity,
  Brain,
  ScanHeart,
  Sparkles,
  MapPin,
  Phone,
  HeartPulse,
  User,
  Bot,
} from "lucide-react";

import { cn } from "../../lib/utils";
import { Role } from "../../types";
import logoMedAssist from "../../assets/medassist-logo.png";

export default function Sidebar({ user, isSidebarOpen, handleLogout }) {
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState({});
  const { t } = useTranslation();

  const toggleDropdown = (name) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const getMenuItems = () => {
    if (!user) return [];

    switch (user.role) {
      case Role.PATIENT:
        return [
          { name: t("navigation.dashboard", "Dashboard"), path: "/dashboard", icon: LayoutDashboard },
          { name: t("ai.aiAssistant", "AI Consultant"), path: "/patient/ai-consultant", icon: Bot },
          { name: t("ai.symptomAnalysis", "AI Symptom Analysis"), path: "/patient/symptom-analysis", icon: Activity },
          { name: t("ai.analyzeReport", "Medical Report Analysis"), path: "/patient/report-analysis", icon: FileText },
          { name: t("ai.healthRecommendations", "AI Recommendations"), path: "/patient/recommendations", icon: Sparkles },
          { name: t("emergency.nearbyHospitals", "Nearby Hospitals"), path: "/patient/nearby-hospitals", icon: MapPin },
          { name: t("emergency.emergencyAssistance", "Emergency Assistance"), path: "/patient/emergency", icon: Phone },
          { name: t("profile.medicalHistory", "Health History"), path: "/patient/health-history", icon: HeartPulse },
          { name: t("lab.labReports", "My Reports"), path: "/patient/reports", icon: FileText },
          { name: t("navigation.profile", "My Profile"), path: "/patient/profile", icon: User },
          { name: t("navigation.settings", "Settings"), path: "/settings", icon: Settings },
        ];

      case Role.DOCTOR:
        return [
          { name: t("navigation.dashboard", "Dashboard"), path: "/doctor/dashboard", icon: LayoutDashboard },
          { name: "My Profile", path: "/doctor/profile", icon: User },
          { name: t("navigation.patients", "Patients"), path: "/doctor/patients", icon: Users },
          { name: t("ai.diseasePrediction", "AI Predictions"), path: "/doctor/ai-predictions", icon: Brain },
          { name: t("lab.labReports", "Medical Reports"), path: "/doctor/reports", icon: FileText },
          { name: t("ai.analyzeImage", "Image Analysis Results"), path: "/doctor/image-analysis", icon: ScanHeart },
          { name: t("navigation.prescriptions", "Prescriptions"), path: "/doctor/prescriptions", icon: Plus },
          { name: t("navigation.appointments", "Appointments"), path: "/doctor/appointments", icon: Calendar },
          { name: t("profile.medicalHistory", "Diagnosis History"), path: "/doctor/history", icon: History },
          { name: t("navigation.settings", "Profile & Settings"), path: "/settings", icon: Settings },
        ];



      case Role.APPOINTMENT:
        return [
          { name: t("navigation.dashboard", "Reception Dashboard"), path: "/appointment/dashboard", icon: LayoutDashboard },
          { name: t("navigation.patients", "Patient Registration"), path: "/appointment/patients", icon: Users },
          { name: t("appointments.bookAppointment", "Appointment Booking"), path: "/appointment/add", icon: Calendar },
          { name: t("profile.medicalHistory", "Appointment History"), path: "/appointment/history", icon: History },
          { name: t("dashboard.pendingRequests", "Queue Management"), path: "/appointment/queue", icon: ClipboardList },
          { name: t("dashboard.totalDoctors", "Doctor Scheduling"), path: "/appointment/scheduler", icon: Users },
          { name: t("navigation.settings", "Settings"), path: "/settings", icon: Settings },
        ];

      case Role.PHARMACY:
        return [
          { name: t("navigation.dashboard", "Pharmacy Dashboard"), path: "/pharmacy/dashboard", icon: LayoutDashboard },
          { name: t("pharmacy.inventory", "Medicine Inventory"), path: "/pharmacy/inventory", icon: Pill },
          { name: t("pharmacy.available", "Medicine Availability"), path: "/pharmacy/availability", icon: BarChart3 },
          { name: t("pharmacy.orders", "Medicine Requests"), path: "/pharmacy/requests", icon: Receipt },
          { name: t("pharmacy.lowStock", "Low Stock Alerts"), path: "/pharmacy/alerts", icon: ShieldCheck },
          { name: t("prescriptions.prescriptions", "Prescription Verification"), path: "/pharmacy/verification", icon: FileText },
          { name: t("navigation.settings", "Settings"), path: "/settings", icon: Settings },
        ];

      case Role.LAB_ASSISTANT:
        return [
          { name: t("navigation.dashboard", "Lab Dashboard"), path: "/lab/dashboard", icon: LayoutDashboard },
          { name: t("lab.addTest", "Add Test"), path: "/lab/add-test", icon: Plus },
          { name: t("lab.tests", "Test Management"), path: "/lab/tests", icon: Microscope },
          { name: t("navigation.settings", "Settings"), path: "/settings", icon: Settings },
        ];


      case Role.HOSPITAL_ADMIN:
        return [
          { name: t("navigation.dashboard", "Hospital Dashboard"), path: "/hospital/dashboard", icon: LayoutDashboard },
          { name: t("dashboard.totalDoctors", "Doctors"), path: "/hospital/doctors", icon: Stethoscope },
          { name: t("navigation.patients", "Patients"), path: "/hospital/patients", icon: Users },
          { name: t("navigation.support", "Staff Management"), path: "/hospital/staff", icon: ShieldCheck },
          { name: t("navigation.dashboard", "Departments"), path: "/hospital/departments", icon: BarChart3 },
          { name: t("navigation.settings", "Settings"), path: "/settings", icon: Settings },
        ];

      case Role.SUPER_ADMIN:
      case Role.ADMIN:
        return [
          { name: t("navigation.dashboard", "Admin Dashboard"), path: "/admin/dashboard", icon: LayoutDashboard },
          { name: t("dashboard.totalPatients", "Total Patients"), path: "/admin/patients", icon: Users },
          { name: t("dashboard.totalDoctors", "Total Doctors"), path: "/admin/doctors", icon: Stethoscope },
          { name: t("lab.labReports", "Total Reports"), path: "/admin/reports", icon: FileText },
          { name: t("ai.diseasePrediction", "AI Predictions"), path: "/admin/ai-predictions", icon: Brain },
          { name: t("dashboard.statistics", "Disease Statistics"), path: "/admin/disease-stats", icon: BarChart3 },
          { name: t("navigation.profile", "Active Users"), path: "/admin/users", icon: Activity },
          { name: t("emergency.nearbyHospitals", "Hospitals Registered"), path: "/admin/hospitals", icon: MapPin },
          { name: t("navigation.profile", "User Management"), path: "/admin/users", icon: ShieldCheck },
          { name: t("common.add", "Add User"), path: "/admin/users/add", icon: UserPlus },
          { name: t("navigation.settings", "Settings"), path: "/settings", icon: Settings },
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  // Split menu into sections — first item is dashboard, rest is "manage"
  const dashboardItem = menuItems[0];
  const manageItems = menuItems.slice(1);

  return (
    <aside
      className={cn(
        "w-64 h-screen flex flex-col flex-shrink-0 transition-all duration-300 z-50",
        "fixed md:relative",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
      style={{ backgroundColor: "#1a3c2e" }}
    >
      {/* LOGO */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-100">
        <img
          src={logoMedAssist}
          alt="MedAssist AI"
          className="h-14 object-contain rounded-xl"
        />
      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {/* Dashboard item */}
        {dashboardItem && (
          <Link
            to={dashboardItem.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all",
              location.pathname === dashboardItem.path
                ? "bg-white/15 text-white"
                : "text-white/60 hover:bg-white/8 hover:text-white/90"
            )}
          >
            <dashboardItem.icon
              className={cn(
                "w-5 h-5",
                location.pathname === dashboardItem.path ? "text-white" : "text-white/50"
              )}
            />
            <span className="font-semibold text-sm">{dashboardItem.name}</span>
          </Link>
        )}

        {/* MANAGE section */}
        {manageItems.length > 0 && (
          <div className="mt-4 mb-2">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] px-3 mb-2">
              {t("common.more", "Manage")}
            </p>
            <div className="space-y-0.5">
              {manageItems.map((item) =>
                item.hasSubmenu ? (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/8 hover:text-white/90 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-white/50" />
                        <span className="font-semibold text-sm">{item.name}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-white/30 transition-transform",
                          openDropdowns[item.name] && "rotate-180"
                        )}
                      />
                    </button>
                    {openDropdowns[item.name] && (
                      <div className="ml-8 mt-0.5 space-y-0.5">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all",
                              location.pathname === sub.path
                                ? "bg-white/15 text-white font-bold"
                                : "text-white/50 hover:bg-white/8 hover:text-white/80"
                            )}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                      location.pathname === item.path
                        ? "bg-white/15 text-white"
                        : "text-white/60 hover:bg-white/8 hover:text-white/90"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5",
                        location.pathname === item.path ? "text-white" : "text-white/50"
                      )}
                    />
                    <span className="font-semibold text-sm">{item.name}</span>
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </nav>

      {/* FOOTER — Log Out */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-bold text-sm">{t("navigation.logout", "Log Out")}</span>
        </button>
      </div>

      {/* Decorative leaf/nature bottom */}
      <div
        className="absolute bottom-16 left-0 right-0 h-32 pointer-events-none overflow-hidden opacity-20"
        aria-hidden="true"
      >
        <svg viewBox="0 0 256 128" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80 Q40 20 80 60 Q120 100 160 40 Q200 -20 256 50 L256 128 L0 128Z" fill="#4ade80" opacity="0.4" />
          <path d="M0 100 Q50 50 100 80 Q150 110 200 60 Q230 30 256 70 L256 128 L0 128Z" fill="#22c55e" opacity="0.5" />
        </svg>
      </div>
    </aside>
  );
}