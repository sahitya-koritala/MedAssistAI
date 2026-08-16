import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { hospitalDataService } from "../../services/hospitalDataService";
import { fetchPatients } from "../../lib/api";
import {
  Search,
  Eye,
  FileText,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  MoreVertical,
  FileImage,
  Stethoscope,
  ClipboardList,
  X,
  Printer,
  ChevronDown
} from "lucide-react";

const DoctorHistory = () => {
  const location = useLocation();
  const dashboardPatientId = location.state?.patientId;

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null); // for modal
  const printRef = useRef();

  // Load patient list
  useEffect(() => {
    const loadPatientsData = async () => {
      try {
        const res = await fetchPatients();
        const list = res.data || res || [];
        
        let loadedPatients = [];
        if (list.length > 0) {
          loadedPatients = list.map((p, idx) => ({
            id: p.id || p._id || `PAT-${Date.now()}-${idx}`,
            name: p.name,
            phone: p.phone,
            email: p.email || "",
            gender: p.gender || "Male",
            age: p.age || 30,
            address: p.address || "Medical District"
          }));
        } else {
          loadedPatients = hospitalDataService.getPatients();
        }
        
        setPatients(loadedPatients);
        
        // Choose active patient ID
        let activeId = dashboardPatientId;
        if (!activeId && loadedPatients.length > 0) {
          activeId = loadedPatients[0].id;
        }
        
        if (activeId) {
          setSelectedPatientId(activeId);
          const p = loadedPatients.find(pt => pt.id === activeId);
          setSelectedPatient(p);
        }
      } catch (err) {
        console.error("Failed to load patients in history:", err);
        const fallback = hospitalDataService.getPatients();
        setPatients(fallback);
        let activeId = dashboardPatientId;
        if (!activeId && fallback.length > 0) {
          activeId = fallback[0].id;
        }
        if (activeId) {
          setSelectedPatientId(activeId);
          const p = fallback.find(pt => pt.id === activeId);
          setSelectedPatient(p);
        }
      }
    };
    loadPatientsData();
  }, [dashboardPatientId]);

  // Load timeline for selected patient
  useEffect(() => {
    if (selectedPatientId) {
      const timeline = hospitalDataService.getPatientTimeline(selectedPatientId);
      setHistory(timeline);
    } else {
      setHistory([]);
    }
  }, [selectedPatientId]);

  const handlePatientChange = (e) => {
    const id = e.target.value;
    setSelectedPatientId(id);
    const p = patients.find(pt => pt.id === id);
    setSelectedPatient(p);
    setCurrentPage(1);
  };

  // Filter history
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.items || []).some(i => (i || "").toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.doctorName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / rowsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getTypeStyles = (type) => {
    switch (type) {
      case "Rx":
        return { icon: ClipboardList, color: "bg-emerald-100 text-emerald-700", label: "Prescription" };
      case "Lab Report":
        return { icon: FileText, color: "bg-blue-100 text-blue-700", label: "Lab Report" };
      case "Diagnosis":
        return { icon: Stethoscope, color: "bg-amber-100 text-amber-700", label: "Diagnosis" };
      case "Imaging Report":
        return { icon: FileImage, color: "bg-purple-100 text-purple-700", label: "Imaging Report" };
      case "Appointment":
        return { icon: Calendar, color: "bg-teal-100 text-teal-700", label: "Appointment" };
      default:
        return { icon: FileText, color: "bg-gray-100 text-gray-700", label: "Record" };
    }
  };

  const handleViewDetails = (item) => {
    setSelectedRecord(item);
  };

  const handleCloseModal = () => {
    setSelectedRecord(null);
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalTitle = document.title;
      document.title = `Medical Record - ${selectedRecord?.date} ${selectedRecord?.type}`;
      const printWindow = window.open("", "_blank", "width=800,height=600");
      printWindow.document.write(`
        <html>
          <head>
            <title>${document.title}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 2rem; line-height: 1.5; }
              h1 { color: #06402B; border-bottom: 2px solid #06402B; padding-bottom: 0.5rem; }
              .record-detail { margin: 1rem 0; }
              .label { font-weight: 600; color: #4B5563; width: 140px; display: inline-block; }
              .value { color: #1F2937; }
              hr { margin: 1rem 0; }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      document.title = originalTitle;
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F9F6] p-6">
      <div className="max-w-[1600px] mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#06402B] tracking-tight">Diagnosis &amp; Consultation History</h1>
          <p className="text-gray-500 font-medium">Unified longitudinal healthcare timeline for your patient records.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-gray-700">Select Patient:</label>
          <select
            value={selectedPatientId}
            onChange={handlePatientChange}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - History List */}
        <div className="xl:col-span-2 space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search visit diagnoses, prescriptions, doctors or notes..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 outline-none"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer"
            >
              <option value="all">All Event Types</option>
              <option value="Rx">Prescriptions (Rx)</option>
              <option value="Lab Report">Lab Reports</option>
              <option value="Diagnosis">Doctor Diagnoses</option>
              <option value="Imaging Report">Imaging Reports (AI)</option>
              <option value="Appointment">Appointments</option>
            </select>
          </div>

          {/* History Cards */}
          <div className="space-y-4">
            {paginatedHistory.map((item) => {
              const { icon: TypeIcon, color, label } = getTypeStyles(item.type);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center min-w-[70px]">
                        <span className="text-sm font-bold text-gray-900">{item.date}</span>
                        <span className="text-xs text-gray-400">{item.time}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl ${color} mt-0.5`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-600 font-medium mt-0.5">{item.description}</div>
                          {item.items && item.items.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {item.items.map((it, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-50 border border-gray-150 rounded text-xs text-gray-600">
                                  {it}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.notes && (
                            <p className="text-xs text-gray-500 italic mt-2 bg-gray-50/50 p-2 rounded border-l-2 border-emerald-400">
                              "{item.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-800">{item.doctorName}</div>
                        <div className="text-xs text-gray-450">{item.doctorSpecialty}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {paginatedHistory.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
                No clinical consultation records found for this patient.
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredHistory.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
              <div className="text-xs text-gray-500">
                Showing {((currentPage - 1) * rowsPerPage) + 1} to{" "}
                {Math.min(currentPage * rowsPerPage, filteredHistory.length)} of {filteredHistory.length} records
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    ←
                  </button>
                  <span className="text-sm font-medium text-gray-700 px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Clinical Profile Sidebar */}
        <div className="xl:col-span-1">
          {selectedPatient ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-[#06402B]">Clinical Profile</h2>
                <p className="text-xs text-gray-400">Digital Medical Record</p>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold">
                    {selectedPatient.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedPatient.name}</h3>
                    <div className="flex gap-2 text-sm text-gray-500 mt-1">
                      <span>{selectedPatient.gender || "Female"}</span>
                      <span>•</span>
                      <span>{selectedPatient.age || 34} Years</span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-1">Patient ID: {selectedPatient.id}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{selectedPatient.phone || "+91 98765 43210"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{selectedPatient.email || "alice.cooper@email.com"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{selectedPatient.address || "Medical District, Hyderabad"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Emergency Contact</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{selectedPatient.emergencyContactName || "Bob Cooper"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{selectedPatient.emergencyContactNumber || "+91 98765 43211"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center text-gray-450">
              No Patient Selected
            </div>
          )}
        </div>
      </div>

      {/* Modal for detailed view */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#06402B]">Record Details</h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div ref={printRef} className="p-6 space-y-5">
              {/* Header */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl ${getTypeStyles(selectedRecord.type).color}`}>
                    {React.createElement(getTypeStyles(selectedRecord.type).icon, { className: "w-6 h-6" })}
                  </div>
                  <span className="text-sm font-semibold text-gray-500">{getTypeStyles(selectedRecord.type).label}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedRecord.title}</h2>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  <span>{selectedRecord.date} at {selectedRecord.time}</span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Findings / Description</h4>
                  <p className="text-gray-800 font-medium">{selectedRecord.description}</p>
                </div>

                {selectedRecord.items && selectedRecord.items.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Items</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {selectedRecord.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedRecord.notes && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Clinical Notes</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRecord.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Care Provider</h4>
                    <p className="font-medium text-gray-800">{selectedRecord.doctorName}</p>
                    <p className="text-sm text-gray-500">{selectedRecord.doctorSpecialty}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Patient</h4>
                    <p className="font-medium text-gray-800">{selectedPatient ? selectedPatient.name : "Unknown Patient"}</p>
                    <p className="text-sm text-gray-500">ID: {selectedPatientId}</p>
                  </div>
                </div>
              </div>

              <hr className="my-2" />
              <div className="text-xs text-gray-400 text-center">
                Generated from Electronic Medical Record System
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={handleCloseModal}
                className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2 rounded-xl bg-[#06402B] text-white hover:bg-emerald-800 transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorHistory;