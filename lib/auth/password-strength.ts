export type StrengthLevel = "kosong" | "lemah" | "sedang" | "kuat";

export interface PasswordStrength {
  level: StrengthLevel;
  label: string;
  /** 0-3, dipakai untuk mengisi bar. */
  score: number;
  /** Saran perbaikan terdekat, atau null kalau sudah kuat. */
  hint: string | null;
}

/**
 * Kriteria kekuatan password. Sengaja ditaruh di sini, bukan di JSX, supaya
 * bisa diuji terpisah dan diubah tanpa menyentuh komponen.
 *
 * Yang dinilai: panjang dan keberagaman jenis karakter. Panjang diberi bobot
 * lebih besar karena itu yang paling menentukan biaya serangan brute force.
 */
export function evaluatePassword(password: string): PasswordStrength {
  if (password.length === 0) {
    return { level: "kosong", label: "", score: 0, hint: null };
  }

  const punyaHurufKecil = /[a-z]/.test(password);
  const punyaHurufBesar = /[A-Z]/.test(password);
  const punyaAngka = /\d/.test(password);
  const punyaSimbol = /[^A-Za-z0-9]/.test(password);

  const ragam = [punyaHurufKecil, punyaHurufBesar, punyaAngka, punyaSimbol].filter(
    Boolean
  ).length;

  let poin = 0;
  if (password.length >= 8) poin += 1;
  if (password.length >= 12) poin += 1;
  if (ragam >= 2) poin += 1;
  if (ragam >= 3) poin += 1;

  // Password pendek tidak pernah dianggap kuat, sebanyak apa pun ragamnya.
  if (password.length < 8) poin = Math.min(poin, 1);

  if (poin <= 1) {
    return {
      level: "lemah",
      label: "Lemah",
      score: 1,
      hint:
        password.length < 8
          ? "Tambah sampai minimal 8 karakter."
          : "Campur huruf besar, angka, atau simbol.",
    };
  }

  if (poin <= 3) {
    return {
      level: "sedang",
      label: "Sedang",
      score: 2,
      hint:
        password.length < 12
          ? "Panjangkan sampai 12 karakter agar lebih kuat."
          : "Tambahkan satu jenis karakter lagi.",
    };
  }

  return { level: "kuat", label: "Kuat", score: 3, hint: null };
}
