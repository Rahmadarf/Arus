// lib/auth/mock.ts
"use client"; // Wajib klien agar kuki otomatis ditulis oleh browser

import { AuthFailure, type Session } from "@/lib/auth/types";

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
  const response = await fetch("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.toLowerCase().trim(),
      password: password,
      dontRememberSession: !remember,
    }),
  });

  const result = await response.json();

  // Tolak respons jika kredensial tidak valid
  if (!response.ok || !result || result.error) {
    throw new AuthFailure("INVALID_CREDENTIALS");
  }

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
  const response = await fetch("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.toLowerCase().trim(),
      password: password,
      name: name.trim(),
    }),
  });

  const result = await response.json();

  if (!response.ok || !result || result.error) {
    throw new AuthFailure("EMAIL_TAKEN");
  }

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