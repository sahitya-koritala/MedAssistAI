import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  Search,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";
import Breadcrumbs from "./Breadcrumbs";
import Sidebar from "./layout/Sidebar";
import Navbar from "./layout/Navbar";
export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: "#f0f7f4" }}>
      {/* Sidebar Backdrop for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar user={user} isSidebarOpen={isSidebarOpen} handleLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <Navbar
          user={user}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isProfileOpen={isProfileOpen}
          setIsProfileOpen={setIsProfileOpen}
          profileRef={profileRef}
          handleLogout={handleLogout}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto relative">
          {/* Decorative background leaves — bottom right */}
          <div
            className="fixed bottom-0 right-0 w-72 h-64 pointer-events-none z-0 opacity-30"
            aria-hidden="true"
          >
            <svg viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <ellipse cx="220" cy="180" rx="90" ry="40" fill="#86efac" opacity="0.5" transform="rotate(-30 220 180)" />
              <ellipse cx="250" cy="200" rx="70" ry="30" fill="#4ade80" opacity="0.4" transform="rotate(-15 250 200)" />
              <ellipse cx="180" cy="220" rx="100" ry="35" fill="#86efac" opacity="0.35" transform="rotate(-45 180 220)" />
              <ellipse cx="270" cy="230" rx="60" ry="25" fill="#22c55e" opacity="0.3" transform="rotate(10 270 230)" />
              <ellipse cx="150" cy="240" rx="80" ry="28" fill="#4ade80" opacity="0.3" transform="rotate(-60 150 240)" />
            </svg>
          </div>

          {/* Decorative dots background */}
          <div
            className="absolute inset-0 z-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #166534 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 p-6 md:p-8">
            <Breadcrumbs />
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}