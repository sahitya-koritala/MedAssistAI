
import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Brain, AlertTriangle, CheckCircle, Plus, X, Search, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { SYMPTOM_CATEGORIES } from "../../lib/symptoms";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { hospitalDataService } from "../../services/hospitalDataService";
import { apiRequest } from "../../services/api";

export default function SymptomAnalysis() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);
  const [severity, setSeverity] = useState("");
  const [duration, setDuration] = useState("");
  const [onset, setOnset] = useState("");
  const [existingDiseases, setExistingDiseases] = useState("");
  const [allergies, setAllergies] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");

  const addSymptom = (symptom) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
    setSearchTerm("");
  };

  const removeSymptom = (symptom) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
  };

  const toggleCategory = (categoryName) => {
    setOpenCategory(openCategory === categoryName ? null : categoryName);
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) return;

    setIsAnalyzing(true);
    setResults(null);

    try {
      const response = await apiRequest("/predict-disease", {
        method: "POST",
        body: JSON.stringify({ symptoms: selectedSymptoms })
      });

      if (response && response.success) {
        setResults(response);

        // Save to hospitalDataService
        const patientName = user?.name || "Sarah Williams";
        const patientId = user?.id || "patient-1";
        hospitalDataService.addAIPrediction({
          patientId,
          patientName,
          symptoms: selectedSymptoms,
          prediction: response.disease,
          confidence: response.confidence,
          date: new Date().toISOString().split("T")[0],
          status: "Pending",
          recommendedSpecialist: response.recommendedSpecialist,
          suggestedTests: response.suggestedTests,
          precautions: response.precautions,
          aiRecommendations: response.aiRecommendations
        });
      } else {
        throw new Error(response?.message || "Failed to analyze symptoms");
      }
    } catch (err) {
      console.error("Prediction error:", err);
      alert("Analysis failed: " + (err.message || "Please check that the Flask server is running and try again."));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredSymptomsBySearch = searchTerm 
    ? SYMPTOM_CATEGORIES.flatMap(category => 
        category.symptoms.filter(symptom => 
          symptom.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !selectedSymptoms.includes(symptom)
        ).map(symptom => ({ symptom, category: category.name }))
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('symptomAnalysis.title', "AI Symptom Analysis")}</h1>
          <p className="text-gray-600">{t('symptomAnalysis.subtitle', "Select your symptoms to get AI-powered disease predictions and recommendations")}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Symptom Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              {t('symptomAnalysis.selectSymptoms', "Select Symptoms")}
            </h2>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('symptomAnalysis.searchPlaceholder', "Search symptoms...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Selected Symptoms */}
            {selectedSymptoms.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">{t('symptomAnalysis.selectedSymptoms', "Selected Symptoms ({count})", { count: selectedSymptoms.length })}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map((symptom) => (
                    <div
                      key={symptom}
                      className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      {symptom}
                      <button
                        onClick={() => removeSymptom(symptom)}
                        className="hover:bg-emerald-200 rounded-full p-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">{t('symptomAnalysis.severity', "Severity")}</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">{t('symptomAnalysis.selectSeverity', "Select severity")}</option>
                  <option value="Mild">{t('symptomAnalysis.mild', "Mild")}</option>
                  <option value="Moderate">{t('symptomAnalysis.moderate', "Moderate")}</option>
                  <option value="Severe">{t('symptomAnalysis.severe', "Severe")}</option>
                  <option value="Critical">{t('symptomAnalysis.critical', "Critical")}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">{t('symptomAnalysis.duration', "Duration")}</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">{t('symptomAnalysis.selectDuration', "Select duration")}</option>
                  <option value="Less than a day">{t('symptomAnalysis.lessThanADay', "Less than a day")}</option>
                  <option value="1-3 days">{t('symptomAnalysis.oneToThreeDays', "1-3 days")}</option>
                  <option value="3-7 days">{t('symptomAnalysis.threeToSevenDays', "3-7 days")}</option>
                  <option value="1-2 weeks">{t('symptomAnalysis.oneToTwoWeeks', "1-2 weeks")}</option>
                  <option value="More than 2 weeks">{t('symptomAnalysis.moreThanTwoWeeks', "More than 2 weeks")}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">{t('symptomAnalysis.onset', "Onset")}</label>
                <select
                  value={onset}
                  onChange={(e) => setOnset(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">{t('symptomAnalysis.selectOnset', "Select onset")}</option>
                  <option value="Sudden">{t('symptomAnalysis.sudden', "Sudden")}</option>
                  <option value="Gradual">{t('symptomAnalysis.gradual', "Gradual")}</option>
                  <option value="Intermittent">{t('symptomAnalysis.intermittent', "Intermittent")}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">{t('symptomAnalysis.existingDiseases', "Existing Diseases")}</label>
                <input
                  type="text"
                  placeholder={t('symptomAnalysis.existingDiseasesPlaceholder', "e.g., Diabetes, Hypertension")}
                  value={existingDiseases}
                  onChange={(e) => setExistingDiseases(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">{t('symptomAnalysis.allergies', "Allergies")}</label>
                <input
                  type="text"
                  placeholder={t('symptomAnalysis.allergiesPlaceholder', "e.g., Penicillin, Peanuts")}
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">{t('symptomAnalysis.currentMedications', "Current Medications")}</label>
                <input
                  type="text"
                  placeholder={t('symptomAnalysis.currentMedicationsPlaceholder', "e.g., Paracetamol, Metformin")}
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Search Results or Categories */}
            <div className="max-h-[400px] overflow-y-auto mb-6">
              {searchTerm ? (
                <div className="space-y-2">
                  {filteredSymptomsBySearch.length > 0 ? (
                    filteredSymptomsBySearch.map((item) => (
                      <button
                        key={item.symptom}
                        onClick={() => addSymptom(item.symptom)}
                        className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-sm transition-colors border border-gray-200 hover:border-emerald-300"
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        {item.symptom} <span className="text-xs text-gray-500">{t('symptomAnalysis.category', "({category})", { category: item.category })}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">{t('symptomAnalysis.noSymptomsFound', "No symptoms found")}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {SYMPTOM_CATEGORIES.map((category) => (
                    <div key={category.name} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleCategory(category.name)}
                        className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-semibold text-gray-800">{category.name}</span>
                        {openCategory === category.name ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      {openCategory === category.name && (
                        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {category.symptoms
                            .filter(symptom => !selectedSymptoms.includes(symptom))
                            .map((symptom) => (
                              <button
                                key={symptom}
                                onClick={() => addSymptom(symptom)}
                                className="text-left px-3 py-2 bg-white hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-sm transition-colors border border-gray-200 hover:border-emerald-300"
                              >
                                <Plus className="w-4 h-4 inline mr-1" />
                                {symptom}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={analyzeSymptoms}
              disabled={selectedSymptoms.length === 0 || isAnalyzing}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('symptomAnalysis.analyzing', "Analyzing...")}
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  {t('symptomAnalysis.analyzeSymptoms', "Analyze Symptoms")}
                </>
              )}
            </button>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-600" />
              {t('symptomAnalysis.analysisResults', "Analysis Results")}
            </h2>

            {!results ? (
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">{t('symptomAnalysis.selectSymptomsAndAnalyze', "Select symptoms and click analyze")}</p>
                <p className="text-sm mt-2">{t('symptomAnalysis.aiWillPredictDiseases', "AI will predict possible diseases based on your symptoms")}</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[800px] overflow-y-auto">
                {/* Top Diseases */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">{t('symptomAnalysis.topPredictedDiseases', "Top Predicted Diseases")}</h3>
                  <div className="space-y-3">
                    {results.topDiseases.map((disease, index) => (
                      <motion.div
                        key={disease.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{disease.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            disease.risk === "High"
                              ? "bg-red-100 text-red-700"
                              : disease.risk === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {t('symptomAnalysis.risk', "{risk} Risk", { risk: disease.risk })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full transition-all"
                              style={{ width: `${disease.confidence}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600">{disease.confidence}%</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Specialist */}
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="text-sm text-gray-600">{t('symptomAnalysis.recommendedSpecialist', "Recommended Specialist")}</p>
                      <p className="font-semibold text-gray-900">{results.recommendedSpecialist}</p>
                    </div>
                  </div>
                </div>

                {/* Suggested Tests */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">{t('symptomAnalysis.suggestedMedicalTests', "Suggested Medical Tests")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.suggestedTests.map((test) => (
                      <span key={test} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                        {test}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Precautions */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">{t('symptomAnalysis.precautions', "Precautions")}</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {results.precautions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* AI Recommendations */}
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    {t('symptomAnalysis.aiRecommendationsTitle', "AI Recommendations")}
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-amber-800">
                    {results.aiRecommendations.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}