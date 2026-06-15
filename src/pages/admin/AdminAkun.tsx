import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import { Badge, Avatar } from "@/components/ui";
import type {
  UserResponse,
  GetDaftarAkunQuery,
  ErrorResponse,
} from "@/lib/api/types";
import type { UserRole, PaginationInfo, RoleStats } from "@/types";
import { adminApi } from "@/lib/api/admin.api";
import { AxiosError } from "axios";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { useAuthStore } from "@/store/authStore";
import WarningModal from '@/components/ui/WarningModal';

const PAGE_SIZE = 10;

const ROLE_CFG: Record<
  UserRole,
  { label: string; variant: "green" | "blue" | "gold" }
> = {
  admin: { label: "Admin", variant: "green" },
  seller: { label: "Penjual", variant: "blue" },
  customer: { label: "Pelanggan", variant: "gold" },
};

export function AdminAkun() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [roleStats, setRoleStats] = useState<RoleStats>({
    admin: 0,
    seller: 0,
    customer: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showWarning, setShowWarning] = useState(false);
  const [warningConfig, setWarningConfig] = useState<{
    title: string;
    message: string;
    subMessage?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const query: GetDaftarAkunQuery = {
          page,
          limit: PAGE_SIZE,
          ...(roleFilter !== "all" && { role: roleFilter }),
        };

        const [usersRes, adminStats, sellerStats, customerStats] =
          await Promise.all([
            adminApi.getDaftarAkun(query),
            adminApi.getDaftarAkun({ page: 1, limit: 1, role: "admin" }),
            adminApi.getDaftarAkun({ page: 1, limit: 1, role: "seller" }),
            adminApi.getDaftarAkun({ page: 1, limit: 1, role: "customer" }),
          ]);

        if (cancelled) return;

        setUsers(usersRes.data?.data ?? []);
        setPagination(usersRes.data?.pagination ?? null);
        setRoleStats({
          admin: adminStats.data?.pagination?.total ?? 0,
          seller: sellerStats.data?.pagination?.total ?? 0,
          customer: customerStats.data?.pagination?.total ?? 0,
        });
      } catch (err: unknown) {
        if (cancelled) return;
        const axiosError = err as AxiosError<ErrorResponse>;
        setError(
          axiosError.response?.data?.message ?? "Gagal memuat data akun",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [page, roleFilter]);

  const handleDeleteClick = (user: UserResponse) => {
    const isSelf = user.id === currentUser?.id;
    const isOtherAdmin = user.role === "admin" && !isSelf;

    if (isOtherAdmin || isSelf) {
      setWarningConfig({
        title: "Akses Ditolak",
        message: "Anda tidak diizinkan menghapus akun Admin",
        subMessage: "Hanya Super Admin yang dapat menghapus akun Admin",
      });
      setShowWarning(true);
      return;
    }
    setDeleteTarget(user);
  };

  const handleRoleChange = (value: UserRole | "all") => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await adminApi.hapusAkun(deleteTarget.id);
      setDeleteTarget(null);

      const isLastItemOnPage = users.length === 1 && page > 1;
      if (isLastItemOnPage) {
        setPage((p) => p - 1);
      } else {
        setRoleFilter((prev) => prev);
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      alert(axiosError.response?.data?.message ?? "Gagal menghapus akun");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
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
            <h1 className="page-title">Kelola Akun</h1>
            <p className="page-subtitle">
              Manajemen data pelanggan dan penjual kantin.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/akun/add")}
            className="btn-primary flex items-center justify-center gap-2 text-sm whitespace-nowrap w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> Tambah Akun
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {(["admin", "seller", "customer"] as const).map((role) => {
            const { label, variant } = ROLE_CFG[role];
            const active = roleFilter === role;

            return (
              <div
                key={role}
                onClick={() => handleRoleChange(active ? "all" : role)}
                className={`card flex items-center gap-4 cursor-pointer transition-all hover:shadow-card-hover ${
                  active ? "ring-2 ring-primary-500/30 border-primary-300" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    role === "admin"
                      ? "text-primary-600 bg-primary-50 dark:bg-primary-900/30"
                      : role === "seller"
                        ? "text-blue-600   bg-blue-50   dark:bg-blue-900/30"
                        : "text-amber-600  bg-amber-50  dark:bg-amber-900/30"
                  }`}
                >
                  {role === "admin" && <UserCheck className="w-5 h-5" />}
                  {role === "seller" && <Users className="w-5 h-5" />}
                  {role === "customer" && <UserX className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-surface-900 dark:text-white">
                    {roleStats[role]}
                  </p>
                  <Badge variant={variant}>{label}</Badge>
                </div>
              </div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              className="input-base pl-9 w-full"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) =>
              handleRoleChange(e.target.value as UserRole | "all")
            }
            className="input-base w-full sm:w-52"
          >
            <option value="all">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="seller">Penjual</option>
            <option value="customer">Pelanggan</option>
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-navy-800 rounded-2xl shadow-card border border-surface-100 dark:border-navy-700 overflow-hidden"
        >
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600">
              {error}
            </div>
          )}

          <div className="min-w-0 overflow-x-auto">
            <table className="table-base-akun min-w-[640px]">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-surface-400"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-surface-400"
                    >
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-surface-400"
                    >
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <td className="whitespace-nowrap font-medium text-center">
                        {index + 1}
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={user.name}
                            src={user.avatar || undefined}
                          />
                          <span className="font-medium text-surface-900 dark:text-white">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-surface-500 dark:text-surface-400">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap">
                        <Badge variant={ROLE_CFG[user.role].variant}>
                          {ROLE_CFG[user.role].label}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap">
                        <Badge
                          variant={user.status === "active" ? "green" : "red"}
                        >
                          {user.status === "active" ? "Aktif" : "Non-Aktif"}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() =>
                              navigate(`/admin/akun/edit/${user.id}`)
                            }
                            className="w-8 h-8 flex items-center justify-center text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
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

          {pagination && (
            <div className="px-4 py-4 border-t border-surface-100 dark:border-surface-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
              <p className="text-surface-500 dark:text-surface-400">
                Menampilkan {users.length} dari {pagination.total} akun •
                Halaman {pagination.currentPage} dari {pagination.totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage((p) => p - 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-40"
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
                          : "hover:bg-surface-100 dark:hover:bg-surface-800"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                <button
                  disabled={!pagination.hasNext}
                  onClick={() => setPage((p) => p + 1)}
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
          title={`Hapus akun`}
          description={
            deleteTarget && (
              <>
                Akun{" "}
                <span className="font-semibold text-surface-800 dark:text-surface-200">
                  {deleteTarget.name}
                </span>{" "}
              </>
            )
          }
        />
        <WarningModal
          isOpen={showWarning}
          onClose={() => setShowWarning(false)}
          title={warningConfig?.title || "Akses Ditolak"}
          message={warningConfig?.message || ""}
          subMessage={warningConfig?.subMessage}
          icon="shield"
          variant="danger"
        />
      </AnimatePresence>
    </>
  );
}
