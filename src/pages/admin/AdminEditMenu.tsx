import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft, Check, AlertTriangle, Loader2, UtensilsCrossed,
  ToggleLeft, ToggleRight, Trash2, Upload, X
} from "lucide-react";
import { adminApi } from "@/lib/api/admin.api";
import type {
  MenuResponse,
  UpdateMenuPayload,
  ErrorResponse,
} from "@/lib/api/types";
import type { AxiosError } from "axios";
import { formatCurrency } from "@/lib/utils";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Badge } from "@/components/ui";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { Field } from "@/components/ui/Field";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const CATEGORY_CFG = {
  Makanan_Berat: { variant: "blue" as const },
  Cemilan: { variant: "gold" as const },
  Minuman: { variant: "green" as const },
};


export function AdminEditMenu() {
  const { menuId } = useParams<{ menuId: string }>();
  const navigate = useNavigate();

  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [menuData, setMenuData] = useState<MenuResponse | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<MenuResponse["category"]>("Makanan_Berat");
  const [isAvailable, setIsAvailable] = useState(true);
  const [stock, setStock] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imgErrored, setImgErrored] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menuId) return;
    let cancelled = false;

    const load = async () => {
      try {
        setFetchLoading(true);
        setFetchError(null);

        const res = await adminApi.getDetailMenu(menuId);
        if (cancelled) return;

        const menu = res.data?.data;
        if (!menu) {
          setFetchError("Menu tidak ditemukan.");
          return;
        }

        setMenuData(menu);
        setName(menu.name);
        setDescription(menu.description ?? "");
        setPrice(String(menu.price));
        setCategory(menu.category);
        setIsAvailable(menu.isAvailable);
        setStock(menu.stock != null ? String(menu.stock) : "");
        setImageUrl(menu.image ?? "");
        setImagePreview(resolveImageUrl(menu.image));
      } catch (err: unknown) {
        if (cancelled) return;
        const axiosError = err as AxiosError<ErrorResponse>;
        setFetchError(
          axiosError.response?.data?.message ?? "Gagal memuat data menu.",
        );
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [menuId]);


    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setImgErrored(false);
    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
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


  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Nama menu wajib diisi.";
    if (!price.trim()) e.price = "Harga wajib diisi.";
    else if (isNaN(Number(price)) || Number(price) <= 0)
      e.price = "Harga harus berupa angka positif.";
    if (stock && (isNaN(Number(stock)) || Number(stock) < 0))
      e.stock = "Stok harus berupa angka ≥ 0.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !menuId) return;
    setSubmitLoading(true);

    const payload: UpdateMenuPayload = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      isAvailable,
      ...(stock !== "" && { stock: Number(stock) }),
    };

    try {
      await adminApi.editMenu(menuId, payload);
      setSaved(true);
      setTimeout(() => navigate("/admin/menu"), 1200);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const msg =
        axiosError.response?.data?.message ?? "Gagal menyimpan perubahan.";
      setErrors((p) => ({ ...p, _global: msg }));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!menuId) return;
    try {
      setIsDeleting(true);
      await adminApi.hapusMenu(menuId);
      setDeleteOpen(false);
      navigate("/admin/menu");
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      alert(axiosError.response?.data?.message ?? "Gagal menghapus menu");
    } finally {
      setIsDeleting(false);
    }
  };


  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-surface-400" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-surface-400">
        <AlertTriangle className="w-10 h-10" />
        <p className="text-sm">{fetchError}</p>
        <button
          onClick={() => navigate("/admin/menu")}
          className="btn-primary text-sm px-4 py-2"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate("/admin/menu")}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-surface-500 hover:text-surface-800 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="page-title">Edit Menu</h1>
            <p className="page-subtitle">Perbarui data menu penjual.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.06 }}
          className="card flex items-center gap-4"
        >
          {imageUrl && !imgErrored ? (
            <img
              src={imageUrl}
              alt={menuData?.name}
              onError={() => setImgErrored(true)}
              className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 bg-surface-100 dark:bg-surface-700 shadow"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center flex-shrink-0">
              <UtensilsCrossed className="w-7 h-7 text-surface-400" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-surface-900 dark:text-white truncate">
              {name || "—"}
            </p>
            <p className="text-sm text-surface-400 truncate">
              {menuData?.seller?.storeName ?? menuData?.seller?.name ?? "—"}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {category && (
                <Badge variant={CATEGORY_CFG[category].variant}>
                  {category}
                </Badge>
              )}
              <span className="text-xs font-semibold text-surface-500 dark:text-surface-400">
                {price ? formatCurrency(Number(price)) : "—"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setDeleteOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card space-y-5"
          >
            <h2 className="font-display font-bold text-surface-900 dark:text-white text-base">
              Informasi Menu
            </h2>

            {errors._global && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />{" "}
                {errors._global}
              </div>
            )}

            <Field label="Nama Menu" required error={errors.name}>
              <input
                className={`input-base ${errors.name ? "border-red-400" : ""}`}
                value={name}
                placeholder="Nama menu"
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: "" }));
                }}
              />
            </Field>

            <Field label="Deskripsi">
              <textarea
                className="input-base min-h-[80px] resize-none"
                value={description}
                placeholder="Deskripsi singkat menu..."
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>

            <Field label="Harga" required error={errors.price}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-400 font-medium">
                  Rp
                </span>
                <input
                  className={`input-base pl-9 ${errors.price ? "border-red-400" : ""}`}
                  type="number"
                  min="0"
                  value={price}
                  placeholder="0"
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setErrors((p) => ({ ...p, price: "" }));
                  }}
                />
              </div>
            </Field>
            
            <Field label="Gambar Menu" error={errors.image}>
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
                  <><Loader2 className="w-4 h-4 animate-spin" /> Mengupload...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Ganti Gambar</>
                )}
              </button>
              {imagePreview && !imgErrored && (
                <div className="relative mt-2 w-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-36 object-cover rounded-xl"
                    onError={() => setImgErrored(true)}
                  />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(""); setImageUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </Field>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card space-y-5"
          >
            <h2 className="font-display font-bold text-surface-900 dark:text-white text-base">
              Detail & Ketersediaan
            </h2>

            <Field label="Kategori">
              <select
                className="input-base"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as MenuResponse["category"])
                }
              >
                <option value="Makanan Berat">Makanan Berat</option>
                <option value="Cemilan">Cemilan</option>
                <option value="Minuman">Minuman</option>
              </select>
            </Field>

            <Field label="Stok" error={errors.stock}>
              <input
                className={`input-base ${errors.stock ? "border-red-400" : ""}`}
                type="number"
                min="0"
                value={stock}
                placeholder="Kosongkan jika tidak dibatasi"
                onChange={(e) => {
                  setStock(e.target.value);
                  setErrors((p) => ({ ...p, stock: "" }));
                }}
              />
              <p className="text-xs text-surface-400 mt-1">
                Kosongkan jika stok tidak dibatasi
              </p>
            </Field>

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-surface-800 dark:text-surface-200">
                  Ketersediaan
                </p>
                <p className="text-xs text-surface-400">
                  Tampilkan menu sebagai tersedia atau habis
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAvailable((p) => !p)}
                className={`transition-colors ${isAvailable ? "text-primary-500" : "text-surface-400"}`}
              >
                {isAvailable ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>

            {menuData?.seller && (
              <div className="pt-2 border-t border-surface-100 dark:border-surface-700">
                <p className="text-xs text-surface-400 mb-1">Penjual</p>
                <p className="text-sm font-medium text-surface-800 dark:text-surface-200">
                  {menuData.seller.storeName ?? menuData.seller.name}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate("/admin/menu")}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitLoading || saved}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              saved
                ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400"
                : "btn-primary"
            } disabled:opacity-70`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" /> Tersimpan!
              </>
            ) : submitLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        <DeleteModal
          isOpen={deleteOpen}
          onConfirm={handleDelete}
          onClose={() => setDeleteOpen(false)}
          isDeleting={isDeleting}
          title="Hapus Menu?"
          description={
            menuData && (
              <>
                Menu{" "}
                <span className="font-semibold text-surface-800 dark:text-surface-200">
                  {menuData.name}
                </span>{" "}
                akan dihapus secara permanen dan tidak dapat dikembalikan.
              </>
            )
          }
        />
      </AnimatePresence>
    </>
  );
}
