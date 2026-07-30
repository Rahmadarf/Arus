import { cookies } from "next/headers";

import { NAMA_COOKIE_SESSION } from "@/lib/auth/types";

/**
 * Satu-satunya sumber kebenaran status login untuk landing page.
 *
 * Dibaca di server lewat next/headers, bukan di klien: kalau statusnya baru
 * diketahui setelah hidrasi, tombol "Mulai Gratis" akan sempat berkedip di
 * layar pengguna yang sebenarnya sudah masuk.
 *
 * Ini hanya memeriksa KEBERADAAN cookie, bukan keabsahannya — sama seperti
 * proxy.ts. Cukup untuk memilih tombol mana yang ditampilkan; tidak cukup
 * untuk melindungi apa pun. Halaman yang butuh perlindungan tetap harus
 * memverifikasi session di server.
 */
export async function isLoggedIn(): Promise<boolean> {
  const store = await cookies();
  return NAMA_COOKIE_SESSION.some((nama) => Boolean(store.get(nama)?.value));
}
