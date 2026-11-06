import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { resolveImageUrl } from '@/lib/resolveImageUrl';
import { uploadImage, UploadError, validateImageFile, type UploadPurpose } from '@/lib/upload';

export interface ImageUploadControl {
  preview: string;
  /** URL yang akan disimpan ('' jika kosong). */
  value: string;
  uploading: boolean;
  progress: number;
  error: string | null;
  dirty: boolean;
  payloadValue: string | null | undefined;
  selectFile: (file: File) => Promise<void>;
  remove: () => void;
  init: (url: string | null | undefined) => void;
}

export function useImageUpload(purpose: UploadPurpose): ImageUploadControl {
  const [initial, setInitial] = useState('');
  const [value, setValue] = useState('');
  const [localPreview, setLocalPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  /** blob: URL milik gambar yang sudah tersimpan di `value` */
  const committedBlobRef = useRef('');
  /** blob: URL milik upload yang sedang berjalan */
  const pendingBlobRef = useRef('');

  const revoke = (url: string) => {
    if (url) URL.revokeObjectURL(url);
  };

  const releaseAll = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    revoke(pendingBlobRef.current);
    revoke(committedBlobRef.current);
    pendingBlobRef.current = '';
    committedBlobRef.current = '';
  }, []);

  useEffect(() => releaseAll, [releaseAll]);

  const init = useCallback(
    (url: string | null | undefined) => {
      releaseAll();
      const next = url ?? '';
      setInitial(next);
      setValue(next);
      setLocalPreview('');
      setUploading(false);
      setProgress(0);
      setError(null);
    },
    [releaseAll],
  );

  const remove = useCallback(() => {
    releaseAll();
    setValue('');
    setLocalPreview('');
    setUploading(false);
    setProgress(0);
    setError(null);
  }, [releaseAll]);

  const selectFile = useCallback(
    async (file: File) => {
      const invalid = validateImageFile(file);
      if (invalid) {
        setError(invalid);
        return;
      }

      // Batalkan upload sebelumnya yang masih berjalan.
      abortRef.current?.abort();
      revoke(pendingBlobRef.current);

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const blob = URL.createObjectURL(file);
      pendingBlobRef.current = blob;
      setLocalPreview(blob);
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        const url = await uploadImage(file, purpose, { signal: ctrl.signal, onProgress: setProgress });
        if (ctrl.signal.aborted) return;

        revoke(committedBlobRef.current);
        committedBlobRef.current = blob;
        pendingBlobRef.current = '';
        setValue(url);
      } catch (err) {
        // Dibatalkan oleh aksi lain (pilih ulang / hapus): aksi itu yang mengatur state.
        if (ctrl.signal.aborted || axios.isCancel(err)) return;

        // Gagal: kembalikan tampilan ke gambar yang sebelumnya tersimpan.
        revoke(blob);
        pendingBlobRef.current = '';
        setLocalPreview(committedBlobRef.current);
        setError(err instanceof UploadError ? err.message : 'Gagal mengupload gambar. Coba lagi.');
      } finally {
        if (abortRef.current === ctrl) {
          abortRef.current = null;
          setUploading(false);
        }
      }
    },
    [purpose],
  );

  const dirty = value !== initial;

  return {
    preview: localPreview || resolveImageUrl(value, 640, purpose === 'qris' ? 'limit' : 'fill'),
    value,
    uploading,
    progress,
    error,
    dirty,
    payloadValue: dirty ? value || null : undefined,
    selectFile,
    remove,
    init,
  };
}

/**
 * Helper payload: `...imagePatch('image', image)` menambahkan field hanya jika berubah.
 */
export function imagePatch<K extends string>(
  key: K,
  control: Pick<ImageUploadControl, 'payloadValue'>,
): Partial<Record<K, string | null>> {
  return control.payloadValue === undefined
    ? {}
    : ({ [key]: control.payloadValue } as Record<K, string | null>);
}
