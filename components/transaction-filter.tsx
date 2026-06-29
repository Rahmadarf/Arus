'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

interface Category {
  id: string
  name: string
  emoji: string
}

interface Props {
  categories: Category[]
}

export default function TransactionFilter({ categories }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State lokal hanya untuk input teks sebelum pengguna menekan Enter
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  // Fungsi utilitas untuk memodifikasi URL tanpa menghapus parameter yang sudah ada
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  // Eksekutor pembaruan URL
  const updateFilter = (key: string, value: string) => {
    router.push(pathname + '?' + createQueryString(key, value), { scroll: false })
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateFilter('search', searchTerm)
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    router.push(pathname, { scroll: false })
  }

  // Generate daftar tahun (dari tahun lalu hingga tahun depan)
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 1, currentYear, currentYear + 1]

  const hasActiveFilters = searchParams.toString().length > 0

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Filter Transaksi</h3>
        {hasActiveFilters && (
          <button 
            onClick={resetFilters}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Reset Semua
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Filter Pencarian (Teks) */}
        <div>
          <input
            type="text"
            placeholder="Cari deskripsi (Enter)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onBlur={() => updateFilter('search', searchTerm)}
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Kategori */}
        <div>
          <select
            value={searchParams.get('categoryId') || ''}
            onChange={(e) => updateFilter('categoryId', e.target.value)}
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="" className="text-zinc-900 dark:text-zinc-900">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="text-zinc-900 dark:text-zinc-900">
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Bulan */}
        <div>
          <select
            value={searchParams.get('month') || ''}
            onChange={(e) => updateFilter('month', e.target.value)}
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="" className="text-zinc-900 dark:text-zinc-900">Semua Bulan</option>
            <option value="01" className="text-zinc-900 dark:text-zinc-900">Januari</option>
            <option value="02" className="text-zinc-900 dark:text-zinc-900">Februari</option>
            <option value="03" className="text-zinc-900 dark:text-zinc-900">Maret</option>
            <option value="04" className="text-zinc-900 dark:text-zinc-900">April</option>
            <option value="05" className="text-zinc-900 dark:text-zinc-900">Mei</option>
            <option value="06" className="text-zinc-900 dark:text-zinc-900">Juni</option>
            <option value="07" className="text-zinc-900 dark:text-zinc-900">Juli</option>
            <option value="08" className="text-zinc-900 dark:text-zinc-900">Agustus</option>
            <option value="09" className="text-zinc-900 dark:text-zinc-900">September</option>
            <option value="10" className="text-zinc-900 dark:text-zinc-900">Oktober</option>
            <option value="11" className="text-zinc-900 dark:text-zinc-900">November</option>
            <option value="12" className="text-zinc-900 dark:text-zinc-900">Desember</option>
          </select>
        </div>

        {/* Filter Tahun */}
        <div>
          <select
            value={searchParams.get('year') || ''}
            onChange={(e) => updateFilter('year', e.target.value)}
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="" className="text-zinc-900 dark:text-zinc-900">Semua Tahun</option>
            {years.map((y) => (
              <option key={y} value={y.toString()} className="text-zinc-900 dark:text-zinc-900">
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}