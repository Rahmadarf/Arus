export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface AppPreferences {
  theme: "light" | "dark" | "system";
  dateFormat: "dd/mm/yyyy" | "mm/dd/yyyy";
}

export type SettingsError =
  | "WRONG_CURRENT_PASSWORD"
  | "EMAIL_TAKEN"
  | "WEAK_PASSWORD"
  | "NETWORK_ERROR";

/** Kegagalan dilempar sebagai kelas sendiri supaya kodenya bisa dibaca. */
export class SettingsFailure extends Error {
  constructor(public readonly code: SettingsError) {
    super(code);
    this.name = "SettingsFailure";
  }
}

export function isSettingsFailure(error: unknown): error is SettingsFailure {
  return error instanceof SettingsFailure;
}

export const SETTINGS_ERROR_MESSAGE: Record<SettingsError, string> = {
  WRONG_CURRENT_PASSWORD: "Password saat ini salah.",
  EMAIL_TAKEN: "Email ini sudah dipakai akun lain.",
  WEAK_PASSWORD: "Password baru terlalu lemah. Gunakan minimal 8 karakter.",
  NETWORK_ERROR: "Gagal terhubung ke server. Coba lagi.",
};

export function settingsErrorMessage(error: unknown): string {
  if (isSettingsFailure(error)) return SETTINGS_ERROR_MESSAGE[error.code];
  return SETTINGS_ERROR_MESSAGE.NETWORK_ERROR;
}

/** Tab yang tersedia. Nilainya dipakai langsung sebagai ?tab= di URL. */
export const SETTINGS_TABS = [
  { value: "profil", label: "Profil" },
  { value: "keamanan", label: "Keamanan" },
  { value: "preferensi", label: "Preferensi" },
  { value: "zona-bahaya", label: "Zona Bahaya" },
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number]["value"];

export const DEFAULT_TAB: SettingsTab = "profil";

/** Kembalikan tab yang sah, atau default kalau param URL ngawur. */
export function parseSettingsTab(value: unknown): SettingsTab {
  return SETTINGS_TABS.some((tab) => tab.value === value)
    ? (value as SettingsTab)
    : DEFAULT_TAB;
}

/**
 * Kata yang harus diketik ulang sebelum akun bisa dihapus. Dicocokkan persis,
 * termasuk huruf besarnya.
 */
export const DELETE_CONFIRMATION = "HAPUS AKUN";

/** Batas berkas avatar yang diterima di sisi klien. */
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
