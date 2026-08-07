import {
  BalanceCardSkeleton,
  OverviewChartSkeleton,
  RecentTransactionsSkeleton,
} from "@/components/dashboard/dashboard-skeletons";

/**
 * Tampil seketika saat pengguna menekan menu Dashboard.
 *
 * Tanpa berkas ini, Next menahan navigasi sampai server selesai — tautan sudah
 * diklik tapi layar tidak berubah sama sekali, dan itu yang dibaca pengguna
 * sebagai aplikasi ngelag. Dengan berkas ini perpindahannya terasa instan
 * karena kerangka halaman langsung menggantikan halaman lama.
 */
export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Ringkasan aktivitas keuangan Anda bulan ini.
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full">
        <BalanceCardSkeleton />
        <OverviewChartSkeleton />
        <RecentTransactionsSkeleton />
      </div>
    </div>
  );
}
