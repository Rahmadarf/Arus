'use client'

import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { fetchMoreTransactions, TransactionWithCategory } from '@/actions/transactions' // Impor tipe dari server
import TransactionActions from './transaction-actions'

interface Props {
    // Gunakan tipe mutlak dari server
    initialTransactions: TransactionWithCategory[] 
    type: 'income' | 'expense'
}

export default function InfiniteTransactionList({ initialTransactions, type }: Props) {
  // Terapkan tipe tersebut ke state
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>(initialTransactions)
  
  const { ref: inViewRef, inView } = useInView()
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setTransactions(initialTransactions)
    // Jika data awal yang ditarik kurang dari limit (misal 10), matikan loading bawah
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
                  // Pastikan penyatuan data aman dari tipe any
                  setTransactions((prev) => [...prev, ...(data as TransactionWithCategory[])])
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
          {transactions.map((tx: TransactionWithCategory) => {
              // Logika ini menyelamatkanmu jika Supabase tiba-tiba mengirim array
              const category = Array.isArray(tx.categories) ? tx.categories[0] : tx.categories;
              
              return (
                  <div key={tx.id} className="flex items-center justify-between py-3.5">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <span className="text-xl flex-shrink-0">{category?.emoji || (type === 'income' ? '💰' : '💸')}</span>
                          <div className="truncate">
                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{tx.description}</p>
                              <p className="text-xs text-zinc-400">{tx.transaction_date}</p>
                          </div>
                      </div>
                      <div className="flex items-center flex-shrink-0 ml-4">
                          <span className={`text-sm font-semibold whitespace-nowrap ${type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                              {type === 'income' ? '+' : '-'}Rp {Number(tx.amount).toLocaleString('id-ID')}
                          </span>
                          <TransactionActions 
                            id={tx.id} 
                            type={type} 
                            onOptimisticDelete={(id) => setTransactions((prev) => prev.filter((t) => t.id !== id))} 
                          />
                      </div>
                  </div>
              )
          })}
          
          {hasMore && (
              <div ref={inViewRef} className="py-4 text-center">
                  <span className="text-sm text-zinc-400 animate-pulse">Memuat data...</span>
              </div>
          )}
      </div>
  )
}