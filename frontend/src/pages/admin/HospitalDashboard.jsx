
import { useState } from "react";
import { Users, Stethoscope, FileText, TrendingUp } from "lucide-react";
import { hospitalDataService } from "../../services/hospitalDataService";

export default function HospitalDashboard() {
  const patients = hospitalDataService.getPatients();
  const doctors = hospitalDataService.getDoctors();
  const reports = hospitalDataService.getLabReports();

  const stats = [
    { label: "Total Patients", value: patients.length, icon: Users },
    { label: "Doctors", value: doctors.length, icon: Stethoscope },
    { label: "Reports", value: reports.length, icon: FileText },
    { label: "Appointments Today", value: 12, icon: TrendingUp },
  ];

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hospital Dashboard</h1>
          <p className="text-gray-500">Hospital admin dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <stat.icon className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Patients</h3>
            <div className="space-y-4">
              {patients.slice(0,5).map((patient, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-500">{patient.age} yrs • {patient.gender}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Doctors</h3>
            <div className="space-y-4">
              {doctors.slice(0,5).map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-500">{doc.specialization}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
