// app/actions/settings.ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

interface UpdateProfileInput {
  name: string;
  email: string;
}

/**
 * ✏️ SERVER ACTION: PERBARUI NAMA PROFIL PENGGUNA
 * Memperbarui nama tampilan pengguna melalui Better Auth API dan menyegarkan cache halaman terkait.
 * @param {UpdateProfileInput} input - Data profil terbaru berupa nama dan email.
 * @returns {Promise<{success: boolean, user?: {name: string, email: string, avatarUrl: string|null}, error?: string}>} Status operasi beserta data pengguna.
 */
export async function updateProfileServerAction(input: UpdateProfileInput) {
  try {
    // Perbarui nama pengguna resmi ke tabel User
    const result = await auth.api.updateUser({
      body: {
        name: input.name.trim(),
      },
      headers: await headers(), // Baca cookie sesi HttpOnly dengan aman di server
    });

    // Periksa status respons Better Auth
    if (!result || !result.status) {
      return { success: false, error: "INVALID_INPUT" };
    }

    // Sinkronkan cache agar visual nama baru tampil di seluruh halaman
    revalidatePath("/settings");
    revalidatePath("/");

    // Susun objek user manual agar sesuai tipe TypeScript
    return {
      success: true,
      user: {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        avatarUrl: null, // Default null sesuai kontrak tipe
      },
    };
  } catch (error: any) {
    console.error("Gagal memproses updateProfile di server action:", error);
    return { success: false, error: "NETWORK_ERROR" };
  }
}
