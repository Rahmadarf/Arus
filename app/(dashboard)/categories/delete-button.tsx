'use client'

import { useState } from 'react'
import { deleteCategory } from '@/actions/categories'

export default function DeleteCategoryButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmDelete = confirm('Apakah kamu yakin ingin menghapus kategori ini?')
    if (!confirmDelete) return

    setLoading(true)
    const result = await deleteCategory(id)

    if (result?.error) {
      alert(result.error) // Memunculkan pesan eror jika diblokir database
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex h-7 items-center justify-center rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-red-950/30"
    >
      {loading ? '...' : 'Hapus'}
    </button>
  )
}