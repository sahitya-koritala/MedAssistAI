import { useState, useEffect } from "react";
import { ScanHeart, Download, Search, ZoomIn, ZoomOut, AlertTriangle, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { hospitalDataService } from "../../services/hospitalDataService";

export default function DoctorImageAnalysis() {
  const { t } = useTranslation();
  const [images, setImages] = useState([
    { id: "static-1", patient: "John Doe", type: "X-ray", date: "2026-07-15", status: "AI Processed", aiFinding: "Possible Pneumonia in Lower Lobe", confidence: 89, severity: "Moderate", explanation: "Mild opacity field seen in right lower lung zone.", followUpRecommendation: "Repeat Chest X-ray in 14 days." },
    { id: "static-2", patient: "Jane Smith", type: "MRI", date: "2026-07-14", status: "Pending", aiFinding: "", confidence: 0, severity: "Low", explanation: "Awaiting AI queue processing.", followUpRecommendation: "N/A" },
    { id: "static-3", patient: "Mike Johnson", type: "CT Scan", date: "2026-07-13", status: "AI Processed", aiFinding: "Normal Scan", confidence: 95, severity: "Low", explanation: "No structural abnormalities detected.", followUpRecommendation: "Routine follow-up." },
  ]);
  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const list = hospitalDataService.getImageAnalyses();
    if (list.length > 0) {
      const mapped = list.map(i => ({
        id: i.id,
        patient: i.patientName,
        type: i.type,
        date: i.date,
        status: i.status,
        aiFinding: i.aiFinding,
        confidence: i.confidence,
        severity: i.severity,
        explanation: i.explanation,
        followUpRecommendation: i.followUpRecommendation
      }));
      setImages(mapped);
      setSelectedImage(mapped[0]);
    } else {
      setSelectedImage(images[0]);
    }
  }, []);

  const filteredImages = images.filter(img => 
    img.patient.toLowerCase().includes(search.toLowerCase()) || 
    img.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('doctorImageAnalysis.resultsTitle', 'Medical Image Analysis Results')}</h1>
          <p className="text-gray-500">{t('doctorImageAnalysis.resultsDescription', 'Review AI analysis results for patient medical images')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('doctorImageAnalysis.searchPlaceholder', 'Search images...')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredImages.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedImage?.id === img.id 
                        ? "border-emerald-500 bg-emerald-50" 
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <ScanHeart className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{img.patient}</div>
                        <div className="text-sm text-gray-500">{img.type} • {img.date}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {selectedImage ? (
                <>
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedImage.patient}</h2>
                      <p className="text-gray-500">{selectedImage.type} • {selectedImage.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} 
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <ZoomOut className="w-5 h-5 text-gray-600" />
                      </button>
                      <span className="text-sm font-semibold text-gray-700">{Math.round(zoom * 100)}%</span>
                      <button 
                        onClick={() => setZoom(z => Math.min(2, z + 0.1))} 
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <ZoomIn className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="ml-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Download className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-8 flex items-center justify-center bg-gray-50 min-h-[400px]">
                    <div 
                      className="bg-white shadow-sm rounded-lg border border-gray-200 p-8 transition-transform"
                      style={{ transform: `scale(${zoom})` }}
                    >
                      <ScanHeart className="w-32 h-32 text-gray-300 animate-pulse" />
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-100 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-600" />
                      {t('doctorImageAnalysis.aiAnalysisTitle', 'AI Diagnostics')}
                    </h3>
                    
                    {selectedImage.aiFinding ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
                          <p className="text-xs font-bold text-emerald-800 uppercase">Predicted Finding</p>
                          <p className="font-bold text-gray-900 text-lg">{selectedImage.aiFinding}</p>
                          <p className="text-xs text-gray-500">Confidence Score: {selectedImage.confidence}%</p>
                        </div>
                        
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-1">
                          <p className="text-xs font-bold text-amber-800 uppercase">Severity Level</p>
                          <p className="font-bold text-gray-900 text-lg">{selectedImage.severity}</p>
                          <p className="text-xs text-gray-500">Follow-up: {selectedImage.followUpRecommendation}</p>
                        </div>

                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl md:col-span-2 space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase">AI Explanation Details</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{selectedImage.explanation}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                        <div>
                          <p className="font-semibold text-amber-900">Queue Processing</p>
                          <p className="text-sm text-amber-800">This image scan is currently waiting in the AI model processing queue.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <ScanHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('doctorImageAnalysis.selectImageTitle', 'Select an Image')}</h3>
                  <p className="text-gray-500">{t('doctorImageAnalysis.selectImageDescription', 'Choose an image from the list to view and analyze')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}