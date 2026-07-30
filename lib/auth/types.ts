export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string; // ISO 8601
}

export interface Session {
  user: User;
  expiresAt: string; // ISO 8601
}

export type AuthError =
  | "INVALID_CREDENTIALS"
  | "EMAIL_TAKEN"
  | "USER_NOT_FOUND"
  | "RATE_LIMITED"
  | "NETWORK_ERROR";

/**
 * Kegagalan auth dilempar sebagai kelas sendiri supaya kodenya bisa dibaca
 * tanpa mencocokkan string pesan.
 */
export class AuthFailure extends Error {
  constructor(public readonly code: AuthError) {
    super(code);
    this.name = "AuthFailure";
  }
}

export function isAuthFailure(error: unknown): error is AuthFailure {
  return error instanceof AuthFailure;
}

/**
 * Pesan untuk pengguna akhir.
 *
 * INVALID_CREDENTIALS sengaja tidak menyebut mana yang salah — email atau
 * password. Membedakan keduanya memberi tahu penyerang bahwa sebuah email
 * terdaftar, yang membuka jalan enumerasi akun.
 */
export const AUTH_ERROR_MESSAGE: Record<AuthError, string> = {
  INVALID_CREDENTIALS: "Email atau password salah.",
  EMAIL_TAKEN: "Email ini sudah terdaftar. Coba masuk saja.",
  USER_NOT_FOUND: "Akun tidak ditemukan.",
  RATE_LIMITED: "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
  NETWORK_ERROR: "Gagal terhubung ke server. Periksa koneksi Anda.",
};

export function authErrorMessage(error: unknown): string {
  if (isAuthFailure(error)) return AUTH_ERROR_MESSAGE[error.code];
  return AUTH_ERROR_MESSAGE.NETWORK_ERROR;
}

/** Nama cookie session milik jalur mock (lib/auth/mock.ts). */
export const SESSION_COOKIE = "session";

/**
 * Semua nama cookie yang menandakan ada session.
 *
 * better-auth (lib/auth.ts) memakai `better-auth.session_token`, dan menambah
 * awalan `__Secure-` saat berjalan di HTTPS. `session` ikut dicek karena jalur
 * mock masih memakai nama itu — hapus baris terakhir begitu mock dibuang.
 *
 * Sengaja bebas dari next/headers supaya bisa dipakai di proxy.ts maupun di
 * Server Component. Satu daftar, jadi keduanya tidak mungkin berbeda.
 */
export const NAMA_COOKIE_SESSION = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
  SESSION_COOKIE,
] as const;
