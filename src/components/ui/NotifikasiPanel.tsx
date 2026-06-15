import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useNotifikasi, useJumlahBelumDibaca } from "@/hooks/useNotifikasi";
import type { NotifikasiResponse } from "@/lib/api/types";

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

const TYPE_CFG = {
  info: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  success: {
    icon: CheckCircle2,
    color: "text-primary-500",
    bg: "bg-primary-50 dark:bg-primary-900/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  error: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
} as const;

function NotifItem({
  notif,
  onRead,
}: {
  notif: NotifikasiResponse;
  onRead: (id: string) => void;
}) {
  const cfg = TYPE_CFG[notif.type] ?? TYPE_CFG.info;
  const Icon = cfg.icon;

  return (
    <div
      className={`flex gap-3 px-4 py-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/60 cursor-pointer ${
        !notif.isRead ? "bg-primary-50/40 dark:bg-primary-900/10" : ""
      }`}
      onClick={() => {
        if (!notif.isRead) onRead(notif.id);
      }}
    >
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}
      >
        <Icon className={`w-4 h-4 ${cfg.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${notif.isRead ? "text-surface-600 dark:text-surface-400" : "font-semibold text-surface-900 dark:text-white"}`}
        >
          {notif.title}
        </p>
        <p className="text-xs text-surface-400 mt-0.5 leading-snug line-clamp-2">
          {notif.message}
        </p>
        <p className="text-xs text-surface-300 dark:text-surface-600 mt-1">
          {fmtRelative(notif.createdAt)}
        </p>
      </div>

      {!notif.isRead && (
        <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
      )}
    </div>
  );
}

export function NotifikasiPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const jumlah = useJumlahBelumDibaca();
  const { notifikasi, tandaiDibaca, tandaiSemuaDibaca, hapusSemua } =
    useNotifikasi();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors relative"
      >
        <Bell className="w-4 h-4" />
        {jumlah > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {jumlah > 99 ? "99+" : jumlah}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-surface-100 dark:border-surface-700 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100 dark:border-surface-700">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm text-surface-900 dark:text-white">
                  Notifikasi
                </h3>
                {jumlah > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                    {jumlah}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {jumlah > 0 && (
                  <button
                    onClick={() => void tandaiSemuaDibaca()}
                    title="Tandai semua dibaca"
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                {notifikasi.length > 0 && (
                  <button
                    onClick={() => void hapusSemua()}
                    title="Hapus semua"
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[380px] overflow-y-auto">
              {notifikasi.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-surface-400">
                  <Bell className="w-8 h-8" />
                  <p className="text-sm">Belum ada notifikasi</p>
                </div>
              ) : (
                <div className="divide-y divide-surface-100 dark:divide-surface-700">
                  {notifikasi.map((n) => (
                    <NotifItem
                      key={n.id}
                      notif={n}
                      onRead={(id) => void tandaiDibaca(id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {notifikasi.length > 0 && jumlah > 0 && (
              <div className="px-4 py-2.5 border-t border-surface-100 dark:border-surface-700">
                <button
                  onClick={() => void tandaiSemuaDibaca()}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <Check className="w-3.5 h-3.5" />
                  Tandai semua sudah dibaca
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
