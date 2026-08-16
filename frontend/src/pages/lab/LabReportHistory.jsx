import { useState, useEffect } from "react";
import { Search, FileText, Download, User, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchReports } from "../../lib/api";

export default function LabReportHistory() {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchReports()
      .then((res) => {
        setReports(res || []);
      })
      .catch((err) => {
        console.error("Failed to load reports:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.testName?.toLowerCase().includes(search.toLowerCase()) ||
      (r.testType || r.type)?.toLowerCase().includes(search.toLowerCase());
    
    const type = r.testType || r.type || "";
    const matchesFilter =
      filter === "All" ||
      type.toLowerCase().includes(filter.toLowerCase());
      
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("labReportHistory.dashboardTitle", "Report History")}
          </h1>
          <p className="text-gray-500">
            {t("labReportHistory.dashboardDescription", "View report upload and processing history")}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("labReportHistory.searchPlaceholder", "Search reports...")}
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
                <option value="All">{t("labReportHistory.filterAll", "All Types")}</option>
                <option value="Hematology">{t("labReportHistory.filterHematology", "Hematology")}</option>
                <option value="Biochemistry">{t("labReportHistory.filterBiochemistry", "Biochemistry")}</option>
                <option value="Endocrinology">{t("labReportHistory.filterEndocrinology", "Endocrinology")}</option>
                <option value="Imaging">{t("labReportHistory.filterImaging", "Imaging")}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading history records...</div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No reports found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      {t("labReportHistory.tablePatient", "Patient")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      {t("labReportHistory.tableType", "Test")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      {t("labReportHistory.tableDate", "Date")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      {t("labReportHistory.tableStatus", "Status")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      {t("labReportHistory.tableActions", "Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReports.map((report) => {
                    const firstAttachment = report.attachments?.[0];
                    return (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{report.patientName}</div>
                              <div className="text-xs text-gray-400 font-mono">{report.patientId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{report.testName}</div>
                          <div className="text-xs text-gray-400 capitalize">
                            {report.testType || report.type}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {report.sampleDate || report.createdAt?.slice(0, 10)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {firstAttachment ? (
                            <a
                              href={firstAttachment.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Download Report File"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}