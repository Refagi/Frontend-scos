import { useRef, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { Field } from '@/components/ui/Field';
import type { ImageUploadControl } from '@/hooks/useImageUpload';
import { IMAGE_ACCEPT, IMAGE_RULE_TEXT } from '@/lib/upload';

interface ImageUploadFieldProps {
  label: string;
  upload: ImageUploadControl;
  /** Keterangan tambahan sebelum aturan format/ukuran. */
  hint?: string;
  /** 'contain' untuk gambar yang tidak boleh terpotong (mis. QRIS). */
  fit?: 'cover' | 'contain';
  /** Preview lebih tinggi (untuk screenshot / bukti bayar yang memanjang). */
  tall?: boolean;
  required?: boolean;
}

export function ImageUploadField({ label, upload, hint, fit = 'cover', tall = false, required }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [brokenSrc, setBrokenSrc] = useState('');

  const { preview, uploading, progress, error } = upload;
  const showPreview = !!preview && brokenSrc !== preview;

  const pick = (file?: File) => {
    if (file) void upload.selectFile(file);
  };

  return (
    <Field label={label} required={required} error={error ?? undefined}>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = ''; // izinkan memilih file yang sama lagi
        }}
      />

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!uploading) pick(e.dataTransfer.files?.[0]);
        }}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed text-sm transition-colors disabled:opacity-60 ${
          dragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
            : 'border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {progress < 100 ? `Mengupload... ${progress}%` : 'Memproses...'}
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            {preview ? 'Ganti Gambar' : 'Pilih atau seret gambar'}
          </>
        )}
      </button>

      {uploading && (
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-1.5 mt-2 rounded-full bg-surface-100 dark:bg-surface-700 overflow-hidden"
        >
          <div className="h-full bg-primary-500 transition-all duration-150" style={{ width: `${progress}%` }} />
        </div>
      )}

      <p className="text-xs text-surface-400 mt-1">
        {hint ? `${hint} · ` : ''}
        {IMAGE_RULE_TEXT}
      </p>

      {showPreview && (
        <div className="relative mt-2">
          <img
            src={preview}
            alt={`Preview ${label}`}
            onError={() => setBrokenSrc(preview)}
            className={`w-full ${tall ? 'h-64' : 'h-36'} rounded-xl ${
              fit === 'contain' ? 'object-contain bg-surface-50 dark:bg-surface-800' : 'object-cover'
            }`}
          />
          <button
            type="button"
            onClick={upload.remove}
            aria-label={uploading ? 'Batalkan upload' : 'Hapus gambar'}
            className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
          {uploading && <div className="absolute inset-0 bg-black/30 rounded-xl pointer-events-none" />}
        </div>
      )}
    </Field>
  );
}
