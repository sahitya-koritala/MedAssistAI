import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  FileText,
  Users,
  Pill,
  TrendingUp,
  Bell,
  Upload,
  History,
  ScanHeart,
  Microscope,
  ShieldCheck,
  MapPin,
  BarChart3
} from "lucide-react";

import RoleGuard from "../components/RoleGuard";
import Layout from "../components/Layout";
import PlaceholderPage from "../components/common/PlaceholderPage";

import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";
import ProfileSetup from "../pages/auth/ProfileSetup";

import { Role } from "../types";
import { useAuth } from "../hooks/useAuth";

/* ====================================================== */
/* Profile Completion Guard */
/* ====================================================== */

function ProfileGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only require profile completion for Patients
  if (user.role === Role.PATIENT && !user.profileCompleted) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <Outlet />;
}

/* ===================================================== */
/* COMMON PAGES */
/* ===================================================== */

import Settings from "../pages/Settings";
import Dashboard from "../pages/Dashboard";

/* ===================================================== */
/* PATIENT MEDASSIST AI PAGES */
/* ===================================================== */

import AIConsultant from "../pages/patient/AIConsultant";
import SymptomAnalysis from "../pages/patient/SymptomAnalysis";
import ReportAnalysis from "../pages/patient/ReportAnalysis";
import Recommendations from "../pages/patient/Recommendations";
import NearbyHospitals from "../pages/patient/NearbyHospitals";
import Emergency from "../pages/patient/Emergency";
import PatientDashboard from "../pages/dashboard/PatientDashboard";
import HealthHistory from "../pages/patient/HealthHistory";
import MyReports from "../pages/patient/MyReports";
import MyProfile from "../pages/patient/MyProfile";

/* ===================================================== */
/* ADMIN PAGES */
/* ===================================================== */

import DoctorsManagement from "../pages/admin/DoctorsManagement";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import UserManagement from "../pages/admin/UserManagement";
import UserRoleManagement from "../pages/admin/UserRoleManagement";
import UserAdd from "../pages/admin/UserAdd";
import AdminPatients from "../pages/admin/AdminPatients";
import AdminReports from "../pages/admin/AdminReports";
import AdminAIPredictions from "../pages/admin/AdminAIPredictions";
import AdminDiseaseStats from "../pages/admin/AdminDiseaseStats";
import AdminHospitals from "../pages/admin/AdminHospitals";
import HospitalDashboard from "../pages/admin/HospitalDashboard";
import HospitalStaff from "../pages/admin/HospitalStaff";
import HospitalDepartments from "../pages/admin/HospitalDepartments";

import Patients from "../pages/patient/PatientList";
import PatientProfile from "../pages/patient/PatientProfile";

import Appointments from "../pages/appointment/AppointmentListNew";

import EMR from "../pages/EMR";
import Billing from "../pages/Billing";
import Addtest from "../pages/lab/add-test";
import TestManagementPage from "../pages/lab/tests";
import LabDashboard from "../pages/lab/LabDashboard";
import AddMedicine from "../pages/clinic/AddMedicine";
import ExpiredMedicine from "../pages/clinic/ExpiredMedicine";

/* ===================================================== */
/* DOCTOR PAGES */
/* ===================================================== */

import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import DoctorReports from "../pages/doctor/DoctorReports";
import DoctorHistory from "../pages/doctor/DoctorHistory";
import PrescriptionCenter from "../pages/doctor/PrescriptionCenter";
import DoctorAIPredictions from "../pages/doctor/DoctorAIPredictions";
import DoctorImageAnalysis from "../pages/doctor/DoctorImageAnalysis";
import DoctorAppointments from "../pages/doctor/DoctorAppointments";
import DoctorProfileEdit from "../pages/doctor/DoctorProfileEdit";




/* ===================================================== */
/* APPOINTMENT PAGES */
/* ===================================================== */
import AppointmentDashboard from "../pages/appointment/AppointmentListNew";
import AppointmentScheduler from "../pages/appointment/AppointmentScheduler";
import PatientQueue from "../pages/appointment/PatientQueue";
import AddAppointment from "../pages/appointment/AddAppointment";
import AppointmentPatients from "../pages/appointment/AppointmentPatients";
import AddPatientAppointment from "../pages/appointment/AddPatientAppointment";
import AppointmentBilling from "../pages/appointment/AppointmentBilling";
import AppointmentHistory from "../pages/appointment/AppointmentHistory";

/* ===================================================== */
/* CLINIC / DISPENSORY PAGES */
/* ===================================================== */

