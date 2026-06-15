import { motion } from 'framer-motion';
import { Loader2, CreditCard, Clock } from 'lucide-react';
import type { PesananResponse } from '@/lib/api/types';
import type { OrderStatus } from '@/types';
import { formatCurrency, getOrderStatusConfig } from '@/lib/utils'

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
  const cfg = getOrderStatusConfig(order.status);
  const actions = nextActions?.[order.status] ?? [];
  const isUpdating = updatingId === order.id;
  const isPaid = order.isPaid === true;

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
            : 'bg-amber-500 text-white'
        }`}
      >
        {isPaid ? (
          <>
            <CreditCard className="w-3.5 h-3.5" /> Sudah Bayar
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
    </motion.div>
  );
}