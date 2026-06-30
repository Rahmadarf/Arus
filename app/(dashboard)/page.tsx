import { createClient } from '@/utils/supabase/server'
import ChartsWrapper from './chart-wrapper'
import Link from 'next/link'
import { getRecentTransactions } from '@/actions/transactions'
import { seedDefaultCategories } from '@/actions/categories'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // 1. Eksekusi yang tidak bergantung data paralel (seeding)
  await seedDefaultCategories()

  // 2. Cegah masalah Timezone UTC Server (Paksa ke WIB/GMT+7 untuk logika tanggal)
  // Ini penting agar perpotongan hari di server sama dengan di layar user
  const now = new Date()
  const today = new Date(now.getTime() + (7 * 60 * 60 * 1000)) 

  const date60DaysAgo = new Date(today)
  date60DaysAgo.setDate(today.getDate() - 60)
  const string60DaysAgo = date60DaysAgo.toISOString().split('T')[0]

  const date120DaysAgo = new Date(today)
  date120DaysAgo.setDate(today.getDate() - 120)
  const string120DaysAgo = date120DaysAgo.toISOString().split('T')[0]

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // 3. PENGAMBILAN DATA PARALEL (Menghilangkan Waterfall Fetching)
  const [
    { data: recentTransactions },
    { data: transactions },
    { data: previousPeriodTransactions },
    { data: profile }
  ] = await Promise.all([
    getRecentTransactions(5),
    supabase
      .from('transactions')
      .select('amount, type, transaction_date, saving_goal_id')
      .gte('transaction_date', string60DaysAgo)
      .order('transaction_date', { ascending: true }),
    supabase
      .from('transactions')
      .select('amount, type, saving_goal_id')
      .gte('transaction_date', string120DaysAgo)
      .lt('transaction_date', string60DaysAgo),
    supabase
      .from('profiles')
      .select('effective_balance')
      .eq('id', user.id)
      .single()
  ])

  const txList = transactions || []

  // --- AGREGASI DATA PERIODE LALU ---
  let prevIncome = 0
  let prevTotalExpense = 0
  let prevSavedAmount = 0

  ;(previousPeriodTransactions || []).forEach((tx) => {
    const amount = Number(tx.amount)
    if (tx.type === 'income') prevIncome += amount
    else if (tx.type === 'expense') {
      if (tx.saving_goal_id) prevSavedAmount += amount
      else prevTotalExpense += amount
    }
  })

  // --- AGREGASI DATA PERIODE SAAT INI ---
  let totalIncome = 0      
  let totalExpense = 0      
  let savedAmount = 0      

  txList.forEach((tx) => {
    const amount = Number(tx.amount)
    if (tx.type === 'expense') {
      if (tx.saving_goal_id) savedAmount += amount
      else totalExpense += amount
    } else if (tx.type === 'income') {
      if (tx.saving_goal_id) savedAmount -= amount
      else totalIncome += amount
    }
  })

  const donutData = [
    { name: 'Pemasukan', value: totalIncome },
    { name: 'Konsumsi', value: totalExpense },
    { name: 'Ditabung', value: savedAmount },
  ]

  const summary = {
    totalIncome,
    totalExpense, 
    savedAmount,
    balance: profile?.effective_balance
  }

  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const trend = {
    incomeChange: calcChange(totalIncome, prevIncome),
    expenseChange: calcChange(totalExpense, prevTotalExpense), 
    savingsChange: calcChange(savedAmount, prevSavedAmount),
  }

  // --- AGREGASI LINE CHART (15 HARI) ---
  const dailyMap = new Map<string, { income: number; expense: number; savings: number }>()

  for (let i = 14; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    dailyMap.set(dateStr, { income: 0, expense: 0, savings: 0 })
  }

  txList.forEach((tx) => {
    if (dailyMap.has(tx.transaction_date)) {
      const current = dailyMap.get(tx.transaction_date)!
      const amount = Number(tx.amount)

      if (tx.type === 'income') {
        if (tx.saving_goal_id) current.savings -= amount 
        else current.income += amount
      } else if (tx.type === 'expense') {
        if (tx.saving_goal_id) current.savings += amount 
        else current.expense += amount
      }
      dailyMap.set(tx.transaction_date, current)
    }
  })

  const lineData = Array.from(dailyMap.entries()).map(([dateStr, value]) => {
    const d = new Date(dateStr)
    return {
      date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      income: value.income,
      expense: value.expense,
      savings: value.savings,
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Evaluasi strategis kondisi finansial tokomu secara berkala.</p>
      </div>

      <ChartsWrapper
        donutData={donutData}
        lineData={lineData}
        summary={summary}
        trend={trend}
      />

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
              const isNormalIncome = tx.type === 'income' && !tx.saving_goal_id;
              const isSavingsWithdrawal = tx.type === 'income' && !!tx.saving_goal_id; 
              const isSavingsDeposit = tx.type === 'expense' && !!tx.saving_goal_id;
              // isExpense murni sudah tidak perlu variabel, ini adalah fallback (else) terakhir

              return (
                <div key={tx.id} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center space-x-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${
                        isNormalIncome ? 'bg-emerald-50' :
                        isSavingsWithdrawal ? 'bg-blue-50' : 
                        isSavingsDeposit ? 'bg-violet-50' : 
                        'bg-red-50' // Ini untuk expense normal
                      }`}>
                      {isNormalIncome ? '💰' : isSavingsWithdrawal ? '📥' : isSavingsDeposit ? '🎯' : '💸'}
                    </span>
                    <p className="text-sm font-medium">{tx.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* PERBAIKAN BUG VISUAL DI SINI */}
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        isNormalIncome ? 'text-emerald-700 bg-emerald-50' :
                        isSavingsWithdrawal ? 'text-blue-700 bg-blue-50' : 
                        isSavingsDeposit ? 'text-violet-700 bg-violet-50' :
                        'text-red-700 bg-red-50'
                      }`}>
                      {isNormalIncome ? 'Pemasukan' : isSavingsWithdrawal ? 'Pencairan Tabungan' : isSavingsDeposit ? 'Menabung' : 'Pengeluaran'}
                    </span>

                    <span className={`text-sm font-semibold ${
                        isNormalIncome ? 'text-emerald-600' : 
                        isSavingsWithdrawal ? 'text-blue-600' : 
                        'text-red-600'
                      }`}>
                      {isNormalIncome || isSavingsWithdrawal ? '+' : '-'} Rp {Number(tx.amount).toLocaleString()}
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