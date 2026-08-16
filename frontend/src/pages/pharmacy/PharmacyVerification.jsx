
import { useState } from "react";
import { Search, User, ShieldCheck, FileText } from "lucide-react";
import { hospitalDataService } from "../../services/hospitalDataService";

export default function PharmacyVerification() {
  const [search, setSearch] = useState("");
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, patientName: "Alice Cooper", doctorName: "Dr. Smith", status: "Pending", medicines: ["Paracetamol 500mg", "Ibuprofen 400mg"] },
    { id: 2, patientName: "John Doe", doctorName: "Dr. Johnson", status: "Pending", medicines: ["Amoxicillin 250mg"] },
  ]);

  const handleVerify = (id, status) => {
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Prescription Verification</h1>
          <p className="text-gray-500">Receive prescriptions directly from doctors, verify, dispense, and update patient records</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient or doctor name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          {prescriptions
            .filter(p => 
              p.patientName.toLowerCase().includes(search.toLowerCase()) ||
              p.doctorName.toLowerCase().includes(search.toLowerCase())
            )
            .map(presc => (
              <div key={presc.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <User className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{presc.patientName}</h3>
                      <p className="text-sm text-gray-500">Prescribed by {presc.doctorName}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    presc.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                    presc.status === "Verified" ? "bg-green-100 text-green-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {presc.status}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Prescribed Medicines:</h4>
                  <div className="space-y-2">
                    {presc.medicines.map((med, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">{med}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {presc.status === "Pending" && (
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => handleVerify(presc.id, "Rejected")}
                      className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleVerify(presc.id, "Verified")}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
                    >
                      Verify & Dispense
                    </button>
                  </div>
                )}

                {presc.status === "Verified" && (
                  <div className="flex items-center gap-2 text-green-600">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-semibold text-sm">Prescription verified and dispensed</span>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
