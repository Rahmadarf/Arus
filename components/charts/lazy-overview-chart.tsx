"use client";

import dynamic from "next/dynamic";

import { OverviewChartSkeleton } from "@/components/dashboard/dashboard-skeletons";
import type { MonthlyTrendPoint } from "@/app/data/analytics";

/**
 * Recharts dimuat terpisah, bukan ikut bundel awal.
 *
 * ssr: false bukan kompromi di sini — Recharts memakai ResponsiveContainer yang
 * mengukur elemen DOM, jadi di server ia memang tidak menggambar apa pun.
 * (Terbukti: HTML hasil render server tidak memuat satu pun <path> chart.)
 * Merendernya di server hanya menambah kerja tanpa piksel yang dihasilkan.
 *
 * Hasilnya potongan JavaScript terbesar di halaman ini baru diunduh setelah
 * kerangka halaman tampil, bukan menghalanginya.
 */
const OverviewChart = dynamic(
  () => import("@/components/overview-chart").then((m) => m.OverviewChart),
  { ssr: false, loading: () => <OverviewChartSkeleton /> }
);

export function LazyOverviewChart({ data }: { data: MonthlyTrendPoint[] }) {
  return <OverviewChart data={data} />;
}
