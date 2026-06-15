import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, UtensilsCrossed } from 'lucide-react';
import { customerApi } from '@/lib/api/customer.api';
import type { SellerResponse } from '@/lib/api/types';
import { SellerCard } from '@/components/ui/SellerCard';
import { SellerCardSkeleton } from '@/components/ui/SellerCardSkeleton';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function CustomerDashboard() {
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

  const sorted      = [...sellers].sort((a, b) => (b.isOpen ? 1 : 0) - (a.isOpen ? 1 : 0));
  const recommended = sorted.slice(0, 4);
  const openSellers = sorted.filter(s => s.isOpen);

  return (
    <div className="space-y-8 p-4 mx-auto">

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <section>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-3"
        >
          <h2 className="font-bold text-lg text-surface-800 dark:text-white">Rekomendasi Penjual</h2>
        </motion.div>

        {loading ? (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {Array.from({ length: 4 }).map((_, i) => <SellerCardSkeleton key={i} />)}
          </div>
        ) : recommended.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-surface-400">
            <UtensilsCrossed className="w-8 h-8" />
            <p className="text-sm">Belum ada penjual tersedia.</p>
          </div>
        ) : (
          <motion.div
            variants={stagger} initial="hidden" animate="show"
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          >
            {recommended.map(seller => (
              <motion.div key={seller.id} variants={fadeUp}>
                <SellerCard seller={seller} className="w-40 flex-shrink-0"/>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {!loading && openSellers.length > 0 && (
        <section>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="mb-3"
          >
            <h2 className="font-bold text-lg text-surface-800 dark:text-white">Buka Sekarang</h2>
            <p className="text-sm text-surface-400">Penjual yang sedang buka hari ini</p>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" animate="show"
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          >
            {openSellers.map(seller => (
              <motion.div key={seller.id} variants={fadeUp}>
                <SellerCard seller={seller} className="w-40 flex-shrink-0"/>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
}