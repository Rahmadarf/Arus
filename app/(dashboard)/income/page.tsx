import { createClient } from '@/utils/supabase/server'
import TransactionForm from '@/components/transaction-form'
import InfiniteTransactionList from '@/components/infinite-transaction-list'
import { TrendingUp } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ edit?: string }>
}

export default async function IncomePage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const resolvedParams = await searchParams
  const editId = resolvedParams.edit

  // 1. Ambil kategori khusus income
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, emoji')
    .eq('type', 'income')
    .order('name')

  // 2. Ambil 10 riwayat transaksi awal dari server
  const { data: history } = await supabase
    .from('transactions')
    .select(`id, description, amount, transaction_date, created_at, category_id, categories (name, emoji)`)
    .eq('type', 'income')
    .order('created_at', { ascending: false }) // WAJIB GANTI order ke created_at
    .limit(10)

  // 3. Jika sedang dalam mode edit, ambil data spesifik transaksi tersebut dari server
  let transactionToEdit = null
  if (editId) {
    const { data } = await supabase
      .from('transactions')
      .select('id, description, amount, transaction_date, category_id')
      .eq('id', editId)
      .single()
    transactionToEdit = data
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Pemasukan (Income)</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Kelola riwayat kas masuk dengan akurat.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TransactionForm
            type="income"
            categories={categories || []}
            initialData={transactionToEdit}
          />
        </div>
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </span>
                Riwayat Income
              </h3>
            </div>

            {/* Serahkan data awal ke Klien untuk Infinite Scroll */}
            <InfiniteTransactionList
              initialTransactions={history as any || []}
              type="income"
            />

          </div>
        </div>
      </div>
    </div>
  )
}