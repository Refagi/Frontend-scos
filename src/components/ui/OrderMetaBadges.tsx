import { Banknote, QrCode, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import type { PesananResponse } from '@/lib/api/types';
import { ORDER_TYPE_LABEL, PAYMENT_METHOD_LABEL } from '@/lib/orderMeta';

type Meta = Pick<PesananResponse, 'orderType' | 'tableNumber' | 'paymentMethod'>;

const chip =
  'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap';

export function OrderMetaBadges({ order, className = '' }: { order: Meta; className?: string }) {
  const dineIn = order.orderType === 'dine_in';
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span
        className={`${chip} ${
          dineIn
            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
            : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300'
        }`}
      >
        {dineIn ? <UtensilsCrossed className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
        {ORDER_TYPE_LABEL[order.orderType]}
        {dineIn && order.tableNumber ? ` · Meja ${order.tableNumber}` : ''}
      </span>
      <span className={`${chip} bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300`}>
        {order.paymentMethod === 'cash' ? <Banknote className="w-3 h-3" /> : <QrCode className="w-3 h-3" />}
        {PAYMENT_METHOD_LABEL[order.paymentMethod]}
      </span>
    </div>
  );
}
