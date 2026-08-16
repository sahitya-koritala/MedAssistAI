import { useAuth } from "../hooks/useAuth";
import { Role } from "../types";
import { Navigate } from "react-router-dom";
import AdminDashboard from "./dashboard/AdminDashboard";
import DoctorDashboard from "./dashboard/DoctorDashboard";
import PatientDashboard from "./dashboard/PatientDashboard";
import AppointmentDashboard from "./appointment/AppointmentDashboard";
import ClinicDashboard from "./clinic/ClinicDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN || user?.role === Role.HOSPITAL_ADMIN) return <AdminDashboard user={user} />;
  if (user?.role === Role.DOCTOR) return <DoctorDashboard user={user} />;
  if (user?.role === Role.APPOINTMENT) return <AppointmentDashboard user={user} />;
  if (user?.role === Role.PHARMACY || user?.role === Role.CLINIC) return <ClinicDashboard user={user} />;
  if (user?.role === Role.PATIENT) return <PatientDashboard user={user} />;
  return <Navigate to="/unauthorized" replace />;
}
