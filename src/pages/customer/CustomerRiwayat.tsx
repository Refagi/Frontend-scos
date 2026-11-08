import { OrderMetaBadges } from '@/components/ui/OrderMetaBadges'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
   RefreshCw, AlertTriangle,
  Package, RotateCcw, ChevronRight,
} from 'lucide-react'
import { customerApi } from '@/lib/api/customer.api'
import type { PesananResponse, ErrorResponse } from '@/lib/api/types'
import { formatCurrency, formatDate, getOrderStatusConfig } from '@/lib/utils'
import { AxiosError } from 'axios'
import type { OrderStatus } from '@/types'

const STATUS_FILTERS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all',      label: 'Semua'    },
  { value: 'selesai',  label: 'Selesai'  },
  { value: 'ditolak',  label: 'Ditolak'  },
  { value: 'menunggu', label: 'Menunggu' },
  { value: 'diterima', label: 'Diterima' },
  { value: 'dimasak',  label: 'Dimasak'  },
  { value: 'siap',     label: 'Siap'     },
]

export function CustomerRiwayat() {
  const navigate = useNavigate()

  const [orders,       setOrders]       = useState<PesananResponse[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [retryKey,     setRetryKey]     = useState(0)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await customerApi.getRiwayatPesanan(
          statusFilter !== 'all' ? statusFilter : undefined
        )

        if (cancelled) return
        setOrders(res.data?.data ?? [])
      } catch (err: unknown) {
        if (cancelled) return
        const axiosError = err as AxiosError<ErrorResponse>
        setError(axiosError.response?.data?.message ?? 'Gagal memuat riwayat pesanan.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [statusFilter, retryKey])

  const handlePesanLagi = (order: PesananResponse) => {
    if (!order.sellerId) return
    navigate(`/customer/sellers/${order.sellerId}/menu`)
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 pb-24">

      <div className="bg-white dark:bg-surface-800 border-b border-surface-100 dark:border-surface-700 sticky top-0 z-20">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex-1">
            <h1 className="font-bold text-surface-900 dark:text-white">Riwayat Pesanan</h1>
          </div>
          <button
            onClick={() => setRetryKey(k => k + 1)}
            className="p-1.5 text-surface-400 hover:text-surface-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === f.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            <button onClick={() => setRetryKey(k => k + 1)} className="ml-auto font-semibold text-xs hover:underline">
              Coba lagi
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-surface-800 rounded-2xl p-4 animate-pulse space-y-3">
                <div className="h-3 w-32 bg-surface-200 dark:bg-surface-700 rounded" />
                <div className="h-4 w-40 bg-surface-200 dark:bg-surface-700 rounded" />
                <div className="h-3 w-full bg-surface-200 dark:bg-surface-700 rounded" />
                <div className="h-3 w-2/3 bg-surface-200 dark:bg-surface-700 rounded" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-surface-400">
            <Package className="w-12 h-12" />
            <p className="font-medium text-surface-600 dark:text-surface-400">
              Belum ada riwayat pesanan
            </p>
            <button
              onClick={() => navigate('/customer/penjual')}
              className="mt-2 px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-colors"
            >
              Mulai Pesan
            </button>
          </div>
        ) : (
          orders.map((order, i) => {
            const cfg        = getOrderStatusConfig(order.status)
            const sellerName = order.seller?.storeName ?? order.seller?.name ?? '—'
            const isActive   = ['menunggu', 'diterima', 'dimasak', 'siap'].includes(order.status)

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white dark:bg-surface-800 rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100 dark:border-surface-700">
                  <div>
                    <p className="font-semibold text-sm text-surface-900 dark:text-white">
                      {sellerName}
                    </p>
                    <p className="font-mono text-xs text-surface-400 mt-0.5">
                      {order.orderNumber}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.className}`}>
                    {cfg.label}
                  </span>
                </div>

                <div className="px-4 py-3">
                  <OrderMetaBadges order={order} className="mb-2" />

                  <div className="space-y-1 mb-3">
                    {order.details.slice(0, 3).map((d, idx) => (
                      <p key={idx} className="text-xs text-surface-500 dark:text-surface-400">
                        {d.quantity}× {d.menuName}
                      </p>
                    ))}
                    {order.details.length > 3 && (
                      <p className="text-xs text-surface-400">
                        +{order.details.length - 3} item lainnya
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-surface-400">{formatDate(order.createdAt)}</p>
                      <p className="font-bold text-sm text-primary-600 dark:text-primary-400 mt-0.5">
                        {formatCurrency(order.totalPrice)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {order.status === 'selesai' && (
                        <button
                          onClick={() => handlePesanLagi(order)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Pesan Lagi
                        </button>
                      )}

                      <button
                        onClick={() => navigate(
                          isActive
                            ? `/customer/ringkasan/pesanan`
                            : `/customer/order/success/${order.id}`
                        )}
                        className="flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                      >
                        Detail
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}