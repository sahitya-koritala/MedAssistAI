import { useState, useEffect } from "react";
import { Activity, Search, Download, CheckCircle, XCircle, FileText, User, Calendar, Edit3, Check, X, Eye } from "lucide-react";
import { hospitalDataService } from "../../services/hospitalDataService";
import { useTranslation } from "react-i18next";

export default function DoctorAIPredictions() {
  const { t } = useTranslation();
  const [predictions, setPredictions] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [reviewMode, setReviewMode] = useState(null); // 'confirm', 'modify', 'reject'
  const [finalDiagnosis, setFinalDiagnosis] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");

  const loadPredictions = () => {
    setPredictions(hospitalDataService.getAIPredictions());
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  const filteredPredictions = predictions.filter(p => 
    p.patientName.toLowerCase().includes(search.toLowerCase()) || 
    p.prediction.toLowerCase().includes(search.toLowerCase())
  );

  const startReview = (pred, mode) => {
    setSelectedPrediction(pred);
    setReviewMode(mode);
    setFinalDiagnosis(mode === 'confirm' ? pred.prediction : "");
    setDoctorNotes("");
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!selectedPrediction) return;

    let status = "Approved";
    let diagnosis = finalDiagnosis;

    if (reviewMode === 'confirm') {
      status = "Confirmed";
      diagnosis = selectedPrediction.prediction;
    } else if (reviewMode === 'modify') {
      status = "Modified";
      if (!diagnosis.trim()) {
        alert("Please enter the modified diagnosis.");
        return;
      }
    } else if (reviewMode === 'reject') {
      status = "Rejected";
      diagnosis = "AI Prediction Rejected";
    }

    hospitalDataService.updateAIPredictionStatus(
      selectedPrediction.id,
      status,
      diagnosis,
      doctorNotes
    );

    // Reset state & reload
    setSelectedPrediction(null);
    setReviewMode(null);
    setFinalDiagnosis("");
    setDoctorNotes("");
    loadPredictions();
    alert(`AI Prediction assessment submitted as: ${status}`);
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('doctorAIPredictions.dashboardTitle', 'AI Disease Predictions')}</h1>
          <p className="text-gray-500">{t('doctorAIPredictions.description', 'Review and manage AI-powered disease predictions for your patients')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('doctorAIPredictions.search', 'Search predictions by patient or disease...')}
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
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">{t('doctorAIPredictions.patient', 'Patient')}</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">{t('doctorAIPredictions.symptoms', 'Symptoms')}</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">{t('doctorAIPredictions.prediction', 'AI Prediction')}</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">{t('doctorAIPredictions.confidence', 'Confidence')}</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">{t('doctorAIPredictions.status', 'Status')}</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">{t('doctorAIPredictions.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPredictions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                        No pending or reviewed AI predictions found.
                      </td>
                    </tr>
                  ) : (
                    filteredPredictions.map((pred) => (
                      <tr key={pred.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="font-semibold text-gray-900">{pred.patientName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {pred.symptoms.map((s, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">{pred.prediction}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" 
                                style={{ width: `${pred.confidence}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-700">{pred.confidence}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            pred.status === "Confirmed" ? "bg-green-100 text-green-700" :
                            pred.status === "Modified" ? "bg-blue-100 text-blue-700" :
                            pred.status === "Rejected" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {pred.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {pred.status === "Pending" ? (
                              <>
                                <button 
                                  onClick={() => startReview(pred, 'confirm')}
                                  title="Confirm AI Prediction"
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => startReview(pred, 'modify')}
                                  title="Modify Prediction"
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => startReview(pred, 'reject')}
                                  title="Reject Prediction"
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => startReview(pred, 'view')}
                                title="View Assessment Details"
                                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assessment Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Assessment Details
              </h2>

              {selectedPrediction ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase">Patient</p>
                    <p className="font-semibold text-gray-900">{selectedPrediction.patientName}</p>
                    
                    <p className="text-xs font-bold text-gray-400 uppercase pt-2">Symptom Timeline</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedPrediction.symptoms.map((s, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-white text-gray-800 rounded-full text-xs border border-gray-200">
                          {s}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs font-bold text-gray-400 uppercase pt-2">AI Diagnosis Prediction</p>
                    <p className="font-semibold text-emerald-700">{selectedPrediction.prediction} ({selectedPrediction.confidence}%)</p>
                  </div>

                  {reviewMode !== 'view' ? (
                    <>
                      {reviewMode === 'modify' && (
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">Doctor's Corrected Diagnosis</label>
                          <input
                            type="text"
                            value={finalDiagnosis}
                            onChange={(e) => setFinalDiagnosis(e.target.value)}
                            placeholder="Enter the actual disease/condition..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            required
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Clinical Notes / Rationale</label>
                        <textarea
                          rows={4}
                          value={doctorNotes}
                          onChange={(e) => setDoctorNotes(e.target.value)}
                          placeholder="Provide assessment comments..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-sm uppercase tracking-wider"
                        >
                          Submit Assessment
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPrediction(null)}
                          className="px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold transition-all text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="p-4 bg-emerald-50 rounded-xl space-y-2 border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-800 uppercase">Doctor Assessment Outcome</p>
                        <p className="text-sm font-bold text-gray-900">
                          Status: <span className="text-emerald-700">{selectedPrediction.status}</span>
                        </p>
                        {selectedPrediction.finalDiagnosis && (
                          <p className="text-sm font-medium text-gray-800">
                            Final Diagnosis: <span className="font-semibold text-gray-900">{selectedPrediction.finalDiagnosis}</span>
                          </p>
                        )}
                        {selectedPrediction.notes && (
                          <p className="text-sm italic text-gray-600 pt-1">
                            "{selectedPrediction.notes}"
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPrediction(null)}
                        className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold transition-all text-sm"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select an action (Confirm, Modify, Reject) on a pending prediction to record your diagnosis assessment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}