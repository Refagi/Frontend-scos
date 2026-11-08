import type { OrderType, PaymentMethod } from '@/types';

export const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  dine_in: 'Dine In',
  takeaway: 'Takeaway',
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: 'Tunai',
  qris: 'QRIS',
};

/** "Dine In · Meja A5" atau "Takeaway" */
export function orderTypeText(type: OrderType, tableNumber?: string | null): string {
  return type === 'dine_in' && tableNumber
    ? `${ORDER_TYPE_LABEL.dine_in} · Meja ${tableNumber}`
    : ORDER_TYPE_LABEL[type];
}

/** Catatan pembayaran tunai untuk pembeli. */
export function cashPaymentNote(type: OrderType, tableNumber?: string | null): string {
  return type === 'dine_in'
    ? `Bayar tunai saat pesanan diantar ke ${tableNumber ? `Meja ${tableNumber}` : 'mejamu'}.`
    : 'Bayar tunai saat kamu mengambil pesanan.';
}

/** Label status "siap" menyesuaikan tipe pesanan. */
export function readyLabel(type: OrderType): string {
  return type === 'dine_in' ? 'Siap Diantar' : 'Siap Diambil';
}
