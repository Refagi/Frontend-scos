import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Field } from '@/components/ui/Field';

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
        className={`input-base pl-9 w-full ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
        {...props}
      />
    </div>
  );
}

export function RegisterPage() {
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();

  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [showConfPw,  setShowConfPw]  = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [loading,     setLoading]     = useState(false);

  const clearError = (key: string) => setErrors(p => ({ ...p, [key]: '' }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())                      e.name      = 'Nama wajib diisi.';
    else if (name.trim().length < 3)       e.name      = 'Nama minimal 3 karakter.';
    if (!email.trim())                     e.email     = 'Email wajib diisi.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email     = 'Format email tidak valid.';
    if (!password)                         e.password  = 'Kata sandi wajib diisi.';
    else if (password.length < 6)         e.password  = 'Kata sandi minimal 6 karakter.';
    if (!confirmPw)                        e.confirmPw = 'Konfirmasi kata sandi wajib diisi.';
    else if (password !== confirmPw)       e.confirmPw = 'Konfirmasi kata sandi tidak cocok.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const result = await registerUser({
      name:     name.trim(),
      email:    email.trim(),
      password,
    });

    if (result.success) {
      navigate('/auth/login');
    } else {
      setErrors(p => ({ ...p, _global: result.error ?? 'Registrasi gagal. Silakan coba lagi.' }));
    }

    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white">
          Daftar Akun Baru
        </h2>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Bergabung dengan SCOS sekarang
        </p>
      </div>

      {errors._global && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl border border-red-200 dark:border-red-800 mb-4"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errors._global}
        </motion.div>
      )}

      <div className="space-y-4">

        <Field label="Nama Lengkap" required error={errors.name}>
          <InputIcon
            icon={<User />}
            error={errors.name}
            value={name}
            placeholder="Nama lengkap Anda"
            autoComplete="name"
            onChange={e => { setName(e.target.value); clearError('name'); }}
          />
        </Field>

        <Field label="Email" required error={errors.email}>
          <InputIcon
            icon={<Mail />}
            error={errors.email}
            type="email"
            value={email}
            placeholder="nama@email.com"
            autoComplete="email"
            onChange={e => { setEmail(e.target.value); clearError('email'); }}
          />
        </Field>

        <Field label="Kata Sandi" required error={errors.password}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none">
              <Lock />
            </span>
            <input
              className={`input-base pl-9 pr-10 w-full ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
              type={showPw ? 'text' : 'password'}
              value={password}
              placeholder="Min. 6 karakter"
              autoComplete="new-password"
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

        <Field label="Konfirmasi Kata Sandi" required error={errors.confirmPw}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none">
              <Lock />
            </span>
            <input
              className={`input-base pl-9 pr-10 w-full ${errors.confirmPw ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
              type={showConfPw ? 'text' : 'password'}
              value={confirmPw}
              placeholder="Ulangi kata sandi"
              autoComplete="new-password"
              onChange={e => { setConfirmPw(e.target.value); clearError('confirmPw'); }}
            />
            <button
              type="button"
              onClick={() => setShowConfPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
            >
              {showConfPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>

        <button
          onClick={() => void handleSubmit()}
          disabled={loading}
          className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Mendaftar...</>
            : 'Daftar Sekarang'
          }
        </button>
      </div>

      <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-5">
        Sudah punya akun?{' '}
        <Link to="/auth/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
          Masuk di sini
        </Link>
      </p>
    </motion.div>
  );
}