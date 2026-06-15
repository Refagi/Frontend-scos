import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User as UserIcon, Mail, Phone, Lock, Eye, EyeOff, Check, ShieldCheck, AlertTriangle, Loader2, ChevronLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { profileApi } from "@/lib/api/profile.api";
import type { UpdateProfilePayload } from "@/lib/api/profile.api";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/lib/api/types";
import { Field } from "@/components/ui/Field";

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
      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400">
        {icon}
      </span>
      <input
        className={`input-base pl-9 w-full ${error ? "border-red-400" : ""}`}
        {...props}
      />
    </div>
  );
}

export function Profile() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState(() => user?.name ?? "");
  const [email, setEmail] = useState(() => user?.email ?? "");
  const [phone, setPhone] = useState(() => user?.phone ?? "");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const [infoErrors, setInfoErrors] = useState<Record<string, string>>({});
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [infoLoading, setInfoLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const validateInfo = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Nama wajib diisi.";
    if (!email.trim()) e.email = "Email wajib diisi.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Format email tidak valid.";
    if (phone && phone.length < 9) e.phone = "Nomor HP minimal 9 karakter.";
    setInfoErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePw = () => {
    const e: Record<string, string> = {};
    if (!currentPw) e.currentPw = "Masukkan kata sandi saat ini.";
    if (newPw.length < 8) e.newPw = "Kata sandi baru minimal 8 karakter.";
    if (newPw !== confirmPw) e.confirmPw = "Konfirmasi kata sandi tidak cocok.";
    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveInfo = async () => {
    if (!validateInfo()) return;
    setInfoLoading(true);

    const payload: UpdateProfilePayload = {
      name: name.trim(),
      email: email.trim(),
      ...(phone && { phone: phone.trim() }),
    };

    try {
      const res = await profileApi.updateProfile(payload);
      const updated = res.data?.data;
      if (updated) setUser(updated);
      setInfoSaved(true);
      setTimeout(() => setInfoSaved(false), 2500);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const msg =
        axiosError.response?.data?.message ?? "Gagal menyimpan profil.";
      if (axiosError.response?.status === 409) {
        setInfoErrors((p) => ({ ...p, email: msg }));
      } else {
        setInfoErrors((p) => ({ ...p, _global: msg }));
      }
    } finally {
      setInfoLoading(false);
    }
  };

  const handleSavePw = async () => {
    if (!validatePw()) return;
    setPwLoading(true);

    try {
      await profileApi.changePassword({
        currentPassword: currentPw,
        newPassword: newPw,
      });
      setPwSaved(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const msg =
        axiosError.response?.data?.message ?? "Gagal mengubah kata sandi.";
      setPwErrors((p) => ({ ...p, _global: msg }));
    } finally {
      setPwLoading(false);
    }
  };

  const initials = name ? name.charAt(0).toUpperCase() : "?";

  return (
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
          <h1 className="page-title">Edit Profil</h1>
          <p className="page-subtitle">
            Perbarui informasi akun dan keamanan Anda.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.06 }}
        className="card flex items-start gap-5"
      >
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-display font-bold text-3xl shadow-green-md">
            {initials}
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-surface-900 dark:text-white text-lg leading-tight truncate">
            {name || "—"}
          </p>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5 truncate">
            {email || "—"}
          </p>
          <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2.5 py-1 rounded-full capitalize">
            <ShieldCheck className="w-3 h-3" /> {user?.role}
          </span>
        </div>
      </motion.div>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-start`}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card space-y-5"
        >
          <h2 className="font-display font-bold text-surface-900 dark:text-white text-base">
            Informasi Pribadi
          </h2>

          {infoErrors._global && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />{" "}
              {infoErrors._global}
            </div>
          )}

          <Field label="Nama Lengkap" required error={infoErrors.name}>
            <InputIcon
              icon={<UserIcon />}
              error={infoErrors.name}
              value={name}
              placeholder="Nama lengkap"
              onChange={(e) => {
                setName(e.target.value);
                setInfoErrors((p) => ({ ...p, name: "" }));
              }}
            />
          </Field>

          <Field label="Alamat E-Mail" required error={infoErrors.email}>
            <InputIcon
              icon={<Mail />}
              error={infoErrors.email}
              type="email"
              value={email}
              placeholder="nama@email.com"
              onChange={(e) => {
                setEmail(e.target.value);
                setInfoErrors((p) => ({ ...p, email: "" }));
              }}
            />
          </Field>

          <Field label="Nomor HP" error={infoErrors.phone}>
            <InputIcon
              icon={<Phone />}
              error={infoErrors.phone}
              value={phone}
              placeholder="08xxxxxxxxxx"
              onChange={(e) => {
                setPhone(e.target.value);
                setInfoErrors((p) => ({ ...p, phone: "" }));
              }}
            />
          </Field>

          <button
            onClick={() => void handleSaveInfo()}
            disabled={infoLoading || infoSaved}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-70 ${
              infoSaved
                ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400"
                : "btn-primary"
            }`}
          >
            {infoSaved ? (
              <>
                <Check className="w-4 h-4" /> Tersimpan!
              </>
            ) : infoLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              "Simpan Informasi"
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="card space-y-5 max-w-lg"
        >
          <h2 className="font-display font-bold text-surface-900 dark:text-white text-base">
            Ubah Kata Sandi
          </h2>
          {pwErrors._global && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />{" "}
              {pwErrors._global}
            </div>
          )}

          <Field label="Kata Sandi Saat Ini" error={pwErrors.currentPw}>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                className={`input-base pl-9 pr-10 w-full ${pwErrors.currentPw ? "border-red-400" : ""}`}
                type={showCur ? "text" : "password"}
                value={currentPw}
                placeholder="••••••••"
                onChange={(e) => {
                  setCurrentPw(e.target.value);
                  setPwErrors((p) => ({ ...p, currentPw: "" }));
                }}
              />
              <button
                type="button"
                onClick={() => setShowCur((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
              >
                {showCur ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </Field>

          <Field label="Kata Sandi Baru" error={pwErrors.newPw}>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                className={`input-base pl-9 pr-10 w-full ${pwErrors.newPw ? "border-red-400" : ""}`}
                type={showNew ? "text" : "password"}
                value={newPw}
                placeholder="Min. 8 karakter"
                onChange={(e) => {
                  setNewPw(e.target.value);
                  setPwErrors((p) => ({ ...p, newPw: "" }));
                }}
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
              >
                {showNew ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </Field>

          <Field label="Konfirmasi Kata Sandi Baru" error={pwErrors.confirmPw}>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                className={`input-base pl-9 pr-10 w-full ${pwErrors.confirmPw ? "border-red-400" : ""}`}
                type={showConf ? "text" : "password"}
                value={confirmPw}
                placeholder="Ulangi kata sandi baru"
                onChange={(e) => {
                  setConfirmPw(e.target.value);
                  setPwErrors((p) => ({ ...p, confirmPw: "" }));
                }}
              />
              <button
                type="button"
                onClick={() => setShowConf((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
              >
                {showConf ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </Field>

          <button
            onClick={() => void handleSavePw()}
            disabled={pwLoading || pwSaved}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-70 ${
              pwSaved
                ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400"
                : "btn-primary"
            }`}
          >
            {pwSaved ? (
              <>
                <Check className="w-4 h-4" /> Kata Sandi Diperbarui!
              </>
            ) : pwLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              "Ubah Kata Sandi"
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
