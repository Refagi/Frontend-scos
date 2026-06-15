import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown, Calendar, TrendingUp,
  ShoppingBag, CheckCircle, XCircle, AlertTriangle, Loader2,
} from 'lucide-react';
import { sellerApi } from '@/lib/api/seller.api';
import type { LaporanResponse, ErrorResponse } from '@/lib/api/types';
import type { AxiosError } from 'axios';
import { formatCurrency, getOrderStatusConfig } from '@/lib/utils';
import { formatDateTime } from '@/lib/utils';

type OrderStatus = 'menunggu' | 'ditolak' | 'diterima' | 'dimasak' | 'siap' | 'selesai';

const ALL_STATUSES: (OrderStatus | 'all')[] = [
  'all', 'menunggu', 'ditolak', 'diterima', 'dimasak', 'siap', 'selesai',
];

const STATUS_LABELS: Record<OrderStatus | 'all', string> = {
  all:      'Semua Status',
  menunggu: 'Menunggu',
  ditolak:  'Ditolak',
  diterima: 'Diterima',
  dimasak:  'Dimasak',
  siap:     'Siap',
  selesai:  'Selesai',
};

export function SellerLaporan() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [statusOpen,   setStatusOpen]   = useState(false);

  const [laporan,  setLaporan]  = useState<LaporanResponse | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await sellerApi.getLaporanPesanan({
          ...(statusFilter !== 'all' && { status: statusFilter }),
          ...(dateFrom && { from: dateFrom }),
          ...(dateTo   && { to:   dateTo   }),
        });

        if (cancelled) return;
        setLaporan(res.data?.data ?? null);
      } catch (err: unknown) {
        if (cancelled) return;
        const axiosError = err as AxiosError<ErrorResponse>;
        setError(axiosError.response?.data?.message ?? 'Gagal memuat laporan.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [statusFilter, dateFrom, dateTo]);

  const pesananList  = laporan?.pesananList  ?? [];
  const ringkasan    = laporan?.ringkasan;
  const menuTerlaris = laporan?.menuTerlaris ?? [];

  return (
    <div className="space-y-6">

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1 className="page-title">Laporan Pesanan</h1>
        <p className="page-subtitle">Rekap pesanan dan pendapatan toko Anda.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex items-center justify-end gap-3 flex-wrap"
      >
        <div className="relative">
          <button
            onClick={() => setStatusOpen(p => !p)}
            className="flex items-center gap-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-300 text-sm font-medium px-4 py-2 rounded-full hover:border-surface-300 dark:hover:border-surface-500 transition-colors min-w-[160px] justify-between"
          >
            <span>{STATUS_LABELS[statusFilter]}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${statusOpen ? 'rotate-180' : ''}`} />
          </button>
          {statusOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-card-hover overflow-hidden min-w-[160px]"
            >
              {ALL_STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setStatusOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    statusFilter === s
                      ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-semibold'
                      : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <div className="relative flex items-center">
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-300 text-sm font-medium pl-4 pr-10 py-2 rounded-full appearance-none cursor-pointer hover:border-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
          />
          <Calendar className="absolute right-3 w-4 h-4 text-surface-400 pointer-events-none" />
        </div>

        <span className="text-surface-400 text-sm">s/d</span>

        <div className="relative flex items-center">
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-300 text-sm font-medium pl-4 pr-10 py-2 rounded-full appearance-none cursor-pointer hover:border-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
          />
          <Calendar className="absolute right-3 w-4 h-4 text-surface-400 pointer-events-none" />
        </div>

        {(statusFilter !== 'all' || dateFrom || dateTo) && (
          <button
            onClick={() => { setStatusFilter('all'); setDateFrom(''); setDateTo(''); }}
            className="text-xs text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 underline transition-colors"
          >
            Reset filter
          </button>
        )}
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-surface-400" />
        </div>
      ) : (
        <>
          {ringkasan && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="card space-y-1">
                <p className="text-xs text-surface-400 font-medium">Total Pesanan</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">{ringkasan.totalPesanan}</p>
                <div className="flex items-center gap-1 text-xs text-surface-400">
                  <ShoppingBag className="w-3.5 h-3.5" /> semua status
                </div>
              </div>

              <div className="card space-y-1">
                <p className="text-xs text-surface-400 font-medium">Total Pendapatan</p>
                <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(ringkasan.totalPendapatan)}
                </p>
                <div className="flex items-center gap-1 text-xs text-surface-400">
                  <TrendingUp className="w-3.5 h-3.5" /> pesanan selesai
                </div>
              </div>

              <div className="card space-y-1">
                <p className="text-xs text-surface-400 font-medium">Pesanan Selesai</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {ringkasan.ringkasanPerStatus.find(r => r.status === 'selesai')?.jumlah ?? 0}
                </p>
                <div className="flex items-center gap-1 text-xs text-surface-400">
                  <CheckCircle className="w-3.5 h-3.5" /> berhasil
                </div>
              </div>

              <div className="card space-y-1">
                <p className="text-xs text-surface-400 font-medium">Pesanan Ditolak</p>
                <p className="text-2xl font-bold text-red-500 dark:text-red-400">
                  {ringkasan.ringkasanPerStatus.find(r => r.status === 'ditolak')?.jumlah ?? 0}
                </p>
                <div className="flex items-center gap-1 text-xs text-surface-400">
                  <XCircle className="w-3.5 h-3.5" /> dibatalkan
                </div>
              </div>
            </motion.div>
          )}

          {menuTerlaris.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="card"
            >
              <h2 className="font-display font-bold text-surface-900 dark:text-white text-base mb-4">
                Menu Terlaris
              </h2>
              <div className="space-y-2">
                {menuTerlaris.map((menu, i) => (
                  <div key={menu.menuId} className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-bold text-surface-400">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">
                        {menu.menuName}
                      </p>
                    </div>
                    <span className="text-xs text-surface-400">{menu.totalTerjual}x terjual</span>
                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 min-w-[80px] text-right">
                      {formatCurrency(menu.totalRevenue)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="card p-0 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="table-base-akun">
                <thead>
                  <tr>
                    <th>No. Pesanan</th>
                    <th>Pelanggan</th>
                    <th>Menu</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {pesananList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-14 text-surface-400 text-sm">
                        Tidak ada pesanan ditemukan
                      </td>
                    </tr>
                  ) : (
                    pesananList.map((pesanan, i) => {
                      const cfg = getOrderStatusConfig(pesanan.status);
                      return (
                        <motion.tr
                          key={pesanan.id}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.03 }}
                        >
                          <td>
                            <span className="font-mono text-sm text-surface-800 dark:text-surface-200">
                              {pesanan.orderNumber}
                            </span>
                          </td>
                          <td className="text-surface-700 dark:text-surface-300">
                            {pesanan?.customer?.name}
                          </td>
                          <td className="text-surface-500 dark:text-surface-400 text-sm">
                            <span className="line-clamp-1">
                              {pesanan.details.map(d => d?.menu?.name).join(', ')}
                            </span>
                          </td>
                          <td className="font-semibold text-surface-900 dark:text-white">
                            {formatCurrency(pesanan.totalPrice)}
                          </td>
                          <td>
                            <span className={cfg.className}>{cfg.label}</span>
                          </td>
                          <td className="text-surface-500 dark:text-surface-400 text-sm">
                            {formatDateTime(new Date(pesanan.createdAt))}
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {pesananList.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="text-xs text-surface-400 dark:text-surface-500 text-right"
            >
              Menampilkan {pesananList.length} pesanan
            </motion.p>
          )}
        </>
      )}
    </div>
  );
}