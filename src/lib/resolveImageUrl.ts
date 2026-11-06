const UPLOAD_MARKER = '/upload/';

/**
 * Mengubah URL gambar menjadi URL yang siap tampil.
 *  - URL Cloudinary: disisipi transformasi (ukuran + kualitas/format otomatis) tepat setelah
 *    "/upload/", jadi cloud name & versi aslinya TIDAK diubah (bekerja pada cloud mana pun).
 *  - Path lokal ("/kantinBunda/...") atau URL lain: dikembalikan apa adanya.
 *
 * crop:
 *  - 'fill'  -> dipotong persegi (cocok untuk foto menu/tenant/avatar)
 *  - 'limit' -> dikecilkan tanpa dipotong (wajib untuk QRIS agar kode tidak terpotong)
 */
export function resolveImageUrl(
  raw: string | null | undefined,
  size = 400,
  crop: 'fill' | 'limit' = 'fill',
): string {
  if (!raw) return '';

  const idx = raw.indexOf(UPLOAD_MARKER);
  if (idx === -1 || !raw.includes('res.cloudinary.com')) return raw;

  const transform =
    crop === 'fill'
      ? `c_fill,g_auto,w_${size},h_${size},q_auto,f_auto`
      : `c_limit,w_${size},h_${size},q_auto,f_auto`;

  const head = raw.slice(0, idx + UPLOAD_MARKER.length);
  const tail = raw.slice(idx + UPLOAD_MARKER.length);
  return `${head}${transform}/${tail}`;
}
