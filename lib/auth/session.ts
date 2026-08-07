// lib/auth/session.ts
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * 🔐 SESI AKTIF (HTTP-ONLY COOKIE), SEKALI PER REQUEST
 *
 * Dibungkus React cache(): satu render halaman bisa memanggilnya berkali-kali —
 * page memanggil, lalu tiap server action yang dipakainya memanggil lagi — dan
 * tanpa pembungkus ini setiap panggilan berarti satu perjalanan bolak-balik ke
 * database. Ke Supabase jarak jauh ongkosnya ~32ms sekali jalan, jadi halaman
 * yang memanggilnya empat kali membuang ~100ms hanya untuk menanyakan hal yang
 * sama. cache() menyimpan hasilnya selama satu request, lalu dibuang.
 */
const bacaSesi = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/**
 * 🔐 ID PENGGUNA UNTUK MEMUAT DATA HALAMAN — mengalihkan, bukan melempar.
 *
 * PAKAI INI DI SEMUA DATA LOADER (page, layout, dan fungsi yang dipanggil
 * saat render).
 *
 * Alasannya bukan selera. Gerbang sesi di app/(dashboard)/layout.tsx TIDAK
 * cukup: React sudah mulai merender segmen Suspense di halaman sebelum
 * redirect layout selesai, jadi tiap loader tetap jalan. Kalau mereka melempar
 * Error biasa, satu permintaan dengan cookie basi menghasilkan tumpukan error
 * tak tertangkap lebih dulu, baru kemudian 307 — persis yang terbaca di log:
 *
 *     ⨯ Error: Unauthorized ... at BagianSaldo
 *     ⨯ Error: Unauthorized ... at BagianTren
 *      GET /dashboard 307
 *
 * redirect() melempar NEXT_REDIRECT, yang dikenali Next sebagai alur kendali,
 * bukan kegagalan. Hasilnya sama-sama mendarat di /login, tanpa error palsu
 * yang menutupi error sungguhan di log.
 */
export async function requireUserId(): Promise<string> {
  const sessionData = await bacaSesi();

  if (!sessionData?.user) {
    // BUKAN "/login" langsung. proxy.ts hanya memeriksa keberadaan cookie, jadi
    // cookie basi membuatnya melempar /login kembali ke /transactions, lalu
    // layout melempar lagi ke /login — ERR_TOO_MANY_REDIRECTS. Rutenya
    // menghapus cookie dulu, baru mengantar ke halaman masuk.
    redirect("/api/sesi-berakhir");
  }

  return sessionData.user.id;
}

/**
 * 🔐 ID PENGGUNA UNTUK SERVER ACTION — melempar, bukan mengalihkan.
 *
 * Mutasi (simpan, hapus, ubah) memakai ini. Sebuah aksi yang gagal sebaiknya
 * mengembalikan pesan kesalahan supaya pemanggilnya bisa memutuskan apa yang
 * ditampilkan; mengalihkan halaman di tengah penyimpanan membuat pengguna
 * kehilangan isian yang belum tersimpan tanpa penjelasan.
 *
 * @throws {Error} Jika sesi tidak valid atau pengguna belum login.
 */
export async function getAuthenticatedUserId() {
  const sessionData = await bacaSesi();

  if (!sessionData || !sessionData.user) {
    throw new Error("Unauthorized: Silakan login kembali.");
  }

  return sessionData.user.id;
}

/** Sesi lengkap bila yang dibutuhkan bukan hanya id. Ikut cache yang sama. */
export async function getSession() {
  return bacaSesi();
}
