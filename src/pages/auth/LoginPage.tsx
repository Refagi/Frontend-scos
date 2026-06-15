import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

type LoginForm = {
  email: string;
  password: string;
};

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = 'Email wajib diisi.';
    if (!form.password.trim()) e.password = 'Password wajib diisi.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setError('');

    const result = await login(form);

    if (result.success && result.role) {
      const redirects: Record<string, string> = {
        admin: '/admin',
        seller: '/seller',
        customer: '/customer',
      };
      navigate(redirects[result.role] ?? '/customer');
    } else {
      setError(result.error || 'Email atau password salah.');
    }

    setIsSubmitting(false);
  };

  const demoAccounts = [
    { label: 'Admin', email: 'admin@gmail.com', password: 'admin@123#' },
    { label: 'Penjual', email: 'yum@gmail.com', password: 'seller@123#' },
    { label: 'Pelanggan', email: 'raka@gmail.com', password: 'customer@123#' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <div className="mb-6 text-center">
        <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white">
          Masuk ke Akun
        </h2>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Selamat datang kembali di SCOS
        </p>
      </div>

      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-3 mb-5">
        <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 mb-2">Demo Akun:</p>
        <div className="space-y-1">
          {demoAccounts.map((acc) => (
            <p key={acc.label} className="text-xs text-primary-600 dark:text-primary-500">
              <span className="font-medium">{acc.label}:</span> {acc.email} / {acc.password}
            </p>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="nama@gmail.com"
          icon={<Mail className="w-4 h-4" />}
          value={form.email}
          error={errors.email}
          onChange={(e) => {
            setForm((p) => ({ ...p, email: e.target.value }));
            setErrors((p) => ({ ...p, email: '' }));
          }}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Masukkan password"
          icon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          value={form.password}
          error={errors.password}
          onChange={(e) => {
            setForm((p) => ({ ...p, password: e.target.value }));
            setErrors((p) => ({ ...p, password: '' }));
          }}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl border border-red-200 dark:border-red-800"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <Button type="button" className="w-full" size="lg" loading={isSubmitting} onClick={handleSubmit}>
          Masuk
        </Button>
      </div>

      <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-5">
        Belum punya akun?{' '}
        <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
          Daftar di sini
        </Link>
      </p>
    </motion.div>
  );
}