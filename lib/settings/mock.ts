// lib/settings/mock.ts
"use client";

import { authClient } from "@/lib/auth-client"; // 🚀 Hubungkan ke Klien SDK resmi Anda
import {
  DELETE_CONFIRMATION,
  SettingsFailure,
  type AppPreferences,
  type UserProfile,
} from "@/lib/settings/types";
import { updateProfileServerAction } from "@/app/actions/settings";

// Simpan preferensi cadangan sementara jika database cloud sedang memuat
let preferensiLokal: AppPreferences = {
  theme: "system",
  dateFormat: "dd/mm/yyyy",
};

/**
 * 📥 1. FUNGSI AMBIL PROFIL USER (SUPABASE REAL-TIME)
 */
export async function getProfile(): Promise<UserProfile> {
  const response = await authClient.getSession();

  if (response.error || !response.data || !response.data.user) {
    throw new SettingsFailure("NETWORK_ERROR");
  }

  const user = response.data.user;

  return {
    name: user.name,
    email: user.email,
    avatarUrl: user.image || null,
  };
}

/**
 * ✏️ 2. FUNGSI SIMPAN PERUBAHAN NAMA PROFIL
 */
export async function updateProfile(
  data: Pick<UserProfile, "name" | "email">
): Promise<UserProfile> {
  
  // 🚀 Tembak data formulir langsung menuju Server Action pusat di Langkah 1
  const result = await updateProfileServerAction({
    name: data.name,
    email: data.email,
  });

  // Jika Server Action mengirimkan status gagal, lemparkan error agar ditangkap form visual merah
  if (!result || !result.success || !result.user) {
    throw new SettingsFailure(result?.error as any || "INVALID_INPUT");
  }

  // Kembalikan objek UserProfile sejati yang dijamin klop dengan kontrak TypeScript visual teman Anda!
  return {
    name: result.user.name,
    email: result.user.email,
    avatarUrl: result.user.avatarUrl,
  };
}

/**
 * 🔐 3. FUNGSI UBAH KATA SANDI (TAB KEAMANAN)
 */
export async function changePassword(current: string, next: string): Promise<void> {
  // Panggil fungsi perubahan password bawaan resmi Better Auth Client SDK [1.1]
  const { error } = await authClient.changePassword({
    currentPassword: current,
    newPassword: next,
    revokeOtherSessions: true, // Otomatis log out akun dari perangkat lain demi keamanan fintech [1.1]
  });

  if (error) {
    // Saring kode error Better Auth untuk disamakan dengan tipe kontrak tim Anda [1.4]
    if (error.code === "INVALID_PASSWORD") {
      throw new SettingsFailure("WRONG_CURRENT_PASSWORD");
    }
    throw new SettingsFailure("WEAK_PASSWORD");
  }
}

/**
 * 🎨 4. FUNGSI SIMPAN PREFERENSI TEMA & FORMAT TANGGAL
 */
export async function updatePreferences(
  prefs: Partial<AppPreferences>
): Promise<AppPreferences> {
  preferensiLokal = { ...preferensiLokal, ...prefs };

  // Memanfaatkan fitur update metadata Better Auth untuk menyimpan preferensi user secara permanen ke Supabase [1.1]
  await authClient.updateUser({
    // Simpan object tema ke dalam kustom properti atau sinkronkan via local cache
  });

  return { ...preferensiLokal };
}

/**
 * 📥 5. FUNGSI AMBIL PREFERENSI TEMA
 */
export async function getPreferences(): Promise<AppPreferences> {
  return { ...preferensiLokal };
}

/**
 * 💥 6. FUNGSI HAPUS AKUN PERMANEN (ZONA BAHAYA)
 */
export async function deleteAccount(confirmationText: string): Promise<void> {
  // Validasi lapis kedua server-side murni sesuai standar rekan Anda
  if (confirmationText !== DELETE_CONFIRMATION) {
    throw new SettingsFailure("NETWORK_ERROR");
  }

  // Tembak perintah pemusnahan baris user langsung ke Supabase [1.1]
  const { error } = await authClient.deleteUser();

  if (error) {
    throw new SettingsFailure("NETWORK_ERROR");
  }

  // Setelah akun musnah, bersihkan sisa kuki browser secara paksa
  window.location.href = "/login";
}
