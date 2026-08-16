
import { useState, useEffect } from "react";
import { FileText, Search, Clock } from "lucide-react";
import { hospitalDataService } from "../../services/hospitalDataService";

export default function PharmacyRequests() {
  const [prescriptions, setPrescriptions] = useState(hospitalDataService.getPrescriptions());
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = p.patientName?.toLowerCase().includes(search.toLowerCase()) || 
                          p.doctorName?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Requests</h1>
          <p className="text-gray-500">View and manage doctor prescription requests</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Filter:</span>
              {["All", "Pending", "Approved", "Rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
                    filter === f
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredPrescriptions.map((presc) => (
              <div key={presc.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{presc.patientName}</h3>
                      <p className="text-sm text-gray-500">Prescribed by {presc.doctorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      presc.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                      presc.status === "Approved" ? "bg-green-100 text-green-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {presc.status}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {presc.createdAt?.slice(0,10)}
                    </div>
                  </div>
                </div>

                {presc.medicines && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Medicines:</h4>
                    <div className="space-y-2">
                      {presc.medicines.map((med, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-900">{med.name} - {med.dosage}</span>
                          <span className="text-gray-600">{med.frequency} x {med.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 justify-end">
                  {presc.status === "Pending" && (
                    <>
                      <button className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold text-sm hover:bg-red-200 transition-colors">
                        Reject
                      </button>
                      <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors">
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
