import { useState } from "react";
import { Activity, FileText, ScanHeart } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LabProcessingStatus() {
  const [processingItems, setProcessingItems] = useState([
    { id: 1, patient: "Alice Cooper", type: "Blood Test", status: "Pending", time: "10:00 AM" },
    { id: 2, patient: "John Doe", type: "X-ray", status: "Processing", time: "10:15 AM" },
    { id: 3, patient: "Sarah Miller", type: "MRI", status: "Completed", time: "09:30 AM" },
    { id: 4, patient: "Mike Johnson", type: "CT Scan", status: "Failed", time: "09:00 AM" },
    { id: 5, patient: "Jane Smith", type: "Blood Test", status: "Prediction Ready", time: "08:45 AM" },
  ]);

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Processing: "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
    Failed: "bg-red-100 text-red-700",
    "Prediction Ready": "bg-purple-100 text-purple-700",
  };

  const { t } = useTranslation();

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('labProcessingStatus.dashboardTitle', 'AI Processing Status')}</h1>
          <p className="text-gray-500">{t('labProcessingStatus.dashboardDescription', 'Track AI processing of uploaded reports')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {processingItems.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    {item.type.includes("Blood") ? (
                      <Activity className="w-6 h-6 text-orange-600" />
                    ) : (
                      <ScanHeart className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{item.patient}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[item.status]}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span placeholder={t('labProcessingStatus.search', 'Type to search...')}></span>
                      <span>•</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}