import type { CategoryStat, ChartSlice } from "@/lib/statistics/types";

/** Jumlah potong berwarna di donat sebelum sisanya dilebur jadi "Lainnya". */
export const MAX_CHART_SLICES = 5;

/** Warna untuk lima kategori teratas. Sisanya memakai warna muted. */
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export const MUTED_COLOR = "var(--muted-foreground)";

/**
 * Kategori peringkat 1-5 dapat warna sendiri. Peringkat 6 ke bawah memakai
 * warna muted karena di chart mereka dilebur jadi satu potong "Lainnya" —
 * titik warna di tabel jadi tetap cocok dengan apa yang terlihat di donat.
 */
export function colorForRank(index: number): string {
  return index < MAX_CHART_SLICES ? CHART_COLORS[index] : MUTED_COLOR;
}

/**
 * Bagi 100 poin persentase ke sekumpulan nilai dengan metode largest remainder.
 *
 * Membulatkan tiap persentase secara terpisah bisa membuat totalnya 99% atau
 * 101%. Metode ini menjamin totalnya tepat 100:
 *   1. Hitung persentase presisi penuh.
 *   2. Bulatkan ke bawah — sekarang ada sisa poin yang belum terbagi.
 *   3. Berikan sisa poin satu per satu ke nilai dengan pecahan terbesar.
 *
 * Kalau totalnya 0, kembalikan nol semua — jangan sampai menghasilkan NaN.
 */
export function distributePercentages(values: number[]): number[] {
  if (values.length === 0) return [];

  const total = values.reduce((sum: number, value: number) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);

  const exact = values.map((value) => (value / total) * 100);
  const result = exact.map(Math.floor);

  let leftover = 100 - result.reduce((sum: number, value: number) => sum + value, 0);

  // Pecahan terbesar dilayani duluan. Kalau seri, indeks lebih kecil menang
  // supaya hasilnya deterministik.
  const byLargestRemainder = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  for (let i = 0; leftover > 0; i += 1) {
    result[byLargestRemainder[i % byLargestRemainder.length].index] += 1;
    leftover -= 1;
  }

  return result;
}

/**
 * Ubah daftar kategori jadi potongan donat.
 *
 * Chart untuk gambaran besar, jadi hanya lima kategori teratas yang berdiri
 * sendiri; sisanya dilebur jadi satu potong "Lainnya". Persentase "Lainnya"
 * dihitung sebagai 100 dikurangi total lima teratas — bukan dijumlah ulang —
 * supaya pembulatan largest remainder tidak rusak dan totalnya tetap 100%.
 *
 * Tabel tetap menampilkan semua kategori tanpa peleburan.
 */
export function buildChartSlices(
  categories: CategoryStat[],
  limit: number = MAX_CHART_SLICES
): ChartSlice[] {
  const ranked = categories.slice(0, limit);
  const rest = categories.slice(limit);

  const slices: ChartSlice[] = ranked.map((category) => ({
    key: category.categoryId,
    name: category.categoryName,
    value: category.total,
    percentage: category.percentage,
    color: category.color,
  }));

  if (rest.length === 0) return slices;

  const rankedPercentage = ranked.reduce((sum: number, item: { percentage: number }) => sum + item.percentage, 0);

  slices.push({
    key: "lainnya",
    name: `Lainnya (${rest.length} kategori)`,
    value: rest.reduce((sum: number, item: { total: number }) => sum + item.total, 0),
    percentage: 100 - rankedPercentage,
    color: MUTED_COLOR,
  });

  return slices;
}
