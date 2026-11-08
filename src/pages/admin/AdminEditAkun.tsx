import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  User as UserIcon, Mail, Phone, MapPin, Store,
  ChevronLeft, Check, ShieldCheck, AlertTriangle,
  Loader2, ToggleLeft, ToggleRight,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin.api";
import type { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import WarningModal from "@/components/ui/WarningModal";
import { Field } from "@/components/ui/Field";
import type { ErrorResponse, EditAkunPayload } from "@/lib/api/types";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { useImageUpload, imagePatch } from "@/hooks/useImageUpload";

function InputIcon({
  icon, error, ...props
}: { icon: React.ReactNode; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400">{icon}</span>
      <input className={`input-base pl-9 ${error ? "border-red-400" : ""}`} {...props} />
    </div>
  );
}

export function AdminEditAkun() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError,   setFetchError]   = useState<string | null>(null);
  const [userRole,     setUserRole]     = useState<string>("customer");

  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [status,    setStatus]    = useState<"active" | "non-active">("active");

  const [storeName,    setStoreName]    = useState("");
  const [description,  setDescription]  = useState("");
  const [location,     setLocation]     = useState("");
  const [isOpen,       setIsOpen]       = useState(true);
  const [openLabel,    setOpenLabel]    = useState("");

  const avatar = useImageUpload("avatar");
  const image  = useImageUpload("tenant");
  const qris   = useImageUpload("qris");

  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [showWarning,   setShowWarning]   = useState(false);

  const isSelfEdit = currentUser?.id === userId;
  const isSeller   = userRole === "seller";
  const initials   = name ? name.charAt(0).toUpperCase() : "?";

  const initAvatar = avatar.init;
  const initImage  = image.init;
  const initQris   = qris.init;
  const anyUploading = avatar.uploading || image.uploading || qris.uploading;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const load = async () => {
      try {
        setFetchLoading(true);
        setFetchError(null);
        const res = await adminApi.getDetailAkun(userId);
        if (cancelled) return;

        const u = res.data.data;
        if (!u) { setFetchError("Data akun tidak ditemukan."); return; }

        setUserRole(u.role);
        setName(u.name ?? "");
        setEmail(u.email ?? "");
        setPhone(u.phone ?? "");
        setStatus(u.status === "active" ? "active" : "non-active");
        setStoreName(u.storeName ?? "");
        setDescription(u.description ?? "");
        setLocation(u.location ?? "");
        setIsOpen(u.isOpen ?? true);
        setOpenLabel(u.openLabel ?? "");

        initAvatar(u.avatar);
        initImage(u.image);
        initQris(u.qrisImage);

        if (u.role === "admin" && currentUser?.id !== userId) setShowWarning(true);
      } catch (err: unknown) {
        if (cancelled) return;
        const axiosError = err as AxiosError<ErrorResponse>;
        setFetchError(axiosError.response?.data?.message ?? "Gagal memuat data akun.");
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [userId, currentUser?.id, initAvatar, initImage, initQris]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())  e.name  = "Nama wajib diisi.";
    if (!email.trim()) e.email = "Email wajib diisi.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Format email tidak valid.";
    if (phone && phone.length < 9) e.phone = "Nomor HP minimal 9 karakter.";
    if (isSeller) {
      if (!storeName.trim()) e.storeName = "Nama toko wajib diisi untuk penjual.";
      if (!location.trim())  e.location  = "Lokasi wajib diisi untuk penjual.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !userId) return;
    setSubmitLoading(true);

    const payload: EditAkunPayload = {
      name:   name.trim(),
      email:  email.trim(),
      ...(phone && { phone }),
      ...imagePatch("avatar", avatar),
      ...(!isSelfEdit && { status }),
      ...(isSeller && {
        storeName,
        description,
        location,
        isOpen,
        openLabel,
        ...imagePatch("image", image),
        ...imagePatch("qrisImage", qris),
      }),
    };

    try {
      await adminApi.editAkun(userId, payload);
      setSaved(true);
      setTimeout(() => navigate("/admin/akun"), 1500);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const msg = axiosError.response?.data?.message ?? "Gagal menyimpan perubahan.";
      if (axiosError.response?.status === 409) {
        setErrors(p => ({ ...p, email: msg }));
      } else {
        setErrors(p => ({ ...p, _global: msg }));
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  if (fetchLoading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-6 h-6 animate-spin text-surface-400" />
    </div>
  );

  if (fetchError) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-surface-400">
      <AlertTriangle className="w-10 h-10" />
      <p className="text-sm">{fetchError}</p>
      <button onClick={() => navigate("/admin/akun")} className="btn-primary text-sm px-4 py-2">
        Kembali
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/akun")}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-surface-500 hover:text-surface-800 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="page-title">Edit Akun</h1>
          <p className="page-subtitle">{isSelfEdit ? "Mengedit akun Anda sendiri" : "Perbarui data pengguna"}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.06 }}
        className="card flex items-center gap-4"
      >
        {avatar.preview ? (
          <img
            src={avatar.preview}
            alt={name}
            className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 shadow"
          />
        ) : (
          <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-display font-bold text-2xl shadow-green-md flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-surface-900 dark:text-white truncate">{name || "—"}</p>
          <p className="text-sm text-surface-400 truncate">{email || "—"}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {isSelfEdit && (
              <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full">
                <ShieldCheck className="w-4 h-4" /> AKUN ANDA
              </span>
            )}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              status === "active"
                ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
            }`}>
              {status === "active" ? "Aktif" : "Non-Aktif"}
            </span>
          </div>
        </div>
      </motion.div>

      <div className={`grid gap-6 ${isSeller ? "md:grid-cols-2" : "max-w-2xl mx-auto"}`}>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card space-y-5"
        >
          <h2 className="font-display font-bold text-surface-900 dark:text-white text-base">Informasi Akun</h2>

          {errors._global && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {errors._global}
            </div>
          )}

          <Field label="Nama Lengkap" required error={errors.name}>
            <InputIcon icon={<UserIcon />} error={errors.name} value={name} placeholder="Nama lengkap"
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }} />
          </Field>

          <Field label="Alamat E-Mail" required error={errors.email}>
            <InputIcon icon={<Mail />} error={errors.email} type="email" value={email} placeholder="nama@email.com"
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }} />
          </Field>

          <Field label="Nomor HP" error={errors.phone}>
            <InputIcon icon={<Phone />} error={errors.phone} value={phone} placeholder="08xxxxxxxxxx"
              onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: "" })); }} />
          </Field>

          {!isSelfEdit && (
            <Field label="Status">
              <select className="input-base" value={status}
                onChange={e => setStatus(e.target.value as "active" | "non-active")}>
                <option value="active">Aktif</option>
                <option value="non-active">Non-Aktif</option>
              </select>
            </Field>
          )}

          <ImageUploadField label="Foto Profil" upload={avatar} hint="Foto profil pengguna" />
        </motion.div>

        {isSeller && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="card space-y-5"
          >
            <h2 className="font-display font-bold text-surface-900 dark:text-white text-base">Informasi Toko</h2>

            <Field label="Nama Toko" required error={errors.storeName}>
              <InputIcon icon={<Store />} error={errors.storeName} value={storeName} placeholder="Nama kantin / toko"
                onChange={e => { setStoreName(e.target.value); setErrors(p => ({ ...p, storeName: "" })); }} />
            </Field>

            <Field label="Lokasi" required error={errors.location}>
              <InputIcon icon={<MapPin />} error={errors.location} value={location} placeholder="Lokasi toko"
                onChange={e => { setLocation(e.target.value); setErrors(p => ({ ...p, location: "" })); }} />
            </Field>

            <Field label="Deskripsi">
              <textarea className="input-base min-h-[80px] resize-none" value={description}
                placeholder="Deskripsi singkat toko..."
                onChange={e => setDescription(e.target.value)} />
            </Field>

            <Field label="Label Jam Buka">
              <input className="input-base" value={openLabel} placeholder="cth: Buka 07.00–15.00"
                onChange={e => setOpenLabel(e.target.value)} />
            </Field>

            <ImageUploadField label="Foto Kantin" upload={image} hint="Foto tampilan kantin / toko" />

            <ImageUploadField label="Gambar QRIS" upload={qris} fit="contain" hint="Gambar kode QRIS untuk pembayaran" />

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-surface-800 dark:text-surface-200">Status Toko</p>
                <p className="text-xs text-surface-400">Tampilkan toko sebagai buka atau tutup</p>
              </div>
              <button type="button" onClick={() => setIsOpen(p => !p)}
                className={`transition-colors ${isOpen ? "text-primary-500" : "text-surface-400"}`}>
                {isOpen ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className={`flex gap-3 ${isSeller ? "max-w-5xl mx-auto" : "max-w-2xl mx-auto"}`}
      >
        <button
          onClick={() => navigate("/admin/akun")}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitLoading || saved || anyUploading}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
            saved
              ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400"
              : "btn-primary"
          } disabled:opacity-70`}
        >
          {saved ? (
            <><Check className="w-4 h-4" /> Tersimpan!</>
          ) : submitLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
          ) : anyUploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Menunggu upload...</>
          ) : (
            "Simpan Perubahan"
          )}
        </button>
      </motion.div>

      <AnimatePresence>
        <WarningModal
          isOpen={showWarning}
          onClose={() => { setShowWarning(false); navigate("/admin/akun", { replace: true }); }}
          title="Akses Ditolak"
          message="Anda tidak diizinkan mengedit akun Admin lain."
          subMessage="Hanya Super Admin yang dapat mengedit akun Admin lain."
          icon="shield"
          variant="danger"
        />
      </AnimatePresence>
    </div>
  );
}