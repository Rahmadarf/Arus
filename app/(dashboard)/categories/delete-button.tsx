'use client'

import { useState } from 'react'
import { deleteCategory } from '@/actions/categories'
import { Trash2, Check, X, Loader2 } from 'lucide-react'

export default function DeleteCategoryButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const result = await deleteCategory(id)

    if (result?.error) {
      alert(result.error)
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-xs text-zinc-500 hidden sm:inline">Yakin?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          title="Ya, hapus"
          aria-label="Konfirmasi hapus kategori"
          className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500 text-white transition-colors hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          title="Batal"
          aria-label="Batalkan hapus kategori"
          className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      disabled={loading}
      title="Hapus kategori"
      aria-label="Hapus kategori"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-red-950/30"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}