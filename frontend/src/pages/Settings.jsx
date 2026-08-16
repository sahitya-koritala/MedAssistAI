
// src/pages/Settings.jsx
import React, { useState } from "react";
import {
  Save,
  Settings as SettingsIcon,
  Mail,
  Shield,
  Calendar,
  FlaskRound,
  Briefcase,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/common/Button";
import { useTranslation } from "../context/TranslationContext";

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={cn(
      "w-10 h-5 rounded-full transition-all relative",
      checked ? "bg-emerald-600" : "bg-gray-300"
    )}
  >
    <div
      className={cn(
        "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all",
        checked ? "left-5" : "left-0.5"
      )}
    />
  </button>
);

// Setting Row Component
const SettingRow = ({ label, desc, control }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
    <div className="pr-4">
      <div className="text-sm font-bold text-slate-800">{label}</div>
      {desc && <div className="text-xs text-gray-500 mt-0.5">{desc}</div>}
    </div>
    <div className="flex-shrink-0">{control}</div>
  </div>
);

export default function Settings() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [showMailPassword, setShowMailPassword] = useState(false);

  // Form states
  const [general, setGeneral] = useState({
    siteName: "MediCare+ Clinic Management System",
    tagline: "Your Health, Our Priority",
    timezone: "Asia/Kolkata",
    dateFormat: "DD MMM YYYY",
    timeFormat: "12",
    currency: "INR",
    maintenanceMode: false,
  });

  const [emailSms, setEmailSms] = useState({
    mailDriver: "smtp",
    mailHost: "smtp.gmail.com",
    mailPort: "587",
    mailUsername: "noreply@medicare.com",
    mailPassword: "password123",
    fromName: "MediCare+ System",
    fromEmail: "noreply@medicare.com",
    smsGateway: "twilio",
  });

  const [security, setSecurity] = useState({
    enforceStrongPassword: true,
    twoFactorAuth: true,
    sessionTimeout: 30,
    loginAttemptLimit: 5,
    ipRestriction: false,
  });

  const [appointment, setAppointment] = useState({
    advanceBookingDays: 30,
    slotInterval: "30",
    allowWalkIn: true,
    autoConfirm: false,
    cancellationLimitHours: 2,
  });

  const [labReports, setLabReports] = useState({
    defaultReportFormat: "pdf",
    enableReportApproval: true,
  });

  const [pharmacy, setPharmacy] = useState({
    lowStockThreshold: 10,
    enableExpiryAlerts: true,
  });

  const [payment, setPayment] = useState({
    defaultPaymentMethod: "cash",
    enableOnlinePayments: true,
  });

  const { t } = useTranslation();

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "te", name: "Telugu", flag: "🇮🇳" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "ta", name: "Tamil", flag: "🇮🇳" },
    { code: "kn", name: "Kannada", flag: "🇮🇳" },
    { code: "ml", name: "Malayalam", flag: "🇮🇳" },
    { code: "bn", name: "Bengali", flag: "🇮🇳" },
    { code: "mr", name: "Marathi", flag: "🇮🇳" },
    { code: "gu", name: "Gujarati", flag: "🇮🇳" },
    { code: "pa", name: "Punjabi", flag: "🇮🇳" },
    { code: "or", name: "Odia", flag: "🇮🇳" },
    { code: "as", name: "Assamese", flag: "🇮🇳" },
    { code: "ur", name: "Urdu", flag: "🇵🇰" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "pt", name: "Portuguese", flag: "🇧🇷" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
  ];

  const { language, setLanguage } = useTranslation();

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      // Save to localStorage or API
      const allSettings = { general, emailSms, security, appointment, labReports, pharmacy, payment };
      localStorage.setItem("medico_system_settings", JSON.stringify(allSettings));
      setSaveMessage({ type: "success", text: t('settings.saveSuccess', 'All settings saved successfully!') });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: "error", text: t('settings.saveError', 'Failed to save settings. Please try again.') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-dark tracking-tighter italic">{t('settings.systemSettings', 'System Settings')}</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
            {t('settings.systemSettingsDesc', 'Manage and configure all system preferences and configuration.')}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-11 px-5 rounded-xl flex items-center gap-2 shadow-md shadow-primary/20"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? t('settings.saving', 'Saving...') : t('settings.saveAllChanges', 'Save All Changes')}
        </Button>
      </div>

      {/* Two column layout for main sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* General Settings Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base font-black text-slate-800">{t('settings.generalSettings', 'General Settings')}</h2>
                  <p className="text-[11px] text-gray-500">{t('settings.generalSettingsDesc', 'Basic system information and preferences.')}</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('settings.siteName', 'Site Name')}</label>
                  <input type="text" className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={general.siteName} onChange={e => setGeneral({...general, siteName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('settings.siteTagline', 'Site Tagline')}</label>
                  <input type="text" className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={general.tagline} onChange={e => setGeneral({...general, tagline: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('settings.timezone', 'Timezone')}</label>
                  <select className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={general.timezone} onChange={e => setGeneral({...general, timezone: e.target.value})}>
                    <option value="Asia/Kolkata">{t('settings.asiaKolkata', '(UTC+05:30) Asia/Kolkata')}</option>
                    <option value="America/New_York">{t('settings.americaNewYork', '(UTC-05:00) America/New_York')}</option>
                    <option value="Europe/London">{t('settings.europeLondon', '(UTC+00:00) Europe/London')}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('settings.dateFormat', 'Date Format')}</label>
                  <select className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={general.dateFormat} onChange={e => setGeneral({...general, dateFormat: e.target.value})}>
                    <option value="DD MMM YYYY">{t('settings.ddMmmYyyy', 'DD MMM YYYY (12 May 2025)')}</option>
                    <option value="YYYY-MM-DD">{t('settings.yyyyMmDd', 'YYYY-MM-DD (2025-05-12)')}</option>
                    <option value="MM/DD/YYYY">{t('settings.mmDdYyyy', 'MM/DD/YYYY (05/12/2025)')}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('settings.timeFormat', 'Time Format')}</label>
                  <select className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={general.timeFormat} onChange={e => setGeneral({...general, timeFormat: e.target.value})}>
                    <option value="12">{t('settings.twelveHour', '12 Hour (HH:MM AM/PM)')}</option>
                    <option value="24">{t('settings.twentyFourHour', '24 Hour (HH:MM)')}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('settings.currency', 'Currency')}</label>
                  <select className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={general.currency} onChange={e => setGeneral({...general, currency: e.target.value})}>
                    <option value="INR">{t('settings.inr', 'INR (₹) - Indian Rupee')}</option>
                    <option value="USD">{t('settings.usd', 'USD ($) - US Dollar')}</option>
                    <option value="EUR">{t('settings.eur', 'EUR (€) - Euro')}</option>
                  </select>
                </div>
              </div>
              <SettingRow
                label={t('settings.maintenanceMode', 'Maintenance Mode')}
                desc={t('settings.maintenanceModeDesc', 'System will be unavailable for normal users.')}
                control={<ToggleSwitch checked={general.maintenanceMode} onChange={(val) => setGeneral({...general, maintenanceMode: val})} />}
              />
            </div>
          </div>

          {/* Email & SMS Settings Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base font-black text-slate-800">{t('settings.emailSmsSettings', 'Email & SMS Settings')}</h2>
                  <p className="text-[11px] text-gray-500">{t('settings.emailSmsSettingsDesc', 'Configure email server and SMS gateway.')}</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('settings.mailDriver', 'Mail Driver')}</label>
                  <select className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={emailSms.mailDriver} onChange={e => setEmailSms({...emailSms, mailDriver: e.target.value})}>
                    <option value="smtp">{t('settings.smtp', 'SMTP')}</option>
                    <option value="sendmail">{t('settings.sendmail', 'Sendmail')}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('settings.mailHost', 'Mail Host')}</label>
                  <input type="text" className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={emailSms.mailHost} onChange={e => setEmailSms({...emailSms, mailHost: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('settings.mailPort', 'Mail Port')}</label>
                  <input type="text" className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={emailSms.mailPort} onChange={e => setEmailSms({...emailSms, mailPort: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('settings.mailUsername', 'Mail Username')}</label>
                  <input type="text" className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={emailSms.mailUsername} onChange={e => setEmailSms({...emailSms, mailUsername: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('settings.mailPassword', 'Mail Password')}</label>
                  <div className="relative">
                    <input type={showMailPassword ? "text" : "password"} className="w-full h-10 px-3 pr-8 bg-gray-50 rounded-xl text-sm" value={emailSms.mailPassword} onChange={e => setEmailSms({...emailSms, mailPassword: e.target.value})} />
                    <button type="button" onClick={() => setShowMailPassword(!showMailPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      {showMailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('settings.fromName', 'From Name')}</label>
                  <input type="text" className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={emailSms.fromName} onChange={e => setEmailSms({...emailSms, fromName: e.target.value})} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('settings.fromEmail', 'From Email')}</label>
                  <input type="email" className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={emailSms.fromEmail} onChange={e => setEmailSms({...emailSms, fromEmail: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('settings.smsGateway', 'SMS Gateway')}</label>
                  <select className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={emailSms.smsGateway} onChange={e => setEmailSms({...emailSms, smsGateway: e.target.value})}>
                    <option value="twilio">Twilio</option>
                    <option value="nexmo">Nexmo</option>
                    <option value="plivo">Plivo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Security Settings Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base font-black text-slate-800">{t('settings.securitySettings', 'Security Settings')}</h2>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <SettingRow label={t('settings.enforceStrongPassword', 'Enforce Strong Password')} control={<ToggleSwitch checked={security.enforceStrongPassword} onChange={(val) => setSecurity({...security, enforceStrongPassword: val})} />} />
              <SettingRow label={t('settings.twoFactorAuth', 'Two-Factor Authentication')} control={<ToggleSwitch checked={security.twoFactorAuth} onChange={(val) => setSecurity({...security, twoFactorAuth: val})} />} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('settings.sessionTimeout', 'Session Timeout (Mins)')}</label>
                  <input type="number" className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={security.sessionTimeout} onChange={e => setSecurity({...security, sessionTimeout: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('settings.loginAttempts', 'Max Login Attempts')}</label>
                  <input type="number" className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={security.loginAttemptLimit} onChange={e => setSecurity({...security, loginAttemptLimit: Number(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Settings Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base font-black text-slate-800">{t('settings.appointmentSettings', 'Appointment Settings')}</h2>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <SettingRow label={t('settings.allowWalkIn', 'Allow Walk-In Appointments')} control={<ToggleSwitch checked={appointment.allowWalkIn} onChange={(val) => setAppointment({...appointment, allowWalkIn: val})} />} />
              <SettingRow label={t('settings.autoConfirm', 'Auto-Confirm Online Booking')} control={<ToggleSwitch checked={appointment.autoConfirm} onChange={(val) => setAppointment({...appointment, autoConfirm: val})} />} />
            </div>
          </div>

          {/* Pharmacy & Lab Settings Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <FlaskRound className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base font-black text-slate-800">{t('settings.pharmacyLab', 'Pharmacy & Lab')}</h2>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <SettingRow label={t('settings.enableExpiryAlerts', 'Enable Expiry Alerts')} control={<ToggleSwitch checked={pharmacy.enableExpiryAlerts} onChange={(val) => setPharmacy({...pharmacy, enableExpiryAlerts: val})} />} />
              <SettingRow label={t('settings.enableReportApproval', 'Require Report Approval')} control={<ToggleSwitch checked={labReports.enableReportApproval} onChange={(val) => setLabReports({...labReports, enableReportApproval: val})} />} />
            </div>
          </div>
          
          {/* Payment Settings Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base font-black text-slate-800">{t('settings.paymentSettings', 'Payment Settings')}</h2>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <SettingRow label={t('settings.enableOnlinePayments', 'Enable Online Payments')} control={<ToggleSwitch checked={payment.enableOnlinePayments} onChange={(val) => setPayment({...payment, enableOnlinePayments: val})} />} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}