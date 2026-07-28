// Format mata uang mengikuti pola yang sudah dipakai di components/recent-transactions.tsx
export const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
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
