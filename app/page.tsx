import BalanceCard from "@/components/balance-card"
import { OverviewChart } from "@/components/overview-chart"
import { RecentTransactions } from "@/components/recent-transactions";
import { getTransactionByUserId } from "./actions/transaction";

export default async function DashboardPage() {

  const testingUserId = "id-user-testing-rahmad-123";

  const dataTransactions = await getTransactionByUserId(testingUserId)
  
  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Ringkasan aktivitas keuangan Anda bulan ini.</p>
      </div>

      {/* Tempelkan Pilihan 1 atau Pilihan 2 di bawah ini */}
      <div className="flex flex-col gap-6 w-full">
        {/* Bagian 1: Kartu Saldo (Otomatis menjadi 1 kolom di HP, 3 kolom di Laptop) */}
        <div className="w-full">
          <BalanceCard />
        </div>

        {/* Bagian 2: Grafik Ringkasan (Mengambil ruang penuh di bawah kartu) */}
        <div className="w-full">
          <OverviewChart />
        </div>

        {/* Bagian 3: Daftar Transaksi Terbaru */}
        <div className="w-full">
          <RecentTransactions data={dataTransactions?.slice(0, 5) || []} />
        </div>
      </div>

    </div>
  );
}
