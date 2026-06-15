import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import {
  ChevronLeft, ChevronRight,
  TrendingUp, ShoppingBag, Package,
} from 'lucide-react'
import { adminApi } from '@/lib/api/admin.api'
import { StatCard } from '@/components/ui'
import type {
  LaporanBulananResponse,
  MenuTerlarisItem,
  RiwayatTransaksiItem,
  ErrorResponse,
} from '@/lib/api/types'
import { AxiosError } from 'axios'
import { formatCurrency, formatDateTime } from '@/lib/utils'


const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]


export function AdminLaporan() {
  const now   = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const [laporan,   setLaporan]   = useState<LaporanBulananResponse | null>(null)
  const [terlaris,  setTerlaris]  = useState<MenuTerlarisItem[]>([])
  const [riwayat,   setRiwayat]   = useState<RiwayatTransaksiItem[]>([])

  const [loadLaporan,  setLoadLaporan]  = useState(true)
  const [loadTerlaris, setLoadTerlaris] = useState(true)
  const [loadRiwayat,  setLoadRiwayat]  = useState(true)

  const [errLaporan,  setErrLaporan]  = useState<string | null>(null)
  const [errTerlaris, setErrTerlaris] = useState<string | null>(null)
  const [errRiwayat,  setErrRiwayat]  = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoadLaporan(true)
        setErrLaporan(null)
        const res = await adminApi.getLaporanBulanan(year, month)
        if (cancelled) return
        setLaporan((res.data?.data as LaporanBulananResponse) ?? null)
      } catch (err: unknown) {
        if (cancelled) return
        const axiosError = err as AxiosError<ErrorResponse>
        setErrLaporan(axiosError.response?.data?.message ?? 'Gagal memuat laporan')
      } finally {
        if (!cancelled) setLoadLaporan(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [year, month])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoadTerlaris(true)
        setErrTerlaris(null)
        const res = await adminApi.getMenuTerlaris(10)
        if (cancelled) return
        setTerlaris((res.data?.data as MenuTerlarisItem[] | undefined) ?? [])
      } catch (err: unknown) {
        if (cancelled) return
        const axiosError = err as AxiosError<ErrorResponse>
        setErrTerlaris(axiosError.response?.data?.message ?? 'Gagal memuat menu terlaris')
      } finally {
        if (!cancelled) setLoadTerlaris(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoadRiwayat(true)
        setErrRiwayat(null)
        const res = await adminApi.getRiwayatTransaksiTerakhir(20)
        if (cancelled) return
        setRiwayat((res.data?.data as RiwayatTransaksiItem[] | undefined) ?? [])
      } catch (err: unknown) {
        if (cancelled) return
        const axiosError = err as AxiosError<ErrorResponse>
        setErrRiwayat(axiosError.response?.data?.message ?? 'Gagal memuat riwayat transaksi')
      } finally {
        if (!cancelled) setLoadRiwayat(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [])

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1
    if (isCurrentMonth) return
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  const sellerChartData = (laporan?.perSeller ?? [])
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map(s => ({
      name:      s.storeName.length > 14 ? s.storeName.slice(0, 14) + '…' : s.storeName,
      pendapatan: s.total,
      pesanan:    s.jumlahPesanan,
    }))

  const terlarisChartData = terlaris.slice(0, 8).map(m => ({
    name:    m.menuName.length > 16 ? m.menuName.slice(0, 16) + '…' : m.menuName,
    terjual: m.totalTerjual,
  }))

  return (
    <div className="space-y-6 w-full">

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="page-title">Laporan</h1>
          <p className="page-subtitle">Analisis penjualan dan transaksi bulanan</p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-navy-800 border border-surface-100 dark:border-navy-700 rounded-xl px-3 py-2 shadow-card self-start sm:self-auto">
          <button
            onClick={prevMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-100 dark:hover:bg-navy-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-surface-900 dark:text-white min-w-[130px] text-center">
            {BULAN[month - 1]} {year}
          </span>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-100 dark:hover:bg-navy-700 transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {errLaporan && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl">
          {errLaporan}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <StatCard
          label="Total Pendapatan"
          value={loadLaporan ? '—' : formatCurrency(laporan?.summary.totalPendapatan ?? 0)}
          icon={<TrendingUp className="w-5 h-5" />}
          sub={`${BULAN[month - 1]} ${year}`}
        />
        <StatCard
          label="Total Pesanan Selesai"
          value={loadLaporan ? '—' : String(laporan?.summary.totalPesanan ?? 0)}
          icon={<ShoppingBag className="w-5 h-5" />}
        />
        <StatCard
          label="Total Item Terjual"
          value={loadLaporan ? '—' : String(laporan?.summary.totalItem ?? 0)}
          icon={<Package className="w-5 h-5" />}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-1">
            Pendapatan per Penjual
          </h3>
          <p className="text-xs text-surface-400 mb-4">{BULAN[month - 1]} {year} · hanya pesanan selesai</p>

          {loadLaporan ? (
            <div className="h-[220px] flex items-center justify-center text-surface-400 text-sm">Memuat...</div>
          ) : sellerChartData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-surface-400 text-sm">Belum ada data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sellerChartData} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false} tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category" dataKey="name"
                  axisLine={false} tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }} width={90}
                />
                <Tooltip
                  contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(v) => [typeof v === 'number' ?  formatCurrency(v) : 'Rp 0', 'Pendapatan']}
                />
                <Bar dataKey="pendapatan" fill="#22c55e" radius={[0, 6, 6, 0]} name="Pendapatan" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card"
        >
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-1">
            Menu Terlaris
          </h3>
          <p className="text-xs text-surface-400 mb-4">Sepanjang waktu · top 8</p>

          {errTerlaris && (
            <p className="text-xs text-red-500 mb-2">{errTerlaris}</p>
          )}

          {loadTerlaris ? (
            <div className="h-[220px] flex items-center justify-center text-surface-400 text-sm">Memuat...</div>
          ) : terlarisChartData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-surface-400 text-sm">Belum ada data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={terlarisChartData} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false} tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <YAxis
                  type="category" dataKey="name"
                  axisLine={false} tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }} width={110}
                />
                <Tooltip
                  contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(v) => [
                    typeof v === 'number' ? v.toLocaleString('id-ID') : '0','Terjual'
                  ]}
                />
                <Bar dataKey="terjual" fill="#22c55e" radius={[0, 6, 6, 0]} name="Terjual" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-navy-800 rounded-2xl shadow-card border border-surface-100 dark:border-navy-700 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-surface-100 dark:border-navy-700">
          <h3 className="font-display font-bold text-surface-900 dark:text-white text-sm">
            Riwayat Transaksi Terakhir
          </h3>
          <p className="text-xs text-surface-400 mt-0.5">20 transaksi terbaru dari semua status</p>
        </div>

        {errRiwayat && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{errRiwayat}</div>
        )}

        <div className="min-w-0 overflow-x-auto">
          <table className="table-base-pesanan min-w-[680px]">
            <thead>
              <tr>
                <th>No</th>
                <th>No. Pesanan</th>
                <th>Pelanggan</th>
                <th>Penjual</th>
                <th>Menu</th>
                <th>Total</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {loadRiwayat ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-surface-400">Memuat data...</td>
                </tr>
              ) : riwayat.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-surface-400">Belum ada transaksi</td>
                </tr>
              ) : (
                riwayat.map((trx, i) => (
                  <motion.tr
                    key={trx.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <td className="text-center font-medium">{i + 1}</td>
                    <td className="whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400">
                        {trx.orderNumber}
                      </span>
                    </td>
                    <td className="whitespace-nowrap font-medium text-surface-900 dark:text-white text-sm">
                      {trx.customer?.name ?? '—'}
                    </td>
                    <td className="whitespace-nowrap text-sm text-surface-500 dark:text-surface-400">
                      {trx.seller?.storeName ?? '—'}
                    </td>
                    <td className="text-xs text-surface-500 dark:text-surface-400 max-w-[180px]">
                      <p className="truncate">
                        {trx.details.map(d => `${d.menuName} ×${d.quantity}`).join(', ')}
                      </p>
                    </td>
                    <td className="whitespace-nowrap font-semibold text-surface-900 dark:text-white">
                      {formatCurrency(trx.totalPrice)}
                    </td>
                    <td className="whitespace-nowrap text-xs text-surface-400">
                      {formatDateTime(trx.createdAt)}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}