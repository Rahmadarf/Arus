'use client'

import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { fetchMoreTransactions } from '@/actions/transactions'
import TransactionActions from './transaction-actions'

interface Transaction {
    id: string
    description: string
    amount: number
    transaction_date: string
    created_at: string
    categories: { name: string; emoji: string }
}

interface Props {
    initialTransactions: Transaction[]
    type: 'income' | 'expense'
}

export default function InfiniteTransactionList({ initialTransactions, type }: Props) {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
    const [hasMore, setHasMore] = useState(initialTransactions.length >= 10)
    const [loading, setLoading] = useState(false)

    // Hook untuk mendeteksi saat elemen observer terlihat di layar
    const { ref, inView } = useInView()

    useEffect(() => {
        // Sinkronisasi jika data awal dari server berubah (misal: user baru saja menambah data baru)
        setTransactions(initialTransactions)
        setHasMore(initialTransactions.length >= 10)
    }, [initialTransactions])

    useEffect(() => {
        async function loadMore() {
            if (inView && hasMore && !loading) {
                setLoading(true)
                // Ambil created_at dari item terakhir sebagai kursor
                const lastCursor = transactions[transactions.length - 1].created_at

                const { data, error } = await fetchMoreTransactions(type, lastCursor)

                if (data) {
                    if (data.length < 10) {
                        setHasMore(false) // Data habis
                    }
                    setTransactions((prev) => [...prev, ...(data as unknown as Transaction[])])
                }
                setLoading(false)
            }
        }

        loadMore()
    }, [inView, hasMore, loading, transactions, type])

    if (transactions.length === 0) {
        return <p className="text-sm text-zinc-400 py-4">Belum ada riwayat {type === 'income' ? 'pemasukan' : 'pengeluaran'}.</p>
    }

    return (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3.5">
                    <div className="flex items-center space-x-3 truncate">
                        <span className="text-xl flex-shrink-0">{tx.categories?.emoji || (type === 'income' ? '💰' : '💸')}</span>
                        <div className="truncate">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{tx.description}</p>
                            <p className="text-xs text-zinc-400">{tx.transaction_date}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className={`text-sm font-semibold whitespace-nowrap ${type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {type === 'income' ? '+' : '-'}Rp {Number(tx.amount).toLocaleString('id-ID')}
                        </span>
                        <TransactionActions id={tx.id} type={type} />
                    </div>
                </div>
            ))}

            {/* Elemen Pemicu (Trigger) untuk Infinite Scroll */}
            {hasMore && (
                <div ref={ref} className="py-4 flex justify-center">
                    <span className="text-xs text-zinc-400 animate-pulse">Memuat riwayat sebelumnya...</span>
                </div>
            )}

            {!hasMore && transactions.length > 0 && (
                <div className="py-4 flex justify-center">
                    <span className="text-xs text-zinc-500">Semua riwayat telah dimuat.</span>
                </div>
            )}
        </div>
    )
}