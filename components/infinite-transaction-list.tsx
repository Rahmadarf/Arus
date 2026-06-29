'use client'

import { useState, useEffect, useRef } from 'react'
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
  // 1. Ini adalah Hati dari komponenmu, satu-satunya sumber data UI
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)

  const [hasMore, setHasMore] = useState(initialTransactions.length >= 10)
  const [loading, setLoading] = useState(false)
  const { ref, inView } = useInView()

  // Ref untuk melacak ID transaksi yang sudah dihapus secara optimistis,
  // agar sinkronisasi dari server tidak mengembalikan item yang sudah dihapus.
  const deletedIdsRef = useRef<Set<string>>(new Set())

  // 2. Fungsi Brutal Optimistic: Langsung potong state array-nya
  const handleOptimisticDelete = (idToRemove: string) => {
    deletedIdsRef.current.add(idToRemove) // Catat ID yang dihapus
    setTransactions((prev) => prev.filter((tx) => tx.id !== idToRemove))
  }

  // Sinkronisasi data dari server, tapi filter keluar item yang sudah dihapus secara optimistis
  useEffect(() => {
    const filtered = initialTransactions.filter(
      (tx) => !deletedIdsRef.current.has(tx.id)
    )
    setTransactions(filtered)
    setHasMore(initialTransactions.length >= 10)
  }, [initialTransactions])

  useEffect(() => {
    async function loadMore() {
      if (inView && hasMore && !loading) {
        setLoading(true)
        const lastCursor = transactions[transactions.length - 1].created_at
        const { data, error } = await fetchMoreTransactions(type, lastCursor)

        if (data) {
          if (data.length < 5) {
            setHasMore(false)
          }
          // Langsung gabungkan data murni dari server
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
      {/* 3. Render langsung dari state transaksi */}
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between py-3.5 gap-2">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <span className="text-xl flex-shrink-0">{tx.categories?.emoji || (type === 'income' ? '💰' : '💸')}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{tx.description}</p>
              <p className="text-xs text-zinc-400">{tx.transaction_date}</p>
            </div>
          </div>
          <div className="flex items-center flex-shrink-0">
            <span className={`text-sm font-semibold whitespace-nowrap ${type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {type === 'income' ? '+' : '-'}Rp {Number(tx.amount).toLocaleString('id-ID')}
            </span>
            {/* Suntikkan fungsi potong state ke komponen aksi */}
            <TransactionActions
              id={tx.id}
              type={type}
              onOptimisticDelete={handleOptimisticDelete}
            />
          </div>
        </div>
      ))}

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