import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoApp from '@/assets/logo.png';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-surface-100 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-100/40 dark:bg-primary-900/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-50/50 dark:bg-primary-900/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-green-lg mb-4"
          >
            <img 
              src={logoApp} 
              alt="Logo SCOS" 
              className="w-30 h-30 object-contain"
            />
          </motion.div>
          <h1 className="font-display font-bold text-3xl text-surface-900 dark:text-white">SCOS</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">Smart Canteen Ordering System</p>
        </div>

        <div className="card shadow-xl border-surface-100 dark:border-surface-700">
          <Outlet />
        </div>

        <p className="text-center text-xs text-surface-400 dark:text-surface-600 mt-6">
          © 2026 SCOS .
        </p>
      </motion.div>
    </div>
  );
}