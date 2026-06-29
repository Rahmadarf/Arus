'use client'

import { useState } from 'react'
import { deleteCategory } from '@/actions/categories'

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
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-xs text-zinc-500">Yakin?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex h-6 items-center justify-center rounded px-2 text-xs font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? '...' : 'Ya'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="inline-flex h-6 items-center justify-center rounded px-2 text-xs bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
        >
          Batal
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      disabled={loading}
      className="inline-flex h-7 items-center justify-center rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-red-950/30 flex-shrink-0"
    >
      Hapus
    </button>
  )
}