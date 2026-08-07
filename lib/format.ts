// Format mata uang mengikuti pola yang sudah dipakai di components/recent-transactions.tsx
export const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Versi ringkas untuk label sumbu grafik: "Rp 350jt", "Rp 1,2jt", "Rp 500rb".
 *
 * Sumbu Y tidak muat menampung "Rp 347.921.733" dikali enam tick — angkanya
 * akan saling tumpang tindih atau memakan lebar plot. Nilai penuhnya tetap
 * terbaca di tooltip, jadi tidak ada informasi yang hilang.
 */
export const formatRupiahRingkas = (value: number) => {
  const negatif = value < 0;
  const n = Math.abs(value);

  // Satu angka di belakang koma hanya bila berguna: "1,2jt" informatif,
  // "350,0jt" hanya ramai.
  const potong = (pembagi: number, satuan: string) => {
    const hasil = n / pembagi;
    const teks = hasil >= 100 || Number.isInteger(hasil)
      ? Math.round(hasil).toString()
      : hasil.toFixed(1).replace(".", ",");
    return `${teks}${satuan}`;
  };

  let inti: string;
  if (n >= 1_000_000_000_000) inti = potong(1_000_000_000_000, "T");
  else if (n >= 1_000_000_000) inti = potong(1_000_000_000, "M");
  else if (n >= 1_000_000) inti = potong(1_000_000, "jt");
  else if (n >= 1_000) inti = potong(1_000, "rb");
  else inti = Math.round(n).toString();

  return `${negatif ? "-" : ""}Rp ${inti}`;
};

// Menghasilkan "24 Feb 2026" — sama dengan format tanggal di dashboard.
// timeZone dikunci agar render server & client tidak berbeda.
export const formatTanggal = (value: Date | string) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
};

const bagianTanggal = (value: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("id-ID", { ...options, timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00Z`)
  );

/**
 * Label periode yang dibaca manusia, seringkas mungkin:
 *   "1 – 31 Juli 2026"          bulan & tahun sama
 *   "1 Mei – 31 Juli 2026"      tahun sama
 *   "1 Des 2025 – 31 Juli 2026" beda tahun
 */
export const formatRentangTanggal = (startDate: string, endDate: string) => {
  const hari = (value: string) => bagianTanggal(value, { day: "numeric" });
  const bulan = (value: string) => bagianTanggal(value, { month: "long" });
  const tahun = (value: string) => bagianTanggal(value, { year: "numeric" });

  const bulanSama = bulan(startDate) === bulan(endDate);
  const tahunSama = tahun(startDate) === tahun(endDate);

  if (tahunSama && bulanSama) {
    return `${hari(startDate)} – ${hari(endDate)} ${bulan(endDate)} ${tahun(endDate)}`;
  }

  if (tahunSama) {
    return `${hari(startDate)} ${bulan(startDate)} – ${hari(endDate)} ${bulan(endDate)} ${tahun(endDate)}`;
  }

  return `${hari(startDate)} ${bulan(startDate)} ${tahun(startDate)} – ${hari(endDate)} ${bulan(endDate)} ${tahun(endDate)}`;
};
