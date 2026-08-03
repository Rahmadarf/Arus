// lib/statistics/mock.ts
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { CategoryStat, StatisticsData, TimeRange } from "@/lib/statistics/types";
import { colorForRank, distributePercentages } from "@/lib/statistics/utils";

const TESTING_USER_ID = "id-user-testing-rahmad-123";

type RawCategory = {
  categoryId: string;
  categoryName: string;
  total: number;
};

/**
 * 🛠️ HITUNG RENTANG TANGGAL DINAMIS
 * Mengonversi label rentang waktu menjadi objek Date awal dan akhir yang siap dipakai kueri Prisma.
 * @param {TimeRange} range - Label rentang waktu ('this-month', 'last-3-months', 'this-year').
 * @returns {{startDate: Date, endDate: Date}} Objek tanggal awal dan akhir periode.
 */
export function getPeriodDates(range: TimeRange) {
  const now = new Date();

  // Default: awal bulan berjalan sampai akhir bulan berjalan
  let startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  if (range === "last-3-months") {
    // Mundur tiga bulan penuh dari bulan berjalan
    startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
  } else if (range === "this-year") {
    // 1 Januari sampai 31 Desember tahun berjalan
    startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  }

  return { startDate, endDate };
}

/**
 * ✨ RAKIT STATISTIK KATEGORI DARI DATA MENTAH
 * Mengurutkan kategori berdasarkan total, lalu menambahkan persentase dan warna berdasarkan peringkat.
 * @param {RawCategory[]} raw - Daftar kategori mentah berisi ID, nama, dan total.
 * @returns {CategoryStat[]} Daftar kategori siap pakai dengan persentase dan warna.
 */
function buildCategoryStats(raw: RawCategory[]): CategoryStat[] {
  const sorted = [...raw].sort((a, b) => b.total - a.total);
  const percentages = distributePercentages(sorted.map((item) => item.total));

  return sorted.map((item, index) => ({
    ...item,
    percentage: percentages[index],
    color: colorForRank(index),
  }));
}

/**
 * 📥 AMBIL DATA STATISTIK PENGELUARAN PENGGUNA
 * Mengambil transaksi pengeluaran dari database, mengelompokkannya per kategori, dan merangkum totalnya.
 * @param {TimeRange} range - Rentang waktu analisis statistik.
 * @returns {Promise<StatisticsData>} Rangkuman statistik pengeluaran untuk rentang waktu tertentu.
 */
// 🚀 OPTIMASI: cache() mencegah hitung ganda untuk rentang yang sama dalam satu request
export const getStatistics = cache(async (range: TimeRange): Promise<StatisticsData> => {
  try {
    // Dapatkan tanggal awal dan akhir periode
    const { startDate, endDate } = getPeriodDates(range);

    const baseWhere = {
      userId: String(TESTING_USER_ID),
      type: "EXPENSE" as const,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // 🚀 OPTIMASI: Agregasi total di DB lewat groupBy + aggregate paralel
    const [grouped, aggregate] = await Promise.all([
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: baseWhere,
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.transaction.aggregate({
        where: baseWhere,
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

    // Jika tidak ada pengeluaran pada periode terpilih
    if (grouped.length === 0) {
      return {
        range,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        totalExpense: 0,
        transactionCount: 0,
        categories: [],
      };
    }

    // Ambil hanya nama kategori untuk label (bukan seluruh kolom)
    const categoryIds = grouped.map((g) => g.categoryId);
    const categoryNames = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const nameMap = new Map(categoryNames.map((c) => [c.id, c.name]));

    const rawCategories: RawCategory[] = grouped.map((g) => ({
      categoryId: g.categoryId,
      categoryName: nameMap.get(g.categoryId) ?? "Tanpa Nama",
      total: g._sum.amount ?? 0,
    }));

    // Bangun struktur kategori dengan persentase dan warna
    const categories = buildCategoryStats(rawCategories);

    return {
      range,
      // Format tanggal menjadi string "YYYY-MM-DD" untuk label UI
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      totalExpense: aggregate._sum.amount ?? 0,
      transactionCount: aggregate._count._all,
      categories,
    };
  } catch (error) {
    console.error("Gagal memproses getStatistics database riil:", error);
    return {
      range,
      startDate: "",
      endDate: "",
      totalExpense: 0,
      transactionCount: 0,
      categories: [],
    };
  }
});