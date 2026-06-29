'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function TrendChart({ data, type }: { data: any[], type: 'income' | 'expense' }) {
    const strokeColor = type === 'income' ? '#10B981' : '#EF4444'

    return (
        <div className="flex h-[420px] flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-8">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Tren {type === 'income' ? 'Pemasukan' : 'Pengeluaran'} 15 Hari</h2>
            <p className="mb-6 text-xs text-zinc-400">Fluktuasi harian aktivitas.</p>

            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid vertical={false} stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" />
                        <XAxis dataKey="date" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${Number(v) / 1000}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            formatter={(value: any) => {
                                // Berikan fallback jika value undefined atau null
                                const numValue = value ? Number(value) : 0;
                                return [`Rp ${numValue.toLocaleString('id-ID')}`, 'Jumlah'];
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke={strokeColor}
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 6 }}
                            animationDuration={900}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}