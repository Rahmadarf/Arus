import {
  DELETE_CONFIRMATION,
  SettingsFailure,
  type AppPreferences,
  type UserProfile,
} from "@/lib/settings/types";

// ============================================================================
// MOCK SETTINGS — SATU-SATUNYA BERKAS YANG BERUBAH SAAT BACKEND SIAP.
//
// Semuanya disimpan di memori modul. TIDAK ADA localStorage di sini, sengaja:
// preferensi diperlakukan sama seperti data lain di aplikasi ini, yaitu milik
// server. Kalau tema disimpan di localStorage sekarang, nanti ada dua sumber
// kebenaran dan pengguna akan melihat setelan berbeda di perangkat berbeda.
//
// PASSWORD tidak pernah disimpan, di-hash, maupun dicatat di sini.
// ============================================================================

const LATENCY_MS = 600;

/** Naikkan untuk menguji error state. 0 = selalu berhasil. */
const FAILURE_RATE = 0.1;

/** Password demo, sejalan dengan lib/auth/mock.ts. */
const DEMO_PASSWORD = "password123";

/** Email yang dianggap sudah dipakai akun lain, untuk menguji EMAIL_TAKEN. */
const EMAIL_TERPAKAI = ["admin@app.com", "sasya@app.com"];

let profil: UserProfile = {
  name: "Sasya Ardelia",
  email: "demo@app.com",
  avatarUrl: null,
};

let preferensi: AppPreferences = {
  theme: "system",
  dateFormat: "dd/mm/yyyy",
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function simulateRequest() {
  await wait(LATENCY_MS);
  if (Math.random() < FAILURE_RATE) {
    throw new SettingsFailure("NETWORK_ERROR");
  }
}

// TODO: ganti isi dengan fetch API. Signature & return type TIDAK boleh berubah.
export async function getProfile(): Promise<UserProfile> {
  await wait(200);
  return { ...profil };
}

// TODO: ganti isi dengan fetch API. Signature & return type TIDAK boleh berubah.
export async function updateProfile(
  data: Pick<UserProfile, "name" | "email">
): Promise<UserProfile> {
  await simulateRequest();

  const emailBaru = data.email.trim().toLowerCase();

  if (emailBaru !== profil.email && EMAIL_TERPAKAI.includes(emailBaru)) {
    throw new SettingsFailure("EMAIL_TAKEN");
  }

  profil = { ...profil, name: data.name.trim(), email: emailBaru };
  return { ...profil };
}

// TODO: ganti isi dengan fetch API. Signature & return type TIDAK boleh berubah.
export async function changePassword(current: string, next: string): Promise<void> {
  await simulateRequest();

  // Password saat ini diperiksa lebih dulu, supaya kodenya spesifik dan bisa
  // ditempelkan ke field yang tepat, bukan jadi galat umum.
  if (current !== DEMO_PASSWORD) {
    throw new SettingsFailure("WRONG_CURRENT_PASSWORD");
  }

  if (next.length < 8) {
    throw new SettingsFailure("WEAK_PASSWORD");
  }

  // Tidak ada yang disimpan: mock ini tidak menyimpan password sama sekali.
}

// TODO: ganti isi dengan fetch API. Signature & return type TIDAK boleh berubah.
export async function updatePreferences(
  prefs: Partial<AppPreferences>
): Promise<AppPreferences> {
  await simulateRequest();
  preferensi = { ...preferensi, ...prefs };
  return { ...preferensi };
}

// TODO: ganti isi dengan fetch API. Signature & return type TIDAK boleh berubah.
export async function deleteAccount(confirmationText: string): Promise<void> {
  await simulateRequest();

  // Pemeriksaan kedua di sisi "server". UI sudah menonaktifkan tombolnya, tapi
  // aksi sedestruktif ini tidak boleh hanya bergantung pada UI.
  if (confirmationText !== DELETE_CONFIRMATION) {
    throw new SettingsFailure("NETWORK_ERROR");
  }
}

// TODO: ganti isi dengan fetch API. Signature & return type TIDAK boleh berubah.
export async function getPreferences(): Promise<AppPreferences> {
  await wait(200);
  return { ...preferensi };
}
