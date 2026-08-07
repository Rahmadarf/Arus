// lib/statistics/mock.ts
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth/session";
import type { CategoryStat, StatisticsData, TimeRange } from "@/lib/statistics/types";
import { colorForRank, distributePercentages } from "@/lib/statistics/utils";

type RawCategory = {
  categoryId: string;
  categoryName: string;
  total: number;
  /** Warna tersimpan milik kategori. null = belum pernah diberi warna. */
  storedColor: string | null;
};

/**
 * Format tanggal jadi "YYYY-MM-DD" memakai komponen WAKTU LOKAL.
 *
 * JANGAN diganti toISOString(). getPeriodDates membangun batas periode di zona
 * lokal, jadi 1 Agustus 00:00 WIB adalah 31 Juli 17:00 UTC — toISOString akan
 * memundurkannya sehari dan label periodenya terbaca "31 Juli – 31 Agustus"
 * untuk rentang yang sebenarnya satu bulan penuh Agustus.
 */
function tanggalLokalISO(date: Date): string {
  const bulan = String(date.getMonth() + 1).padStart(2, "0");
  const hari = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${bulan}-${hari}`;
}

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

  return {
    startDate,
    endDate,
    // Label periode dipakai apa adanya oleh halaman. Dihitung di sini supaya
    // pemanggil tidak tergoda memakai toISOString dan mengulang bug zona waktu.
    startDateStr: tanggalLokalISO(startDate),
    endDateStr: tanggalLokalISO(endDate),
  };
}

/**
 * ✨ RAKIT STATISTIK KATEGORI DARI DATA MENTAH
 * Mengurutkan kategori berdasarkan total, lalu menambahkan persentase dan warna berdasarkan peringkat.
 * @param {RawCategory[]} raw - Daftar kategori mentah berisi ID, nama, dan total.
 * @returns {CategoryStat[]} Daftar kategori siap pakai dengan persentase dan warna.
 */
function buildCategoryStats(raw: RawCategory[]): CategoryStat[] {
  const sorted = [...raw].sort((a, b) => b.total - a.total);
  const percentages = distributePercentages(sorted.map((item: RawCategory) => item.total));

  return sorted.map(({ storedColor, ...item }: RawCategory, index: number) => ({
    ...item,
    percentage: percentages[index],
    // Warna diambil dari kategori, BUKAN dari peringkatnya. Aturan ini
    // dijelaskan di lib/categories/types.ts: kalau warna ditentukan urutan,
    // titik warna di /categories tidak lagi mewakili potongan donat yang sama,
    // dan satu transaksi baru yang menggeser peringkat akan mengacak seluruh
    // warna chart tanpa sebab yang bisa dipahami pengguna.
    //
    // colorForRank hanya jadi cadangan untuk kategori yang belum punya warna —
    // createTransaction bisa membuat kategori otomatis tanpa mengisi color.
    color: storedColor ?? colorForRank(index),
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
  // Kegagalan sengaja dibiarkan naik ke app/(dashboard)/error.tsx. Blok catch
  // sebelumnya mengembalikan totalExpense 0, dan halaman membacanya sebagai
  // "Belum ada pengeluaran di periode ini" — kalimat yang salah dan menenangkan
  // justru ketika databasenya sedang bermasalah.
  {
    // 🔐 Wajib: tanpa ini kueri di bawah memakai user yang salah (lihat git blame).
    const userId = await requireUserId();

    // Dapatkan tanggal awal dan akhir periode
    const { startDate, endDate, startDateStr, endDateStr } = getPeriodDates(range);

    const baseWhere = {
      userId,
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
        startDate: startDateStr,
        endDate: endDateStr,
        totalExpense: 0,
        transactionCount: 0,
        categories: [],
      };
    }

    // Ambil nama dan warna kategori untuk label + potongan donat.
    const categoryIds = grouped.map((g) => g.categoryId);
    const categoryRows = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true },
    });
    const catMap = new Map(categoryRows.map((c) => [c.id, c]));

    const rawCategories: RawCategory[] = grouped.map((g) => ({
      categoryId: g.categoryId,
      categoryName: catMap.get(g.categoryId)?.name ?? "Tanpa Nama",
      storedColor: catMap.get(g.categoryId)?.color ?? null,
      total: g._sum.amount ?? 0,
    }));

    // Bangun struktur kategori dengan persentase dan warna
    const categories = buildCategoryStats(rawCategories);

    return {
      range,
      startDate: startDateStr,
      endDate: endDateStr,
      totalExpense: aggregate._sum.amount ?? 0,
      transactionCount: aggregate._count._all,
      categories,
    };
  }
});
