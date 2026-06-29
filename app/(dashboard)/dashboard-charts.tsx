'use client'

import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface DashboardChartsProps {
    donutData: { name: string; value: number }[]
    lineData: { date: string; income: number; expense: number }[]
    summary: { totalIncome: number; totalExpense: number; balance: number }
    trend: { incomeChange: number; expenseChange: number }
}

const COLORS = ['#10B981', '#EF4444'] // Emerald untuk Income, Red untuk Expense

// Tooltip kustom untuk Donut Chart
function DonutTooltip({ active, payload }: any) {
    if (!active || !payload || !payload.length) return null
    const entry = payload[0]
    return (
        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{entry.name}</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Rp {Number(entry.value).toLocaleString('id-ID')}
            </p>
        </div>
    )
}

// Tooltip kustom untuk Line Chart
function LineChartTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null
    return (
        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <p className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
            {payload.map((entry: any) => (
                <div key={entry.dataKey} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        {entry.name}
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                        Rp {Number(entry.value).toLocaleString('id-ID')}
                    </span>
                </div>
            ))}
        </div>
    )
}

export default function DashboardCharts({ donutData, lineData, summary, trend }: DashboardChartsProps) {
    return (
        <div className="space-y-8">
            {/* Tiga Kartu Ringkasan Utama */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                Total Pemasukan (60 Hari)
                            </p>
                            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                Rp {summary.totalIncome.toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <TrendingUp className="h-4.5 w-4.5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 border-t border-zinc-100 pt-3 text-xs font-medium dark:border-zinc-800">
                        {trend.incomeChange >= 0 ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span className={trend.incomeChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>
                            {Math.abs(trend.incomeChange)}%
                        </span>
                        <span className="text-zinc-400">dari periode lalu</span>
                    </div>
                </div>
                <div className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                Total Pengeluaran (60 Hari)
                            </p>
                            <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                                Rp {summary.totalExpense.toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                            <TrendingDown className="h-4.5 w-4.5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 border-t border-zinc-100 pt-3 text-xs font-medium dark:border-zinc-800">
                        {trend.expenseChange <= 0 ? (
                            <ArrowDownRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span className={trend.expenseChange <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>
                            {Math.abs(trend.expenseChange)}%
                        </span>
                        <span className="text-zinc-400">dari periode lalu</span>
                    </div>
                </div>
                <div className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                Sisa Saldo Efektif
                            </p>
                            <p className={`mt-1 text-2xl font-bold ${summary.balance >= 0 ? 'text-zinc-900 dark:text-zinc-50' : 'text-red-500'}`}>
                                Rp {summary.balance.toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            <Wallet className="h-4.5 w-4.5" />
                        </div>
                    </div>
                    <div className="mt-3 border-t border-zinc-100 pt-3 text-xs font-medium text-zinc-400 dark:border-zinc-800">
                        {summary.totalIncome > 0
                            ? `Rasio simpan ${Math.round((summary.balance / summary.totalIncome) * 100)}%`
                            : 'Belum ada data pemasukan'}
                    </div>
                </div>
            </div>

            {/* Grid Utama Visualisasi Grafik */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Donut Chart */}
                <div className="flex h-[420px] flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Komposisi Kas 60 Hari Terakhir</h2>
                    <p className="mb-6 text-xs text-zinc-400">Perbandingan persentase uang masuk dan keluar.</p>
                    <div className="flex flex-1 items-center justify-center">
                        {donutData.every(d => d.value === 0) ? (
                            <span className="text-sm text-zinc-400">Belum ada data sirkulasi uang dalam 60 hari.</span>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <defs>
                                        <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#34D399" />
                                            <stop offset="100%" stopColor="#059669" />
                                        </linearGradient>
                                        <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#F87171" />
                                            <stop offset="100%" stopColor="#DC2626" />
                                        </linearGradient>
                                    </defs>
                                    <Pie
                                        data={donutData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={70}
                                        outerRadius={95}
                                        paddingAngle={4}
                                        dataKey="value"
                                        cornerRadius={6}
                                        animationDuration={700}
                                        animationEasing="ease-out"
                                    >
                                        {donutData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={index === 0 ? 'url(#gradIncome)' : 'url(#gradExpense)'}
                                                stroke="transparent"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<DonutTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Line Chart */}
                <div className="flex h-[420px] flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Tren Arus Kas 15 Hari Terakhir</h2>
                    <p className="mb-6 text-xs text-zinc-400">Fluktuasi harian aktivitas pemasukan dan pengeluaran.</p>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="lineIncome" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#10B981" />
                                        <stop offset="100%" stopColor="#34D399" />
                                    </linearGradient>
                                    <linearGradient id="lineExpense" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#EF4444" />
                                        <stop offset="100%" stopColor="#F87171" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    vertical={false}
                                    stroke="currentColor"
                                    className="text-zinc-100 dark:text-zinc-800"
                                />
                                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${Number(v) / 1000}k`} />
                                <Tooltip content={<LineChartTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="income"
                                    name="Pemasukan"
                                    stroke="url(#lineIncome)"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                                    animationDuration={900}
                                    animationEasing="ease-out"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="expense"
                                    name="Pengeluaran"
                                    stroke="url(#lineExpense)"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                                    animationDuration={900}
                                    animationEasing="ease-out"
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}