'use client'

import dynamic from 'next/dynamic'

// Definisikan tipe props agar TypeScript tidak mengeluh
interface DashboardChartsProps {
  donutData: { name: string; value: number }[]
  lineData: { date: string; income: number; expense: number }[]
  summary: { totalIncome: number; totalExpense: number; balance: number }
}

// Eksekusi dynamic import secara sah di dalam area Klien
const DashboardCharts = dynamic(() => import('./dashboard-charts'), { 
  ssr: false,
  loading: () => (
    <div className="grid gap-6 md:grid-cols-2 mt-8">
      <div className="flex h-[420px] w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
        <span className="text-sm text-zinc-400 animate-pulse">Memuat grafik komposisi...</span>
      </div>
      <div className="flex h-[420px] w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
        <span className="text-sm text-zinc-400 animate-pulse">Memuat tren arus kas...</span>
      </div>
    </div>
  )
})

export default function ChartsWrapper(props: DashboardChartsProps) {
  return <DashboardCharts {...props} />
}