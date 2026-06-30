'use client'

import { useState } from 'react'
import { deleteCategory } from '@/actions/categories'
import { Trash2, Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function DeleteCategoryButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    const action = async () => {

      const result = await deleteCategory(id)

      if (result?.error) {
        throw new Error(result.error)
      }

      return result
    }

    toast.promise(action(), {
      loading: 'Menghapus kategori...',
      success: 'Kategori berhasil dihapus.',
      error: (err: any) => err?.error || 'Gagal menghapus kategori.',
    })
  }


  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="Hapus kategori"
      aria-label="Hapus kategori"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-red-950/30"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}