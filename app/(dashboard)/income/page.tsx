import { createClient } from '@/utils/supabase/server'
import InfiniteTransactionList from '@/components/infinite-transaction-list'
import TransactionFilter from '@/components/transaction-filter'
import ExportPdfButton from '@/components/export-pdf-button'
import TransactionForm from '@/components/transaction-form'
import { fetchMoreTransactions, getMonthlyTrend, TransactionFilters } from '@/actions/transactions'
import TrendChart from '@/components/trend-chart'

export default async function IncomePage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const trendData = await getMonthlyTrend('income')

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, emoji')
    .eq('type', 'income')
    .order('created_at', { ascending: false })

  const currentFilters: TransactionFilters = {
    year: searchParams.year,
    month: searchParams.month,
    categoryId: searchParams.categoryId,
    search: searchParams.search,
  }

  const { data: initialTransactions } = await fetchMoreTransactions('income', undefined, currentFilters)

  return (
    // 1. KOREKSI LEBAR: Ubah dari max-w-3xl menjadi max-w-6xl agar muat 2 kolom
    <div className="max-w-6xl mx-auto w-full p-4 md:p-6 space-y-8">

      {/* Header Utama */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Pemasukan
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Riwayat seluruh aliran dana yang masuk.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Tombol ekspor tetap di atas sebagai aksi tingkat halaman */}
          <ExportPdfButton type="income" />
        </div>
      </div>

      {/* 2. ARSITEKTUR GRID: Membagi halaman menjadi 3 bagian (1/3 Form, 2/3 Daftar) di layar besar */}
      <div className="grid gap-8 lg:grid-cols-3 items-start">

        {/* KOLOM KIRI: Formulir (Menempati 1 bagian kolom) */}
        {/* Taktik 'sticky top-6' menahan form tetap di layar meski kolom kanan di-scroll */}
        <div className="lg:col-span-1 sticky top-6">
          <TransactionForm type="income" categories={categories || []} />
        </div>

        {/* KOLOM KANAN: Filter & Daftar Transaksi (Menempati 2 bagian kolom) */}
        <div className="lg:col-span-2 space-y-6">
          <TransactionFilter categories={categories || []} />

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <InfiniteTransactionList
              key={JSON.stringify(currentFilters)}
              initialTransactions={initialTransactions || []}
              type="income"
            />
          </div>
        </div>

      </div>
    </div>
  )
}