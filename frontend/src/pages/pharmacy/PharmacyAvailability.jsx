
import { useState } from "react";
import { Search, Pill, BarChart3 } from "lucide-react";
import { hospitalDataService } from "../../services/hospitalDataService";

export default function PharmacyAvailability() {
  const medications = hospitalDataService.getMedications();
  const [search, setSearch] = useState("");

  const filteredMeds = medications.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.genericName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Availability</h1>
          <p className="text-gray-500">Check medicine availability and stock status</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for medicine..."
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
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Medicine</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Available Qty</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Expiry</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMeds.map((med) => (
                  <tr key={med.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                          <Pill className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{med.name}</p>
                          {med.genericName && <p className="text-sm text-gray-500">{med.genericName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{med.quantity}</td>
                    <td className="px-6 py-4 text-gray-600">${med.price || 0}</td>
                    <td className="px-6 py-4 text-gray-600">{med.expiryDate || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        med.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {med.available ? "Available" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
                        Update Stock
                      </button>
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
