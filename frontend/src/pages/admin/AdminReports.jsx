
import { useState, useEffect } from "react";
import { Search, FileText, Filter, Download, Users } from "lucide-react";
import { hospitalDataService } from "../../services/hospitalDataService";

export default function AdminReports() {
  const [reports, setReports] = useState(hospitalDataService.getLabReports());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.patientName?.toLowerCase().includes(search.toLowerCase()) || 
                          r.type?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || r.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports Management</h1>
          <p className="text-gray-500">View and manage all medical reports</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              >
                <option value="All">All Types</option>
                <option value="Blood Test">Blood Test</option>
                <option value="X-ray">X-ray</option>
                <option value="MRI">MRI</option>
                <option value="CT Scan">CT Scan</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Report Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                          <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="font-semibold text-gray-900">{report.patientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{report.type}</td>
                    <td className="px-6 py-4 text-gray-600">{report.createdAt?.slice(0, 10)}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
