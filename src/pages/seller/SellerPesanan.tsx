import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, XCircle, ChefHat, RefreshCw, AlertCircle
} from 'lucide-react'
import { sellerApi } from '@/lib/api/seller.api'
import type { PesananResponse, ErrorResponse } from '@/lib/api/types'
import type { OrderStatus } from '@/types'
import { AxiosError } from 'axios'
import SellerOrderCard from '@/components/ui/SellerOrderCard';

const NEXT_ACTIONS: Partial<Record<OrderStatus, {
  status: OrderStatus
  label:  string
  color:  string
  icon:   React.ReactNode
}[]>> = {
  menunggu: [
    { status: 'diterima', label: 'Terima',  color: 'bg-primary-500 hover:bg-primary-600', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    { status: 'ditolak',  label: 'Tolak',   color: 'bg-red-500 hover:bg-red-600',         icon: <XCircle     className="w-3.5 h-3.5" /> },
  ],
  diterima: [
    { status: 'dimasak', label: 'Mulai Masak', color: 'bg-blue-500 hover:bg-blue-600', icon: <ChefHat className="w-3.5 h-3.5" /> },
  ],
  dimasak: [
    { status: 'siap', label: 'Tandai Siap', color: 'bg-primary-500 hover:bg-primary-600', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  ],
  siap: [
    { 
      status: 'selesai', 
      label: 'Selesai (Sudah Diambil)', 
      color: 'bg-emerald-600 hover:bg-emerald-700', 
      icon: <CheckCircle className="w-3.5 h-3.5" /> 
    },
  ],
}

const COLUMNS = [
  { key: 'menunggu',              label: 'Menunggu',    borderColor: 'border-t-yellow-400' },
  { key: 'diterima_dimasak',      label: 'Dimasak',     borderColor: 'border-t-blue-500'   },
  { key: 'siap',                  label: 'Siap Diambil / Diantar', borderColor: 'border-t-primary-500' },
] as const

export function SellerPesanan() {
  const [pesanan,    setPesanan]    = useState<PesananResponse[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [retryKey,   setRetryKey]   = useState(0)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await sellerApi.getSemuaPesanan()
        if (cancelled) return

        const aktif = (res.data?.data ?? []).filter(
          o => !['selesai', 'ditolak'].includes(o.status)
        )

        // Pesanan yang siap diproses (sudah dibayar, atau tunai) tampil lebih dulu;
        // QRIS yang masih menunggu bukti bayar di bawah.
        const ready = (o: PesananResponse) => o.isPaid || o.paymentMethod === 'cash'
        aktif.sort((a, b) => {
          if (ready(a) === ready(b)) return 0
          return ready(a) ? -1 : 1
        })
        setPesanan(aktif)
      } catch (err: unknown) {
        if (cancelled) return
        const axiosError = err as AxiosError<ErrorResponse>
        setError(axiosError.response?.data?.message ?? 'Gagal memuat pesanan.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [retryKey])

  const handleStatusChange = useCallback(async (pesananId: string, newStatus: OrderStatus) => {
    setUpdatingId(pesananId)
    try {
      const res = await sellerApi.updateStatusPesanan(pesananId, { status: newStatus })
      const updated = res.data?.data
      if (!updated) return

      if (['selesai', 'ditolak'].includes(newStatus)) {
        setPesanan(prev => prev.filter(o => o.id !== pesananId))
      } else {
        setPesanan(prev => prev.map(o => o.id === pesananId ? updated : o))
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>
      alert(axiosError.response?.data?.message ?? 'Gagal mengubah status pesanan.')
    } finally {
      setUpdatingId(null)
    }
  }, [])

  const grouped: Record<string, PesananResponse[]> = {
    menunggu:         pesanan.filter(o => o.status === 'menunggu'),
    diterima_dimasak: pesanan.filter(o => ['diterima', 'dimasak'].includes(o.status)),
    siap:             pesanan.filter(o => o.status === 'siap'),
  }

  const totalAktif = pesanan.length

  return (
    <div className="space-y-5 w-full">

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Pesanan Masuk</h1>
          <p className="page-subtitle">
            Kelola pesanan pelanggan secara real-time
            {!loading && totalAktif > 0 && (
              <span className="ml-1.5 text-primary-600 dark:text-primary-400 font-semibold">
                · {totalAktif} aktif
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setRetryKey(k => k + 1)}
          className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-800 dark:hover:text-surface-200 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setRetryKey(k => k + 1)}
            className="flex items-center gap-1.5 font-semibold hover:underline">
            <RefreshCw className="w-3.5 h-3.5" /> Coba lagi
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(col => (
            <div key={col.key} className="space-y-3">
              <div className={`card border-t-4 ${col.borderColor} animate-pulse`}>
                <div className="h-4 w-24 bg-surface-200 dark:bg-surface-700 rounded" />
              </div>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="card animate-pulse space-y-2">
                  <div className="h-3 w-20 bg-surface-200 dark:bg-surface-700 rounded" />
                  <div className="h-4 w-32 bg-surface-200 dark:bg-surface-700 rounded" />
                  <div className="h-3 w-full bg-surface-200 dark:bg-surface-700 rounded mt-2" />
                  <div className="h-3 w-3/4 bg-surface-200 dark:bg-surface-700 rounded" />
                  <div className="h-8 w-full bg-surface-200 dark:bg-surface-700 rounded-lg mt-1" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(col => {
            const colOrders = grouped[col.key] ?? []
            return (
              <div key={col.key}>
                <div className={`card border-t-4 ${col.borderColor} mb-3`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-surface-900 dark:text-white">{col.label}</h3>
                    <span className="text-xs bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 px-2 py-0.5 rounded-full font-medium">
                      {colOrders.length}
                    </span>
                  </div>
                </div>

                <AnimatePresence mode="popLayout">
                  {colOrders.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-center py-10 text-surface-400 text-sm"
                    >
                      Tidak ada pesanan
                    </motion.div>
                  ) : (
                    colOrders.map(o => (
                      <SellerOrderCard
                        key={o.id}
                        order={o}
                        onStatusChange={handleStatusChange}
                        updatingId={updatingId}
                        nextActions={NEXT_ACTIONS}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}