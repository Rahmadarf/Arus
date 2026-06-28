'use client'

import { useState } from 'react'
import { deleteTransaction } from '@/actions/transactions'
import { useRouter } from 'next/navigation'

export default function TransactionActions({ id, type }: { id: string; type: 'income' | 'expense' }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Hapus catatan transaksi ini?')) return
    setLoading(true)
    const result = await deleteTransaction(id)
    if (result?.error) {
      alert(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
      <button
        onClick={() => router.push(`/${type}?edit=${id}`)}
        disabled={loading}
        className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        Edit
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs text-red-500 hover:text-red-700"
      >
        {loading ? '...' : 'Hapus'}
      </button>
    </div>
  )
}