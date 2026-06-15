import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Store,
  MapPin,
  ChevronLeft,
  Check,
  AlertTriangle,
  Loader2,
  ToggleLeft,
  ToggleRight,
  X, Upload
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { AxiosError } from "axios";
import type { ErrorResponse, UpdateSellerTenantPayload } from "@/lib/api/types";
import { Field } from "@/components/ui/Field";
import { sellerApi } from "@/lib/api/seller.api";
import { resolveImageUrl } from "@/lib/resolveImageUrl";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function InputIcon({
  icon,
  error,
  ...props
}: {
  icon: React.ReactNode;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none">
        {icon}
      </span>
      <input
        className={`input-base pl-9 w-full ${error ? "border-red-400" : ""}`}
        {...props}
      />
    </div>
  );
}

export function SellerEditTenant() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState(() => user?.storeName ?? "");
  const [description, setDescription] = useState(() => user?.description ?? "");
  const [location, setLocation] = useState(() => user?.location ?? "");
  const [isOpen, setIsOpen] = useState(() => user?.isOpen ?? true);
  const [openLabel, setOpenLabel] = useState(() => user?.openLabel ?? "");

  const [imageUrl, setImageUrl] = useState(() => user?.image ?? "");
  const [imagePreview, setImagePreview] = useState(() => resolveImageUrl(user?.image));
  const [qrisImageUrl, setQrisImageUrl] = useState(() => user?.qrisImage ?? "");
  const [qrisImagePreview, setQrisImagePreview] = useState(() => resolveImageUrl(user?.qrisImage));
  const [uploadLoading, setUploadLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const clearError = (key: string) => setErrors((p) => ({ ...p, [key]: "" }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!storeName.trim()) e.storeName = "Nama toko wajib diisi.";
    if (!location.trim()) e.location = "Lokasi wajib diisi.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      const data = await res.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
      } else {
        setErrors((p) => ({ ...p, image: "Gagal upload gambar." }));
      }
    } catch {
      setErrors((p) => ({ ...p, image: "Gagal upload gambar." }));
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);

    const payload: UpdateSellerTenantPayload = {
      storeName: storeName.trim(),
      description: description.trim() || null,
      location: location.trim(),
      isOpen,
      openLabel: openLabel.trim(),
      ...(imageUrl && { image: imageUrl }),
      ...(qrisImageUrl && { qrisImage: qrisImageUrl }),
    };

    try {
      const res = await sellerApi.updateSellerTenant(payload);
      const updated = res.data?.data;
      if (updated) setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const msg =
        axiosError.response?.data?.message ?? "Gagal menyimpan data toko.";
      setErrors((p) => ({ ...p, _global: msg }));
    } finally {
      setLoading(false);
    }
  };

  const initials = (user?.storeName ?? user?.name ?? "?")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => navigate("/seller")}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-surface-500 hover:text-surface-800 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="page-title">Edit Tenant</h1>
          <p className="page-subtitle">Perbarui informasi kantin Anda.</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.06 }}
        className="card flex items-center gap-4"
      >
        <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-display font-bold text-2xl shadow-green-md flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-surface-900 dark:text-white truncate text-lg">
            {storeName || "Nama Toko"}
          </p>
          <p className="text-sm text-surface-400 truncate">
            {location || "Lokasi toko..."}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isOpen
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                  : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              }`}
            >
              {isOpen ? "Buka" : "Tutup"}
            </span>
            {openLabel && (
              <span className="text-xs text-surface-400">{openLabel}</span>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card space-y-5"
        >
          <h2 className="font-display font-bold text-surface-900 dark:text-white text-base">
            Informasi Toko
          </h2>

          {errors._global && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />{" "}
              {errors._global}
            </div>
          )}

          <Field label="Nama Toko" required error={errors.storeName}>
            <InputIcon
              icon={<Store />}
              error={errors.storeName}
              value={storeName}
              placeholder="Nama kantin / toko"
              onChange={(e) => {
                setStoreName(e.target.value);
                clearError("storeName");
              }}
            />
          </Field>

          <Field label="Lokasi" required error={errors.location}>
            <InputIcon
              icon={<MapPin />}
              error={errors.location}
              value={location}
              placeholder="cth: Gedung A Lt. 1"
              onChange={(e) => {
                setLocation(e.target.value);
                clearError("location");
              }}
            />
          </Field>

          <Field label="Deskripsi">
            <textarea
              className="input-base min-h-[90px] resize-none w-full"
              value={description}
              placeholder="Deskripsi singkat toko, menu andalan, dll..."
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <Field label="Label Jam Buka">
            <input
              className="input-base w-full"
              value={openLabel}
              placeholder="cth: Buka 07.00–15.00"
              onChange={(e) => setOpenLabel(e.target.value)}
            />
          </Field>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-surface-800 dark:text-surface-200">
                Status Toko
              </p>
              <p className="text-xs text-surface-400">
                Tampilkan toko sebagai buka atau tutup
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen((p) => !p)}
              className={`transition-colors ${isOpen ? "text-primary-500" : "text-surface-400"}`}
            >
              {isOpen ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card space-y-5"
        >
          <h2 className="font-display font-bold text-surface-900 dark:text-white text-base">
            Media & Pembayaran
          </h2>

          <Field label="Gambar Tenant" error={errors.image}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-surface-200 dark:border-surface-700 text-sm text-surface-500 dark:text-surface-400 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors disabled:opacity-60"
            >
              {uploadLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Mengupload...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Ganti Gambar
                </>
              )}
            </button>
            {imagePreview && (
              <div className="relative mt-2 w-full">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-36 object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview("");
                    setImageUrl("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </Field>
          
          <Field label="Gambar Qris" error={errors.image}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-surface-200 dark:border-surface-700 text-sm text-surface-500 dark:text-surface-400 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors disabled:opacity-60"
            >
              {uploadLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Mengupload...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Ganti Gambar
                </>
              )}
            </button>
            {qrisImagePreview && (
              <div className="relative mt-2 w-full">
                <img
                  src={qrisImagePreview}
                  alt="Preview"
                  className="w-full h-36 object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setQrisImagePreview("");
                    setQrisImageUrl("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </Field>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3"
      >
        <button
          onClick={() => navigate("/seller/dashboard")}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
        >
          Batal
        </button>
        <button
          onClick={() => void handleSave()}
          disabled={loading || saved}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-70 ${
            saved
              ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400"
              : "btn-primary"
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" /> Tersimpan!
            </>
          ) : loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </button>
      </motion.div>
    </div>
  );
}
