export type TimeRange = "this-month" | "last-3-months" | "this-year";

export interface CategoryStat {
  categoryId: string;
  categoryName: string;
  total: number; // dalam Rupiah, integer
  percentage: number; // 0-100, sudah dinormalisasi
  color: string; // CSS var chart token, contoh: "var(--chart-1)"
}

export interface StatisticsData {
  range: TimeRange;
  startDate: string; // ISO 8601, contoh: "2026-07-01"
  endDate: string; // ISO 8601
  totalExpense: number;
  transactionCount: number;
  categories: CategoryStat[]; // sudah terurut desc by total
}

/**
 * Satu potong donat. Bentuknya berbeda dari CategoryStat karena beberapa
 * kategori bisa dilebur jadi satu potong "Lainnya".
 */
export interface ChartSlice {
  key: string; // dipakai sebagai kunci ChartConfig, wajib aman untuk nama CSS var
  name: string; // label yang dibaca pengguna
  value: number;
  percentage: number;
  color: string;
}

export const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "this-month", label: "Bulan Ini" },
  { value: "last-3-months", label: "3 Bulan Terakhir" },
  { value: "this-year", label: "Tahun Ini" },
];

export const DEFAULT_RANGE: TimeRange = "this-month";

/** Kembalikan range yang valid, atau default kalau param URL ngawur. */
export function parseTimeRange(value: unknown): TimeRange {
  return TIME_RANGES.some((item) => item.value === value)
    ? (value as TimeRange)
    : DEFAULT_RANGE;
}
