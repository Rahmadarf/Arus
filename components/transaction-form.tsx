'use client'

import { useState, useRef, useEffect } from 'react'
import { createTransaction, updateTransaction } from '@/actions/transactions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Tag, CalendarDays, FolderOpen, Save, X } from 'lucide-react'

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
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const isEditMode = !!initialData
  const isIncome = type === 'income'

  // HANYA state ini yang kamu butuhkan. Hapus state error dan loading.
  const [displayAmount, setDisplayAmount] = useState('')
  const [rawAmount, setRawAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false) // Khusus untuk disable tombol saat diklik

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    setRawAmount(rawValue)

    if (rawValue) {
      const formatted = new Intl.NumberFormat('id-ID').format(Number(rawValue))
      setDisplayAmount(formatted)
    } else {
      setDisplayAmount('')
    }
  }

  // PENDENGAR PERUBAHAN YANG BENAR
  useEffect(() => {
    if (isEditMode && initialData && formRef.current) {
      const form = formRef.current;
      // 1. Uncontrolled components bisa dimanipulasi via DOM
      (form.elements.namedItem('description') as HTMLInputElement).value = initialData.description;
      (form.elements.namedItem('transaction_date') as HTMLInputElement).value = initialData.transaction_date;
      (form.elements.namedItem('category_id') as HTMLSelectElement).value = initialData.category_id;

      // 2. Controlled components HARUS dimanipulasi via State React
      setRawAmount(initialData.amount.toString());
      setDisplayAmount(new Intl.NumberFormat('id-ID').format(initialData.amount));

    } else if (!isEditMode && formRef.current) {
      // 3. Bersihkan form secara menyeluruh jika batal edit
      formRef.current.reset();
      setRawAmount('');
      setDisplayAmount('');
    }
  }, [initialData, isEditMode])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const form = event.currentTarget
    const formData = new FormData(form)

    // PERBAIKAN: Taruh di sini agar CREATE maupun UPDATE selalu membawa data type
    formData.append('type', type)

    const action = async () => {
      let result
      if (isEditMode && initialData) {
        // Sekarang formData di sini sudah memiliki properti 'type'
        result = await updateTransaction(initialData.id, formData)
      } else {
        result = await createTransaction(formData)
      }

      if (result?.error) {
        setIsSubmitting(false)
        throw new Error(result.error)
      }

      // Bersihkan state & UI
      setDisplayAmount('')
      setRawAmount('')
      setIsSubmitting(false)

      if (!isEditMode) {
        form.reset()
      } else {
        router.push(`/${type}`)
      }

      return result
    }

    toast.promise(action(), {
      loading: isEditMode ? 'Memperbarui transaksi...' : 'Menyimpan transaksi...',
      success: isEditMode ? 'Transaksi diperbarui.' : 'Transaksi disimpan.',
      error: (err) => err.message || 'Gagal memproses transaksi.'
    })
  }

  // Fungsi khusus untuk keluar dari mode edit agar URL bersih
  const handleCancelEdit = () => {
    router.push(`/${type}`)
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
            onClick={handleCancelEdit}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 hover:underline dark:hover:text-zinc-300"
          >
            <X className="h-3.5 w-3.5" />
            Batal Edit
          </button>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">

        {/* BLOK ERROR HTML DIHAPUS - Biarkan Sonner Toast yang menangani error UI */}

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
              type="text"
              id="display_amount"
              value={displayAmount}
              onChange={handleAmountChange}
              placeholder="0"
              required
              className="pl-9 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <input type="hidden" name="amount" value={rawAmount} required />
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
          disabled={isSubmitting}
          className={`w-full inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-zinc-50 shadow transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${isIncome ? 'bg-emerald-600 hover:bg-emerald-600/90' : 'bg-zinc-900 hover:bg-zinc-900/90'
            }`}
        >
          <Save className="h-4 w-4" />
          {isEditMode ? 'Perbarui Data' : 'Simpan Transaksi'}
        </button>
      </form>
    </div>
  )
}