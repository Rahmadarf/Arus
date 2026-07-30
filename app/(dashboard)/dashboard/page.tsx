import BalanceCard from "@/components/balance-card"
import { OverviewChart } from "@/components/overview-chart"
import { RecentTransactions } from "@/components/recent-transactions";
import { getTransactionByUserId } from "@/app/actions/transaction";

export default async function DashboardPage() {
  // TODO(backend): ganti dengan id pengguna dari session begitu auth tersambung
  // ke tabel User. Id uji ini dipakai supaya sejalan dengan pola yang sudah ada
  // di app/actions/transaction.ts dan lib/transactions-mock.ts — bukan pilihan
  // baru, dan harus ikut dibereskan saat penyaringan per akun dikerjakan.
  const testingUserId = "id-user-testing-rahmad-123";

  const transaksi = await getTransactionByUserId(testingUserId);

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
          <BalanceCard />
        </div>

        {/* Bagian 2: Grafik Ringkasan (Mengambil ruang penuh di bawah kartu) */}
        <div className="w-full">
          <OverviewChart />
        </div>

        {/* Bagian 3: Daftar Transaksi Terbaru.
            getTransactionByUserId mengembalikan undefined kalau query-nya gagal
            (blok catch di dalamnya tidak me-return apa pun), jadi nilai baliknya
            wajib dijaga di sini — itu penyebab crash `data.map` sebelumnya. */}
        <div className="w-full">
          <RecentTransactions data={transaksi?.slice(0, 5) ?? []} />
        </div>
      </div>

    </div>
  );
}
