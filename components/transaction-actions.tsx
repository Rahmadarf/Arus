'use client'

import { useState } from 'react'
import { deleteTransaction } from '@/actions/transactions'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
  type: 'income' | 'expense'
  onOptimisticDelete?: (id: string) => void // Properti baru untuk injeksi fungsi Optimistic
}

export default function TransactionActions({ id, type, onOptimisticDelete }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Hapus catatan transaksi ini?')) return
    
    // 1. Eksekusi Optimistic UI (Hapus dari layar secara instan)
    if (onOptimisticDelete) {
      onOptimisticDelete(id)
    }

    setLoading(true)
    
    // 2. Eksekusi tindakan server di latar belakang
    const result = await deleteTransaction(id)
    
    if (result?.error) {
      alert(result.error)
      // Jika terjadi eror (misal koneksi putus), revalidatePath dari server tidak akan berjalan,
      // tetapi state React akan secara otomatis melakukan rollback saat proses selesai.
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