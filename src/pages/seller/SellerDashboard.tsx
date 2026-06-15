import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag, TrendingUp, Edit2
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useAuthStore } from '@/store/authStore'
import { sellerApi } from '@/lib/api/seller.api'
import type {
  SellerDashboardSummary,
  MenuTerlarisItem,
  GrafikMingguanItem,
  ErrorResponse,
} from '@/lib/api/types'
import { AxiosError } from 'axios'
import { formatCurrency } from '@/lib/utils'
import { StatCard, Card } from '@/components/ui/index'


const BADGE_BG  = ['bg-primary-500', 'bg-primary-400', 'bg-primary-300', 'bg-primary-200', 'bg-primary-100']
const BADGE_TXT = ['text-white', 'text-white', 'text-primary-900', 'text-primary-800', 'text-primary-700']

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35 },
  }),
}


export function SellerDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [summary,   setSummary]   = useState<SellerDashboardSummary | null>(null)
  const [grafik,    setGrafik]    = useState<GrafikMingguanItem[]>([])
  const [terlaris,  setTerlaris]  = useState<MenuTerlarisItem[]>([])

  const [loadSummary,  setLoadSummary]  = useState(true)
  const [loadGrafik,   setLoadGrafik]   = useState(true)
  const [loadTerlaris, setLoadTerlaris] = useState(true)

  const [errSummary,  setErrSummary]  = useState<string | null>(null)
  const [errGrafik,   setErrGrafik]   = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoadSummary(true)
        const res = await sellerApi.getDashboardSummary()
        if (cancelled) return
        setSummary(res.data?.data ?? null)
      } catch (err: unknown) {
        if (cancelled) return
        const axiosError = err as AxiosError<ErrorResponse>
        setErrSummary(axiosError.response?.data?.message ?? 'Gagal memuat ringkasan')
      } finally {
        if (!cancelled) setLoadSummary(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoadGrafik(true)
        const res = await sellerApi.getGrafikMingguan()
        if (cancelled) return
        setGrafik(res.data?.data ?? [])
      } catch (err: unknown) {
        if (cancelled) return
        const axiosError = err as AxiosError<ErrorResponse>
        setErrGrafik(axiosError.response?.data?.message ?? 'Gagal memuat grafik')
      } finally {
        if (!cancelled) setLoadGrafik(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoadTerlaris(true)
        const res = await sellerApi.getMenuTerlaris()
        if (cancelled) return
        setTerlaris(res.data?.data ?? [])
      } catch {
        // silent — tidak kritis
      } finally {
        if (!cancelled) setLoadTerlaris(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  const maxQty = terlaris[0]?.totalTerjual ?? 1

  return (
    <div className="space-y-5 w-full">

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Selamat datang kembali, {user?.storeName ?? user?.name}!
        </p>
      </motion.div>

      {errSummary && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-xl">
          {errSummary}
        </div>
      )}

      <div className="grid grid-cols-3 lg:grid-cols-3 gap-4">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
          <Card className="h-full">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Profil Kantin
                  </p>
                <p className="text-2xl font-display font-bold text-surface-900 dark:text-white mt-1 truncate">
                  {user?.storeName ?? '—'}
                  </p>
              </div>
                <button onClick={() => navigate('/seller/tenant')}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors">
                  <Edit2 className="w-4 h-4" />
                  </button>
           </div>
          </Card>
      </motion.div>
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
          <StatCard
            label="Pesanan Hari Ini"
            value={String(summary?.pesananHariIni ?? 0)}
            icon={<ShoppingBag className="w-4 h-4" />}
            loading={loadSummary}
          />
        </motion.div>
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show">
          <StatCard
            label="Pendapatan Hari Ini"
            value={formatCurrency(summary?.pendapatanHariIni ?? 0)}
            icon={<TrendingUp className="w-4 h-4" />}
            loading={loadSummary}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="lg:col-span-2 card"
        >
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-1">
            Grafik Pesanan Mingguan
          </h3>
          <p className="text-xs text-surface-400 mb-4">7 hari terakhir</p>

          {errGrafik && (
            <p className="text-xs text-red-500 mb-2">{errGrafik}</p>
          )}

          {loadGrafik ? (
            <div className="h-[280px] flex items-center justify-center text-surface-400 text-sm">
              Memuat grafik...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={grafik}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="sellerAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
                <XAxis
                  dataKey="hariPendek"
                  axisLine={false} tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <YAxis
                  axisLine={false} tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  width={30}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff', borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  labelStyle={{ fontWeight: 600, color: '#334155' }}
                  itemStyle={{ color: '#22c55e', fontWeight: 600 }}
                  formatter={(v) => [v, 'Pesanan']}
                  labelFormatter={(label) => {
                    const item = grafik.find(g => g.hariPendek === label)
                    return item?.hari ?? label
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="jumlahPesanan"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  fill="url(#sellerAreaGrad)"
                  dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#16a34a', stroke: '#fff', strokeWidth: 2 }}
                  name="Pesanan"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          className="card flex flex-col"
        >
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-1">
            Menu Terlaku
          </h3>
          <p className="text-xs text-surface-400 mb-4">Sepanjang waktu · top 5</p>

          {loadTerlaris ? (
            <div className="flex-1 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-surface-100 dark:bg-surface-700 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : terlaris.length === 0 ? (
            <p className="text-sm text-surface-400 text-center py-8 flex-1">
              Belum ada data pesanan
            </p>
          ) : (
            <div className="space-y-3 flex-1">
              {terlaris.map((menu, idx) => {
                const pct = Math.round((menu.totalTerjual / maxQty) * 100)
                return (
                  <div key={menu.menuId} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate pr-2">
                          {menu.menuName}
                        </span>
                        <span
                          className={`flex-shrink-0 min-w-[28px] text-center text-xs font-bold px-2 py-0.5 rounded-full
                            ${BADGE_BG[idx]  ?? 'bg-primary-100'}
                            ${BADGE_TXT[idx] ?? 'text-primary-700'}`}
                        >
                          {menu.totalTerjual}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.5 + idx * 0.07, duration: 0.6, ease: 'easeOut' }}
                          className="h-full bg-primary-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-700 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-xs text-surface-500 dark:text-surface-400">Total Menu</p>
                <p className="font-display font-bold text-lg text-surface-900 dark:text-white">
                  {loadSummary ? '—' : summary?.totalMenu ?? 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-surface-500 dark:text-surface-400">Tersedia</p>
                <p className="font-display font-bold text-lg text-primary-600 dark:text-primary-400">
                  {loadSummary ? '—' : summary?.menuTersedia ?? 0}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/seller/menu')}
              className="w-full py-2 rounded-xl text-xs font-semibold border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
            >
              Kelola Menu →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}