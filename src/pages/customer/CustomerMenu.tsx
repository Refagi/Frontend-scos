import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ShoppingCart,
  MapPin, Clock, AlertTriangle, UtensilsCrossed,
} from 'lucide-react';
import { customerApi } from '@/lib/api/customer.api';
import type { SellerResponse, MenuResponse, CheckoutItem } from '@/lib/api/types';
import { formatCurrency } from '@/lib/utils';
import { MenuRow } from '@/components/ui/MenuRow';

type Category = 'Makanan_Berat' | 'Cemilan' | 'Minuman';
type CategoryFilter = 'Semua' | Category;

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: 'Semua',        label: 'Semua'         },
  { value: 'Makanan_Berat', label: 'Makanan_Berat' },
  { value: 'Cemilan',      label: 'Cemilan'        },
  { value: 'Minuman',      label: 'Minuman'        },
];

export function CustomerMenu() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate     = useNavigate();

  const [seller,   setSeller]   = useState<SellerResponse | null>(null);
  const [menus,    setMenus]    = useState<MenuResponse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>('Semua');
  const [cart,     setCart]     = useState<Map<string, CheckoutItem>>(new Map());

  useEffect(() => {
    if (!sellerId) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await customerApi.getMenuSeller(sellerId, category === 'Semua' ? undefined : category);
        if (cancelled) return;
        setSeller(res.data?.data?.seller ?? null);
        setMenus(res.data?.data?.menus ?? []);
      } catch {
        if (cancelled) return;
        setError('Gagal memuat menu.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [sellerId, category]);

  const addToCart = (menu: MenuResponse) => {
    setCart(prev => {
      const next = new Map(prev);
      const existing = next.get(menu.id);
      next.set(menu.id, { menu, quantity: (existing?.quantity ?? 0) + 1 });
      return next;
    });
  };

  const removeFromCart = (menuId: string) => {
    setCart(prev => {
      const next = new Map(prev);
      const existing = next.get(menuId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        next.delete(menuId);
      } else {
        next.set(menuId, { ...existing, quantity: existing.quantity - 1 });
      }
      return next;
    });
  };

  const cartItems      = Array.from(cart.values());
  const totalItems     = cartItems.reduce((s, i) => s + i.quantity, 0);
  const totalPrice     = cartItems.reduce((s, i) => s + i.menu.price * i.quantity, 0);

  const handleCheckout = () => {
    navigate(`/customer/checkout/${sellerId}`, {
      state: {
        seller,
        items: cartItems.map(i => ({
          menu: i.menu,
          quantity: i.quantity,
        })),
      },
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-50 dark:bg-surface-900">

      <div className="bg-white dark:bg-surface-800 border-b border-surface-100 dark:border-surface-700 sticky top-0 z-20">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="h-4 w-32 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
            ) : (
              <>
                <h1 className="font-bold text-surface-900 dark:text-white text-base truncate">
                  {seller?.storeName ?? seller?.name ?? 'Menu'}
                </h1>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {seller?.location && (
                    <span className="text-xs text-surface-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {seller.location}
                    </span>
                  )}
                  {seller?.openLabel && (
                    <span className="text-xs text-surface-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {seller.openLabel}
                    </span>
                  )}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    seller?.isOpen
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {seller?.isOpen ? '✓ Buka' : '✕ Tutup'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex border-t border-surface-100 dark:border-surface-700">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors relative ${
                category === cat.value
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'
              }`}
            >
              {cat.label}
              {category === cat.value && (
                <motion.div
                  layoutId="category-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 pb-16">
        {error && (
          <div className="flex items-center gap-2 m-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-surface-100 dark:border-surface-700 animate-pulse">
                <div className="w-16 h-16 rounded-xl bg-surface-200 dark:bg-surface-700 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-2/3" />
                  <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
                  <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : menus.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-surface-400">
            <UtensilsCrossed className="w-10 h-10" />
            <p className="text-sm">
              {category === 'Semua' ? 'Belum ada menu tersedia.' : `Tidak ada menu kategori ${CATEGORIES.find(c => c.value === category)?.label}.`}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-surface-800">
            {menus.map(menu => (
              <MenuRow
                key={menu.id}
                menu={menu}
                quantity={cart.get(menu.id)?.quantity ?? 0}
                onAdd={() => addToCart(menu)}
                onRemove={() => removeFromCart(menu.id)}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bottom-0 left-0 right-0 z-30 p-4 bg-white dark:bg-surface-800 border-t border-surface-100 dark:border-surface-700 shadow-lg"
          >
            <button
              onClick={handleCheckout}
              disabled={!seller?.isOpen}
              className="w-full flex items-center justify-between bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-4 py-3.5 rounded-2xl transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="bg-white/20 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm">
                  {!seller?.isOpen ? 'Toko Sedang Tutup' : 'Pesan Sekarang'}
                </span>
              </span>
              <span className="text-sm font-bold">{formatCurrency(totalPrice)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}