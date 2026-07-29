import BalanceCard from "@/components/balance-card"
import { OverviewChart } from "@/components/overview-chart"
import { RecentTransactions } from "@/components/recent-transactions";
import { getTransactionByUserId } from "./actions/transaction";

export default async function DashboardPage() {

  const testingUserId = "id-user-testing-rahmad-123";

  const dataTransactions = await getTransactionByUserId(testingUserId)
  
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo size="sm" />

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="h-9 rounded-xl" asChild>
            <Link href="/login">Masuk</Link>
          </Button>
          <Button
            className="h-9 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900"
            asChild
          >
            <Link href="/register">Daftar</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6">
        <section className="py-14 sm:py-20">
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Catat arus kas. Lihat polanya.
          </h1>
          <p className="mt-3 max-w-xl text-base text-zinc-500">
            Arus menyimpan pemasukan dan pengeluaran harian Anda, lalu menunjukkan ke
            mana uang itu benar-benar pergi.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              className="h-10 rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-900"
              asChild
            >
              <Link href="/register">Buat akun</Link>
            </Button>
            <Button variant="outline" className="h-10 rounded-xl px-5" asChild>
              <Link href="/login">Sudah punya akun</Link>
            </Button>
          </div>

        {/* Bagian 3: Daftar Transaksi Terbaru */}
        <div className="w-full">
          <RecentTransactions data={dataTransactions?.slice(0, 5) || []} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
