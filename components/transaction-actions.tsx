'use client'

import { useState } from 'react'
import { deleteTransaction } from '@/actions/transactions'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
  type: 'income' | 'expense'
  onOptimisticDelete?: (id: string) => void
}

export default function TransactionActions({ id, type, onOptimisticDelete }: Props) {
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)

    if (onOptimisticDelete) {
      onOptimisticDelete(id)
    }

    const result = await deleteTransaction(id)

    if (result?.error) {
      alert(`Gagal menghapus: ${result.error}`)
      window.location.reload()
    }
    setLoading(false)
  }

  // Tampilkan tombol konfirmasi inline saat user klik "Hapus"
  if (confirming) {
    return (
      <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
        <span className="text-xs text-zinc-500 mr-1">Yakin hapus?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-semibold px-2 py-0.5 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? '...' : 'Ya'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="text-xs px-2 py-0.5 rounded bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
        >
          Batal
        </button>
      </div>
    )
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
        onClick={() => setConfirming(true)}
        disabled={loading}
        className="text-xs text-red-500 hover:text-red-700"
      >
        Hapus
      </button>
    </div>
  )
}