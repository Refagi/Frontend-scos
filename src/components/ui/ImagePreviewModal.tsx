import { useEffect, useState } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { resolveImageUrl } from '@/lib/resolveImageUrl';

interface ImagePreviewModalProps {
  src: string;
  title?: string;
  onClose: () => void;
}

export function ImagePreviewModal({ src, title = 'Gambar', onClose }: ImagePreviewModalProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-surface-800 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100 dark:border-surface-700">
          <h3 className="font-semibold text-sm text-surface-900 dark:text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1 text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 overflow-auto flex-1 flex items-center justify-center bg-surface-50 dark:bg-surface-900">
          {failed ? (
            <p className="text-sm text-surface-400 py-10">Gambar tidak dapat dimuat.</p>
          ) : (
            <img
              src={resolveImageUrl(src, 1200, 'limit')}
              alt={title}
              onError={() => setFailed(true)}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          )}
        </div>

        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-primary-600 dark:text-primary-400 border-t border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Buka gambar asli
        </a>
      </div>
    </div>
  );
}
