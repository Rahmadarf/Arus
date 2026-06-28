'use client'

import { useState, useRef, useEffect } from 'react'
import { createCategory } from '@/actions/categories'
import data from '@emoji-mart/data'
import { Picker } from 'emoji-mart'

export default function CategoryForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [chosenEmoji, setChosenEmoji] = useState('💰')
  const [showPicker, setShowPicker] = useState(false)
  
  const formRef = useRef<HTMLFormElement>(null)
  const pickerWrapperRef = useRef<HTMLDivElement>(null)
  const pickerContainerRef = useRef<HTMLDivElement>(null)

  // 1. Logika Klik di Luar (Menutup Picker)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerWrapperRef.current && !pickerWrapperRef.current.contains(event.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 2. Inisialisasi Vanilla Web Component
  useEffect(() => {
    // Hanya buat instance Picker jika showPicker aktif dan container HTML-nya masih kosong
    if (showPicker && pickerContainerRef.current && pickerContainerRef.current.innerHTML === '') {
      const picker = new Picker({
        data,
        theme: 'light',
        onEmojiSelect: (emoji: any) => {
          setChosenEmoji(emoji.native)
          setShowPicker(false)
        },
      })
      
      // Sisipkan Web Component mentah (<em-emoji-picker>) ke dalam div
      pickerContainerRef.current.appendChild(picker as unknown as Node)
    }
    
    // Cleanup: Kosongkan isi div jika picker ditutup agar tidak terjadi duplikasi elemen
    if (!showPicker && pickerContainerRef.current) {
      pickerContainerRef.current.innerHTML = ''
    }
  }, [showPicker])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    // Sisipkan emoji murni ke form data
    formData.append('emoji', chosenEmoji)

    const result = await createCategory(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setLoading(false)
      setChosenEmoji('💰') // Reset emoji ke default
      formRef.current?.reset()
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
        Tambah Kategori Baru
      </h2>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900">
            {error}
          </div>
        )}

        <div className="space-y-1.5 relative" ref={pickerWrapperRef}>
          <label className="text-sm font-medium">Pilih Emoji</label>
          <div>
            <button
              type="button"
              onClick={() => setShowPicker(!showPicker)}
              className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-2xl shadow-sm hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800"
            >
              {chosenEmoji}
            </button>
          </div>

          {/* Container Kosong Tempat Picker Akan Disuntikkan */}
          <div 
            className={`absolute z-50 mt-2 shadow-xl border rounded-lg overflow-hidden ${showPicker ? 'block' : 'hidden'}`}
            ref={pickerContainerRef}
          ></div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="name">
            Nama Kategori
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Contoh: Uang Jajan, Bonus Proyek"
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-zinc-800"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="type">
            Tipe Aliran Dana
          </label>
          <select
            id="type"
            name="type"
            required
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <option value="expense">Pengeluaran (Expense)</option>
            <option value="income">Pemasukan (Income)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow hover:bg-zinc-900/90 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {loading ? 'Menyimpan...' : 'Simpan Kategori'}
        </button>
      </form>
    </div>
  )
}