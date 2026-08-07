import { Suspense } from "react";

import BalanceCard from "@/components/balance-card";
import { LazyOverviewChart } from "@/components/charts/lazy-overview-chart";
import { RecentTransactions } from "@/components/recent-transactions";
import {
  BalanceCardSkeleton,
  OverviewChartSkeleton,
  RecentTransactionsSkeleton,
} from "@/components/dashboard/dashboard-skeletons";
import {
  getDashboardSummary,
  getMonthlyTrendData,
  getRecentTransactions,
} from "@/app/data/analytics";

/**
 * Dashboard.
 *
 * Komponen halamannya SENGAJA tidak async dan tidak menunggu apa pun. Judul
 * dan kerangka kartu terkirim seketika, lalu tiap bagian menyusul sendiri
 * lewat Suspense. Versi sebelumnya menunggu seluruh kueri selesai sebelum
 * mengirim satu byte pun — layar kosong selama itu, dan itulah yang terasa
 * sebagai "berat".
 *
 * Ketiga bagian ini bersaudara, bukan bersarang, jadi kueri mereka berjalan
 * bersamaan; bagian tercepat tampil lebih dulu tanpa menunggu yang lambat.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Ringkasan aktivitas keuangan Anda bulan ini.
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full">
        <div className="w-full">
          <Suspense fallback={<BalanceCardSkeleton />}>
            <BagianSaldo />
          </Suspense>
        </div>

        <div className="w-full">
          <Suspense fallback={<OverviewChartSkeleton />}>
            <BagianTren />
          </Suspense>
        </div>

        <div className="w-full">
          <Suspense fallback={<RecentTransactionsSkeleton />}>
            <BagianTerbaru />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function BagianSaldo() {
  // Dijumlahkan di SQL — dua baris hasil, bukan seluruh riwayat transaksi.
  const { balance, income, expense } = await getDashboardSummary();
  return <BalanceCard balance={balance} income={income} expense={expense} />;
}

async function BagianTren() {
  const data = await getMonthlyTrendData();
  return <LazyOverviewChart data={data} />;
}

async function BagianTerbaru() {
  // Hanya lima baris yang ditarik, bukan semua lalu dipotong di memori.
  const data = await getRecentTransactions(5);
  return <RecentTransactions data={data} />;
}
