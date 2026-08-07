import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { NAMA_COOKIE_SESSION } from "@/lib/auth/types";
import { safeCallbackUrl } from "@/lib/auth/callback-url";

/**
 * 🚪 BERSIHKAN COOKIE SESI YANG SUDAH TIDAK SAH, LALU KE HALAMAN MASUK.
 *
 * Ada karena mengalihkan langsung ke /login TIDAK cukup, dan gagalnya
 * berbentuk lingkaran tak berujung:
 *
 *   proxy.ts melihat cookie ada  -> "sudah login", /login dilempar ke /transactions
 *   layout memvalidasi sesi      -> tidak sah, dilempar kembali ke /login
 *   ...berulang sampai browser menyerah: ERR_TOO_MANY_REDIRECTS
 *
 * proxy.ts sengaja hanya memeriksa keberadaan cookie (ia berjalan di edge dan
 * tidak boleh menyentuh database), jadi rantai itu hanya bisa diputus dengan
 * MENGHAPUS cookienya. Render halaman dan layout tidak bisa menulis cookie —
 * hanya Route Handler yang bisa, dan itulah sebabnya berkas ini ada.
 *
 * Berada di bawah /api sehingga tidak ikut tercakup matcher proxy.ts, jadi ia
 * sendiri tidak mungkin ikut terlempar.
 */
export function GET(request: NextRequest) {
  const callbackUrl = safeCallbackUrl(
    request.nextUrl.searchParams.get("callbackUrl")
  );

  const tujuan = new URL("/login", request.url);
  tujuan.searchParams.set("callbackUrl", callbackUrl);

  const response = NextResponse.redirect(tujuan);

  // Semua varian nama dihapus sekaligus: nama cookie berbeda antara http dan
  // https (awalan __Secure-), dan menebak salah satu berarti lingkarannya
  // kembali lagi.
  for (const nama of NAMA_COOKIE_SESSION) {
    response.cookies.delete(nama);
  }

  return response;
}
