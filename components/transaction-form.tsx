'use client'

import { useState, useRef, useEffect } from 'react'
import { createTransaction, updateTransaction } from '@/actions/transactions'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  emoji: string
}

interface TransactionFormProps {
  type: 'income' | 'expense'
  categories: Category[]
  initialData?: {
    id: string
    description: string
    amount: number
    transaction_date: string
    category_id: string
  } | null
}

export default function TransactionForm({ type, categories, initialData }: TransactionFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const isEditMode = !!initialData

  // Sinkronisasi data ke form jika mode edit aktif
  useEffect(() => {
    if (isEditMode && initialData && formRef.current) {
      const form = formRef.current
      ;(form.elements.namedItem('description') as HTMLInputElement).value = initialData.description
      ;(form.elements.namedItem('amount') as HTMLInputElement).value = initialData.amount.toString()
      ;(form.elements.namedItem('transaction_date') as HTMLInputElement).value = initialData.transaction_date
      ;(form.elements.namedItem('category_id') as HTMLSelectElement).value = initialData.category_id
    }
  }, [initialData, isEditMode])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)

    let result
    if (isEditMode && initialData) {
      result = await updateTransaction(initialData.id, formData)
    } else {
      formData.append('type', type)
      result = await createTransaction(formData)
    }

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setLoading(false)
      if (!isEditMode) {
        formRef.current?.reset()
      } else {
        // Keluar dari mode edit dengan membersihkan kueri parameter di URL
        router.push(`/${type}`)
      }
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {isEditMode ? 'Edit' : 'Catat'} {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
        </h2>
        {isEditMode && (
          <button
            type="button"
            onClick={() => router.push(`/${type}`)}
            className="text-xs text-zinc-500 hover:underline"
          >
            Batal Edit
          </button>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="description">
            Sumber / Deskripsi
          </label>
          <input
            id="description"
            name="description"
            type="text"
            required
            placeholder={type === 'income' ? 'Contoh: Gaji Bulanan' : 'Contoh: Beli Makan'}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-zinc-800"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="amount">
            Nominal (Rupiah)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            required
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-zinc-800"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="transaction_date">
            Tanggal Transaksi
          </label>
          <input
            id="transaction_date"
            name="transaction_date"
            type="date"
            required
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="category_id">
            Pilih Kategori
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <option value="">-- Pilih Kategori --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-zinc-50 shadow transition-colors ${
            type === 'income' ? 'bg-emerald-600 hover:bg-emerald-600/90' : 'bg-zinc-900 hover:bg-zinc-900/90'
          }`}
        >
          {loading ? 'Menyimpan...' : isEditMode ? 'Perbarui Data' : 'Simpan Transaksi'}
        </button>
      </form>
    </div>
  )
}