'use client'

import { useState, useRef, useEffect } from 'react'
import { createTransaction, updateTransaction } from '@/actions/transactions'
import { useRouter } from 'next/navigation'
import {
  Tag,
  Wallet,
  CalendarDays,
  FolderOpen,
  Save,
  X,
  Loader2,
} from 'lucide-react'

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
  const isIncome = type === 'income'

  const [displayAmount, setDisplayAmount] = useState('') // Untuk layar (1.000.000)
  const [rawAmount, setRawAmount] = useState('')         // Untuk server (1000000)

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sapu bersih semua karakter kecuali angka murni menggunakan Regex
    const rawValue = e.target.value.replace(/\D/g, '')
    setRawAmount(rawValue)

    // Jika ada angka, format ke standar Indonesia (titik per ribuan)
    if (rawValue) {
      const formatted = new Intl.NumberFormat('id-ID').format(Number(rawValue))
      setDisplayAmount(formatted)
    } else {
      setDisplayAmount('')
    }
  }

  // Sinkronisasi data ke form jika mode edit aktif
  useEffect(() => {
    if (isEditMode && initialData && formRef.current) {
      const form = formRef.current
        ; (form.elements.namedItem('description') as HTMLInputElement).value = initialData.description
        ; (form.elements.namedItem('amount') as HTMLInputElement).value = initialData.amount.toString()
        ; (form.elements.namedItem('transaction_date') as HTMLInputElement).value = initialData.transaction_date
        ; (form.elements.namedItem('category_id') as HTMLSelectElement).value = initialData.category_id
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
        setDisplayAmount('')
        setRawAmount('')
        router.push(`/${type}`)
      }
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {isEditMode ? 'Edit' : 'Catat'} {isIncome ? 'Pemasukan' : 'Pengeluaran'}
        </h2>
        {isEditMode && (
          <button
            type="button"
            onClick={() => router.push(`/${type}`)}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 hover:underline dark:hover:text-zinc-300"
          >
            <X className="h-3.5 w-3.5" />
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
          <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="description">
            <Tag className="h-3.5 w-3.5 text-zinc-400" />
            Sumber / Deskripsi
          </label>
          <input
            id="description"
            name="description"
            type="text"
            required
            placeholder={isIncome ? 'Contoh: Gaji Bulanan' : 'Contoh: Beli Makan'}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 focus-visible:border-zinc-400 dark:border-zinc-800 dark:focus-visible:ring-zinc-600/50"
          />
        </div>

        <div>
          <label htmlFor="display_amount" className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Jumlah (Rp)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-zinc-500 sm:text-sm">Rp</span>
            </div>
            <input
              type="text" /* HARUS type text, bukan number, agar titik tidak dihapus oleh peramban */
              id="display_amount"
              value={displayAmount}
              onChange={handleAmountChange}
              placeholder="0"
              required
              className="pl-9 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* TAKTIK MUTLAK: Input tersembunyi yang akan dikirim ke Server Action */}
          <input
            type="hidden"
            name="amount"
            value={rawAmount}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="transaction_date">
            <CalendarDays className="h-3.5 w-3.5 text-zinc-400" />
            Tanggal Transaksi
          </label>
          <input
            id="transaction_date"
            name="transaction_date"
            type="date"
            required
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 focus-visible:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-visible:ring-zinc-600/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="category_id">
            <FolderOpen className="h-3.5 w-3.5 text-zinc-400" />
            Pilih Kategori
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 focus-visible:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-visible:ring-zinc-600/50"
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
          className={`w-full inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-zinc-50 shadow transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${isIncome ? 'bg-emerald-600 hover:bg-emerald-600/90' : 'bg-zinc-900 hover:bg-zinc-900/90'
            }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEditMode ? 'Perbarui Data' : 'Simpan Transaksi'}
            </>
          )}
        </button>
      </form>
    </div>
  )
}