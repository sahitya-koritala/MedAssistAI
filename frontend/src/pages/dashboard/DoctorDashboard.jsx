import { Link } from "react-router-dom";
import { 
  ArrowUpRight, 
  TrendingDown, 
  Users, 
  Calendar, 
  Clock, 
  Plus, 
  ClipboardList, 
  ArrowRight,
  Activity,
  FlaskConical,
  Pill,
  UserCircle,
  Award
} from "lucide-react";
import { cn } from "../../lib/utils";
import AIConsultant from "../../components/dashboard/AIConsultant";
import { useTranslation } from "react-i18next";

function StatCard({ title, value, icon: Icon, color, trend, trendValue }) {
  const { t } = useTranslation();
  const isPositive = trend === "up";
  
  return (
    <div className="bg-bg-secondary p-6 rounded-[2rem] border border-primary/10 shadow-sm transition-all hover:shadow-xl hover:shadow-primary-dark/5 group">
      <div className="flex items-center justify-between mb-6">
        <div className={cn("p-4 rounded-2xl bg-opacity-10 group-hover:scale-110 transition-transform duration-300", color.replace('text-', 'bg-'))}>
          <Icon className={cn("w-6 h-6", color)} />
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{t('doctorDashboard.statCard.title', title)}</p>
        <p className="text-3xl font-black text-primary-dark tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

export default function DoctorDashboard({ user }) {
  const name = user?.name || "Doctor";
  const { t } = useTranslation();
  return (
    <div className="space-y-10">
      <AIConsultant />
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-primary-dark tracking-tighter italic">{t('doctorDashboard.doctorsLounge.title', 'Doctor\'s Lounge')}</h1>
              <p className="text-gray-500 font-medium">{t('doctorDashboard.doctorsLounge.message', 'Hello Dr. {name}, you have {tasks} tasks remaining today.')}</p>
            </div>
            <div className="flex gap-3">
               <Link to="/appointments" className="h-14 px-8 bg-primary/10 text-primary-forest rounded-2xl font-bold flex items-center gap-2 hover:bg-primary/20 transition-colors">
                  <ClipboardList className="w-5 h-5" /> {t('doctorDashboard.queue', 'Queue')}
               </Link>
               <Link to="/emr" className="h-14 px-8 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5" /> {t('doctorDashboard.consultation', 'Consultation')}
               </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title={t('doctorDashboard.totalAppointments', 'Total Appointments')} value="28" icon={Calendar} color="text-primary" />
            <StatCard title={t('doctorDashboard.patientsSeen', 'Patients Seen')} value="12" icon={Users} color="text-blue-600" />
            <StatCard title={t('doctorDashboard.avgTime', 'Avg. Time')} value="18m" icon={Clock} color="text-orange-600" />
          </div>
        </div>

        {/* Profile Card */}
        <div className="w-full xl:w-80 flex-shrink-0">
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-primary-dark/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary-dark font-black text-3xl mb-4 border-4 border-white shadow-lg">
                {name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-xl font-black text-primary-dark tracking-tight mb-1">{t('doctorDashboard.doctorName', 'Dr. {name}')}</h3>
              <p className="text-xs font-bold text-primary-forest uppercase tracking-widest mb-6 px-4 py-1 bg-primary/10 rounded-full">
                {user?.specializations || t('doctorDashboard.specialization', 'General Practitioner')}
              </p>
              
              <div className="w-full space-y-4 text-left">
                <div className="p-4 bg-bg-primary rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('doctorDashboard.degrees', 'Degrees')}</p>
                  <p className="text-sm font-bold text-gray-700">{user?.degrees || t('doctorDashboard.degreesValue', 'MBBS, MD')}</p>
                </div>
                {user?.medals && (
                   <div className="p-4 bg-bg-primary rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('doctorDashboard.honorsMedals', 'Honors & Medals')}</p>
                    <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Award className="w-4 h-4 text-orange-400" /> {user.medals}
                    </p>
                  </div>
                )}
                <div className="flex justify-center gap-2 pt-2">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary-forest">
                      <Award className="w-5 h-5" />
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <TrendingDown className="w-5 h-5" />
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                      <Activity className="w-5 h-5" />
                   </div>
                </div>

                <div className="pt-8 border-t border-gray-50">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{t('doctorDashboard.availabilityManagement', 'Availability Management')}</h4>
                  <div className="space-y-3">
                    {["Mon", "Wed", "Fri"].map(day => (
                      <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-xs font-bold text-gray-600">{day}</span>
                        <span className="text-[10px] font-black text-primary italic">{t('doctorDashboard.time', '09:00 - 17:00')}</span>
                      </div>
                    ))}
                    <button className="w-full py-3 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/10 transition-colors">
                      {t('doctorDashboard.editSchedule', 'Edit Schedule')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-bg-secondary rounded-[3rem] border border-primary/10 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-primary/10 flex items-center justify-between bg-primary/5">
             <div>
                <h3 className="text-xl font-bold text-primary-dark tracking-tight">{t('doctorDashboard.todaysSchedule', 'Today\'s Schedule')}</h3>
                <p className="text-xs font-bold text-primary-forest/60 uppercase tracking-widest mt-1">{t('doctorDashboard.date', 'April 22 · Wednesday')}</p>
             </div>
             <button className="p-3 bg-white/50 rounded-xl shadow-sm text-gray-400 hover:text-primary transition-colors">
                <ArrowRight className="w-5 h-5" />
             </button>
          </div>
          <div className="divide-y divide-gray-50 px-4">
             {[
               { time: "09:30 AM", patient: "Alice Cooper", type: "Follow-up", status: "Waiting" },
               { time: "10:15 AM", patient: "Bob Marley", type: "First Visit", status: "Upcoming" },
               { time: "11:00 AM", patient: "Charlie Sheen", type: "Urgent", status: "Upcoming" },
               { time: "11:45 AM", patient: "Diana Ross", type: "Consultation", status: "Upcoming" },
             ].map((apt, i) => (
               <div key={i} className="py-5 flex items-center justify-between group cursor-pointer hover:bg-gray-50 rounded-2xl px-4 transition-colors">
                 <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-bold">
                     {apt.time.split(' ')[0]}
                   </div>
                   <div>
                     <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{apt.patient}</p>
                     <p className="text-xs text-gray-500 font-medium">{t(`doctorDashboard.aptType.${apt.type.replace(/ /g, '')}`, apt.type)}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <span className={cn(
                     "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                     apt.status === "Waiting" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                   )}>
                     {t(`doctorDashboard.status.${apt.status}`, apt.status)}
                   </span>
                   <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-primary group-hover:text-primary group-hover:bg-primary/5 transition-all">
                     <ArrowUpRight className="w-4 h-4" />
                   </button>
                 </div>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-bg-secondary rounded-[3rem] border border-primary/10 shadow-sm p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-primary-dark tracking-tight">{t('doctorDashboard.quickActions.title', 'Quick Actions')}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-primary/5 hover:bg-primary/10 text-primary transition-colors border border-primary/10">
              <ClipboardList className="w-6 h-6" />
              <span className="text-xs font-bold">{t('doctorDashboard.quickActions.writePrescription', 'Write Prescription')}</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-600 transition-colors border border-orange-100">
              <FlaskConical className="w-6 h-6" />
              <span className="text-xs font-bold">{t('doctorDashboard.quickActions.orderLabTest', 'Order Lab Test')}</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors border border-blue-100">
              <Pill className="w-6 h-6" />
              <span className="text-xs font-bold">{t('doctorDashboard.quickActions.pharmacyRequest', 'Pharmacy Request')}</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors border border-gray-100">
              <UserCircle className="w-6 h-6" />
              <span className="text-xs font-bold">{t('doctorDashboard.quickActions.addPatient', 'Add Patient')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}