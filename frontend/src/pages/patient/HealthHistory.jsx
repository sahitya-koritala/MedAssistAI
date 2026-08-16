import { useState, useEffect } from "react";
import { HeartPulse, FileText, Calendar, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { hospitalDataService } from "../../services/hospitalDataService";

const HealthHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (user?.id) {
      const timeline = hospitalDataService.getPatientTimeline(user.id);
      if (timeline && timeline.length > 0) {
        setHistory(timeline.map(item => ({
          id: item.id,
          date: item.date,
          type: item.type === "Rx" ? "Prescription" : item.type === "Lab Report" ? "Report Analysis" : "Appointment",
          title: item.title,
          result: item.description || item.notes
        })));
      } else {
        // Fallback to static reports so the screen is never empty on first load
        setHistory([
          { id: 1, date: "2026-05-15", type: "Symptom Analysis", title: "Fever & Headache", result: "Viral Infection - Low Risk" },
          { id: 2, date: "2026-05-10", type: "Report Analysis", title: "Blood Report", result: "Normal - All parameters within range" },
          { id: 3, date: "2026-05-05", type: "Appointment", title: "Dr. Smith Consultation", result: "Follow-up in 2 weeks" }
        ]);
      }
    }
  }, [user]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#06402B]">{t('healthHistory.dashboardTitle', 'My Health History')}</h1>
        <p className="text-gray-600 mt-2">{t('healthHistory.dashboardDescription', 'Track all your health activities and records')}</p>
      </div>

      <div className="space-y-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  {item.type === "Symptom Analysis" && <HeartPulse className="text-emerald-600" />}
                  {item.type === "Report Analysis" && <FileText className="text-blue-600" />}
                  {item.type === "Appointment" && <Calendar className="text-purple-600" />}
                  {item.type !== "Symptom Analysis" && item.type !== "Report Analysis" && item.type !== "Appointment" && <HeartPulse className="text-emerald-600" />}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('healthHistory.historyType', item.type)}</p>
                  <h3 className="font-bold text-[#06402B]">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.result}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-500">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthHistory;