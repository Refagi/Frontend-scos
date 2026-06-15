import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Check, AlertTriangle,
  Loader2, UtensilsCrossed, ToggleLeft, ToggleRight,
  Upload, X,
} from 'lucide-react';
import { sellerApi } from '@/lib/api/seller.api';
import type { CreateMenuPayload, ErrorResponse } from '@/lib/api/types';
import { AxiosError } from 'axios';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { Field } from '@/components/ui/Field';

type Category = 'Makanan_Berat' | 'Cemilan' | 'Minuman';

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'Makanan_Berat', label: 'Makanan Berat' },
  { value: 'Cemilan',       label: 'Cemilan'       },
  { value: 'Minuman',       label: 'Minuman'       },
];

const CATEGORY_CFG: Record<Category, { variant: 'blue' | 'gold' | 'green' }> = {
  Makanan_Berat: { variant: 'blue'  },
  Cemilan:       { variant: 'gold'  },
  Minuman:       { variant: 'green' },
};

const CLOUDINARY_CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export function SellerTambahMenu() {
  const navigate = useNavigate();

  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [price,       setPrice]       = useState('');
  const [category,    setCategory]    = useState<Category>('Makanan_Berat');
  const [isAvailable, setIsAvailable] = useState(true);
  const [stock,       setStock]       = useState('');
  const [imageUrl,    setImageUrl]    = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [saved,         setSaved]         = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearError = (key: string) => setErrors(p => ({ ...p, [key]: '' }));

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploadLoading(true);
    clearError('image');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const res  = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json() as { secure_url?: string };

      if (data.secure_url) {
        setImageUrl(data.secure_url);
      } else {
        setErrors(p => ({ ...p, image: 'Gagal upload gambar.' }));
      }
    } catch {
      setErrors(p => ({ ...p, image: 'Gagal upload gambar.' }));
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())                                          e.name  = 'Nama menu wajib diisi.';
    if (!price.trim())                                         e.price = 'Harga wajib diisi.';
    else if (isNaN(Number(price)) || Number(price) <= 0)      e.price = 'Harga harus berupa angka positif.';
    if (stock && (isNaN(Number(stock)) || Number(stock) < 0)) e.stock = 'Stok harus berupa angka ≥ 0.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitLoading(true);

    const payload: CreateMenuPayload = {
      name:        name.trim(),
      description: description.trim(),
      price:       Number(price),
      category,
      isAvailable,
      ...(imageUrl        && { image: imageUrl }),
      ...(stock !== ''    && { stock: Number(stock) }),
    };

    try {
      await sellerApi.addMenu(payload);
      setSaved(true);
      setTimeout(() => navigate('/seller/menu'), 1200);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const msg = axiosError.response?.data?.message ?? 'Gagal membuat menu.';
      if (axiosError.response?.status === 409) {
        setErrors(p => ({ ...p, name: msg }));
      } else {
        setErrors(p => ({ ...p, _global: msg }));
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button
          onClick={() => navigate('/seller/menu')}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-surface-500 hover:text-surface-800 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="page-title">Tambah Menu</h1>
          <p className="page-subtitle">Tambahkan menu baru ke kantin Anda.</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.06 }}
        className="card flex items-center gap-4"
      >
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="preview"
            className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 shadow"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center flex-shrink-0">
            <UtensilsCrossed className="w-7 h-7 text-surface-400" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-surface-900 dark:text-white truncate">
            {name || 'Nama Menu'}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant={CATEGORY_CFG[category].variant}>
              {CATEGORY_OPTIONS.find(c => c.value === category)?.label}
            </Badge>
            <span className="text-xs font-semibold text-surface-500 dark:text-surface-400">
              {price ? formatCurrency(Number(price)) : '—'}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isAvailable
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            }`}>
              {isAvailable ? 'Tersedia' : 'Habis'}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card space-y-5"
        >
          <h2 className="font-display font-bold text-surface-900 dark:text-white text-base">Informasi Menu</h2>

          {errors._global && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {errors._global}
            </div>
          )}

          <Field label="Nama Menu" required error={errors.name}>
            <input
              className={`input-base w-full ${errors.name ? 'border-red-400' : ''}`}
              value={name}
              placeholder="Nama menu"
              onChange={e => { setName(e.target.value); clearError('name'); }}
            />
          </Field>

          <Field label="Deskripsi">
            <textarea
              className="input-base min-h-[80px] resize-none w-full"
              value={description}
              placeholder="Deskripsi singkat menu..."
              onChange={e => setDescription(e.target.value)}
            />
          </Field>

          <Field label="Harga" required error={errors.price}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-400 font-medium pointer-events-none">
                Rp
              </span>
              <input
                className={`input-base pl-9 w-full ${errors.price ? 'border-red-400' : ''}`}
                type="number"
                min="0"
                value={price}
                placeholder="0"
                onChange={e => { setPrice(e.target.value); clearError('price'); }}
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
              {uploadLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengupload...</>
                : <><Upload className="w-4 h-4" /> Pilih Gambar</>
              }
            </button>
            {imagePreview && (
              <div className="relative mt-2 w-full">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-36 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                {uploadLoading && (
                  <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
            )}
          </Field>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card space-y-5"
        >
          <h2 className="font-display font-bold text-surface-900 dark:text-white text-base">Detail & Ketersediaan</h2>

          <Field label="Kategori">
            <select
              className="input-base w-full"
              value={category}
              onChange={e => setCategory(e.target.value as Category)}
            >
              {CATEGORY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Stok" error={errors.stock} hint="(opsional)">
            <input
              className={`input-base w-full ${errors.stock ? 'border-red-400' : ''}`}
              type="number"
              min="0"
              value={stock}
              placeholder="Kosongkan jika tidak dibatasi"
              onChange={e => { setStock(e.target.value); clearError('stock'); }}
            />
            <p className="text-xs text-surface-400 mt-1">Kosongkan jika stok tidak dibatasi</p>
          </Field>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-surface-800 dark:text-surface-200">Ketersediaan</p>
              <p className="text-xs text-surface-400">Tampilkan menu sebagai tersedia atau habis</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable(p => !p)}
              className={`transition-colors ${isAvailable ? 'text-primary-500' : 'text-surface-400'}`}
            >
              {isAvailable ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="flex gap-3"
      >
        <button
          onClick={() => navigate('/seller/menu')}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitLoading || saved || uploadLoading}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-70 ${
            saved ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400' : 'btn-primary'
          }`}
        >
          {saved
            ? <><Check className="w-4 h-4" /> Menu Dibuat!</>
            : submitLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
              : 'Buat Menu'
          }
        </button>
      </motion.div>
    </div>
  );
}