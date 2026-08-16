import { useState } from "react";
import { Upload, Search, User, FileText } from "lucide-react";
import { hospitalDataService } from "../../services/hospitalDataService";
import { useTranslation } from "react-i18next";

export default function LabUploadBlood() {
  const { t } = useTranslation();
  const [patientSearch, setPatientSearch] = useState("");
  const [patient, setPatient] = useState(null);
  const [formData, setFormData] = useState({
    cbc: "",
    sugar: "",
    cholesterol: "",
    hemoglobin: "",
    notes: ""
  });

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
        type: "Blood Test",
        ...formData,
        status: "Available"
      });
      alert(t('labUploadBlood.successMessage', 'Blood report uploaded successfully!'));
      setFormData({ cbc: "", sugar: "", cholesterol: "", hemoglobin: "", notes: "" });
      setPatient(null);
    }
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('labUploadBlood.dashboardTitle', 'Upload Blood Reports')}</h1>
          <p className="text-gray-500">{t('labUploadBlood.description', 'Upload and process blood test reports')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">{t('labUploadBlood.selectPatient', 'Select Patient')}</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('labUploadBlood.searchPatient', 'Search patient by name or phone...')}
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
                  <button onClick={() => setPatient(null)} className="text-sm text-emerald-700 hover:underline">{t('labUploadBlood.changePatient', 'Change')}</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">{t('labUploadBlood.cbc', 'CBC (Complete Blood Count)')}</label>
                <input
                  type="text"
                  value={formData.cbc}
                  onChange={(e) => setFormData({ ...formData, cbc: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  placeholder={t('labUploadBlood.enterCbc', 'Enter CBC results')}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">{t('labUploadBlood.sugar', 'Sugar (Blood Glucose)')}</label>
                <input
                  type="text"
                  value={formData.sugar}
                  onChange={(e) => setFormData({ ...formData, sugar: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  placeholder={t('labUploadBlood.enterSugar', 'Enter sugar levels')}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">{t('labUploadBlood.cholesterol', 'Cholesterol')}</label>
                <input
                  type="text"
                  value={formData.cholesterol}
                  onChange={(e) => setFormData({ ...formData, cholesterol: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  placeholder={t('labUploadBlood.enterCholesterol', 'Enter cholesterol levels')}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">{t('labUploadBlood.hemoglobin', 'Hemoglobin')}</label>
                <input
                  type="text"
                  value={formData.hemoglobin}
                  onChange={(e) => setFormData({ ...formData, hemoglobin: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  placeholder={t('labUploadBlood.enterHemoglobin', 'Enter hemoglobin levels')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">{t('labUploadBlood.notes', 'Additional Notes')}</label>
              <textarea
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                placeholder={t('labUploadBlood.enterNotes', 'Enter any additional notes')}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">{t('labUploadBlood.uploadReport', 'Upload Report File (PDF/Image)')}</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">{t('labUploadBlood.uploadInstructions', 'Click or drag file here to upload')}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!patient}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('labUploadBlood.saveReport', 'Save Report')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}