'use client'

import { useState, useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { fetchMoreTransactions } from '@/actions/transactions'
import TransactionActions from './transaction-actions'
import { Loader2 } from 'lucide-react'

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
      // Guard: jangan load more kalau list sedang kosong (cth: semua item terhapus
      // secara optimistis sebelum infinite scroll trigger) — cegah akses index -1.
      if (inView && hasMore && !loading && transactions.length > 0) {
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
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xl dark:bg-zinc-800">
          {type === 'income' ? '💰' : '💸'}
        </span>
        <p className="text-sm text-zinc-400">
          Belum ada riwayat {type === 'income' ? 'pemasukan' : 'pengeluaran'}.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {/* 3. Render langsung dari state transaksi */}
      {transactions.map((tx) => {
        return (
          <div key={tx.id} className="flex items-center justify-between py-3.5 gap-2">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${
                  type === 'income'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10'
                    : 'bg-red-50 dark:bg-red-500/10'
                }`}
              >
                {tx.categories?.emoji || (type === 'income' ? '💰' : '💸')}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{tx.description}</p>
                <p className="text-xs text-zinc-400">{tx.transaction_date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span
                className={`hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  type === 'income'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                }`}
              >
                {tx.categories?.name || (type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
              </span>
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
        )
      })}

      {hasMore && (
        <div ref={ref} className="py-4 flex items-center justify-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
          <span className="text-xs text-zinc-400">Memuat riwayat sebelumnya...</span>
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