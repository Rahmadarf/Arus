import { createClient } from '@/utils/supabase/server'
import ChartsWrapper from './charts-wrapper'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Hitung batas tanggal secara presisi di level server
  const today = new Date()
  
  const date60DaysAgo = new Date()
  date60DaysAgo.setDate(today.getDate() - 60)
  const string60DaysAgo = date60DaysAgo.toISOString().split('T')[0]

  const date15DaysAgo = new Date()
  date15DaysAgo.setDate(today.getDate() - 15)

  // 2. Tarik semua transaksi dalam jendela waktu 60 hari terakhir
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, type, transaction_date')
    .gte('transaction_date', string60DaysAgo)
    .order('transaction_date', { ascending: true })

  const txList = transactions || []

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
      />
    </div>
  )
}