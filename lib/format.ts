// Format mata uang mengikuti pola yang sudah dipakai di components/recent-transactions.tsx
export const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
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
