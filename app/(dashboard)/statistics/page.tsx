import { Suspense } from "react";

import { RangeFilter } from "@/components/statistics/range-filter";
import { StatisticsContent } from "@/components/statistics/statistics-content";
import { StatisticsSkeleton } from "@/components/statistics/statistics-skeleton";
import { formatRentangTanggal } from "@/lib/format";
import { getPeriodDates } from "@/lib/statistics/mock";
import { parseTimeRange } from "@/lib/statistics/types";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Next 16: searchParams adalah Promise, wajib di-await.
  const params = await searchParams;

  // Param kosong atau tidak valid jatuh ke 'this-month'.
  const range = parseTimeRange(params.range);

  // Sudah berupa "YYYY-MM-DD" dari komponen waktu lokal. Jangan diturunkan
  // sendiri dari objek Date lewat toISOString — lihat catatan zona waktu di
  // lib/statistics/mock.ts.
  const { startDateStr, endDateStr } = getPeriodDates(range);

  const periodLabel = formatRentangTanggal(startDateStr, endDateStr);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Statistik</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Lihat ke mana uang Anda paling banyak pergi.
        </p>
      </div>

      <RangeFilter range={range} periodLabel={periodLabel} />

      {/* Key = range, supaya skeleton muncul tiap rentang waktu berganti. */}
      <Suspense key={range} fallback={<StatisticsSkeleton />}>
        <StatisticsContent range={range} />
      </Suspense>
    </div>
  );
}
