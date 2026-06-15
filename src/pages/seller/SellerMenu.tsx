import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Edit2, Trash2,
} from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { sellerApi } from '@/lib/api/seller.api'
import type { MenuResponse, ErrorResponse } from '@/lib/api/types'
import { AxiosError } from 'axios'
import { DeleteModal } from '@/components/ui/DeleteModal'
import { formatCurrency } from '@/lib/utils'
import CloudinaryImage from '@/components/ui/CloudinaryImage'

export function SellerMenu() {
  const navigate = useNavigate()

  const [menus, setMenus] = useState<MenuResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MenuResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await sellerApi.getSemuaMenu()
        
        if (cancelled) return
        setMenus(res.data?.data ?? [])
      } catch (err: unknown) {
        if (cancelled) return
        const axiosError = err as AxiosError<ErrorResponse>
        setError(axiosError.response?.data?.message ?? 'Gagal memuat menu Anda')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => { cancelled = true }
  }, [])


  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      setIsDeleting(true)
      await sellerApi.deleteMenu(deleteTarget.id)
      setDeleteTarget(null)
      setMenus(prev => prev.filter(m => m.id !== deleteTarget.id))
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>
      alert(axiosError.response?.data?.message ?? 'Gagal menghapus menu')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="page-title">Menu Saya</h1>
          <p className="page-subtitle">Kelola daftar menu kantin Anda</p>
        </div>
        <Button
          onClick={() => navigate('/seller/menu/add')}
          icon={<Plus className="w-4 h-4" />}
        >
          Tambah Menu
        </Button>
      </motion.div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-surface-400">
          Memuat menu Anda...
        </div>
      ) : menus.length === 0 ? (
        <div className="text-center py-20 text-surface-400">
          Belum ada menu. Silakan tambahkan menu baru.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {menus.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04 }}
              className="card card-hover p-4"
            >
              <div className="flex items-start gap-3">
                <CloudinaryImage
                  src={item.image}
                  alt={item.name}
                  size={56}
                  className="flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-surface-900 dark:text-white text-sm line-clamp-2 pr-2">
                      {item.name}
                    </h3>
                    <Badge
                      variant={
                        item.category === 'Makanan_Berat' ? 'blue' :
                        item.category === 'Minuman' ? 'green' : 'gold'
                      }
                    >
                      {item.category}
                    </Badge>
                  </div>

                  <p className="font-bold text-primary-600 dark:text-primary-400 mt-2">
                    {formatCurrency(item.price)}
                  </p>
                  <Badge variant={item.isAvailable ? 'green' : 'red'}>
                    {item.isAvailable ? 'Tersedia' : 'Habis'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-surface-100 dark:border-surface-700">

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/seller/menu/edit/${item.id}`)}
                    className="w-8 h-8 flex items-center justify-center text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="w-8 h-8 flex items-center justify-center text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        <DeleteModal
          isOpen={!!deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
          title="Hapus Menu?"
          description={
            deleteTarget && (
              <>
                Menu{' '}
                <span className="font-semibold text-surface-800 dark:text-surface-200">
                  {deleteTarget.name}
                </span>{' '}
                akan dihapus secara permanen.
              </>
            )
          }
        />
      </AnimatePresence>
    </div>
  )
}