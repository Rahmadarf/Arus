// lib/auth/mock.ts
"use client"; // Wajib klien agar kuki otomatis ditulis oleh browser

import { AuthFailure, type AuthError, type Session, type User } from "@/lib/auth/types";

export const DEMO_EMAIL = "rahmad@arus.com";
export const DEMO_PASSWORD = "password123";

/** Bentuk balasan sukses dari endpoint sign-in/sign-up Better Auth. */
type AuthResponseBody = {
  error?: unknown;
  user: Pick<User, "id" | "name" | "email" | "createdAt">;
};

/**
 * Panggil endpoint auth dan kembalikan body-nya sebagai objek.
 *
 * Dulu setiap pemanggil langsung melakukan `await response.json()`. Saat rute
 * /api/auth balas 500 dengan badan kosong — persis yang terjadi ketika koneksi
 * database putus — `json()` melempar SyntaxError, error itu lolos sebagai
 * "bukan AuthFailure", dan form menampilkan "Gagal terhubung ke server" untuk
 * masalah yang sebenarnya ada di server. Di sini status HTTP dipetakan lebih
 * dulu supaya pesannya jujur.
 *
 * @param path - Jalur endpoint di bawah /api/auth.
 * @param init - Opsi fetch tambahan.
 * @param kegagalanKlien - Kode yang dipakai saat server menolak dengan 4xx.
 */
async function requestAuth(
  path: string,
  init: RequestInit,
  kegagalanKlien: AuthError
): Promise<AuthResponseBody> {
  let response: Response;

  try {
    response = await fetch(`/api/auth/${path}`, {
      ...init,
      credentials: "include",
    });
  } catch {
    // Hanya di sini koneksi benar-benar tidak sampai ke server.
    throw new AuthFailure("NETWORK_ERROR");
  }

  const teks = await response.text();

  let body: Partial<AuthResponseBody> | null = null;
  try {
    body = teks ? (JSON.parse(teks) as Partial<AuthResponseBody>) : null;
  } catch {
    body = null;
  }

  if (response.status === 429) {
    throw new AuthFailure("RATE_LIMITED");
  }

  if (response.status >= 500) {
    // Badan 500 sering kosong; log mentahnya supaya penyebab asli tetap terlihat
    // di devtools alih-alih hilang di balik pesan ramah.
    console.error(`[auth] ${path} balas ${response.status}:`, teks || "(kosong)");
    throw new AuthFailure("SERVER_ERROR");
  }

  // `user` ikut dijaga di sini, bukan di masing-masing pemanggil: balasan 200
  // tanpa user berarti kontraknya berubah, dan itu bukan kesalahan pengguna.
  if (!response.ok || !body || body.error || !body.user) {
    throw new AuthFailure(kegagalanKlien);
  }

  return { ...body, user: body.user };
}

/**
 * 🚀 MASUK AKUN MELALUI FETCH API
 * Mengirimkan kredensial masuk ke endpoint internal Better Auth dan mengelola sesi otomatis via kuki browser.
 * @param {string} email - Alamat surel pengguna.
 * @param {string} password - Kata sandi pengguna.
 * @param {boolean} [remember=false] - Bendera mengingat sesi setelah browser ditutup.
 * @returns {Promise<Session>} Objek sesi yang berhasil dibuat.
 * @throws {AuthFailure} Jika kredensial ditolak oleh server.
 */
export async function login(email: string, password: string, remember = false): Promise<Session> {
  // Panggil endpoint Better Auth untuk masuk
  const result = await requestAuth(
    "sign-in/email",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password: password,
        dontRememberSession: !remember,
      }),
    },
    "INVALID_CREDENTIALS"
  );

  // Kuki sesi otomatis tertanam di browser oleh Better Auth
  return {
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      createdAt: result.user.createdAt,
    },
    expiresAt: new Date(Date.now() + 24 * 3600_000).toISOString(),
  };
}

/**
 * ➕ PENDAFTARAN AKUN MELALUI FETCH API
 * Mendaftarkan akun baru dan menginisiasi sesi otomatis setelah registrasi berhasil.
 * @param {string} name - Nama lengkap pengguna.
 * @param {string} email - Alamat surel baru.
 * @param {string} password - Kata sandi untuk akun baru.
 * @returns {Promise<Session>} Objek sesi pengguna yang baru terdaftar.
 * @throws {AuthFailure} Jika surel sudah terpakai atau proses gagal.
 */
export async function register(name: string, email: string, password: string): Promise<Session> {
  const result = await requestAuth(
    "sign-up/email",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password: password,
        name: name.trim(),
      }),
    },
    "EMAIL_TAKEN"
  );

  return {
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      createdAt: result.user.createdAt,
    },
    expiresAt: new Date(Date.now() + 24 * 3600_000).toISOString(),
  };
}

/**
 * 📥 AMBIL SESI AKTIF MELALUI FETCH API
 * Memeriksa apakah kuki sesi masih berlaku dan mengembalikan data pengguna, atau null bila tidak ada.
 * @returns {Promise<Session | null>} Objek sesi aktif atau null jika tidak terautentikasi.
 */
export async function getSession(): Promise<Session | null> {
  try {
    const response = await fetch("/api/auth/get-session");

    if (!response.ok) return null;

    const result = await response.json();
    if (!result || !result.user) return null;

    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        createdAt: result.user.createdAt,
      },
      expiresAt: result.session.expiresAt,
    };
  } catch (error) {
    console.error("Gagal menarik getSession API:", error);
    return null;
  }
}

/**
 * 🗑️ KELUAR AKUN MELALUI FETCH API
 * Menghancurkan sesi di server dengan mengirim kuki HttpOnly, lalu membersihkan status autentikasi pada SDK klien.
 * @returns {Promise<void>} Tidak mengembalikan nilai.
 */
export async function logout(): Promise<void> {
  try {
    // Panggil endpoint resmi Better Auth untuk menghapus kuki
    await fetch("/api/auth/sign-out", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // Sertakan kredensial agar kuki HttpOnly dikirim untuk dihancurkan
      credentials: "include"
    });

    // Bersihkan sisa status pada SDK klien
    const { authClient } = await import("@/lib/auth-client");
    await authClient.signOut();

  } catch (error) {
    console.error("Gagal logout API:", error);
  }
}

/**
 * 📥 MINTA RESET KATA SANDI MELALUI FETCH API
 * Mengirimkan permintaan pengaturan ulang kata sandi ke alamat surel pengguna.
 * @param {string} email - Alamat surel yang meminta reset.
 * @returns {Promise<void>} Tidak mengembalikan nilai.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await fetch("/api/auth/forget-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        redirectTo: "/reset-password",
      }),
    });
  } catch (error) {
    console.error(error);
  }
}