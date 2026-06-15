import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ShoppingCart, AlertTriangle, Loader2 } from 'lucide-react';
import { customerApi } from '@/lib/api/customer.api';
import type { ErrorResponse, LocationState } from '@/lib/api/types';
import { formatCurrency } from '@/lib/utils';
import CloudinaryImage from '@/components/ui/CloudinaryImage';
import { AxiosError } from 'axios';

export function CustomerCheckout() {
  const { sellerId } = useParams<{ sellerId: string }>()
  const navigate     = useNavigate()
  const location     = useLocation()
  const state        = location.state as LocationState | null

  const [orderNotes, setOrderNotes] = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const seller    = state?.seller ?? null
  const cartItems = state?.items  ?? []


  if (!state || !sellerId || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold">Data pesanan tidak ditemukan</h2>
        <button onClick={() => navigate(-1)} className="text-primary-600 hover:underline text-sm">
          Kembali
        </button>
      </div>
    )
  }

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.menu.price * item.quantity, 0
  )

  const handleCreateOrder = async () => {
    if (!sellerId || cartItems.length === 0) return
    setLoading(true)
    setError(null)

    try {
      const res = await customerApi.buatPesanan({
        sellerId,
        items: cartItems.map(item => ({
          menuId:   item.menu.id,
          quantity: item.quantity,
          ...(item.notes && { notes: item.notes }),
        })),
        ...(orderNotes.trim() && { notes: orderNotes.trim() }),
      })

      const order = res.data?.data
      if (!order) throw new Error('Respons tidak valid dari server')

      navigate(`/customer/order/success/${order.id}`, {
        replace: true,
        state: { order, seller },
      })
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>
      setError(
        axiosError.response?.data?.message ?? 'Gagal membuat pesanan. Silakan coba lagi.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 pb-24">

      <div className="bg-white dark:bg-surface-800 border-b border-surface-100 dark:border-surface-700 sticky top-0 z-20">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-semibold text-lg">Konfirmasi Pesanan</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">

        <div className="bg-white dark:bg-surface-800 rounded-2xl p-4">
          <p className="text-xs text-surface-400 mb-1">Pesanan untuk</p>
          <p className="font-semibold text-lg">
            {seller?.storeName ?? seller?.name ?? '—'}
          </p>
          {seller?.location && (
            <p className="text-sm text-surface-500 mt-0.5">{seller.location}</p>
          )}
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-2xl p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Ringkasan Pesanan
            <span className="text-xs font-normal text-surface-400">
              ({cartItems.length} item)
            </span>
          </h2>

          <div className="space-y-3 divide-y divide-surface-100 dark:divide-surface-700">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start pt-3 first:pt-0">
                <div className="flex gap-3">
                  <CloudinaryImage
                    src={item.menu.image}
                    alt={item.menu.name}
                    size={48}
                  />
                  <div>
                    <p className="font-medium text-sm">{item.menu.name}</p>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {item.quantity} × {formatCurrency(item.menu.price)}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-surface-400 italic mt-0.5">
                        📝 {item.notes}
                      </p>
                    )}
                  </div>
                </div>
                <p className="font-semibold text-sm whitespace-nowrap ml-3">
                  {formatCurrency(item.menu.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4 pt-4 border-t border-surface-100 dark:border-surface-700 font-semibold text-base">
            <span>Total Pembayaran</span>
            <span className="text-primary-600 dark:text-primary-400">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-2xl p-4">
          <label className="block text-sm font-medium mb-2">
            Catatan untuk Penjual
            <span className="ml-1 text-xs font-normal text-surface-400">(opsional)</span>
          </label>
          <textarea
            value={orderNotes}
            onChange={e => setOrderNotes(e.target.value)}
            placeholder="Contoh: Tolong tidak pakai sambal, tambah es batu banyak, dll."
            className="w-full h-24 p-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent focus:outline-none focus:border-primary-500 text-sm resize-none"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => void handleCreateOrder()}
          disabled={loading || totalPrice === 0}
          className="w-full py-4 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:bg-surface-300 dark:disabled:bg-surface-700 disabled:text-surface-400 text-white font-semibold rounded-2xl text-base shadow-lg flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
          ) : (
            `Buat Pesanan • ${formatCurrency(totalPrice)}`
          )}
        </motion.button>
      </div>
    </div>
  )
}