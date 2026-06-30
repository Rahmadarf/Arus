'use client'

import { useState } from 'react'
import { deleteTransaction } from '@/actions/transactions'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { error } from 'console'

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

    const action = async () => {

      const result = await deleteTransaction(id)

      if (result?.error) {
        throw new Error(result.error)
      }

      if (onOptimisticDelete) {
        onOptimisticDelete(id)
      }

      return result
    }

    toast.promise(action(), {
      loading: 'Sedang memproses...',
      success: 'Transaksi berhasil dihapus.',
      error: (err: any) => err?.message || 'Gagal menghapus transaksi.',
    })

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
        onClick={handleDelete}
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