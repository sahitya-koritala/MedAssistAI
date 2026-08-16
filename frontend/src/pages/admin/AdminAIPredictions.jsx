
import { useState } from "react";
import { Search, Activity, TrendingUp, Users } from "lucide-react";

export default function AdminAIPredictions() {
  const [predictions, setPredictions] = useState([
    { id: 1, patient: "Alice Cooper", disease: "Viral Infection", confidence: 87, status: "Approved", date: "2024-05-15" },
    { id: 2, patient: "John Doe", disease: "Possible Angina", confidence: 72, status: "Pending", date: "2024-05-14" },
    { id: 3, patient: "Sarah Miller", disease: "Migraine", confidence: 93, status: "Rejected", date: "2024-05-13" },
  ]);
  const [search, setSearch] = useState("");

  const stats = [
    { label: "Total Predictions", value: 124, icon: Activity },
    { label: "Accuracy", value: "92%", icon: TrendingUp },
  ];

  const filteredPredictions = predictions.filter(p => 
    p.patient.toLowerCase().includes(search.toLowerCase()) || 
    p.disease.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Predictions</h1>
          <p className="text-gray-500">View AI predictions analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <stat.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search predictions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Disease</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Confidence</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPredictions.map((pred) => (
                  <tr key={pred.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                          <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="font-semibold text-gray-900">{pred.patient}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{pred.disease}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: `${pred.confidence}%` }} />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{pred.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{pred.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pred.status === "Approved" ? "bg-green-100 text-green-700" :
                        pred.status === "Rejected" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {pred.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
