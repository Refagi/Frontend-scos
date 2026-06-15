import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  isDeleting?: boolean;
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function DeleteModal({
  isOpen,
  onConfirm,
  onClose,
  isDeleting = false,
  title = "Hapus Item?",
  description = "Item ini akan dihapus secara permanen dan tidak dapat dikembalikan.",
  confirmLabel = "Ya, Hapus",
  cancelLabel = "Batal",
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl w-full max-w-sm border border-surface-100 dark:border-surface-700"
      >
        <div className="px-6 py-7 text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1.5 leading-relaxed">
              {description}
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-70"
            >
              {isDeleting ? "Menghapus..." : confirmLabel}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}