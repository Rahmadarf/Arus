// app/actions/upload-avatar.ts
"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Inisialisasi klien internal Supabase Storage khusus server.
// WAJIB pakai SUPABASE_SERVICE_ROLE_KEY (server-only, tanpa prefix NEXT_PUBLIC_) —
// anon key ikut ke bundle browser, jadi siapa pun bisa panggil Storage API Supabase
// langsung dengan key itu dan menimpa file di bucket manapun, skip endpoint ini sama sekali.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function uploadAvatarAction(formData: FormData) {
  try {
    // 1. Validasi Keamanan: Pastikan hanya user yang sudah login yang bisa unggah foto profil [1.1]
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData || !sessionData.user) {
      return { success: false, error: "Unauthorized" };
    }
    const userId = sessionData.user.id;

    // 2. Tangkap file biner gambar dari form data frontend
    const file = formData.get("avatarFile") as File;
    if (!file) {
      return { success: false, error: "Tidak ada berkas yang dipilih." };
    }

    // Ekstrak ekstensi file (png, jpg, webp)
    const fileExtension = file.name.split(".").pop();
    const filePath = `${userId}/profile-${Date.now()}.${fileExtension}`;

    // 3. JALUR TOL SUPABASE STORAGE: Unggah file mentah ke dalam bucket 'avatars'
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // Timpa file lama jika user berkali-kali mengganti foto
      });

    if (uploadError) throw uploadError;

    // 4. GENERATE PUBLIC URL: Ambil tautan link internet resmi dari foto tersebut
    const { data: urlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // 5. UPDATE DATABASE PROFILE: Simpan link URL foto baru tersebut ke dalam tabel User Better Auth Anda [1.1]
    await auth.api.updateUser({
      body: {
        image: publicUrl, // Simpan ke kolom 'image' resmi bawaan Better Auth [1.1]
      },
      headers: await headers(),
    });

    revalidatePath("/settings");
    return { success: true, avatarUrl: publicUrl };
  } catch (error: any) {
    console.error("Gagal mengunggah foto profil ke Supabase:", error);
    return { success: false, error: "Gagal mengunggah gambar ke server cloud." };
  }
}
