import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Activity, 
  FlaskConical, 
  Pill, 
  Plus, 
  HeartPulse, 
  Stethoscope,
  FileText
} from "lucide-react";
import { emrService } from "../../services/emrService";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";

function StatCard({ title, value, icon: Icon, color }) {
  const { t } = useTranslation();
  return (
    <div className="bg-bg-secondary p-6 rounded-[2rem] border border-primary/10 shadow-sm transition-all hover:shadow-xl hover:shadow-primary-dark/5 group">
      <div className="flex items-center justify-between mb-6">
        <div className={cn("p-4 rounded-2xl bg-opacity-10 group-hover:scale-110 transition-transform duration-300", color.replace('text-', 'bg-'))}>
          <Icon className={cn("w-6 h-6", color)} />
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{t('patientDashboard.statCardTitle', title)}</p>
        <p className="text-3xl font-black text-primary-dark tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

export default function PatientDashboard({ user }) {
  const name = user?.name || "Patient";
  const [timeline, setTimeline] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchHistory = async () => {
      const history = await emrService.getPatientTimeline(user?.patientId || user?.id);
      setTimeline(history);
    };
    if (user) fetchHistory();
  }, [user]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-primary-dark tracking-tighter">{t('patientDashboard.dashboardTitle', 'Dashboard')}</h1>
              <p className="text-gray-500 font-medium italic">Welcome back, {name}. Your stats look <span className="text-primary font-bold">{t('patientDashboard.statsLook', 'Excellent')}</span>.</p>
            </div>
            <Link to="/appointments" className="h-14 px-8 bg-primary-dark text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-primary-dark/20 hover:scale-105 transition-transform">
               <Plus className="w-5 h-5" /> {t('patientDashboard.bookAppointment', 'Book Appointment')}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title={t('patientDashboard.recentRx', 'Recent Rx')} value={timeline.filter(t => t.type === 'prescription').length || "0"} icon={Pill} color="text-primary" />
            <StatCard title={t('patientDashboard.pulse', 'Pulse')} value="72 BPM" icon={Activity} color="text-red-500" />
            <StatCard title={t('patientDashboard.bloodGroup', 'Blood Group')} value="O+" icon={FlaskConical} color="text-blue-600" />
            <StatCard title={t('patientDashboard.reports', 'Reports')} value={timeline.filter(t => t.type === 'report').length || "0"} icon={FileText} color="text-orange-600" />
          </div>
        </div>

        {/* Patient Profile Card */}
        <div className="w-full xl:w-80 flex-shrink-0">
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-primary-dark/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-[2rem] bg-blue-50 flex items-center justify-center text-blue-600 font-black text-3xl mb-4 border-4 border-white shadow-lg">
                {name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-xl font-black text-primary-dark tracking-tight mb-1">{name}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Patient ID: {user?.patientId || user?.id || t('patientDashboard.patientId', 'P-8821')}</p>
              
              <div className="w-full space-y-4 text-left">
                <div className="p-4 bg-bg-primary rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('patientDashboard.latestClinicalNote', 'Latest Clinical Note')}</p>
                  <p className="text-sm font-medium text-gray-600 italic leading-relaxed">
                    {timeline[0]?.notes || user?.history || t('patientDashboard.noHistory', 'No significant medical history recorded yet.')}
                  </p>
                </div>
                <div className="p-4 bg-bg-primary rounded-2xl">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('patientDashboard.careProvider', 'Care Provider')}</p>
                   <p className="text-sm font-bold text-primary-forest">{timeline[0]?.doctorName || t('patientDashboard.pendingAssignment', 'Pending Assignment')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-bg-secondary p-10 rounded-[3rem] border border-primary/10 shadow-sm">
          <div className="flex items-center justify-between mb-10">
             <h3 className="text-xl font-bold text-primary-dark tracking-tight uppercase tracking-widest text-xs opacity-50">{t('patientDashboard.recentHistory', 'Recent History')}</h3>
             <button className="text-xs font-bold text-primary hover:underline">{t('patientDashboard.downloadRecords', 'Download All Records')}</button>
          </div>
          <div className="space-y-12 relative before:absolute before:left-3.5 before:top-4 before:bottom-0 before:w-px before:bg-primary/5">
            {[
              { date: "Mar 12, 2026", title: "General Physical Examination", doctor: "Dr. Sam Smith", note: "Vital signs normal. Recommended vitamin D and continued daily exercise.", icon: Stethoscope },
              { date: "Feb 05, 2026", title: "Standard Blood Test", doctor: "BioLab Central", note: "Cholesterol levels improved by 5%. Next test in 6 months.", icon: FlaskConical }
            ].map((item, i) => (
              <div key={i} className="relative pl-12 group">
                <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-emerald-50 border-4 border-white flex items-center justify-center shadow-sm group-hover:bg-emerald-600 transition-colors">
                   <item.icon className="w-2.5 h-2.5 text-emerald-600 group-hover:text-white" />
                </div>
                <div className="text-[10px] font-black text-gray-300 mb-2 uppercase tracking-widest">{item.date}</div>
                <h4 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">{item.title}</h4>
                <p className="text-xs font-bold text-emerald-600 mb-4">{item.doctor}</p>
                <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-500 leading-relaxed italic">
                   "{item.note}"
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                 <div className="p-3 bg-red-50 rounded-xl text-red-600">
                    <HeartPulse className="w-6 h-6" />
                 </div>
                 <h3 className="text-lg font-bold text-[#06402B]">{t('patientDashboard.activeMeds', 'Active Meds')}</h3>
              </div>
              <div className="space-y-4">
                 {[
                   { name: "Amoxicillin", dose: "500mg, 1x Daily", days: "3 days left" },
                   { name: "Cetirizine", dose: "10mg, Before Bed", days: "Permanent" },
                 ].map((m, i) => (
                   <div key={i} className="p-4 bg-bg-primary rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-primary/5 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm text-lg font-bold text-gray-300">
                         {i + 1}
                       </div>
                       <div>
                         <p className="font-bold text-gray-900">{t(`patientDashboard.meds.${m.name}`, m.name)}</p>
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t(`patientDashboard.meds.${m.dose.replace(/ /g, '')}`, m.dose)}</p>
                       </div>
                     </div>
                     <span className={cn(
                       "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest",
                       m.days.includes("left") ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"
                     )}>
                       {t(`patientDashboard.meds.${m.days.replace(/ /g, '')}`, m.days)}
                     </span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}