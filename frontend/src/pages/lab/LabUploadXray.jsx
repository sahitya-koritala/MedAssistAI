import { useState } from "react";
import { Upload, Search, User, ScanHeart } from "lucide-react";
import { hospitalDataService } from "../../services/hospitalDataService";
import { useTranslation } from "react-i18next";

export default function LabUploadXray() {
  const { t } = useTranslation();
  const [patientSearch, setPatientSearch] = useState("");
  const [patient, setPatient] = useState(null);
  const [findings, setFindings] = useState("");
  const [comments, setComments] = useState("");

  const patients = hospitalDataService.getPatients();
  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(patientSearch.toLowerCase()) || 
    p.phone?.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const handleSelectPatient = (p) => {
    setPatient(p);
    setPatientSearch("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (patient) {
      hospitalDataService.addLabReport({
        patientId: patient.id,
        patientName: patient.name,
        type: "X-ray",
        findings,
        comments,
        status: "Available"
      });
      alert(t('labUploadXray.uploadSuccess', 'X-ray report uploaded successfully!'));
      setFindings("");
      setComments("");
      setPatient(null);
    }
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('labUploadXray.dashboardTitle', 'Upload X-ray Reports')}</h1>
          <p className="text-gray-500">{t('labUploadXray.description', 'Upload and process X-ray images')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">{t('labUploadXray.selectPatient', 'Select Patient')}</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('labUploadXray.searchPatient', 'Search patient by name or phone...')}
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>
              {patientSearch && !patient && (
                <div className="mt-2 bg-white border border-gray-100 rounded-xl shadow-sm max-h-48 overflow-y-auto">
                  {filteredPatients.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPatient(p)}
                      className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{p.name}</div>
                          <div className="text-sm text-gray-500">{p.phone}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {patient && (
                <div className="mt-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-6 h-6 text-emerald-600" />
                    <span className="font-semibold text-gray-900">{patient.name}</span>
                  </div>
                  <button onClick={() => setPatient(null)} className="text-sm text-emerald-700 hover:underline">{t('labUploadXray.changePatient', 'Change')}</button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">{t('labUploadXray.radiologistFindings', 'Radiologist Findings')}</label>
              <textarea
                rows={4}
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                placeholder={t('labUploadXray.findingsPlaceholder', 'Enter radiologist findings...')}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">{t('labUploadXray.additionalComments', 'Additional Comments')}</label>
              <textarea
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                placeholder={t('labUploadXray.commentsPlaceholder', 'Enter any additional comments...')}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">{t('labUploadXray.uploadXrayImage', 'Upload X-ray Image')}</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">{t('labUploadXray.uploadInstructions', 'Click or drag image file here to upload')}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!patient}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('labUploadXray.saveReport', 'Save Report')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}