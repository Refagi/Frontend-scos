import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon, Mail, Lock, Eye, EyeOff, Phone,
  MapPin, Store, ChevronLeft, Check, ShieldCheck,
  AlertTriangle, Loader2, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin.api';
import type { TambahAkunPayload } from '@/lib/api/types';
import type { UserRole } from '@/types';
import { AxiosError } from 'axios';
import type { ErrorResponse } from '@/lib/api/types';
import { Field } from '@/components/ui/Field';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin',    label: 'Admin'     },
  { value: 'seller',   label: 'Penjual'   },
  { value: 'customer', label: 'Pelanggan' },
];


function InputIcon({
  icon, error, ...props
}: { icon: React.ReactNode; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none">
        {icon}
      </span>
      <input
        className={`input-base pl-9 w-full ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
        {...props}
      />
    </div>
  );
}

export function AdminTambahAkun() {
  const navigate = useNavigate();

  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [phone,       setPhone]       = useState('');
  const [role,        setRole]        = useState<UserRole>('customer');
  const [status,      setStatus]      = useState<'active' | 'non-active'>('active');
  // seller fields
  const [storeName,   setStoreName]   = useState('');
  const [description, setDescription] = useState('');
  const [location,    setLocation]    = useState('');
  const [isOpen,      setIsOpen]      = useState(true);
  const [openLabel,   setOpenLabel]   = useState('');
  const [qrisImage,   setQrisImage]   = useState('');

  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [saved,         setSaved]         = useState(false);

  const isSeller = role === 'seller';
  const initials = name ? name.charAt(0).toUpperCase() : '+';

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())                      e.name     = 'Nama wajib diisi.';
    if (!email.trim())                     e.email    = 'Email wajib diisi.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Format email tidak valid.';
    if (password.length < 6)              e.password = 'Kata sandi minimal 6 karakter.';
    if (phone && phone.length < 9)        e.phone    = 'Nomor HP minimal 9 karakter.';
    if (isSeller) {
      if (!storeName.trim()) e.storeName = 'Nama toko wajib diisi untuk penjual.';
      if (!location.trim())  e.location  = 'Lokasi wajib diisi untuk penjual.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearError = (key: string) => setErrors(p => ({ ...p, [key]: '' }));

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitLoading(true);

    const payload: TambahAkunPayload = {
      name:     name.trim(),
      email:    email.trim(),
      password,
      role,
      status,
      ...(phone && { phone }),
      ...(isSeller && {
        storeName,
        description,
        location,
        isOpen,
        openLabel,
        qrisImage,
      }),
    };

    try {
      await adminApi.tambahAkun(payload);
      setSaved(true);
      setTimeout(() => navigate('/admin/akun'), 1200);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const msg = axiosError.response?.data?.message ?? 'Gagal membuat akun.';
      if (axiosError.response?.status === 409) {
        setErrors(p => ({ ...p, email: msg }));
      } else {
        setErrors(p => ({ ...p, _global: msg }));
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/akun')}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-surface-500 hover:text-surface-800 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="page-title">Tambah Akun</h1>
          <p className="page-subtitle">Buat akun pengguna baru.</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.06 }}
        className="card flex items-center gap-4"
      >
        <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-display font-bold text-2xl shadow-green-md flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-surface-900 dark:text-white truncate">{name || 'Nama Pengguna'}</p>
          <p className="text-sm text-surface-400 truncate">{email || 'email@contoh.com'}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 px-2 py-0.5 rounded-full capitalize">
              <ShieldCheck className="w-3 h-3" />
              {ROLE_OPTIONS.find(r => r.value === role)?.label}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              status === 'active'
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            }`}>
              {status === 'active' ? 'Aktif' : 'Non-Aktif'}
            </span>
          </div>
        </div>
      </motion.div>

      <div className={`grid gap-6 ${isSeller ? 'md:grid-cols-2' : 'max-w-2xl mx-auto'}`}>

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
            <InputIcon
              icon={<UserIcon />} error={errors.name}
              value={name} placeholder="Nama lengkap"
              onChange={e => { setName(e.target.value); clearError('name'); }}
            />
          </Field>

          <Field label="Alamat E-Mail" required error={errors.email}>
            <InputIcon
              icon={<Mail />} error={errors.email}
              type="email" value={email} placeholder="nama@email.com"
              onChange={e => { setEmail(e.target.value); clearError('email'); }}
            />
          </Field>

          <Field label="Kata Sandi" required error={errors.password}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none">
                <Lock />
              </span>
              <input
                className={`input-base pl-9 pr-10 w-full ${errors.password ? 'border-red-400' : ''}`}
                type={showPw ? 'text' : 'password'}
                value={password} placeholder="Min. 6 karakter"
                onChange={e => { setPassword(e.target.value); clearError('password'); }}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <Field label="Nomor HP" error={errors.phone}>
            <InputIcon
              icon={<Phone />} error={errors.phone}
              value={phone} placeholder="08xxxxxxxxxx"
              onChange={e => { setPhone(e.target.value); clearError('phone'); }}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Role">
              <select
                className="input-base"
                value={role}
                onChange={e => { setRole(e.target.value as UserRole); setErrors({}); }}
              >
                {ROLE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                className="input-base"
                value={status}
                onChange={e => setStatus(e.target.value as 'active' | 'non-active')}
              >
                <option value="active">Aktif</option>
                <option value="non-active">Non-Aktif</option>
              </select>
            </Field>
          </div>
        </motion.div>

        {isSeller && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="card space-y-5"
          >
            <h2 className="font-display font-bold text-surface-900 dark:text-white text-base">Informasi Toko</h2>

            <Field label="Nama Toko" required error={errors.storeName}>
              <InputIcon
                icon={<Store />} error={errors.storeName}
                value={storeName} placeholder="Nama kantin / toko"
                onChange={e => { setStoreName(e.target.value); clearError('storeName'); }}
              />
            </Field>

            <Field label="Lokasi" required error={errors.location}>
              <InputIcon
                icon={<MapPin />} error={errors.location}
                value={location} placeholder="Lokasi toko"
                onChange={e => { setLocation(e.target.value); clearError('location'); }}
              />
            </Field>

            <Field label="Deskripsi">
              <textarea
                className="input-base min-h-[80px] resize-none w-full"
                value={description} placeholder="Deskripsi singkat toko..."
                onChange={e => setDescription(e.target.value)}
              />
            </Field>

            <Field label="Label Jam Buka">
              <input
                className="input-base w-full"
                value={openLabel} placeholder="cth: Buka 07.00–15.00"
                onChange={e => setOpenLabel(e.target.value)}
              />
            </Field>

            <Field label="URL QRIS">
              <input
                className="input-base w-full"
                value={qrisImage} placeholder="https://..."
                onChange={e => setQrisImage(e.target.value)}
              />
            </Field>

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-surface-800 dark:text-surface-200">Status Toko</p>
                <p className="text-xs text-surface-400">Tampilkan toko sebagai buka atau tutup</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(p => !p)}
                className={`transition-colors ${isOpen ? 'text-primary-500' : 'text-surface-400'}`}
              >
                {isOpen ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className={`flex gap-3 ${isSeller ? 'max-w-5xl mx-auto' : 'max-w-2xl mx-auto'}`}>
        <button
          onClick={() => navigate('/admin/akun')}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitLoading || saved}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-70 ${
            saved ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400' : 'btn-primary'
          }`}
        >
          {saved
            ? <><Check className="w-4 h-4" /> Akun Dibuat!</>
            : submitLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
              : 'Buat Akun'
          }
        </button>
      </motion.div>
    </div>
  );
}