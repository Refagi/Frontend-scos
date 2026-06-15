import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  subMessage?: string;
  icon?: 'warning' | 'shield' | 'info';
  buttonText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function WarningModal({
  isOpen,
  onClose,
  title,
  message,
  subMessage,
  icon = 'warning',
  buttonText = 'Mengerti',
  variant = 'danger',
}: WarningModalProps) {
  const iconMap = {
    warning: <AlertTriangle className="w-10 h-10 text-amber-600" />,
    shield: <ShieldCheck className="w-10 h-10 text-red-600" />,
    info: <Info className="w-10 h-10 text-blue-600" />,
  };

  const bgMap = {
    danger: 'bg-red-100 dark:bg-red-900/30',
    warning: 'bg-amber-100 dark:bg-amber-900/30',
    info: 'bg-blue-100 dark:bg-blue-900/30',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="p-8 text-center">
              <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center ${bgMap[variant]}`}>
                {iconMap[icon]}
              </div>

              <h3 className="text-2xl font-semibold mt-6 text-surface-900 dark:text-white">
                {title}
              </h3>

              <p className="mt-3 text-surface-600 dark:text-surface-400 leading-relaxed">
                {message}
              </p>

              {subMessage && (
                <p className="text-sm text-surface-500 mt-2">{subMessage}</p>
              )}
            </div>

            <div className="border-t border-surface-200 dark:border-surface-700 p-4">
              <button
                onClick={onClose}
                className="w-full py-3.5 btn-primary dark:bg-white text-white dark:text-surface-900 rounded-2xl font-semibold hover:bg-surface-800 dark:hover:bg-surface-100 transition"
              >
                {buttonText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}