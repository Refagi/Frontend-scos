import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Package,
  AlertTriangle, RefreshCw, ArrowRight,
} from 'lucide-react'
import { customerApi } from '@/lib/api/customer.api'
import type { PesananResponse, ErrorResponse } from '@/lib/api/types'
import { AxiosError } from 'axios'
import { ActiveOrderCard } from '@/components/ui/ActiveOrderCard'

const ACTIVE_STATUSES = ['menunggu', 'diterima', 'dimasak', 'siap'] as const


export function CustomerRingkasan() {
  const navigate = useNavigate()

  const [orders,   setOrders]   = useState<PesananResponse[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const [konfirmingId, setKonfirmingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await customerApi.getRiwayatPesanan() 
        if (cancelled) return
        const all = (res.data?.data ?? []).filter(o =>
          ACTIVE_STATUSES.includes(o.status as typeof ACTIVE_STATUSES[number])
        )

        all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setOrders(all)
      } catch (err: unknown) {
        if (cancelled) return
        const axiosError = err as AxiosError<ErrorResponse>
        setError(axiosError.response?.data?.message ?? 'Gagal memuat pesanan aktif.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [retryKey])

  const handleKonfirmasi = async (pesananId: string) => {
    setKonfirmingId(pesananId)
    try {
      await customerApi.konfirmasiPembayaran(pesananId)
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>
      setError(axiosError.response?.data?.message ?? 'Gagal mengirim konfirmasi.')
    } finally {
    setKonfirmingId(null)
  }
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 pb-24">

      <div className="bg-white dark:bg-surface-800 border-b border-surface-100 dark:border-surface-700 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg text-surface-900 dark:text-white">
            Pesanan Aktif
          </h1>
          <p className="text-xs text-surface-400 mt-0.5">
            Pantau status pesananmu saat ini
          </p>
        </div>
        <button
          onClick={() => setRetryKey(k => k + 1)}
          className="p-2 text-surface-400 hover:text-surface-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-4 space-y-4">

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            <button onClick={() => setRetryKey(k => k + 1)} className="ml-auto font-semibold hover:underline text-xs">
              Coba lagi
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-surface-800 rounded-2xl p-4 animate-pulse space-y-3">
                <div className="h-3 w-32 bg-surface-200 dark:bg-surface-700 rounded" />
                <div className="h-4 w-48 bg-surface-200 dark:bg-surface-700 rounded" />
                <div className="h-3 w-full bg-surface-200 dark:bg-surface-700 rounded" />
                <div className="h-8 w-full bg-surface-200 dark:bg-surface-700 rounded-xl" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-surface-400">
            <Package className="w-12 h-12" />
            <p className="font-medium text-surface-600 dark:text-surface-400">
              Tidak ada pesanan aktif
            </p>
            <p className="text-xs text-center">
              Pesanan yang sedang berjalan akan muncul di sini
            </p>
            <button
              onClick={() => navigate('/customer/penjual')}
              className="mt-2 px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-colors"
            >
              Pesan Sekarang
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {orders.map(order => (
              <ActiveOrderCard
                key={order.id}
                order={order}
                onKonfirmasi={handleKonfirmasi}
                konfirmingId={konfirmingId}
              />
            ))}
          </AnimatePresence>
        )}

        {!loading && orders.length > 0 && (
          <button
            onClick={() => navigate('/customer/riwayat/pesanan')}
            className="w-full flex items-center justify-between py-3.5 px-4 bg-white dark:bg-surface-800 rounded-2xl text-sm font-medium text-surface-600 dark:text-surface-400 shadow-sm"
          >
            <span>Lihat Riwayat Pesanan</span>
            <ArrowRight className="w-4 h-4 text-surface-400" />
          </button>
        )}
      </div>
    </div>
  )
}