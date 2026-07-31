/** Tujuan setelah masuk kalau callbackUrl tidak ada atau tidak sah. */
export const DEFAULT_REDIRECT = "/transactions";

/**
 * Saring callbackUrl agar hanya menerima path internal.
 *
 * Tanpa penyaringan ini, tautan seperti
 *   /login?callbackUrl=https://situs-palsu.example
 * akan melempar pengguna ke situs luar tepat setelah mereka berhasil masuk —
 * momen paling meyakinkan untuk memancing kredensial. Itu open redirect.
 *
 * Yang ditolak:
 *   https://…   protokol lengkap, jelas keluar origin
 *   //situs     protocol-relative, browser membacanya sebagai host lain
 *   /\situs     sebagian browser menormalkan garis miring terbalik jadi //
 *   selain '/'  path relatif tidak bisa dipastikan tujuannya
 */
export function safeCallbackUrl(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_REDIRECT;
  if (!raw.startsWith("/")) return DEFAULT_REDIRECT;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return DEFAULT_REDIRECT;

  return raw;
}
