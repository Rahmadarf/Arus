import Link from "next/link";
import { PieChart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryTable } from "@/components/statistics/category-table";
import { ExpenseDonutChart } from "@/components/statistics/expense-donut-chart";
import { getStatistics } from "@/lib/statistics/mock";
import { buildChartSlices } from "@/lib/statistics/utils";
import type { TimeRange } from "@/lib/statistics/types";

export async function StatisticsContent({ range }: { range: TimeRange }) {
  const data = await getStatistics(range);

  // Tanpa pengeluaran, persentase tidak bisa dihitung — tampilkan ajakan
  // bertindak, bukan donat kosong atau NaN%.
  if (data.totalExpense === 0 || data.categories.length === 0) {
    return (
      <Card className="rounded-2xl border-zinc-200 shadow-sm w-full">
        <CardContent className="flex flex-col items-center px-6 py-14 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-zinc-100">
            <PieChart className="size-5 text-zinc-400" />
          </div>
          <p className="mt-4 text-sm font-semibold text-zinc-900">
            Belum ada pengeluaran di periode ini
          </p>
          <p className="mt-1 max-w-sm text-sm text-zinc-500">
            Catat pengeluaran lewat tombol Transaksi Baru, atau pilih rentang waktu lain.
          </p>
          <Button variant="outline" className="mt-5 h-9 rounded-xl" asChild>
            <Link href="/transactions">Lihat transaksi</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const slices = buildChartSlices(data.categories);
  const adaPeleburan = slices.length !== data.categories.length;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* self-start: kartu chart tidak ikut memanjang mengikuti tinggi tabel. */}
      <Card className="rounded-2xl border-zinc-200 shadow-sm lg:col-span-2 lg:self-start">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-zinc-900">
            Komposisi Pengeluaran
          </CardTitle>
          <CardDescription>
            {adaPeleburan
              ? "Lima kategori terbesar, sisanya digabung."
              : "Seluruh kategori di periode ini."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseDonutChart slices={slices} totalExpense={data.totalExpense} />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-zinc-200 shadow-sm lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-zinc-900">Kategori Terboros</CardTitle>
          <CardDescription>
            {data.categories.length} kategori dari {data.transactionCount} transaksi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabel memuat semua kategori tanpa peleburan — chart untuk gambaran
              besar, tabel untuk detail sekaligus alternatif non-visual. */}
          <CategoryTable categories={data.categories} />
        </CardContent>
      </Card>
    </div>
  );
}
