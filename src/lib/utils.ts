import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type OrderStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR', 
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {  
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateTimeSlot(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function getOrderStatusConfig(status: OrderStatus) {
  const configs = {
    menunggu: { label: 'Menunggu', className: 'badge-yellow' },
    ditolak: { label: 'Ditolak', className: 'badge-red' },
    diterima: { label: 'Diterima', className: 'badge-blue' },
    dimasak: { label: 'Dimasak', className: 'badge-blue' },
    siap: { label: 'Siap', className: 'badge-green' },
    selesai: { label: 'Selesai', className: 'badge-gray' },
  };
  return configs[status];
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}