
import { useState, useEffect } from "react";
import { Pill, FileText, AlertCircle, TrendingUp, Users } from "lucide-react";
import { hospitalDataService } from "../../services/hospitalDataService";

export default function PharmacyDashboard() {
  const meds = hospitalDataService.getMedications();
  const prescriptions = hospitalDataService.getPrescriptions();

  const stats = [
    { label: "Total Prescriptions", value: prescriptions.length, icon: FileText },
    { label: "Medications in Stock", value: meds.filter(m => m.available).length, icon: Pill },
    { label: "Low Stock Alerts", value: meds.filter(m => m.quantity <= 10).length, icon: AlertCircle, tone: "warning" },
    { label: "Pending Prescriptions", value: prescriptions.filter(p => p.status === "Pending").length, icon: TrendingUp, tone: "info" },
  ];

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pharmacy Dashboard</h1>
          <p className="text-gray-500">Manage your pharmacy operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  stat.tone === "warning" ? "bg-amber-100" :
                  stat.tone === "info" ? "bg-blue-100" :
                  "bg-emerald-100"
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    stat.tone === "warning" ? "text-amber-600" :
                    stat.tone === "info" ? "text-blue-600" :
                    "text-emerald-600"
                  }`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Prescriptions</h3>
            <div className="space-y-4">
              {prescriptions.slice(0,4).map(p => (
                <div key={p.id} className="p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{p.patientName}</p>
                      <p className="text-sm text-gray-500">{p.createdAt?.slice(0, 10)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      p.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                      p.status === "Dispensed" ? "bg-green-100 text-green-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Low Stock Medications</h3>
            <div className="space-y-4">
              {meds.filter(m => m.quantity <=10).slice(0,4).map(m => (
                <div key={m.id} className="p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{m.name}</p>
                      <p className="text-sm text-gray-500">Qty: {m.quantity}</p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      Low Stock
                    </span>
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
