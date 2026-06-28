'use client'

import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
    LineChart, Line, XAxis, YAxis, Tooltip as LineTooltip
} from 'recharts'

interface DashboardChartsProps {
    donutData: { name: string; value: number }[]
    lineData: { date: string; income: number; expense: number }[]
    summary: { totalIncome: number; totalExpense: number; balance: number }
}

const COLORS = ['#10B981', '#EF4444'] // Emerald untuk Income, Red untuk Expense

export default function DashboardCharts({ donutData, lineData, summary }: DashboardChartsProps) {
    return (
        <div className="space-y-8">
            {/* Tiga Kartu Ringkasan Utama */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Pemasukan (60 Hari)</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">Rp {summary.totalIncome.toLocaleString('id-ID')}</p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Pengeluaran (60 Hari)</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">Rp {summary.totalExpense.toLocaleString('id-ID')}</p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Sisa Saldo Efektif</p>
                    <p className={`text-2xl font-bold mt-1 ${summary.balance >= 0 ? 'text-zinc-900 dark:text-zinc-50' : 'text-red-500'}`}>
                        Rp {summary.balance.toLocaleString('id-ID')}
                    </p>
                </div>
            </div>

            {/* Grid Utama Visualisasi Grafik */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Donut Chart */}
                <div className="flex h-[420px] flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Komposisi Kas 60 Hari Terakhir</h2>
                    <p className="text-xs text-zinc-400 mb-6">Perbandingan persentase uang masuk dan keluar.</p>
                    <div className="flex-1 flex items-center justify-center">
                        {donutData.every(d => d.value === 0) ? (
                            <span className="text-sm text-zinc-400">Belum ada data sirkulasi uang dalam 60 hari.</span>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={donutData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={70}
                                        outerRadius={95}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {donutData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Line Chart */}
                <div className="flex h-[420px] flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Tren Arus Kas 15 Hari Terakhir</h2>
                    <p className="text-xs text-zinc-400 mb-6">Fluktuasi harian aktivitas pemasukan dan pengeluaran.</p>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${Number(v) / 1000}k`} />                                <Line type="monotone" dataKey="income" name="Pemasukan" stroke="#10B981" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="expense" name="Pengeluaran" stroke="#EF4444" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}