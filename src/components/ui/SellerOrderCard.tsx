import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CreditCard, Clock, Banknote, Eye } from 'lucide-react';
import type { PesananResponse } from '@/lib/api/types';
import type { OrderStatus } from '@/types';
import { formatCurrency, getOrderStatusConfig } from '@/lib/utils'
import { OrderMetaBadges } from '@/components/ui/OrderMetaBadges';
import { ImagePreviewModal } from '@/components/ui/ImagePreviewModal';

interface SellerOrderCardProps {
  order: PesananResponse;
  onStatusChange: (id: string, status: OrderStatus) => Promise<void>;
  updatingId: string | null;
  nextActions?: Partial<Record<OrderStatus, {
    status: OrderStatus;
    label: string;
    color: string;
    icon: React.ReactNode;
  }[]>>;
}

export default function SellerOrderCard({
  order,
  onStatusChange,
  updatingId,
  nextActions,
}: SellerOrderCardProps) {
  const [showProof, setShowProof] = useState(false);
  const cfg = getOrderStatusConfig(order.status);
  const isUpdating = updatingId === order.id;
  const isPaid = order.isPaid === true;
  const isCash = order.paymentMethod === 'cash';
  const isDineIn = order.orderType === 'dine_in';
  const isOpen = order.status !== 'ditolak' && order.status !== 'selesai';

  // QRIS yang belum ada bukti bayar belum boleh diterima (backend juga menolak).
  const waitingProof = !isCash && !isPaid && order.status === 'menunggu';
  const rawActions = nextActions?.[order.status] ?? [];
  const actions = (waitingProof ? rawActions.filter((a) => a.status !== 'diterima') : rawActions).map((a) =>
    a.status === 'selesai'
      ? { ...a, label: isDineIn ? 'Selesai (Sudah Diantar)' : 'Selesai (Sudah Diambil)' }
      : a,
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="card mb-3 relative"
    >
      <div
        className={`absolute -top-2 -right-2 text-xs px-3 py-1 rounded-full font-semibold shadow-sm flex items-center gap-1 z-10 ${
          isPaid
            ? 'bg-green-500 text-white'
            : isCash
              ? 'bg-blue-500 text-white'
              : 'bg-amber-500 text-white'
        }`}
      >
        {isPaid ? (
          <>
            <CreditCard className="w-3.5 h-3.5" /> Sudah Bayar
          </>
        ) : isCash ? (
          <>
            <Banknote className="w-3.5 h-3.5" /> Bayar Tunai
          </>
        ) : (
          <>Belum Bayar</>
        )}
      </div>

      <div className="flex items-start justify-between mb-3 pt-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-primary-600 dark:text-primary-400 font-medium truncate">
            {order.orderNumber}
          </p>
          <p className="font-semibold text-surface-900 dark:text-white">
            {order?.customer?.name}
          </p>
          {order.slot && (
            <div className="flex items-center gap-1 text-xs text-surface-500 mt-0.5">
              <Clock className="w-3 h-3" />
              Ambil: {order.slot}
            </div>
          )}
          <OrderMetaBadges order={order} className="mt-1.5" />
        </div>

        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${cfg.className}`}>
          {cfg.label}
        </span>
      </div>

      <div className="space-y-1 mb-4">
        {order.details.map((d) => (
          <div key={d.id} className="flex justify-between text-xs text-surface-600 dark:text-surface-400">
            <span className="truncate pr-2">
              {d.quantity}× {d.menuName}
            </span>
            <span className="flex-shrink-0">{formatCurrency(d.subtotal)}</span>
          </div>
        ))}

        {order.notes && (
          <p className="text-xs text-surface-400 italic pt-1 border-t border-surface-100 dark:border-surface-700 mt-2">
            📝 {order.notes}
          </p>
        )}

        <div className="flex justify-between font-semibold text-sm pt-2 border-t border-surface-100 dark:border-surface-700">
          <span>Total</span>
          <span className="text-primary-600 dark:text-primary-400">
            {formatCurrency(order.totalPrice)}
          </span>
        </div>
      </div>

      {order.paymentProof && (
        <button
          type="button"
          onClick={() => setShowProof(true)}
          className="w-full mb-3 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> Lihat Bukti Bayar
        </button>
      )}

      {waitingProof && (
        <p className="mb-3 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
          ⏳ Menunggu customer mengirim bukti pembayaran QRIS.
        </p>
      )}

      {isCash && !isPaid && isOpen && (
        <p className="mb-3 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
          💵 Tagih tunai <strong>{formatCurrency(order.totalPrice)}</strong>{' '}
          {isDineIn ? `saat mengantar ke Meja ${order.tableNumber ?? '-'}` : 'saat pesanan diambil'}.
        </p>
      )}

      {actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action) => (
            <button
              key={action.status}
              disabled={isUpdating}
              onClick={() => void onStatusChange(order.id, action.status)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60 ${action.color}`}
            >
              {isUpdating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                action.icon
              )}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {showProof && order.paymentProof && (
        <ImagePreviewModal
          src={order.paymentProof}
          title={`Bukti Bayar · ${order.orderNumber}`}
          onClose={() => setShowProof(false)}
        />
      )}
    </motion.div>
  );
}