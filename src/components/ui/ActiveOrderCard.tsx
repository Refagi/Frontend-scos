import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Clock, CheckCircle2, ChefHat,
  Package, ArrowRight, Upload,
} from 'lucide-react'
import type { PesananResponse } from '@/lib/api/types'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { cashPaymentNote, readyLabel } from '@/lib/orderMeta'
import { OrderTracker } from './OrderTracker'
import { OrderMetaBadges } from './OrderMetaBadges'

const STATUS_CFG: Record<string, {
  label: string
  color: string
  bg:    string
  icon:  React.ReactNode
}> = {
  menunggu: {
    label: 'Menunggu Konfirmasi',
    color: 'text-yellow-700 dark:text-yellow-400',
    bg:    'bg-yellow-100 dark:bg-yellow-900/30',
    icon:  <Clock className="w-4 h-4" />,
  },
  diterima: {
    label: 'Pesanan Diterima',
    color: 'text-blue-700 dark:text-blue-400',
    bg:    'bg-blue-100 dark:bg-blue-900/30',
    icon:  <CheckCircle2 className="w-4 h-4" />,
  },
  dimasak: {
    label: 'Sedang Dimasak',
    color: 'text-orange-700 dark:text-orange-400',
    bg:    'bg-orange-100 dark:bg-orange-900/30',
    icon:  <ChefHat className="w-4 h-4" />,
  },
  siap: {
    label: 'Siap Diambil!',
    color: 'text-green-700 dark:text-green-400',
    bg:    'bg-green-100 dark:bg-green-900/30',
    icon:  <Package className="w-4 h-4" />,
  },
}

interface ActiveOrderCardProps {
  order:       PesananResponse
  detailPath?: string
}

export function ActiveOrderCard({
  order,
  detailPath,
}: ActiveOrderCardProps) {
  const navigate     = useNavigate()
  const cfg          = STATUS_CFG[order.status]
  const sellerName   = order.seller?.storeName ?? order.seller?.name ?? '—'
  const targetPath   = detailPath ?? `/customer/order/success/${order.id}`
  const isCash       = order.paymentMethod === 'cash'
  // QRIS yang belum dibayar: bukti pembayaran dikirim dari halaman detail
  const needsProof   = !isCash && !order.isPaid && order.status === 'menunggu'

  const statusLabel =
    order.status === 'siap'     ? `${readyLabel(order.orderType)}!`
    : needsProof                ? 'Menunggu Pembayaran'
    : cfg?.label

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white dark:bg-surface-800 rounded-2xl shadow-sm overflow-hidden"
    >
      <div className={`flex items-center gap-2 px-4 py-2.5 ${cfg?.bg}`}>
        <span className={cfg?.color}>{cfg?.icon}</span>
        <span className={`text-xs font-bold ${cfg?.color}`}>{statusLabel}</span>
        <span className="ml-auto text-xs text-surface-400">
          {formatDateTime(order.createdAt)}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-bold text-surface-900 dark:text-white text-sm">
              {sellerName}
            </p>
            <p className="font-mono text-xs text-surface-400 mt-0.5">
              {order.orderNumber}
            </p>
          </div>
          <p className="font-bold text-primary-600 dark:text-primary-400 text-sm">
            {formatCurrency(order.totalPrice)}
          </p>
        </div>

        <div className="space-y-1 mb-3">
          {order.details.slice(0, 3).map((d, i) => (
            <p key={i} className="text-xs text-surface-500 dark:text-surface-400">
              {d.quantity}× {d.menuName}
            </p>
          ))}
          {order.details.length > 3 && (
            <p className="text-xs text-surface-400">
              +{order.details.length - 3} item lainnya
            </p>
          )}
        </div>

        <OrderMetaBadges order={order} className="mb-1" />

        <OrderTracker status={order.status} />

        {isCash && (
          <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
            💵 {cashPaymentNote(order.orderType, order.tableNumber)}
          </p>
        )}

        <div className="flex gap-2 mt-4">
          {needsProof && (
            <button
              onClick={() => navigate(targetPath, { state: { order, seller: null } })}
              className="flex-1 py-2 text-xs font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Bukti Bayar
            </button>
          )}
          <button
            onClick={() => navigate(targetPath, { state: { order, seller: null } })}
            className="flex-1 py-2 text-xs font-semibold border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors flex items-center justify-center gap-1"
          >
            Detail <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}