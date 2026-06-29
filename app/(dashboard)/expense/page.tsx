import { createClient } from '@/utils/supabase/server'
import TransactionForm from '@/components/transaction-form'
import InfiniteTransactionList from '@/components/infinite-transaction-list'
import { TrendingDown } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ edit?: string }>
}

export default async function ExpensePage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const resolvedParams = await searchParams
  const editId = resolvedParams.edit

  // 1. Ambil kategori khusus income
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, emoji')
    .eq('type', 'expense')
    .order('name')

// 2. Ambil 10 riwayat transaksi awal dari server
  const { data: history } = await supabase
    .from('transactions')
    .select(`id, description, amount, transaction_date, created_at, category_id, categories (name, emoji)`)
    .eq('type', 'expense')
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
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Pengeluaran (Expense)</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Pantau ke mana perginya uangmu untuk mendeteksi pemborosan.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TransactionForm
            type="expense"
            categories={categories || []}
            initialData={transactionToEdit}
          />
        </div>
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  <TrendingDown className="h-4 w-4" />
                </span>
                Riwayat Expense
              </h3>
            </div>

            {/* Serahkan data awal ke Klien untuk Infinite Scroll */}
            <InfiniteTransactionList
              initialTransactions={history as any || []}
              type="expense"
            />

          </div>
        </div>
      </div>
    </div>
  )
}