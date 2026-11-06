import axios from 'axios';
import api from '@/lib/api/axios';
import type { ApiResponse } from '@/lib/api/types';

export const IMAGE_ALLOWED_MIME = ['image/png', 'image/jpeg'] as const;
export const IMAGE_ALLOWED_EXT = ['png', 'jpg', 'jpeg'] as const;
export const IMAGE_ACCEPT = 'image/png,image/jpeg';
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const IMAGE_RULE_TEXT = 'PNG, JPG, atau JPEG • maks. 10 MB';

export type UploadPurpose = 'avatar' | 'tenant' | 'qris' | 'menu';

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function validateImageFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mimeOk = (IMAGE_ALLOWED_MIME as readonly string[]).includes(file.type);
  const extOk = (IMAGE_ALLOWED_EXT as readonly string[]).includes(ext);

  if (!mimeOk || !extOk) return 'Format file harus PNG, JPG, atau JPEG.';
  if (file.size === 0) return 'File kosong atau rusak.';
  if (file.size > IMAGE_MAX_BYTES) {
    return `Ukuran file maksimal 10 MB (file ini ${formatBytes(file.size)}).`;
  }
  return null;
}

interface SignatureResponse {
  cloudName: string;
  apiKey: string;
  uploadUrl: string;
  params: Record<string, string | number>;
  allowedFormats: string[];
  maxFileSize: number;
}

interface UploadOptions {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

function readErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: unknown } })?.response?.data as
    | { message?: string; error?: { message?: string } }
    | undefined;

  const cloudinaryMsg = data?.error?.message?.toLowerCase();
  if (cloudinaryMsg) {
    if (cloudinaryMsg.includes('format')) return 'Format file tidak didukung. Gunakan PNG, JPG, atau JPEG.';
    if (cloudinaryMsg.includes('size') || cloudinaryMsg.includes('large')) return 'Ukuran file terlalu besar (maks. 10 MB).';
    if (cloudinaryMsg.includes('stale') || cloudinaryMsg.includes('signature')) return 'Sesi upload kedaluwarsa. Coba pilih gambar lagi.';
  }
  return data?.message ?? 'Gagal mengupload gambar. Periksa koneksi lalu coba lagi.';
}

export async function uploadImage(
  file: File,
  purpose: UploadPurpose,
  { onProgress, signal }: UploadOptions = {},
): Promise<string> {
  const invalid = validateImageFile(file);
  if (invalid) throw new UploadError(invalid);

  let sig: SignatureResponse;
  try {
    const res = await api.post<ApiResponse<SignatureResponse>>('/uploads/signature', { purpose }, { signal });
    if (!res.data?.data) throw new Error('empty');
    sig = res.data.data;
  } catch (err) {
    if (axios.isCancel(err)) throw err;
    throw new UploadError(readErrorMessage(err));
  }

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  Object.entries(sig.params).forEach(([key, value]) => form.append(key, String(value)));

  try {
    // axios polos (bukan instance  lib`api`): tidak boleh membawa cookie ke domain Cloudinary.
    const res = await axios.post<{ secure_url?: string }>(sig.uploadUrl, form, {
      signal,
      timeout: 60_000,
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
    if (!res.data?.secure_url) throw new Error('no url');
    return res.data.secure_url;
  } catch (err) {
    if (axios.isCancel(err)) throw err;
    throw new UploadError(readErrorMessage(err));
  }
}
