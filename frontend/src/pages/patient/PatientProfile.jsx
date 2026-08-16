import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Pill, 
  Activity, 
  ChevronLeft, 
  Loader2, 
  Plus, 
  History,
  Phone,
  Mail,
  MapPin,
  Stethoscope
} from "lucide-react";
import { motion } from "motion/react";
import { patientService } from "../../services/patientService";
import { emrService } from "../../services/emrService";
import { Button } from "../../components/common/Button";
import { useTranslation } from "react-i18next";

export default function PatientProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const p = await patientService.getById(id);
        setPatient(p);
        if (p) {
          const t = await emrService.getPatientTimeline(p.patientId || p.id);
          setTimeline(t);
        }
      } catch (err) {
        console.error("Failed to fetch patient data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center text-gray-500">
        <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <h2 className="text-2xl font-bold">{t('patientProfile.patientNotFound', 'Patient Not Found')}</h2>
        <Link to="/patients" className="text-primary hover:underline mt-4 inline-block">{t('patientProfile.backToRegistry', 'Back to Registry')}</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Navigation */}
      <div className="flex items-center gap-4">
        <Link to="/patients" className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-primary-dark tracking-tighter italic">{t('patientProfile.clinicalProfile', 'Clinical Profile')}</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{t('patientProfile.digitalMedicalRecord', 'Digital Medical Record')} • {patient.patientId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient Demographics Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-primary/5 overflow-hidden">
            <div className="p-8 pb-4 flex flex-col items-center">
              <div className="w-24 h-24 rounded-[2rem] bg-blue-50 flex items-center justify-center text-blue-600 font-black text-3xl mb-4 border-4 border-white shadow-lg">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h2 className="text-2xl font-black text-primary-dark text-center leading-tight mb-2">{t('patientProfile.patientName', 'Patient Name')}</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest">{t('patientProfile.gender', 'Gender')}</span>
                <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest">{t('patientProfile.age', 'Age')} Years</span>
              </div>
            </div>

            <div className="p-8 pt-4 space-y-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.25em] border-b border-gray-50 pb-2">{t('patientProfile.contactInfo', 'Contact Info')}</h4>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-600 italic">{patient.phone || patient.contact || t('patientProfile.na', 'N/A')}</span>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-600 italic">{patient.email || t('patientProfile.na', 'N/A')}</span>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-600 italic">{patient.address || t('patientProfile.medicalDistrict', 'Medical District, Hyderabad')}</span>
                </div>
              </div>

              <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                <p className="text-[10px] font-black text-primary-forest uppercase tracking-widest mb-3">{t('patientProfile.clinicianNotes', 'Clinician Notes')}</p>
                <p className="text-xs text-primary-dark/70 font-medium leading-relaxed italic">
                  {t('patientProfile.patientRegistered', 'Patient registered under')} {patient.lastVisit || t('patientProfile.newConsultation', 'New Consultation')}. {t('patientProfile.highAdherence', 'High adherence to suggested treatment protocols expected.')}.
                </p>
              </div>
            </div>
          </div>

          <Button className="w-full h-16 rounded-2xl flex items-center justify-center gap-3 shadow-xl">
             <Plus className="w-5 h-5" /> {t('patientProfile.scheduleNewVisit', 'Schedule New Visit')}
          </Button>
        </div>

        {/* Medical History Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 min-h-[600px]">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
               <div className="flex items-center gap-3">
                  <History className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-black text-primary-dark italic tracking-tight">{t('patientProfile.clinicalTimeline', 'Clinical Timeline')}</h3>
               </div>
               <div className="flex items-center gap-2">
                 <button className="px-4 py-2 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold hover:bg-primary/5 hover:text-primary transition-all">{t('patientProfile.exportReport', 'Export Report')}</button>
               </div>
            </div>

            {timeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4">
                 <Stethoscope className="w-12 h-12 opacity-20" />
                 <p className="font-bold text-sm italic">{t('patientProfile.noClinicalHistory', 'No clinical history records found yet.')}</p>
                 <button className="px-6 py-3 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20">{t('patientProfile.addFirstNote', 'Add First Note')}</button>
              </div>
            ) : (
              <div className="space-y-8 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-px before:bg-gray-100">
                {timeline.map((entry, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    key={entry.id} 
                    className="relative pl-12 flex flex-col sm:flex-row gap-6 group"
                  >
                    <div className="absolute left-0 w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      {entry.type === 'prescription' ? <Pill className="w-5 h-5" /> : 
                       entry.type === 'report' ? <FileText className="w-5 h-5" /> : 
                       <Activity className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1 bg-gray-50 rounded-[1.5rem] p-6 group-hover:bg-primary/5 transition-all border border-transparent group-hover:border-primary/10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-white rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                          <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                            {t(`patientProfile.entryTypes.${entry.type}`, entry.type)}
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {entry.doctorName && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-bold text-gray-600">{entry.doctorName}</span>
                          </div>
                        )}
                        <p className="text-sm text-gray-500 leading-relaxed bg-white p-4 rounded-xl border border-gray-100 italic">
                          "{entry.notes}"
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}