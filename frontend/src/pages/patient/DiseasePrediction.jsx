import { useState } from "react";
import { motion } from "motion/react";
import { Brain, AlertTriangle, CheckCircle, Activity, Stethoscope, Loader2, FileText, Pill, Thermometer, Heart, Droplets } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DiseasePrediction() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const SYMPTOMS = [
    "Fever", "Cough", "Cold", "Headache", "Migraine", "Sore Throat",
    "Chest Pain", "Shortness of Breath", "Fatigue", "Vomiting", "Nausea",
    "Diarrhea", "Stomach Pain", "Body Pain", "Joint Pain", "Muscle Pain",
    "Dizziness", "High Blood Pressure", "Low Blood Pressure", "Diabetes Symptoms",
    "High Blood Sugar", "Skin Rash", "Itching", "Swelling", "Back Pain",
    "Ear Pain", "Eye Pain", "Vision Problems", "Anxiety", "Depression", "Insomnia"
  ];

  const { t } = useTranslation();

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const predictDisease = async () => {
    if (selectedSymptoms.length === 0) return;
    
    setIsPredicting(true);
    // Simulate ML prediction
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Mock prediction results
    const mockPrediction = {
      disease: "Viral Upper Respiratory Infection",
      confidence: 87,
      description: "A viral infection affecting the upper respiratory tract, commonly known as the common cold or flu. It typically resolves within 7-10 days with proper rest and care.",
      severity: "Moderate",
      possibleCauses: [
        "Rhinovirus infection",
        "Influenza virus",
        "Coronavirus variants",
        "Seasonal viral outbreaks"
      ],
      precautions: [
        "Get plenty of rest and sleep",
        "Stay hydrated with fluids",
        "Use over-the-counter pain relievers",
        "Gargle with warm salt water for sore throat",
        "Avoid close contact with others",
        "Monitor temperature regularly"
      ],
      suggestedMedicines: [
        { name: "Paracetamol", dosage: "500mg, 3 times daily", purpose: "Fever and pain relief" },
        { name: "Cough Syrup", dosage: "10ml, 2 times daily", purpose: "Cough suppression" },
        { name: "Vitamin C", dosage: "500mg, daily", purpose: "Immune support" }
      ],
      recommendedDepartment: "General Medicine",
      suggestedTests: [
        "Complete Blood Count (CBC)",
        "Chest X-ray",
        "Throat Swab Culture",
        "Influenza Test"
      ]
    };
    
    setPrediction(mockPrediction);
    setIsPredicting(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'moderate': return <Activity className="w-5 h-5" />;
      case 'low': return <CheckCircle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('diseasePrediction.title', 'AI Disease Prediction')}</h1>
          <p className="text-gray-600">{t('diseasePrediction.description', 'Advanced ML-powered disease prediction with detailed analysis')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Symptom Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              {t('diseasePrediction.selectSymptoms', 'Select Symptoms')}
            </h2>
            
            <p className="text-sm text-gray-600 mb-4">
              {t('diseasePrediction.selectedSymptoms', 'Selected: {count} symptoms', { count: selectedSymptoms.length })}
            </p>

            <div className="max-h-[500px] overflow-y-auto space-y-2">
              {SYMPTOMS.map(symptom => (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                    selectedSymptoms.includes(symptom)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:border-emerald-300'
                  } border`}
                >
                  <div className="flex items-center justify-between">
                    <span>{t('diseasePrediction.symptoms', 'Symptoms')}</span>
                    <span>{symptom}</span>
                    {selectedSymptoms.includes(symptom) && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={predictDisease}
              disabled={selectedSymptoms.length === 0 || isPredicting}
              className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPredicting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('diseasePrediction.predicting', 'Predicting Disease...')}
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  {t('diseasePrediction.predictDisease', 'Predict Disease')}
                </>
              )}
            </button>
          </motion.div>

          {/* Prediction Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-600" />
              {t('diseasePrediction.predictionResults', 'Prediction Results')}
            </h2>

            {!prediction ? (
              <div className="text-center py-16 text-gray-500">
                <Brain className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">{t('diseasePrediction.noPrediction', 'AI-Powered Disease Prediction')}</p>
                <p className="text-sm">{t('diseasePrediction.selectSymptoms', 'Select symptoms to get detailed disease prediction with ML analysis')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Disease Header */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{prediction.disease}</h3>
                      <p className="text-gray-600">{prediction.description}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${getSeverityColor(prediction.severity)}`}>
                      {getSeverityIcon(prediction.severity)}
                      <span className="font-semibold">{prediction.severity