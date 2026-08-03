import BalanceCard from "@/components/balance-card"
import { OverviewChart } from "@/components/overview-chart"
import { RecentTransactions } from "@/components/recent-transactions";
import { getAuthenticatedUserId, getTransactionByUserId } from "@/app/actions/transaction";
import { getMonthlyTrendData } from "@/app/data/analytics";

export default async function DashboardPage() {

  const userId = await getAuthenticatedUserId()

  // 🚀 OPTIMASI: Kueri paralel untuk memotong latensi kumulatif
  const [txData, trendChartData] = await Promise.all([
    getTransactionByUserId(userId),
    getMonthlyTrendData(userId),
  ]);

  const totalIncome = txData.filter((tx) => tx.type === "INCOME").reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = txData.filter((tx) => tx.type === "EXPENSE").reduce((sum, tx) => sum + tx.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Ringkasan aktivitas keuangan Anda bulan ini.</p>
      </div>

      <div className="flex flex-col gap-6 w-full">
        {/* Bagian 1: Kartu Saldo (Otomatis menjadi 1 kolom di HP, 3 kolom di Laptop) */}
        <div className="w-full">
          <BalanceCard balance={totalBalance} income={totalIncome} expense={totalExpense} />
        </div>

        {/* Bagian 2: Grafik Ringkasan (Mengambil ruang penuh di bawah kartu) */}
        <div className="w-full">
          <OverviewChart data={trendChartData} />
        </div>

        {/* Bagian 3: Daftar Transaksi Terbaru.
            getTransactionByUserId mengembalikan undefined kalau query-nya gagal
            (blok catch di dalamnya tidak me-return apa pun), jadi nilai baliknya
            wajib dijaga di sini — itu penyebab crash `data.map` sebelumnya. */}
        <div className="w-full">
          <RecentTransactions data={txData.slice(0, 5)} />
        </div>
      </div>

    </div>
  );
}
