import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ShoppingCart, AlertTriangle, Loader2,
  UtensilsCrossed, ShoppingBag, QrCode, Banknote,
} from 'lucide-react';
import { customerApi } from '@/lib/api/customer.api';
import type { ErrorResponse, LocationState } from '@/lib/api/types';
import { formatCurrency } from '@/lib/utils';
import { cashPaymentNote } from '@/lib/orderMeta';
import type { OrderType, PaymentMethod } from '@/types';
import CloudinaryImage from '@/components/ui/CloudinaryImage';
import { AxiosError } from 'axios';

const optionClass = (active: boolean, disabled = false) =>
  `flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-colors ${
    disabled
      ? 'opacity-50 cursor-not-allowed border-surface-200 dark:border-surface-700'
      : active
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
        : 'border-surface-200 dark:border-surface-700 hover:border-primary-300'
  }`

export function CustomerCheckout() {
  const { sellerId } = useParams<{ sellerId: string }>()
  const navigate     = useNavigate()
  const location     = useLocation()
  const state        = location.state as LocationState | null

  const [orderNotes, setOrderNotes] = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  // Default dine in: wajib isi nomor meja, jadi tidak mungkin "terlewat" diam-diam.
  const [orderType,     setOrderType]     = useState<OrderType>('dine_in')
  const [tableNumber,   setTableNumber]   = useState('')
  const [tableError,    setTableError]    = useState<string | null>(null)
  // Jika penjual belum punya QRIS, mulai dari tunai.
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    () => (state?.seller && !state.seller.qrisImage ? 'cash' : 'qris'),
  )

  const seller    = state?.seller ?? null
  const cartItems = state?.items  ?? []
  // Jika data penjual tidak ada, anggap tersedia; backend tetap memvalidasi.
  const sellerHasQris = seller ? !!seller.qrisImage : true


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

    const table = tableNumber.trim()
    if (orderType === 'dine_in' && !table) {
      setTableError('Nomor meja wajib diisi untuk Dine In')
      document.getElementById('table-number')?.focus()
      return
    }

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
        orderType,
        paymentMethod,
        ...(orderType === 'dine_in' && { tableNumber: table }),
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
          <h2 className="font-semibold mb-3">Tipe Pesanan</h2>
          <div role="radiogroup" aria-label="Tipe pesanan" className="grid grid-cols-2 gap-3">
            {([
              { value: 'dine_in',  label: 'Dine In',  desc: 'Makan di tempat', icon: <UtensilsCrossed className="w-5 h-5" /> },
              { value: 'takeaway', label: 'Takeaway', desc: 'Dibawa pulang',   icon: <ShoppingBag className="w-5 h-5" /> },
            ] as const).map(opt => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={orderType === opt.value}
                onClick={() => { setOrderType(opt.value); setTableError(null) }}
                className={optionClass(orderType === opt.value)}
              >
                <span className={orderType === opt.value ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400'}>
                  {opt.icon}
                </span>
                <span className="font-semibold text-sm">{opt.label}</span>
                <span className="text-xs text-surface-500">{opt.desc}</span>
              </button>
            ))}
          </div>

          {orderType === 'dine_in' && (
            <div className="mt-4">
              <label htmlFor="table-number" className="block text-sm font-medium mb-2">
                Nomor Meja <span className="text-red-500">*</span>
              </label>
              <input
                id="table-number"
                value={tableNumber}
                maxLength={10}
                autoComplete="off"
                aria-invalid={!!tableError}
                onChange={e => {
                  setTableNumber(e.target.value.replace(/[^A-Za-z0-9 \-/]/g, ''))
                  setTableError(null)
                }}
                placeholder="Contoh: 5 atau A12"
                className={`w-full p-3 rounded-xl border bg-transparent focus:outline-none text-sm uppercase placeholder:normal-case ${
                  tableError
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-surface-200 dark:border-surface-700 focus:border-primary-500'
                }`}
              />
              {tableError ? (
                <p className="text-xs text-red-500 mt-1">{tableError}</p>
              ) : (
                <p className="text-xs text-surface-400 mt-1">Isi sesuai nomor meja yang kamu tempati.</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-2xl p-4">
          <h2 className="font-semibold mb-3">Metode Pembayaran</h2>
          <div role="radiogroup" aria-label="Metode pembayaran" className="grid grid-cols-2 gap-3">
            <button
              type="button"
              role="radio"
              aria-checked={paymentMethod === 'qris'}
              disabled={!sellerHasQris}
              onClick={() => setPaymentMethod('qris')}
              className={optionClass(paymentMethod === 'qris', !sellerHasQris)}
            >
              <span className={paymentMethod === 'qris' && sellerHasQris ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400'}>
                <QrCode className="w-5 h-5" />
              </span>
              <span className="font-semibold text-sm">QRIS</span>
              <span className="text-xs text-surface-500">
                {sellerHasQris ? 'Scan & upload bukti' : 'Belum tersedia di toko ini'}
              </span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={paymentMethod === 'cash'}
              onClick={() => setPaymentMethod('cash')}
              className={optionClass(paymentMethod === 'cash')}
            >
              <span className={paymentMethod === 'cash' ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400'}>
                <Banknote className="w-5 h-5" />
              </span>
              <span className="font-semibold text-sm">Tunai</span>
              <span className="text-xs text-surface-500">Bayar di tempat</span>
            </button>
          </div>

          {paymentMethod === 'cash' ? (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              💵 {cashPaymentNote(orderType, tableNumber.trim() || null)}
            </div>
          ) : (
            <p className="text-xs text-surface-400 mt-3">
              Setelah pesanan dibuat, scan QRIS penjual lalu upload bukti pembayaran.
            </p>
          )}
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