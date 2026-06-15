import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Moon, Sun, User as UserIcon, LogOut } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useNotifikasiSSE } from "@/hooks/useNotifikasi";
import { NotifikasiPanel } from "@/components/ui/NotifikasiPanel";

export function Header() {
  const { theme, toggleTheme, setSidebarOpen, sidebarOpen } = useAppStore();
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useNotifikasiSSE();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Selamat Pagi";
    if (h < 15) return "Selamat Siang";
    if (h < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const handleGoToProfile = () => {
    setDropdownOpen(false);
    navigate(`/${user?.role ?? "customer"}/profil`);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/login");
  };

  const initials = user?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <header className="h-16 bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800 flex items-center px-5 gap-4 flex-shrink-0 relative z-30">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-surface-500 dark:text-surface-400">
          {greeting()},
        </p>
        <p className="font-semibold text-surface-900 dark:text-white text-sm leading-none truncate">
          {user?.name}
        </p>
      </div>

      <button
        onClick={toggleTheme}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
      >
        {theme === "light" ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
      </button>

      <NotifikasiPanel />

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((p) => !p)}
          className="flex items-center gap-2 rounded-xl p-1 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-surface-100 dark:border-surface-700 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-surface-900 dark:text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 truncate capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={handleGoToProfile}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-surface-400" />
                  Edit Profil
                </button>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                >
                  {theme === "light" ? (
                    <Moon className="w-4 h-4 text-surface-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-surface-400" />
                  )}
                  {theme === "light" ? "Mode Gelap" : "Mode Terang"}
                </button>
              </div>

              <div className="p-1.5 border-t border-surface-100 dark:border-surface-700">
                <button
                  onClick={() => void handleLogout()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar dari Akun
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
