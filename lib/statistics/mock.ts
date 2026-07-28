import type { CategoryStat, StatisticsData, TimeRange } from "@/lib/statistics/types";
import { colorForRank, distributePercentages } from "@/lib/statistics/utils";

type RawCategory = {
  categoryId: string;
  categoryName: string;
  total: number;
};

type RawPeriod = {
  startDate: string;
  endDate: string;
  transactionCount: number;
  categories: RawCategory[];
};

// Skenario per rentang sengaja dibuat berbeda supaya tiap cabang UI teruji:
// - this-month    : 6 kategori, satu dominan (~51%)
// - last-3-months : 12 kategori, menguji peleburan "Lainnya"
// - this-year     : kosong, menguji empty state
const PERIODS: Record<TimeRange, RawPeriod> = {
  "this-month": {
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    transactionCount: 48,
    categories: [
      { categoryId: "cat-makanan", categoryName: "Makanan & Minuman", total: 4850000 },
      { categoryId: "cat-transportasi", categoryName: "Transportasi", total: 1420000 },
      { categoryId: "cat-belanja", categoryName: "Belanja Rumah", total: 1180000 },
      { categoryId: "cat-tagihan", categoryName: "Tagihan & Utilitas", total: 980000 },
      { categoryId: "cat-hiburan", categoryName: "Hiburan", total: 620000 },
      { categoryId: "cat-kesehatan", categoryName: "Kesehatan", total: 410000 },
    ],
  },

  "last-3-months": {
    startDate: "2026-05-01",
    endDate: "2026-07-31",
    transactionCount: 173,
    categories: [
      { categoryId: "cat-makanan", categoryName: "Makanan & Minuman", total: 12480000 },
      { categoryId: "cat-belanja", categoryName: "Belanja Rumah", total: 6350000 },
      { categoryId: "cat-transportasi", categoryName: "Transportasi", total: 5720000 },
      { categoryId: "cat-tagihan", categoryName: "Tagihan & Utilitas", total: 4310000 },
      { categoryId: "cat-cicilan", categoryName: "Cicilan", total: 3900000 },
      { categoryId: "cat-hiburan", categoryName: "Hiburan", total: 2640000 },
      { categoryId: "cat-kesehatan", categoryName: "Kesehatan", total: 2180000 },
      { categoryId: "cat-pendidikan", categoryName: "Pendidikan", total: 1750000 },
      { categoryId: "cat-perawatan", categoryName: "Perawatan Diri", total: 1290000 },
      { categoryId: "cat-donasi", categoryName: "Hadiah & Donasi", total: 940000 },
      { categoryId: "cat-perbaikan", categoryName: "Perbaikan Rumah", total: 780000 },
      { categoryId: "cat-admin", categoryName: "Biaya Admin Bank", total: 165000 },
    ],
  },

  "this-year": {
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    transactionCount: 0,
    categories: [],
  },
};

function buildCategoryStats(raw: RawCategory[]): CategoryStat[] {
  const sorted = [...raw].sort((a, b) => b.total - a.total);

  // Persentase dihitung sekali di sini dengan largest remainder, jadi komponen
  // tidak perlu tahu-menahu soal pembulatan.
  const percentages = distributePercentages(sorted.map((item) => item.total));

  return sorted.map((item, index) => ({
    ...item,
    percentage: percentages[index],
    color: colorForRank(index),
  }));
}

/**
 * Batas periode adalah turunan dari rentang yang dipilih, bukan dari hasil
 * query. Dipisah supaya label "1 – 31 Juli 2026" bisa tampil seketika tanpa
 * menunggu data — dan tetap satu sumber kebenaran dengan getStatistics().
 */
export function getPeriodDates(range: TimeRange) {
  const { startDate, endDate } = PERIODS[range];
  return { startDate, endDate };
}

// ============================================================================
// TODO: ganti isi fungsi ini dengan fetch API.
// Signature dan return type TIDAK boleh berubah.
// ============================================================================
export async function getStatistics(range: TimeRange): Promise<StatisticsData> {
  // Delay artifisial supaya loading state benar-benar teruji.
  await new Promise((resolve) => setTimeout(resolve, 600));

  const period = PERIODS[range];
  const categories = buildCategoryStats(period.categories);

  return {
    range,
    startDate: period.startDate,
    endDate: period.endDate,
    totalExpense: categories.reduce((sum, item) => sum + item.total, 0),
    transactionCount: period.transactionCount,
    categories,
  };
}
