
import { useState } from "react";
import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react";

const diseaseData = [
  { name: "Viral Infection", count: 45, trend: 12 },
  { name: "Migraine", count: 32, trend: -5 },
  { name: "Diabetes", count: 28, trend: 8 },
  { name: "Hypertension", count: 25, trend: 3 },
  { name: "Asthma", count: 18, trend: -2 },
];

export default function AdminDiseaseStats() {
  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Disease Statistics</h1>
          <p className="text-gray-500">View disease statistics and trends</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Most Common Diseases</h3>
              <BarChart3 className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-3">
              {diseaseData.slice(0,3).map((d, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="text-gray-900 font-medium">{d.name}</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Trend</h3>
              <TrendingUp className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-2">
              {[150, 180, 165, 190, 205, 220].map((val, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-12">Month {idx+1}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                      style={{ width: `${(val/220)*100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Patient Demographics</h3>
              <Users className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Male</span>
                  <span className="text-sm font-semibold text-gray-900">58%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "58%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Female</span>
                  <span className="text-sm font-semibold text-gray-900">42%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full" style={{ width: "42%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Disease Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diseaseData.map((d, idx) => (
              <div key={idx} className="p-4 border border-gray-100 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{d.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">{d.count}</span>
                    <span className={`text-xs font-semibold ${d.trend >=0 ? "text-green-600" : "text-red-600"}`}>
                      {d.trend >=0 ? "+" : ""}{d.trend}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
