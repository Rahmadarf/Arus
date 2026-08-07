import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth/session";

/**
 * Zona waktu tampilan aplikasi. Sama dengan yang dikunci formatTanggal di
 * lib/format.ts — pengelompokan bulan harus memakai zona yang sama dengan
 * tanggal yang dibaca pengguna, kalau tidak transaksi pukul 23:00 WIB akan
 * jatuh ke bulan berikutnya karena di UTC ia sudah lewat tengah malam.
 */
const ZONA = "Asia/Jakarta";

const NAMA_BULAN = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export type MonthlyTrendPoint = {
  bulan: string;
  pemasukan: number;
  pengeluaran: number;
};

export type DashboardSummary = {
  income: number;
  expense: number;
  balance: number;
};

// ============================================================================
// KEGAGALAN DI BERKAS INI SENGAJA TIDAK DITELAN.
//
// Versi sebelumnya membungkus tiap kueri dengan catch yang mengembalikan nilai
// kosong. Untuk aplikasi keuangan itu berbahaya: database mati akan tampil
// sebagai "saldo Anda Rp 0" dan "belum ada transaksi" — dua kalimat yang
// terbaca sebagai fakta tentang uang pengguna, padahal aplikasinya yang rusak.
//
// Sekarang error dibiarkan naik ke app/(dashboard)/error.tsx, yang mengatakan
// apa adanya bahwa data gagal dimuat dan menawarkan coba lagi.
// ============================================================================

/**
 * 📊 TOTAL PEMASUKAN & PENGELUARAN
 *
 * Dijumlahkan di SQL, bukan di JavaScript. Versi sebelumnya menarik SELURUH
 * transaksi pengguna melewati jaringan hanya untuk menghitung tiga angka —
 * pada 2.000 transaksi itu berarti ~2.000 baris dikirim untuk menghasilkan
 * dua baris hasil.
 */
export const getDashboardSummary = cache(async (): Promise<DashboardSummary> => {
  const userId = await requireUserId();

  const grouped = await prisma.transaction.groupBy({
    by: ["type"],
    where: { userId },
    _sum: { amount: true },
  });

  const jumlah = (tipe: string) =>
    grouped.find((row) => row.type === tipe)?._sum.amount ?? 0;

  const income = jumlah("INCOME");
  const expense = jumlah("EXPENSE");

  return { income, expense, balance: income - expense };
});

/**
 * 🧾 TRANSAKSI TERBARU
 * Hanya sebanyak yang ditampilkan. Sebelumnya seluruh riwayat ditarik lalu
 * dipotong .slice(0, 5) di memori.
 */
export const getRecentTransactions = cache(async (limit = 5) => {
  const userId = await requireUserId();

  return prisma.transaction.findMany({
    where: { userId },
    select: {
      id: true,
      amount: true,
      type: true,
      description: true,
      createdAt: true,
      category: { select: { id: true, name: true, type: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
});

type BarisTren = {
  bulan: Date;
  pemasukan: number | string;
  pengeluaran: number | string;
};

/**
 * 📈 TREN 12 BULAN TERAKHIR
 *
 * Dua perbaikan sekaligus dibanding versi lama:
 *
 * 1. Pengelompokan dilakukan di SQL. Versi lama menarik semua transaksi lalu
 *    mengelompokkannya dengan forEach di Node.
 * 2. Tahun ikut diperhitungkan. Versi lama memakai date.getMonth() saja, jadi
 *    "Agu" 2025 dan "Agu" 2026 dijumlahkan ke batang yang sama — grafik untuk
 *    data lintas tahun menampilkan angka yang tidak pernah terjadi.
 *
 * Hasilnya 12 titik berurutan berakhir di bulan berjalan, termasuk bulan tanpa
 * transaksi (diisi nol) supaya sumbu X tidak bolong.
 */
export const getMonthlyTrendData = cache(async (): Promise<MonthlyTrendPoint[]> => {
  const userId = await requireUserId();

  // date_trunc dijalankan pada waktu lokal Jakarta, bukan UTC mentah.
  // createdAt bertipe `timestamp without time zone` berisi nilai UTC, jadi
  // ia ditafsirkan sebagai UTC dulu sebelum digeser ke zona tampilan.
  const rows = await prisma.$queryRaw<BarisTren[]>`
      SELECT
        date_trunc('month', "createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${ZONA}) AS bulan,
        COALESCE(SUM(amount) FILTER (WHERE type = 'INCOME'), 0)  AS pemasukan,
        COALESCE(SUM(amount) FILTER (WHERE type = 'EXPENSE'), 0) AS pengeluaran
      FROM "Transaction"
      WHERE "userId" = ${userId}
        AND "createdAt" >= (
          (date_trunc('month', now() AT TIME ZONE ${ZONA}) - interval '11 months')
          AT TIME ZONE ${ZONA}
        )
    GROUP BY 1
    ORDER BY 1
  `;

  // Kunci "tahun-bulan" — memakai nama bulan saja akan menabrakkan tahun.
  const byKey = new Map(
    rows.map((row) => {
      const d = new Date(row.bulan);
      return [`${d.getUTCFullYear()}-${d.getUTCMonth()}`, row];
    })
  );

  // Bulan berjalan menurut zona tampilan, bukan menurut zona server —
  // di Vercel server berjalan pada UTC.
  const sekarang = new Date(
    new Date().toLocaleString("en-US", { timeZone: ZONA })
  );

  const hasil: MonthlyTrendPoint[] = [];
  for (let mundur = 11; mundur >= 0; mundur -= 1) {
    const d = new Date(sekarang.getFullYear(), sekarang.getMonth() - mundur, 1);
    const row = byKey.get(`${d.getFullYear()}-${d.getMonth()}`);

    hasil.push({
      bulan: NAMA_BULAN[d.getMonth()],
      // SUM di Postgres bisa kembali sebagai string; Number() menjaga chart
      // tidak menerima teks yang lalu digambar sebagai NaN.
      pemasukan: Number(row?.pemasukan ?? 0),
      pengeluaran: Number(row?.pengeluaran ?? 0),
    });
  }

  return hasil;
});
