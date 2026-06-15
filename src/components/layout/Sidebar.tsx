import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UtensilsCrossed,
  ShoppingBag, BarChart3, LogOut, ChevronLeft, Store,
  ShoppingCart, Bell, ClipboardList, ReceiptText
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { type UserRole } from '@/types';
import logoApp from '@/assets/logo.png';

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/akun', icon: Users, label: 'Kelola Akun' },
  { to: '/admin/menu', icon: UtensilsCrossed, label: 'Kelola Menu' },
  { to: '/admin/pesanan', icon: ShoppingBag, label: 'Pesanan' },
  { to: '/admin/laporan', icon: BarChart3, label: 'Laporan' },
];

const sellerNavItems = [
  { to: '/seller', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/seller/pesanan', icon: ClipboardList, label: 'Kelola Pesanan' },
  { to: '/seller/menu', icon: UtensilsCrossed, label: 'Kelola Menu' },
  { to: '/seller/laporan', icon: BarChart3, label: 'Laporan' },
];

const customerNavItems = [
  { to: '/customer', icon: Store, label: 'Beranda' },
  { to: '/customer/ringkasan/pesanan', icon: ReceiptText, label: 'Ringkasan' },
  { to: '/customer/penjual', icon: ShoppingCart, label: 'Penjual' },
  { to: '/customer/riwayat/pesanan', icon: Bell, label: 'Riwayat Pesanan' },
];

const roleNavMap: Record<UserRole, typeof adminNavItems> = {
  admin: adminNavItems,
  seller: sellerNavItems,
  customer: customerNavItems,
};

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) return null;

  const navItems = roleNavMap[user.role];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-[240px] bg-white dark:bg-surface-900 border-r border-surface-100 dark:border-surface-800 z-40 flex flex-col shadow-lg lg:shadow-none lg:translate-x-0"
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-green-sm">
              <img src={logoApp} alt="Logo SCOS" className="w-30 h-30 object-contain"/>
            </div>
            <div>
              <span className="font-display font-bold text-base text-surface-900 dark:text-white">SCOS</span>
              <p className="text-[10px] text-surface-400 dark:text-surface-500 leading-none">Smart Canteen Ordering System</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-4 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-3 bg-surface-50 dark:bg-surface-800 rounded-xl p-3">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-surface-900 dark:text-white text-sm truncate">{user.name}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-[10px] font-bold text-surface-400 dark:text-surface-600 uppercase tracking-widest px-3 mb-3">Menu Utama</p>
          <ul className="space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/admin' || to === '/seller' || to === '/customer'}
                  className={({ isActive }) =>
                    cn('sidebar-item', isActive && 'active')
                  }
                  // onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-3 py-4 border-t border-surface-100 dark:border-surface-800">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="sidebar-item w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? 'Sedang keluar...' : 'Keluar'}</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}