import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, UtensilsCrossed } from 'lucide-react';
import { resolveImageUrl } from '@/lib/resolveImageUrl';
import { formatCurrency } from '@/lib/utils';
import type { MenuResponse } from '@/lib/api/types';

interface MenuRowProps {
  menu:     MenuResponse;
  quantity: number;
  onAdd:    () => void;
  onRemove: () => void;
}

export function MenuRow({ menu, quantity, onAdd, onRemove }: MenuRowProps) {
  const [imgErrored, setImgErrored] = useState(false);
  const imageUrl = resolveImageUrl(menu.image, 120);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 border-b border-surface-100 dark:border-surface-700 last:border-0"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-700 flex-shrink-0">
        {imageUrl && !imgErrored ? (
          <img
            src={imageUrl}
            alt={menu.name}
            onError={() => setImgErrored(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-surface-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-surface-900 dark:text-white text-sm truncate">{menu.name}</p>
        {menu.description && (
          <p className="text-xs text-surface-400 truncate mt-0.5">{menu.description}</p>
        )}
        <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-1">
          {formatCurrency(menu.price)}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <AnimatePresence>
          {quantity > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={onRemove}
                className="w-7 h-7 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-5 text-center text-sm font-bold text-surface-900 dark:text-white">
                {quantity}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onAdd}
          className="w-7 h-7 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center text-white transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}