import Pharmacy from "../pages/Pharmacy";
import Patient from "../pages/clinic/Patients";
import ClinicDashboard from "../pages/clinic/ClinicDashboard";
import NewPatientClinic from "../pages/clinic/NewPatientClinic";
import ClinicHistory from "../pages/clinic/ClinicHistory";
import ClinicBilling from "../pages/clinic/ClinicBilling";
import MedicineInventory from "../pages/clinic/MedicineInventory";
import MedicineDispense from "../pages/clinic/MedicineDispense";
import Stocks from "../pages/clinic/StockMedicine";
import PharmacyDashboard from "../pages/pharmacy/PharmacyDashboard";
import PharmacyInventory from "../pages/pharmacy/PharmacyInventory";
import PharmacyAvailability from "../pages/pharmacy/PharmacyAvailability";
import PharmacyRequests from "../pages/pharmacy/PharmacyRequests";
import PharmacyAlerts from "../pages/pharmacy/PharmacyAlerts";
import PharmacyVerification from "../pages/pharmacy/PharmacyVerification";

/* ===================================================== */
/* ROLE BASED DASHBOARD REDIRECT */
/* ===================================================== */

function RoleBasedDashboard() {
  const { user } = useAuth();

  switch (user?.role) {
    case Role.SUPER_ADMIN:
    case Role.ADMIN:
    case Role.HOSPITAL_ADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    case Role.DOCTOR:
      return <Navigate to="/doctor/dashboard" replace />;
    case Role.APPOINTMENT:
      return <Navigate to="/appointment/dashboard" replace />;
    case Role.PHARMACY:
    case Role.CLINIC:
      return <Navigate to="/clinic/dashboard" replace />;
    case Role.LAB_ASSISTANT:
      return <Navigate to="/lab/dashboard" replace />;
    case Role.PATIENT:
      return <PatientDashboard user={user} />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}

/* ===================================================== */
/* COMING SOON */
/* ===================================================== */

const ComingSoon = ({ title }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-white rounded-[3rem] shadow-sm border border-gray-100">
    <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mb-6">
      <div className="w-12 h-12 bg-emerald-600 rounded-2xl animate-pulse" />
    </div>
    <h1 className="text-3xl font-bold text-[#06402B] mb-2">{title}</h1>
    <p className="text-gray-500 font-medium">
      This module is currently being optimized for your workflow.
    </p>
  </div>
);

/* ===================================================== */
/* APP ROUTES */
/* ===================================================== */

export default function AppRoutes() {
  return (
    <Routes>
      {/* ========== PUBLIC ROUTES ========== */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* ========== PROFILE SETUP ROUTE ========== */}
      <Route
        path="/profile-setup"
        element={
          <RoleGuard
            allowedRoles={[Role.PATIENT]}
          />
        }
      >
        <Route index element={<ProfileSetup />} />
      </Route>

      {/* ========== PROFILE GUARD PROTECTED ROUTES ========== */}
      <Route element={<ProfileGuard />}>
        <Route
          element={
            <RoleGuard
              allowedRoles={[
                Role.SUPER_ADMIN,
                Role.ADMIN,
                Role.HOSPITAL_ADMIN,
                Role.DOCTOR,
                Role.APPOINTMENT,
                Role.PHARMACY,
                Role.PATIENT,
                Role.LAB_ASSISTANT,
              ]}
            />
          }
        >
          <Route
            path="/dashboard"
            element={
              <Layout>
                <RoleBasedDashboard />
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout>
                <Settings />
              </Layout>
            }
          />
        </Route>

        {/* ========== PATIENT MEDASSIST AI ROUTES ========== */}
        <Route element={<RoleGuard allowedRoles={[Role.PATIENT]} />}>
          <Route
            path="/patient/symptom-analysis"
            element={
              <Layout>
                <SymptomAnalysis />
              </Layout>
            }
          />
          <Route
            path="/patient/ai-consultant"
            element={
              <Layout>
                <AIConsultant />
              </Layout>
            }
          />

          <Route
            path="/patient/report-analysis"
            element={
              <Layout>
                <ReportAnalysis />
              </Layout>
            }
          />
          <Route
            path="/patient/recommendations"
            element={
              <Layout>
                <Recommendations />
              </Layout>
            }
          />
          <Route
            path="/patient/nearby-hospitals"
            element={
              <Layout>
                <NearbyHospitals />
              </Layout>
            }
          />
          <Route
            path="/patient/emergency"
            element={
              <Layout>
                <Emergency />
              </Layout>
            }
          />
          <Route
            path="/patient/health-history"
            element={
              <Layout>
                <HealthHistory />
              </Layout>
            }
          />
          <Route
            path="/patient/reports"
            element={
              <Layout>
                <MyReports />
              </Layout>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <Layout>
                <MyProfile />
              </Layout>
            }
          />
        </Route>

        {/* ========== ADMIN ROUTES ========== */}
        <Route element={<RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.HOSPITAL_ADMIN]} />}>
          <Route
            path="/admin/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/clinic/stock"
            element={
              <Layout>
                <Stocks />
              </Layout>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <Layout>
                <DoctorsManagement />
              </Layout>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <Layout>
                <AdminAnalytics />
              </Layout>
            }
          />
          <Route
            path="/admin/users"
            element={
              <Layout>
                <UserManagement />
              </Layout>
            }
          />
          <Route
            path="/admin/users/add"
            element={
              <Layout>
                <UserAdd />
              </Layout>
            }
          />
          <Route
            path="/admin/roles"
            element={
              <Layout>
                <UserRoleManagement />
              </Layout>
            }
          />
          <Route
            path="/patients"
            element={
              <Layout>
                <Patients />
              </Layout>
            }
          />
          {/* Admin/Hospital Admin missing routes */}
          <Route
            path="/admin/patients"
            element={
              <Layout>
                <AdminPatients />
              </Layout>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <Layout>
                <AdminReports />
              </Layout>
            }
          />
          <Route
            path="/admin/ai-predictions"
            element={
              <Layout>
                <AdminAIPredictions />
              </Layout>
            }
          />
          <Route
            path="/admin/disease-stats"
            element={
              <Layout>
                <AdminDiseaseStats />
              </Layout>
            }
          />
          <Route
            path="/admin/hospitals"
            element={
              <Layout>
                <AdminHospitals />
              </Layout>
            }
          />
          <Route
            path="/hospital/dashboard"
            element={
              <Layout>
                <HospitalDashboard />
              </Layout>
            }
          />
          <Route
            path="/hospital/doctors"
            element={
              <Layout>
                <DoctorsManagement />
              </Layout>
            }
          />
          <Route
            path="/hospital/patients"
            element={
              <Layout>
                <Patients />
              </Layout>
            }
          />
          <Route
            path="/hospital/staff"
            element={
              <Layout>
                <HospitalStaff />
              </Layout>
            }
          />
          <Route
            path="/hospital/departments"
            element={
              <Layout>
                <HospitalDepartments />
              </Layout>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <Layout>
                <PatientProfile />
              </Layout>
            }
          />
          <Route
            path="/appointments"
            element={
              <Layout>
                <Appointments />
              </Layout>
            }
          />
          <Route
            path="/billing"
            element={
              <Layout>
                <Billing />
              </Layout>
            }
          />
          <Route
            path="/emr"
            element={
              <Layout>
                <EMR />
              </Layout>
            }
          />
          <Route
            path="/clinic/dispense"
            element={
              <Layout>
                <MedicineDispense />
              </Layout>
            }
          />
          <Route
            path="/clinic/add-medicine"
            element={
              <Layout>
                <AddMedicine />
              </Layout>
            }
          />
          <Route
            path="/pharmacy"
            element={
              <Layout>
                <Pharmacy />
              </Layout>
            }
          />
          <Route
            path="/clinic/expired-medicines"
            element={
              <Layout>
                <ExpiredMedicine />
              </Layout>
            }
          />
        </Route>

        {/* ========== LAB ASSISTANT ROUTES ========== */}
        <Route element={<RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.HOSPITAL_ADMIN, Role.LAB_ASSISTANT]} />}>
          <Route
            path="/lab/dashboard"
            element={
              <Layout>
                <LabDashboard />
              </Layout>
            }
          />
          <Route
            path="/lab/add-test"
            element={
              <Layout>
                <Addtest />
              </Layout>
            }
          />
          <Route
            path="/lab/tests"
            element={
              <Layout>
                <TestManagementPage />
              </Layout>
            }
          />
        </Route>

        {/* ========== DOCTOR ROUTES ========== */}
        <Route element={<RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.DOCTOR, Role.ADMIN, Role.HOSPITAL_ADMIN]} />}>
          <Route
            path="/doctor/dashboard"
            element={
              <Layout>
                <DoctorDashboard />
              </Layout>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <Layout>
                <DoctorProfileEdit />
              </Layout>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <Layout>
                <Patients />
              </Layout>
            }
          />
          <Route
            path="/doctor/patients/:id"
            element={
              <Layout>
                <PatientProfile />
              </Layout>
            }
          />
          <Route
            path="/doctor/prescriptions"
            element={
              <Layout>
                <PrescriptionCenter />
              </Layout>
            }
          />
          <Route
            path="/doctor/reports"
            element={
              <Layout>
                <DoctorReports />
              </Layout>
            }
          />
          <Route
            path="/doctor/history"
            element={
              <Layout>
                <DoctorHistory />
              </Layout>
            }
          />
          {/* Doctor missing routes */}
          <Route
            path="/doctor/ai-predictions"
            element={
              <Layout>
                <DoctorAIPredictions />
              </Layout>
            }
          />
          <Route
            path="/doctor/image-analysis"
            element={
              <Layout>
                <DoctorImageAnalysis />
              </Layout>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <Layout>
                <DoctorAppointments />
              </Layout>
            }
          />

        </Route>

        {/* ========== APPOINTMENT ROUTES ========== */}
        <Route element={<RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.APPOINTMENT, Role.ADMIN, Role.HOSPITAL_ADMIN]} />}>
          <Route
            path="/appointment/dashboard"
            element={
              <Layout>
                <AppointmentDashboard />
              </Layout>
            }
          />
          <Route
            path="/appointment/add"
            element={
              <Layout>
                <AddAppointment />
              </Layout>
            }
          />
          <Route
            path="/appointment/patients"
            element={
              <Layout>
                <AppointmentPatients />
              </Layout>
            }
          />
          <Route
            path="/appointment/add-patient"
            element={
              <Layout>
                <AddPatientAppointment />
              </Layout>
            }
          />
          <Route
            path="/appointment/billing"
            element={
              <Layout>
                <AppointmentBilling />
              </Layout>
            }
          />
          <Route
            path="/appointment/history"
            element={
              <Layout>
                <AppointmentHistory />
              </Layout>
            }
          />
          <Route
            path="/appointment/scheduler"
            element={
              <Layout>
                <AppointmentScheduler />
              </Layout>
            }
          />
          <Route
            path="/appointment/queue"
            element={
              <Layout>
                <PatientQueue />
              </Layout>
            }
          />
        </Route>

        {/* ========== PHARMACY ROUTES ========== */}
        <Route element={<RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.PHARMACY, Role.ADMIN, Role.HOSPITAL_ADMIN]} />}>
          <Route
            path="/clinic/dashboard"
            element={
              <Layout>
                <ClinicDashboard />
              </Layout>
            }
          />
          <Route
            path="/clinic/expired-medicines"
            element={
              <Layout>
                <ExpiredMedicine />
              </Layout>
            }
          />
          <Route
            path="/clinic/patients"
            element={
              <Layout>
                <Patient />
              </Layout>
            }
          />
          <Route
            path="/clinic/history"
            element={
              <Layout>
                <ClinicHistory />
              </Layout>
            }
          />
          <Route
            path="/clinic/billing"
            element={
              <Layout>
                <ClinicBilling />
              </Layout>
            }
          />
          <Route
            path="/clinic/stocks"
            element={
              <Layout>
                <Stocks />
              </Layout>
            }
          />
          <Route
            path="/clinic/dispense"
            element={
              <Layout>
                <MedicineDispense />
              </Layout>
            }
          />
          {/* Pharmacy missing routes */}
          <Route
            path="/pharmacy/dashboard"
            element={
              <Layout>
                <PharmacyDashboard />
              </Layout>
            }
          />
          <Route
            path="/pharmacy/inventory"
            element={
              <Layout>
                <PharmacyInventory />
              </Layout>
            }
          />
          <Route
            path="/pharmacy/availability"
            element={
              <Layout>
                <PharmacyAvailability />
              </Layout>
            }
          />
          <Route
            path="/pharmacy/requests"
            element={
              <Layout>
                <PharmacyRequests />
              </Layout>
            }
          />
          <Route
            path="/pharmacy/alerts"
            element={
              <Layout>
                <PharmacyAlerts />
              </Layout>
            }
          />
          <Route
            path="/pharmacy/verification"
            element={
              <Layout>
                <PharmacyVerification />
              </Layout>
            }
          />
        </Route>
      </Route>

      {/* ========== UNAUTHORIZED ========== */}
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
            <h1 className="text-9xl font-black text-emerald-50 mb-4 select-none">403</h1>
            <div className="text-center relative -top-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
              <p className="text-gray-500 mb-8 max-w-sm">
                You do not have permission to access this module.
              </p>
              <button
                onClick={() => window.history.back()}
                className="h-12 px-8 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 hover:scale-105 transition-transform"
              >
                Go Back
              </button>
            </div>
          </div>
        }
      />

      {/* ========== FALLBACK ========== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
