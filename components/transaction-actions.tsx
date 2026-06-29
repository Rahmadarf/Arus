'use client'

import { useState } from 'react'
import { deleteTransaction } from '@/actions/transactions'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Check, X, Loader2 } from 'lucide-react'

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
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
        <span className="text-xs text-zinc-500 mr-0.5 hidden sm:inline">Yakin hapus?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          title="Ya, hapus"
          aria-label="Konfirmasi hapus transaksi"
          className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500 text-white transition-colors hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          title="Batal"
          aria-label="Batalkan hapus transaksi"
          className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 flex-shrink-0 ml-4">
      <button
        onClick={() => router.push(`/${type}?edit=${id}`)}
        disabled={loading}
        title="Edit transaksi"
        aria-label="Edit transaksi"
        className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setConfirming(true)}
        disabled={loading}
        title="Hapus transaksi"
        aria-label="Hapus transaksi"
        className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}