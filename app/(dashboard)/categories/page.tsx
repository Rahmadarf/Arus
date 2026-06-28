import { createClient } from '@/utils/supabase/server'
import CategoryForm from './categories'
import DeleteCategoryButton from './delete-button'

export default async function CategoriesPage() {
  const supabase = await createClient()

  // 1. Tarik seluruh data kategori milik pengguna saat ini
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })

  const incomeCategories = categories?.filter((c) => c.type === 'income') || []
  const expenseCategories = categories?.filter((c) => c.type === 'expense') || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Kelola Kategori
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Buat dan kustomisasi kategori keuanganmu sendiri menggunakan emoji pilihan.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Kolom Kiri: Formulir Input */}
        <div className="lg:col-span-1">
          <CategoryForm />
        </div>

        {/* Kolom Kanan: Daftar Kategori Terdaftar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Kelompok Pemasukan */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold mb-4 text-emerald-600 dark:text-emerald-400">
              Kategori Pemasukan ({incomeCategories.length})
            </h3>
            {incomeCategories.length === 0 ? (
              <p className="text-sm text-zinc-400">Belum ada kategori pemasukan buatanmu.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {incomeCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between rounded-lg border p-3 dark:border-zinc-800">
                    <div className="flex items-center space-x-3 truncate mr-2">
                      <span className="text-xl flex-shrink-0">{category.emoji}</span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{category.name}</span>
                    </div>
                    {/* Sisipkan Tombol Hapus di Sini */}
                    <DeleteCategoryButton id={category.id} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kelompok Pengeluaran */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400">
              Kategori Pengeluaran ({expenseCategories.length})
            </h3>
            {expenseCategories.length === 0 ? (
              <p className="text-sm text-zinc-400">Belum ada kategori pengeluaran buatanmu.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {expenseCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between rounded-lg border p-3 dark:border-zinc-800">
                    <div className="flex items-center space-x-3 truncate mr-2">
                      <span className="text-xl flex-shrink-0">{category.emoji}</span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{category.name}</span>
                    </div>
                    {/* Sisipkan Tombol Hapus di Sini */}
                    <DeleteCategoryButton id={category.id} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}