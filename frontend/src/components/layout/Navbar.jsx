import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Bell, 
  Search, 
  User as UserIcon, 
  Menu, 
  ChevronDown, 
  UserCircle, 
  LogOut, 
  Globe 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import NotificationCenter from "./NotificationCenter";
import { useTranslation } from "../../context/TranslationContext";
import { useTranslation as useI18nTranslation } from "react-i18next";

export default function Navbar({ 
  user, 
  setIsSidebarOpen, 
  isSidebarOpen, 
  isProfileOpen, 
  setIsProfileOpen, 
  profileRef, 
  handleLogout 
}) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const notificationRef = useRef(null);
  const languageRef = useRef(null);
  const { language, setLanguage } = useTranslation();
  const { t } = useI18nTranslation();

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
    { code: "or", name: "Odia", flag: "��" },
    { code: "as", name: "Assamese", flag: "��" },
    { code: "ur", name: "Urdu", flag: "��" },
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        (notificationRef.current && !notificationRef.current.contains(event.target)) &&
        (languageRef.current && !languageRef.current.contains(event.target))
      ) {
        setIsNotificationsOpen(false);
        setIsLanguageOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-10 flex-shrink-0 z-40">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 text-gray-400 hover:text-[#06402B] hover:bg-emerald-50 rounded-xl transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative group hidden lg:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder={t("common.search", "Search across MedAssist AI...")}
            className="bg-gray-50 border-none rounded-2xl pl-12 pr-6 h-12 w-80 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        {/* Language Selector */}
        <div className="relative" ref={languageRef}>
          <button 
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            className="flex items-center gap-2 p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
          >
            <Globe className="w-6 h-6" />
            <span className="hidden md:inline font-semibold text-sm">
              {languages.find(l => l.code === language)?.name || "English"}
            </span>
          </button>
          
          <AnimatePresence>
            {isLanguageOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-96 overflow-y-auto z-50"
              >
                <div className="px-4 py-3 mb-2 border-b border-gray-50">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("settings.selectLanguage", "Language")}</p>
                </div>
                {languages.map((lang) => (
                  <button 
                    key={lang.code} 
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLanguageOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-emerald-50 transition-colors",
                      language === lang.code ? "bg-emerald-50 text-emerald-700" : "text-gray-600"
                    )}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className={cn("font-bold", language === lang.code ? "text-emerald-700" : "")}>
                      {lang.name}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={cn(
              "p-2.5 rounded-xl transition-all relative group",
              isNotificationsOpen ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
            )}
          >
            <Bell className="w-6 h-6" />
            <span className={cn(
              "absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full border-2",
              isNotificationsOpen ? "bg-white border-emerald-600" : "bg-red-500 border-white"
            )} />
          </button>
          
          <NotificationCenter 
            isOpen={isNotificationsOpen} 
            onClose={() => setIsNotificationsOpen(false)} 
            role={user?.role}
          />
        </div>
        
        <div className="w-px h-8 bg-gray-100" />
        
        {/* User Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-2 py-1 pr-1 group hover:bg-gray-50 rounded-2xl transition-all"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                {user?.name}
              </p>
              <p className="text-[10px] uppercase tracking-widest font-black text-emerald-600/60">
                {user?.role}
              </p>
            </div>
            <div className="w-11 h-11 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 shadow-sm border border-white group-hover:scale-105 transition-transform">
              <UserIcon className="w-6 h-6" />
            </div>
            <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isProfileOpen ? "rotate-180" : "")} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden pb-2 pt-2 z-50"
              >
                 <div className="px-4 py-3 mb-2 border-b border-gray-50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("settings.accountSettings", "Account")}</p>
                 </div>
                 <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                    <UserCircle className="w-5 h-5" />
                    <span className="font-bold">{t("navigation.profile", "My Profile")}</span>
                 </Link>
                 <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold">{t("navigation.logout", "Sign Out")}</span>
                 </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
