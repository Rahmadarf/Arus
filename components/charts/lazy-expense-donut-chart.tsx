"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import type { ChartSlice } from "@/lib/statistics/types";

/**
 * Sama alasannya dengan lazy-overview-chart: Recharts tidak menggambar apa pun
 * di server, jadi memuatnya terpisah menghilangkan potongan JavaScript besar
 * dari jalur render pertama tanpa kehilangan piksel.
 */
const ExpenseDonutChart = dynamic(
  () =>
    import("@/components/statistics/expense-donut-chart").then(
      (m) => m.ExpenseDonutChart
    ),
  { ssr: false, loading: () => <DonutSkeleton /> }
);

function DonutSkeleton() {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Bulat dan seukuran donat aslinya, supaya kartunya tidak berubah
          tinggi saat chart tiba. */}
      <Skeleton className="mx-auto aspect-square w-full max-w-[260px] rounded-full" />
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-3 w-16 rounded-md" />
        ))}
      </div>
    </div>
  );
}

export function LazyExpenseDonutChart(props: {
  slices: ChartSlice[];
  totalExpense: number;
}) {
  return <ExpenseDonutChart {...props} />;
}
