import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ClipboardList,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin.api";
import { useNotifStore } from "@/hooks/useNotifikasi";
import type {
  PesananResponse,
  ErrorResponse,
  UpdateOrderStatusPayload,
} from "@/lib/api/types";
import type { OrderStatus, PaginationInfo } from "@/types";
import { AxiosError } from "axios";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const PAGE_SIZE = 10;

const ALL_STATUSES: OrderStatus[] = [
  "menunggu",
  "ditolak",
  "diterima",
  "dimasak",
  "siap",
  "selesai",
];

const STATUS_CFG: Record<
  OrderStatus,
  {
    label: string;
    pill: string;
    badge: string;
  }
> = {
  menunggu: {
    label: "Menunggu",
    pill: "bg-amber-500 text-white",
    badge:
      "badge bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  },
  ditolak: {
    label: "Ditolak",
    pill: "bg-red-500 text-white",
    badge: "badge bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  },
  diterima: {
    label: "Diterima",
    pill: "bg-blue-500 text-white",
    badge:
      "badge bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  },
  dimasak: {
    label: "Dimasak",
    pill: "bg-purple-500 text-white",
    badge:
      "badge bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  },
  siap: {
    label: "Siap",
    pill: "bg-primary-500 text-white",
    badge:
      "badge bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400",
  },
  selesai: {
    label: "Selesai",
    pill: "bg-surface-500 text-white",
    badge:
      "badge bg-surface-100 text-surface-600 dark:bg-navy-700 dark:text-surface-400",
  },
};

const ALLOWED_NEXT: Record<OrderStatus, OrderStatus[]> = {
  menunggu: ["diterima", "ditolak"],
  diterima: ["dimasak", "ditolak"],
  dimasak: ["siap"],
  siap: ["selesai"],
  ditolak: [],
  selesai: [],
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={STATUS_CFG[status].badge}>{STATUS_CFG[status].label}</span>
  );
}

function StatusDropdown({
  pesananId,
  current,
  onUpdated,
}: {
  pesananId: string;
  current: OrderStatus;
  onUpdated: (id: string, newStatus: OrderStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const allowed = ALLOWED_NEXT[current];
  if (allowed.length === 0) return <StatusBadge status={current} />;

  const handleChange = async (next: OrderStatus) => {
    setOpen(false);
    setLoading(true);
    try {
      const payload: UpdateOrderStatusPayload = { status: next };
      await adminApi.updateStatusPesanan(pesananId, payload);
      onUpdated(pesananId, next);
    } catch (err: unknown) {
      const msg =
        (err as AxiosError<ErrorResponse>).response?.data?.message ??
        "Gagal mengubah status";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        disabled={loading}
        onClick={() => setOpen((p) => !p)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all
          ${STATUS_CFG[current].badge.replace("badge ", "")}
          hover:opacity-80 disabled:opacity-50 cursor-pointer`}
      >
        {loading ? "…" : STATUS_CFG[current].label}
        {!loading && <ChevronDown className="w-3 h-3 opacity-70" />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-navy-800
                         border border-surface-200 dark:border-navy-600
                         rounded-xl shadow-card-hover overflow-hidden min-w-[130px]"
            >
              <div className="px-3 py-2 text-xs text-surface-400 border-b border-surface-100 dark:border-navy-700 font-medium">
                Ubah ke:
              </div>
              {allowed.map((next) => (
                <button
                  key={next}
                  onClick={() => void handleChange(next)}
                  className="w-full text-left px-3 py-2 text-xs font-semibold
                             hover:bg-surface-50 dark:hover:bg-navy-700 transition-colors
                             text-surface-700 dark:text-surface-300"
                >
                  {STATUS_CFG[next].label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdminPesanan() {
  const [pesanan, setPesanan] = useState<PesananResponse[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<PesananResponse | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const latestNotif = useNotifStore((s) => s.items[0]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await adminApi.getSemuaPesanan({
          page,
          limit: PAGE_SIZE,
          ...(statusFilter !== "all" && { status: statusFilter }),
        });

        if (cancelled) return;
        setPesanan(res.data?.data ?? []);
        setPagination(res.data?.pagination ?? null);
      } catch (err: unknown) {
        if (cancelled) return;
        const axiosError = err as AxiosError<ErrorResponse>;
        setError(
          axiosError.response?.data?.message ?? "Gagal memuat data pesanan",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [statusFilter, page]);

  useEffect(() => {
    if (!latestNotif?.pesananId) return;
    let cancelled = false;

    const silentRefresh = async () => {
      try {
        const res = await adminApi.getSemuaPesanan({
          page,
          limit: PAGE_SIZE,
          ...(statusFilter !== "all" && { status: statusFilter }),
        });
        if (cancelled) return;
        setPesanan(res.data?.data ?? []);
        setPagination(res.data?.pagination ?? null);
      } catch {
        // silent
      }
    };

    void silentRefresh();
    return () => {
      cancelled = true;
    };
  }, [latestNotif?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getSemuaPesanan({
        page,
        limit: PAGE_SIZE,
        ...(statusFilter !== "all" && { status: statusFilter }),
      });
      setPesanan(res.data?.data ?? []);
      setPagination(res.data?.pagination ?? null);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(
        axiosError.response?.data?.message ?? "Gagal memuat data pesanan",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (val: OrderStatus | "all") => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleStatusUpdated = (id: string, newStatus: OrderStatus) => {
    setPesanan((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)),
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await adminApi.hapusPesanan(deleteTarget.id);
      setDeleteTarget(null);

      const isLastOnPage = pesanan.length === 1 && page > 1;
      if (isLastOnPage) {
        setPage((p) => p - 1);
      } else {
        setPesanan((prev) => prev.filter((o) => o.id !== deleteTarget.id));
        setPagination((prev) =>
          prev ? { ...prev, total: prev.total - 1 } : prev,
        );
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      alert(axiosError.response?.data?.message ?? "Gagal menghapus pesanan");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = pesanan.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      (o.customer?.name ?? "").toLowerCase().includes(q) ||
      (o.seller?.storeName ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="space-y-5 w-full">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="page-title">Manajemen Pesanan</h1>
            <p className="page-subtitle">
              Pantau dan kelola semua pesanan secara real-time
            </p>
          </div>
          <button
            onClick={() => void handleRefresh()}
            disabled={loading}
            className="btn-secondary flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex gap-2 flex-wrap"
        >
          <button
            onClick={() => handleStatusChange("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === "all"
                ? "bg-navy-700 dark:bg-surface-100 text-white dark:text-navy-900"
                : "bg-surface-100 dark:bg-navy-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-navy-600"
            }`}
          >
            Semua {pagination && `(${pagination.total})`}
          </button>

          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === s
                  ? STATUS_CFG[s].pill
                  : "bg-surface-100 dark:bg-navy-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-navy-600"
              }`}
            >
              {STATUS_CFG[s].label}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            className="input-base pl-9 w-full"
            placeholder="Cari nomor pesanan, pelanggan, atau penjual..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white dark:bg-navy-800 rounded-2xl shadow-card border border-surface-100 dark:border-navy-700 overflow-hidden"
        >
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="min-w-0 overflow-x-auto">
            <table className="table-base-pesanan">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nomor & Waktu</th>
                  <th>Pelanggan</th>
                  <th>Penjual</th>
                  <th>Total</th>
                  <th>Slot</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-14 text-surface-400"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14">
                      <div className="flex flex-col items-center gap-2 text-surface-400">
                        <ClipboardList className="w-8 h-8" />
                        <p className="text-sm">Tidak ada pesanan ditemukan</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <td className="whitespace-nowrap text-center font-medium">
                        {(page - 1) * PAGE_SIZE + index + 1}
                      </td>

                      <td className="whitespace-nowrap">
                        <p className="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-surface-400 mt-0.5">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </td>

                      <td className="whitespace-nowrap">
                        <p className="font-medium text-surface-900 dark:text-white text-sm">
                          {order.customer?.name ?? "—"}
                        </p>
                        {order.customer?.phone && (
                          <p className="text-xs text-surface-400">
                            {order.customer.phone}
                          </p>
                        )}
                      </td>

                      <td className="whitespace-nowrap text-sm text-surface-500 dark:text-surface-400">
                        {order.seller?.storeName ?? order.seller?.name ?? "—"}
                      </td>

                      <td className="whitespace-nowrap font-semibold text-surface-900 dark:text-white">
                        {formatCurrency(order.totalPrice)}
                      </td>

                      <td className="whitespace-nowrap text-xs text-surface-500 dark:text-surface-400">
                        {order.slot ?? "—"}
                      </td>

                      <td className="whitespace-nowrap">
                        <StatusDropdown
                          pesananId={order.id}
                          current={order.status}
                          onUpdated={handleStatusUpdated}
                        />
                      </td>

                      <td className="whitespace-nowrap">
                        <button
                          onClick={() => setDeleteTarget(order)}
                          className="w-8 h-8 flex items-center justify-center text-surface-400
                                     hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30
                                     rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && !loading && (
            <div
              className="px-4 py-4 border-t border-surface-100 dark:border-navy-700
                            flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
            >
              <p className="text-surface-500 dark:text-surface-400">
                Menampilkan {pesanan.length} dari {pagination.total} pesanan •
                Halaman {pagination.currentPage} dari {pagination.totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage((p) => p - 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg
                             hover:bg-surface-100 dark:hover:bg-navy-700 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, pagination.currentPage - 3),
                    pagination.currentPage + 2,
                  )
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        p === pagination.currentPage
                          ? "bg-primary-500 text-white"
                          : "hover:bg-surface-100 dark:hover:bg-navy-700 text-surface-700 dark:text-surface-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                <button
                  disabled={!pagination.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg
                             hover:bg-surface-100 dark:hover:bg-navy-700 disabled:opacity-40"
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
          title="Hapus Pesanan?"
          description={
            deleteTarget && (
              <>
                Pesanan{" "}
                <span className="font-semibold text-surface-800 dark:text-surface-200">
                  {deleteTarget.orderNumber}
                </span>{" "}
                akan dihapus permanen dan tidak bisa dikembalikan.
              </>
            )
          }
        />
      </AnimatePresence>
    </>
  );
}
