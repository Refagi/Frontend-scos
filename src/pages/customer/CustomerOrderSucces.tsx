import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2, Clock, Copy, Check,
  AlertTriangle, Loader2, ChevronRight,
  QrCode, Receipt, Banknote, Eye,
} from 'lucide-react'
import { customerApi } from '@/lib/api/customer.api'
import type { PesananResponse, SellerResponse, ErrorResponse } from '@/lib/api/types'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { cashPaymentNote } from '@/lib/orderMeta'
import { resolveImageUrl } from '@/lib/resolveImageUrl'
import { ImageUploadField } from '@/components/ui/ImageUploadField'
import { ImagePreviewModal } from '@/components/ui/ImagePreviewModal'
import { OrderMetaBadges } from '@/components/ui/OrderMetaBadges'
import { useImageUpload } from '@/hooks/useImageUpload'
import { AxiosError } from 'axios'

interface LocationState {
  order:  PesananResponse
  seller: SellerResponse | null
}

export function CustomerOrderSuccess() {
  const { pesananId } = useParams<{ pesananId: string }>()
  const navigate      = useNavigate()
  const location      = useLocation()
  const state         = location.state as LocationState | null

  const [order,       setOrder]       = useState<PesananResponse | null>(state?.order ?? null)
  const [loading,     setLoading]     = useState(!state?.order)
  const [confirming,  setConfirming]  = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [copiedOrder, setCopiedOrder] = useState(false)
  const [showProof,   setShowProof]   = useState(false)
  const proof = useImageUpload('payment_proof')

  useEffect(() => {
    if (state?.order || !pesananId) return
    let cancelled = false


    const load = async () => {
      try {
        setLoading(true)
        const res = await customerApi.getDetailPesanan(pesananId)
        if (cancelled) return
        setOrder(res.data?.data ?? null)
      } catch {
        if (cancelled) return
        setError('Gagal memuat detail pesanan.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [pesananId, state?.order])

  const handleCopyOrderNumber = async () => {
    if (!order?.orderNumber) return
    await navigator.clipboard.writeText(order.orderNumber)
    setCopiedOrder(true)
    setTimeout(() => setCopiedOrder(false), 2000)
  }

  const handleKirimBukti = async () => {
    if (!pesananId || confirming || proof.uploading || !proof.value) return
    setConfirming(true)
    setError(null)

    try {
      await customerApi.konfirmasiPembayaran(pesananId, proof.value)
      // Server sudah menerima: perbarui tampilan dulu, lalu sinkronkan dengan data server.
      setOrder(o => o ? { ...o, isPaid: true, status: 'diterima', paymentProof: proof.value } : o)
      try {
        const res = await customerApi.getDetailPesanan(pesananId)
        if (res.data?.data) setOrder(res.data.data)
      } catch { /* tampilan lokal sudah benar */ }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>
      setError(axiosError.response?.data?.message ?? 'Gagal mengirim bukti pembayaran. Coba lagi.')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-surface-400" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-surface-400 p-4 text-center">
        <AlertTriangle className="w-10 h-10" />
        <p className="text-sm">Data pesanan tidak ditemukan.</p>
        <button
          onClick={() => navigate('/customer')}
          className="text-primary-600 text-sm hover:underline"
        >
          Kembali ke Beranda
        </button>
      </div>
    )
  }

  const seller = state?.seller ?? null
  const qrisUrl    = order.seller?.qrisImage ?? seller?.qrisImage ?? null
  const sellerName = order.seller?.storeName ?? seller?.storeName ?? 'Penjual'

  const isCash    = order.paymentMethod === 'cash'
  const canPay    = !isCash && !order.isPaid && order.status === 'menunggu'
  const proofSent = !isCash && order.isPaid
  const cashNote  = cashPaymentNote(order.orderType, order.tableNumber)

  const heading =
    order.status === 'ditolak' ? 'Pesanan Tidak Diproses'
    : order.status === 'selesai' ? 'Pesanan Selesai'
    : 'Pesanan Berhasil Dibuat!'
  const subheading =
    order.status === 'ditolak' ? 'Pesanan ini dibatalkan atau ditolak oleh penjual'
    : order.status === 'selesai' ? 'Terima kasih sudah memesan'
    : isCash ? cashNote
    : canPay ? 'Selesaikan pembayaran agar pesananmu segera diproses'
    : 'Bukti pembayaran sudah dikirim ke penjual'

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 pb-32">

      <div className="bg-primary-500 pt-12 pb-16 px-4 text-center text-white">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3"
        >
          <CheckCircle2 className="w-9 h-9" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h1 className="font-bold text-xl mb-1">{heading}</h1>
          <p className="text-white/80 text-sm">{subheading}</p>
        </motion.div>
      </div>

      <div className="px-4 -mt-8 space-y-4">

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-surface-500 dark:text-surface-400">
              <Receipt className="w-4 h-4" />
              <span className="text-xs font-medium">Nomor Pesanan</span>
            </div>
            <button
              onClick={() => void handleCopyOrderNumber()}
              className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 font-semibold"
            >
              {copiedOrder
                ? <><Check className="w-3.5 h-3.5" /> Disalin!</>
                : <><Copy className="w-3.5 h-3.5" /> Salin</>
              }
            </button>
          </div>
          <p className="font-mono font-bold text-lg text-surface-900 dark:text-white tracking-wide">
            {order.orderNumber}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-surface-400">
            <Clock className="w-3.5 h-3.5" />
            {formatDateTime(order.createdAt)} · {sellerName}
          </div>
          <OrderMetaBadges order={order} className="mt-3" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-sm"
        >
          <h2 className="font-semibold text-sm mb-3">Ringkasan Pesanan</h2>
          <div className="space-y-2">
            {order.details.map((d, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-surface-600 dark:text-surface-400 truncate pr-2">
                  {d.quantity}× {d.menuName}
                </span>
                <span className="font-medium flex-shrink-0">
                  {formatCurrency(d.subtotal)}
                </span>
              </div>
            ))}
          </div>
          {order.notes && (
            <p className="text-xs text-surface-400 italic mt-3 pt-3 border-t border-surface-100 dark:border-surface-700">
              📝 {order.notes}
            </p>
          )}
          <div className="flex justify-between mt-3 pt-3 border-t border-surface-100 dark:border-surface-700 font-bold">
            <span>Total Pembayaran</span>
            <span className="text-primary-600 dark:text-primary-400">
              {formatCurrency(order.totalPrice)}
            </span>
          </div>
        </motion.div>

        {isCash && order.status !== 'ditolak' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <Banknote className="w-5 h-5 text-primary-500" />
              <h2 className="font-semibold text-sm">Bayar Tunai</h2>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              💵 {cashNote}
              <p className="mt-1.5 font-bold">Total: {formatCurrency(order.totalPrice)}</p>
            </div>
          </motion.div>
        )}

        {canPay && (
          <>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-primary-500" />
            <h2 className="font-semibold text-sm">Bayar via QRIS</h2>
          </div>

          {qrisUrl ? (
            <div className="flex flex-col items-center">
              <div className="bg-white p-3 rounded-2xl border border-surface-200 dark:border-surface-600 shadow-sm mb-3">
                <img
                  src={qrisUrl}
                  alt="QRIS"
                  className="w-52 h-52 object-contain"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              </div>
              <p className="text-xs text-surface-400 text-center">
                Scan QR di atas dengan aplikasi e-wallet atau mobile banking
              </p>
              <p className="text-sm font-bold text-surface-800 dark:text-surface-200 mt-1.5">
                Nominal: {formatCurrency(order.totalPrice)}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-surface-400 gap-2">
              <QrCode className="w-10 h-10" />
              <p className="text-sm">QRIS tidak tersedia</p>
              <p className="text-xs text-center text-surface-400">
                Hubungi penjual untuk informasi pembayaran
              </p>
            </div>
          )}
        </motion.div>


            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4"
            >
              <h3 className="font-semibold text-amber-800 dark:text-amber-400 text-sm mb-2">
                📋 Cara Pembayaran
              </h3>
              <ol className="space-y-1.5 text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed">
                <li>1. Buka aplikasi e-wallet atau mobile banking kamu</li>
                <li>2. Scan QR Code di atas</li>
                <li>3. Masukkan nominal <strong>{formatCurrency(order.totalPrice)}</strong></li>
                <li>4. Selesaikan pembayaran dan simpan bukti (screenshot)</li>
                <li>5. Upload bukti di bawah, lalu klik <strong>"Kirim Bukti Pembayaran"</strong></li>
              </ol>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-sm"
            >
              <ImageUploadField
                label="Bukti Pembayaran"
                upload={proof}
                fit="contain"
                tall
                required
                hint="Screenshot atau foto struk pembayaran"
              />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-sm"
              >
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => void handleKirimBukti()}
              disabled={confirming || proof.uploading || !proof.value}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:bg-surface-300 dark:disabled:bg-surface-700 disabled:text-surface-400 text-white font-semibold rounded-2xl text-base flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              {confirming
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim bukti...</>
                : proof.uploading
                  ? 'Menunggu upload selesai...'
                  : proof.value
                    ? '✓ Kirim Bukti Pembayaran'
                    : 'Upload bukti pembayaran dulu'}
            </motion.button>
          </>
        )}

        {proofSent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-2xl p-4 text-center"
          >
            <CheckCircle2 className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <p className="font-semibold text-primary-700 dark:text-primary-400 text-sm">
              Bukti pembayaran terkirim ke penjual!
            </p>
            <p className="text-xs text-primary-600/70 dark:text-primary-400/70 mt-1 leading-relaxed">
              Penjual akan memeriksa bukti pembayaran dan memproses pesananmu.
            </p>
            {order.paymentProof && (
              <button
                type="button"
                onClick={() => setShowProof(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                <img
                  src={resolveImageUrl(order.paymentProof, 96)}
                  alt=""
                  className="w-8 h-8 rounded object-cover border border-primary-200 dark:border-primary-700"
                />
                <Eye className="w-3.5 h-3.5" /> Lihat bukti pembayaran
              </button>
            )}
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          onClick={() => navigate('/customer/riwayat/pesanan')}
          className="w-full flex items-center justify-between py-3.5 px-4 bg-white dark:bg-surface-800 rounded-2xl text-sm font-medium text-surface-700 dark:text-surface-300 shadow-sm"
        >
          <span>Lihat Riwayat Pesanan</span>
          <ChevronRight className="w-4 h-4 text-surface-400" />
        </motion.button>

      </div>

      {showProof && order.paymentProof && (
        <ImagePreviewModal
          src={order.paymentProof}
          title="Bukti Pembayaran"
          onClose={() => setShowProof(false)}
        />
      )}
    </div>
  )
}