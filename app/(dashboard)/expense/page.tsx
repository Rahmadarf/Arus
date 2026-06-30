import { createClient } from '@/utils/supabase/server'
import InfiniteTransactionList from '@/components/infinite-transaction-list'
import TransactionFilter from '@/components/transaction-filter'
import ExportPdfButton from '@/components/export-pdf-button'
import TransactionForm from '@/components/transaction-form'
import { fetchMoreTransactions, getMonthlyTrend, TransactionFilters } from '@/actions/transactions'
import TrendChart from '@/components/trend-chart'

export default async function expensePage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const trendData = await getMonthlyTrend('expense')

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, emoji')
    .eq('type', 'expense')
    .order('created_at', { ascending: false })

  const currentFilters: TransactionFilters = {
    year: searchParams.year,
    month: searchParams.month,
    categoryId: searchParams.categoryId,
    search: searchParams.search,
  }

  const { data: initialTransactions } = await fetchMoreTransactions('expense', undefined, currentFilters)

  // ==============================================================
  // 1. LOGIKA MODE EDIT (INI YANG SEBELUMNYA HILANG DARI KODEMU)
  // ==============================================================
  let transactionToEdit = null
  const editId = searchParams.edit

  if (editId) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Ambil data spesifik dari transaksi yang ID-nya ada di URL
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', editId)
        .eq('user_id', user.id)
        .single()

      if (!error && data) {
        transactionToEdit = data
      }
    }
  }
  // ==============================================================

  return (
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
          <ExportPdfButton type="expense" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 items-start">

        {/* KOLOM KIRI: Formulir */}
        <div className="lg:col-span-1 sticky top-6">
          {/* 2. TAKTIK NUKLIR: Lempar 'key' dan 'initialData' ke Form */}
          <TransactionForm 
            key={transactionToEdit?.id || 'form-baru'}
            type="expense" 
            categories={categories || []} 
            initialData={transactionToEdit} 
          />
        </div>

        {/* KOLOM KANAN: Filter & Daftar Transaksi */}
        <div className="lg:col-span-2 space-y-6">
          <TransactionFilter categories={categories || []} />

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <InfiniteTransactionList
              key={JSON.stringify(currentFilters)}
              initialTransactions={initialTransactions || []}
              type="expense"
            />
          </div>
        </div>

      </div>
    </div>
  )
}