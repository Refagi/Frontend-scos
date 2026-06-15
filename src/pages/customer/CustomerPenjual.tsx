


import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, UtensilsCrossed } from 'lucide-react';
import { customerApi } from '@/lib/api/customer.api';
import type { SellerResponse } from '@/lib/api/types';
import { SellerCard } from '@/components/ui/SellerCard';
import { SellerCardSkeleton } from '@/components/ui/SellerCardSkeleton';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export function CustomerPenjual() {
  const [sellers, setSellers] = useState<SellerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await customerApi.getDaftarSeller();
        if (cancelled) return;
        setSellers(res.data?.data ?? []);
      } catch {
        if (cancelled) return;
        setError('Gagal memuat daftar penjual.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-4 mx-auto">
      <h2 className="font-bold text-lg text-surface-800 dark:text-white mb-4">
        Pesan Sekarang
      </h2>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <SellerCardSkeleton key={i} />
          ))}
        </div>
      ) : sellers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-surface-400">
          <UtensilsCrossed className="w-10 h-10" />
          <p className="text-sm">Belum ada penjual tersedia.</p>
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3"
        >
          {sellers.map(seller => (
            <motion.div key={seller.id} variants={fadeUp}>
              <SellerCard seller={seller} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}