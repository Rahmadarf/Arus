import { createClient } from '@/utils/supabase/server'
import ChartsWrapper from './chart-wrapper'
import Link from 'next/link'
import { getRecentTransactions } from '@/actions/transactions'
import { seedDefaultCategories } from '@/actions/categories'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  await seedDefaultCategories()
  const { data: recentTransactions } = await getRecentTransactions(5)

  // 1. Hitung batas tanggal secara presisi di level server
  const today = new Date()

  const date60DaysAgo = new Date()
  date60DaysAgo.setDate(today.getDate() - 60)
  const string60DaysAgo = date60DaysAgo.toISOString().split('T')[0]

  // Batas periode sebelumnya (60 hari sebelum window 60 hari saat ini), untuk perbandingan tren
  const date120DaysAgo = new Date()
  date120DaysAgo.setDate(today.getDate() - 120)
  const string120DaysAgo = date120DaysAgo.toISOString().split('T')[0]

  const date15DaysAgo = new Date()
  date15DaysAgo.setDate(today.getDate() - 15)

  // 2. Tarik semua transaksi dalam jendela waktu 60 hari terakhir
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, type, transaction_date')
    .gte('transaction_date', string60DaysAgo)
    .order('transaction_date', { ascending: true })

  const txList = transactions || []

  // 2b. Tarik transaksi periode sebelumnya (60-120 hari lalu) khusus untuk hitung persentase tren
  const { data: previousPeriodTransactions } = await supabase
    .from('transactions')
    .select('amount, type')
    .gte('transaction_date', string120DaysAgo)
    .lt('transaction_date', string60DaysAgo)

  let prevIncome = 0
  let prevExpense = 0
  ;(previousPeriodTransactions || []).forEach((tx) => {
    const amount = Number(tx.amount)
    if (tx.type === 'income') prevIncome += amount
    else if (tx.type === 'expense') prevExpense += amount
  })

  // --- AGREGASI DATA UNTUK DONUT CHART & KARTU RINGKASAN (60 HARI) ---
  let totalIncome = 0
  let totalExpense = 0

  txList.forEach((tx) => {
    const amount = Number(tx.amount)
    if (tx.type === 'income') {
      totalIncome += amount
    } else if (tx.type === 'expense') {
      totalExpense += amount
    }
  })

  const donutData = [
    { name: 'Pemasukan', value: totalIncome },
    { name: 'Pengeluaran', value: totalExpense },
  ]

  const summary = {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense
  }

  // --- HITUNG PERSENTASE PERUBAHAN DIBANDING PERIODE 60 HARI SEBELUMNYA ---
  // Jika periode sebelumnya 0 tapi periode ini > 0, anggap kenaikan 100% (hindari pembagian dengan nol).
  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const trend = {
    incomeChange: calcChange(totalIncome, prevIncome),
    expenseChange: calcChange(totalExpense, prevExpense),
  }

  // --- AGREGASI DATA UNTUK LINE CHART (15 HARI DENGAN MITIGASI BARIS KOSONG) ---
  // Membuat peta (Map) untuk menampung nilai transaksi harian
  const dailyMap = new Map<string, { income: number; expense: number }>()

  // Isi peta dengan baris tanggal default (0 rupiah) selama 15 hari terakhir agar tidak ada hari yang bolong
  for (let i = 14; i >= 0; i--) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    // Format tampilan tanggal pendek untuk sumbu X grafik (cth: "28 Jun")
    const displayDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    dailyMap.set(dateStr, { income: 0, expense: 0 })
  }

  // Masukkan data kalkulasi riwayat transaksi aktual ke dalam peta
  txList.forEach((tx) => {
    if (dailyMap.has(tx.transaction_date)) {
      const current = dailyMap.get(tx.transaction_date)!
      const amount = Number(tx.amount)

      if (tx.type === 'income') current.income += amount
      if (tx.type === 'expense') current.expense += amount

      dailyMap.set(tx.transaction_date, current)
    }
  })

  // Ubah struktur Map menjadi Array format JSON yang siap dibaca oleh Recharts
  const lineData = Array.from(dailyMap.entries()).map(([dateStr, value]) => {
    const d = new Date(dateStr)
    return {
      date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      income: value.income,
      expense: value.expense,
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Evaluasi strategis kondisi finansial tokomu secara berkala.</p>
      </div>

      {/* Render Komponen Grafik */}
      <ChartsWrapper
        donutData={donutData}
        lineData={lineData}
        summary={summary}
        trend={trend}
      />

      {/* Sesi Transaksi Terakhir */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Transaksi Terakhir</h2>
          <div className="flex gap-3">
            <Link href="/income" className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
              Pemasukan <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/expense" className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400">
              Pengeluaran <ArrowDownRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {(!recentTransactions || recentTransactions.length === 0) ? (
          <div className="text-center py-8 text-sm text-zinc-500">
            Belum ada aktivitas transaksi.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentTransactions.map((tx: any) => {
              // Ekstrak kategori dengan aman (mengantisipasi bentuk array atau objek dari Supabase)
              const category = Array.isArray(tx.categories) ? tx.categories[0] : tx.categories
              const isIncome = tx.type === 'income'

              return (
                <div key={tx.id} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${
                        isIncome
                          ? 'bg-emerald-50 dark:bg-emerald-500/10'
                          : 'bg-red-50 dark:bg-red-500/10'
                      }`}
                    >
                      {category?.emoji || (isIncome ? '💰' : '💸')}
                    </span>
                    <div className="truncate">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                        {tx.description || category?.name || 'Tanpa Deskripsi'}
                      </p>
                      <p className="text-xs text-zinc-400">{tx.transaction_date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span
                      className={`hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                      }`}
                    >
                      {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                    <span className={`text-sm font-semibold whitespace-nowrap ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isIncome ? '+' : '-'}Rp {Number(tx.amount).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}