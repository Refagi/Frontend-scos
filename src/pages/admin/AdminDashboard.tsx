import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Store, ShoppingBag, TrendingUp, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { StatCard } from '@/components/ui';
import { adminApi } from '@/lib/api/admin.api';
import type { DashboardSummaryResponse, GrafikMingguanItem, ErrorResponse } from '@/lib/api/types';
import { formatCurrency, getOrderStatusConfig } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { AxiosError } from "axios";
import type { OrderStatus } from '@/types/index.js';


const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const STATUS_COLORS: Record<string, string> = {
  menunggu: '#f59e0b',
  ditolak:  '#ef4444',
  diterima: '#3b82f6',
  dimasak:  '#8b5cf6',
  siap:     '#22c55e',
  selesai:  '#64748b',
};

function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="h-4 w-24 bg-surface-200 dark:bg-surface-700 rounded mb-3" />
      <div className="h-8 w-16 bg-surface-200 dark:bg-surface-700 rounded" />
    </div>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 font-semibold hover:underline"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Coba lagi
      </button>
    </div>
  );
}

export function AdminDashboard() {
  const { user } = useAuthStore();

  const [summary, setSummary]         = useState<DashboardSummaryResponse | null>(null);
  const [grafik, setGrafik]           = useState<GrafikMingguanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
   const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, grafikRes] = await Promise.all([
          adminApi.getDashboardSummary(),
          adminApi.getGrafikPesananMingguan(),
        ]);

        if (cancelled) return;

        setSummary(summaryRes.data.data ?? null);
        setGrafik(grafikRes.data.data ?? []);
      } catch (err: unknown) {
        if (cancelled) return;
        const axiosError = err as AxiosError<ErrorResponse>;
        setError(axiosError.response?.data?.message ?? 'Gagal memuat data dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const handleRetry = () => setRetryKey(k => k + 1);

  const statusEntries = summary
    ? Object.entries(summary.ringkasanStatus) as [string, number][]
    : [];
  const maxStatus = statusEntries.length
    ? Math.max(...statusEntries.map(([, v]) => v), 1)
    : 1;

  const grafikData = grafik.map(g => ({
    day:    g.hariPendek,
    orders: g.jumlahPesanan,
  }));

  return (
        <div className="space-y-6">

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1 className="page-title">Overview Dashboard</h1>
        <p className="page-subtitle">Selamat datang, {user?.name}. Berikut ringkasan sistem hari ini.</p>
      </motion.div>

      {error && <ErrorBanner message={error} onRetry={handleRetry} />}

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <motion.div key={i} variants={fadeUp}><SkeletonCard /></motion.div>
          ))
        ) : (
          <>
            <motion.div variants={fadeUp}>
              <StatCard label="Total Pengguna" value={summary?.totalPengguna ?? 0} icon={<Users className="w-5 h-5" />}     color="blue"   />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard label="Total Penjual" value={summary?.totalPenjual ?? 0} icon={<Store className="w-5 h-5" />}     color="purple" />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard label="Pesanan Hari Ini" value={summary?.pesananHariIni ?? 0} icon={<ShoppingBag className="w-5 h-5" />} color="yellow" />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard label="Pendapatan Hari Ini" value={formatCurrency(summary?.pendapatanHariIni ?? 0)} icon={<TrendingUp className="w-5 h-5" />} color="green"  />
            </motion.div>
          </>
        )}
      </motion.div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 card"
        >
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-4">
            Grafik Pesanan Mingguan
          </h3>

          {loading ? (
            <div className="flex items-center justify-center h-[450px]">
              <Loader2 className="w-6 h-6 animate-spin text-surface-400" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={grafikData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} width={30} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--tw-white, #fff)', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 600 }}
                  formatter={(value) => [value, 'Pesanan']}
                />
                <Bar dataKey="orders" fill="#22c55e" radius={[6, 6, 0, 0]} name="Pesanan" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="card"
        >
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-4">
            Ringkasan Status
          </h3>

          {loading ? (
            <div className="space-y-7">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-1.5">
                  <div className="h-3 w-20 bg-surface-200 dark:bg-surface-700 rounded" />
                  <div className="h-3.5 w-full bg-surface-200 dark:bg-surface-700 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-7">
              {statusEntries.map(([status, count]) => {
                const config = getOrderStatusConfig(status as OrderStatus);
                const pct    = Math.round((count / maxStatus) * 100);
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-surface-700 dark:text-surface-300">{config.label}</span>
                      <span className="text-xs font-bold text-surface-900 dark:text-white">{count}</span>
                    </div>
                    <div className="w-full bg-surface-100 dark:bg-surface-700 rounded-full h-3.5">
                      <motion.div
                        className="h-3.5 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[status] ?? '#94a3b8' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}