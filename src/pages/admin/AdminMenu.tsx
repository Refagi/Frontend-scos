import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Search, Plus, Edit2, Trash2,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { Badge } from '@/components/ui'
import { adminApi } from '@/lib/api/admin.api'
import type { MenuResponse, ErrorResponse, GetSemuaMenuQuery } from '@/lib/api/types'
import { AxiosError } from 'axios'
import { DeleteModal } from '@/components/ui/DeleteModal'
import { formatCurrency } from '@/lib/utils'
import CloudinaryImage from '@/components/ui/CloudinaryImage'
 
 
const CATEGORY_CFG = {
  'Makanan_Berat': { variant: 'blue'  as const },
  'Cemilan'      : { variant: 'gold'  as const },
  'Minuman'      : { variant: 'green' as const },
}
 
const PAGE_SIZE = 10

export function AdminMenu() {
  const navigate = useNavigate()

  const [menus,          setMenus]          = useState<MenuResponse[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)
  const [search,         setSearch]         = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'Makanan_Berat' | 'Cemilan' | 'Minuman'  | 'all'>('all')
  const [sellerFilter,   setSellerFilter]   = useState('')
  const [page,           setPage]           = useState(1)
  const [deleteTarget,   setDeleteTarget]   = useState<MenuResponse | null>(null)
  const [isDeleting,     setIsDeleting]     = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const query: GetSemuaMenuQuery = {
          ...(sellerFilter                  && { sellerId:  sellerFilter }),
          ...(categoryFilter !== 'all'      && { category: categoryFilter }),
        }

        const res = await adminApi.getSemuaMenu(query)

        if (cancelled) return
        setMenus(res.data?.data ?? [])
        setPage(1)
      } catch (err: unknown) {
        if (cancelled) return
        const axiosError = err as AxiosError<ErrorResponse>
        setError(axiosError.response?.data?.message ?? 'Gagal memuat data menu')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => { cancelled = true }
  }, [sellerFilter, categoryFilter])

  const sellers = Array.from(
    new Map(
      menus
        .filter(m => m.seller)
        .map(m => [m.seller!.id, {
          id:   m.seller!.id,
          name: m.seller!.storeName ?? m.seller!.name,
        }])
    ).values()
  )

  const filtered = menus.filter(m => {
    if (!search) return true
    const q          = search.toLowerCase()
    const sellerName = m.seller?.storeName ?? m.seller?.name ?? ''
    return m.name.toLowerCase().includes(q) || sellerName.toLowerCase().includes(q)
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setIsDeleting(true)
      await adminApi.hapusMenu(deleteTarget.id)
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
    <>
      <div className="space-y-5 w-full">

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="page-title">Kelola Menu</h1>
            <p className="page-subtitle">Daftar semua menu dari seluruh penjual</p>
          </div>
          <button
            onClick={() => navigate('/admin/menu/add')}
            className="btn-primary flex items-center justify-center gap-2 text-sm whitespace-nowrap w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> Tambah Menu
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              className="input-base pl-9 w-full"
              placeholder="Cari nama menu atau penjual..."
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
            />
          </div>
          <select
            value={sellerFilter}
            onChange={e => { setSellerFilter(e.target.value); setPage(1) }}
            className="input-base w-full sm:w-48"
          >
            <option value="">Semua Penjual</option>
            {sellers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value as 'Makanan_Berat' | 'Cemilan' | 'Minuman'  | 'all'); setPage(1) }}
            className="input-base w-full sm:w-44"
          >
            <option value="all">Semua Kategori</option>
            <option value="Makanan Berat">Makanan Berat</option>
            <option value="Cemilan">Cemilan</option>
            <option value="Minuman">Minuman</option>
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-navy-800 rounded-2xl shadow-card border border-surface-100 dark:border-navy-700 overflow-hidden"
        >
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="min-w-0 overflow-x-auto">
            <table className="table-base-menu min-w-[900px] table-fixed">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Menu</th>
                  <th>Penjual</th>
                  <th>Kategori</th>
                  <th>Harga</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-14 text-surface-400">
                      Memuat data...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-14 text-surface-400">
                      Tidak ada menu ditemukan
                    </td>
                  </tr>
                ) : (
                  paginated.map((menu, index) => (
                    <motion.tr
                      key={menu.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <td className="whitespace-nowrap text-center font-medium">
                        {(safePage - 1) * PAGE_SIZE + index + 1}
                      </td>

                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <CloudinaryImage src={menu.image} alt={menu.name} size={48}/>
                          <div className="min-w-0">
                            <p className="font-medium text-surface-900 dark:text-white truncate max-w-[180px]">
                              {menu.name}
                            </p>
                            {menu.description && (
                              <p className="text-xs text-surface-400 truncate max-w-[180px]">
                                {menu.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap text-sm text-surface-500 dark:text-surface-400">
                        {menu.seller?.storeName ?? menu.seller?.name ?? '—'}
                      </td>

                      <td className="whitespace-nowrap">
                        <Badge variant={CATEGORY_CFG[menu.category].variant}>
                          {menu.category}
                        </Badge>
                      </td>

                      <td className="whitespace-nowrap font-semibold text-surface-900 dark:text-white">
                        {formatCurrency(menu.price)}
                      </td>

                      <td className="whitespace-nowrap">
                        <Badge variant={menu.isAvailable ? 'green' : 'red'}>
                          {menu.isAvailable ? 'Tersedia' : 'Habis'}
                        </Badge>
                      </td>

                      <td className="whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/admin/menu/edit/${menu.id}`)}
                            className="w-8 h-8 flex items-center justify-center text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(menu)}
                            className="w-8 h-8 flex items-center justify-center text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div className="px-4 py-4 border-t border-surface-100 dark:border-surface-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
              <p className="text-surface-500 dark:text-surface-400">
                Menampilkan {paginated.length} dari {filtered.length} menu
                {filtered.length !== menus.length && ` (difilter dari ${menus.length})`}
                {' '}• Halaman {safePage} dari {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={safePage <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, safePage - 3), safePage + 2)
                  .map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        p === safePage
                          ? 'bg-primary-500 text-white'
                          : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  disabled={safePage >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

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
    </>
  )
}