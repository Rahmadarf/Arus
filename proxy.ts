import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { NAMA_COOKIE_SESSION } from "@/lib/auth/types";

// ============================================================================
// Proxy ini HANYA mengecek keberadaan cookie. Verifikasi tanda tangan dan
// masa berlaku token WAJIB dilakukan backend di setiap request. Jangan pernah
// anggap berkas ini sebagai lapisan keamanan — siapa pun bisa membuat cookie
// bernama 'session' berisi apa saja dari devtools dan lolos dari sini.
//
// Tugasnya cuma satu: menghemat satu putaran render dengan mengarahkan
// pengguna ke halaman yang tepat.
//
// CATATAN VERSI: di Next.js 16 konvensi `middleware.ts` sudah deprecated dan
// diganti `proxy.ts` dengan fungsi bernama `proxy`. Perilakunya sama.
// ============================================================================

/** Halaman yang hanya masuk akal saat BELUM login. */
const RUTE_TAMU = ["/login", "/register", "/forgot-password"];

/**
 * Halaman publik yang boleh dibuka siapa pun, login atau tidak.
 *
 * "/" ada di sini, BUKAN di RUTE_TAMU. Sebelumnya ia diperlakukan sebagai rute
 * tamu, sehingga pengunjung yang sudah punya session langsung dialihkan ke
 * /transactions dan landing page-nya tidak pernah terlihat. Landing page perlu
 * bisa dibuka dalam kedua keadaan, karena tombolnya sendiri yang berubah:
 * "Mulai Gratis" untuk tamu, "Buka Dashboard" untuk yang sudah masuk.
 *
 * Dicocokkan persis, bukan lewat prefiks — "/" adalah awalan semua rute.
 */
const RUTE_PUBLIK_PERSIS = ["/"];

/** Tujuan setelah login kalau tidak ada callbackUrl yang sah. */
const BERANDA_TERAUTENTIKASI = "/transactions";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const punyaSession = NAMA_COOKIE_SESSION.some(
    (nama) => Boolean(request.cookies.get(nama)?.value)
  );

  const halamanPublik = RUTE_PUBLIK_PERSIS.includes(pathname);
  const halamanTamu = RUTE_TAMU.some(
    (rute) => pathname === rute || pathname.startsWith(`${rute}/`)
  );

  // Halaman publik dibiarkan lewat apa pun status loginnya.
  if (halamanPublik) {
    return NextResponse.next();
  }

  // Sudah login tapi membuka halaman masuk/daftar — tidak ada gunanya.
  if (punyaSession && halamanTamu) {
    return NextResponse.redirect(new URL(BERANDA_TERAUTENTIKASI, request.url));
  }

  // Belum login dan membuka halaman dashboard mana pun.
  if (!punyaSession && !halamanTamu) {
    const tujuan = new URL("/login", request.url);

    // Simpan alamat asal supaya setelah masuk pengguna kembali ke sana.
    // Query ikut dibawa agar filter dan tab yang sudah dipilih tidak hilang.
    tujuan.searchParams.set("callbackUrl", `${pathname}${search}`);

    return NextResponse.redirect(tujuan);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Cocokkan semua rute KECUALI aset dan API. Tanpa pengecualian ini, logika
   * redirect di atas ikut memblokir CSS, JS, gambar, dan font.
   */
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?)$).*)",
  ],
};
