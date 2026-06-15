import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CheckoutItem, MenuResponse } from '@/lib/api/types';

interface CartState {
  items: CheckoutItem[];
  sellerId: string | null;
  sellerName: string | null;
  addItem: (menuItem: MenuResponse, quantity?: number, notes?: string) => void;
  removeItem: (menuId: string) => void;
  updateQuantity: (menuId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sellerId: null,
      sellerName: null,

      addItem: (menuItem, quantity = 1, notes) => {
        const { items, sellerId } = get();

        // Check if from different seller
        if (sellerId && sellerId !== menuItem.sellerId) {
          if (!confirm('Keranjang berisi item dari penjual lain. Kosongkan keranjang?')) return;
          set({ items: [], sellerId: null, sellerName: null });
        }

        const existing = items.find((i) => i.menu.id === menuItem.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.menu.id === menuItem.id ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({
            items: [...items, { menu: menuItem, quantity, notes }],
            sellerId: menuItem.sellerId,
            sellerName: menuItem.name,
          });
        }
      },

      removeItem: (menuId) => {
        const { items } = get();
        const newItems = items.filter((i) => i.menu.id !== menuId);
        set({
          items: newItems,
          sellerId: newItems.length === 0 ? null : get().sellerId,
          sellerName: newItems.length === 0 ? null : get().sellerName,
        });
      },

      updateQuantity: (menuId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuId);
          return;
        }
        set({
          items: get().items.map((i) => (i.menu.id === menuId ? { ...i, quantity } : i)),
        });
      },

      clearCart: () => set({ items: [], sellerId: null, sellerName: null }),

      getTotal: () => get().items.reduce((sum, i) => sum + i.menu.price * i.quantity, 0),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'siorka-cart' }
  )
);

interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarOpen: true,
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        set({ theme: newTheme });
      },
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    { name: 'siorka-app' }
  )
);