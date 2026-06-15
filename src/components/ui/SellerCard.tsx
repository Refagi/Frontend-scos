import { useState } from 'react';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resolveImageUrl } from '@/lib/resolveImageUrl';
import type { SellerResponse } from '@/lib/api/types';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80';

interface SellerCardProps {
  seller:       SellerResponse;
  navigateTo?:  string;
  className?:   string;
}

export function SellerCard({ seller, navigateTo, className = '' }: SellerCardProps) {
  const navigate    = useNavigate();
  const [errored, setErrored] = useState(false);

  const imageUrl = resolveImageUrl(seller.image);
  const target   = navigateTo ?? `/customer/sellers/${seller.id}/menu`;

  return (
    <div className={`bg-white dark:bg-surface-800 rounded-2xl overflow-hidden shadow-sm border border-surface-100 dark:border-surface-700 hover:shadow-md transition-shadow ${className}`}>
      <div className="w-full h-28 overflow-hidden bg-surface-100 dark:bg-surface-700">
        <img
          src={imageUrl && !errored ? imageUrl : FALLBACK_IMG}
          alt={seller.storeName ?? seller.name}
          onError={() => setErrored(true)}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-2.5">
        <p className="font-semibold text-surface-800 dark:text-white text-sm leading-tight truncate">
          {seller.storeName ?? seller.name}
        </p>

        {seller.location && (
          <p className="text-xs text-surface-400 truncate mt-0.5">{seller.location}</p>
        )}

        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            seller.isOpen
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {seller.isOpen ? '✓ Buka' : '✕ Tutup'}
          </span>

          {seller.openLabel && (
            <span className="text-xs text-surface-400 flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {seller.openLabel}
            </span>
          )}
        </div>

        <button
          onClick={() => navigate(target)}
          className="w-full mt-2 bg-primary-500 hover:bg-primary-600 transition-colors text-white text-xs font-semibold py-1.5 rounded-lg"
        >
          Lihat Menu
        </button>
      </div>
    </div>
  );
}