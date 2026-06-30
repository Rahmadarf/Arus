'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/supabase'
import { z } from 'zod'

export type TransactionWithCategory = Database['public']['Tables']['transactions']['Row'] & {
  categories: { name: string; emoji: string } | { name: string; emoji: string }[] | null
}

export interface TransactionFilters {
  year?: string
  month?: string
  categoryId?: string
  search?: string
}

// 1. Definisikan Skema Validasi Transaksi
const transactionSchema = z.object({
  description: z.string()
    .min(3, { message: 'Deskripsi minimal 3 karakter.' })
    .max(100, { message: 'Deskripsi terlalu panjang.' }),
  // z.coerce.number() memaksa string dari form menjadi angka sebelum divalidasi
  amount: z.coerce.number()
    .positive({ message: 'Nominal harus lebih besar dari 0.' })
    .max(10000000000, { message: 'Nominal melebihi batas sistem.' }),
  transaction_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format tanggal harus YYYY-MM-DD.' }),
  category_id: z.string().uuid({ message: 'ID Kategori tidak valid.' }),
  type: z.enum(['income', 'expense'], { message: 'Tipe transaksi tidak valid.' }),
})

export async function createTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Sesi habis, silakan login kembali.' }

  // 2. Eksekusi Validasi Zod (safeParse tidak melempar error yang membuat server crash)
  const validatedFields = transactionSchema.safeParse({
    description: formData.get('description'),
    amount: formData.get('amount'),
    transaction_date: formData.get('transaction_date'),
    category_id: formData.get('category_id'),
    type: formData.get('type'),
  })

  // 3. Tangkap dan lemparkan pesan eror validasi ke UI
  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message }
  }

  // 4. Gunakan data yang sudah divalidasi dan di-parsing (validatedFields.data)
  const { error } = await supabase.from('transactions').insert([
    {
      user_id: user.id,
      ...validatedFields.data,
    },
  ])

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/income')
  revalidatePath('/expense')
  return { success: true }
}

export async function updateTransaction(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Sesi habis, silakan login kembali.' }

  const validatedFields = transactionSchema.safeParse({
    description: formData.get('description'),
    amount: formData.get('amount'),
    transaction_date: formData.get('transaction_date'),
    category_id: formData.get('category_id'),
    type: formData.get('type'), // Pastikan form edit juga mengirimkan type
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message }
  }

  const { error } = await supabase
    .from('transactions')
    .update({ ...validatedFields.data })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/income')
  revalidatePath('/expense')
  return { success: true }
}

// ... fungsi deleteTransaction tetap sama seperti sebelumnya ...



export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Sesi habis, silakan login kembali.' }

  // 1. MUTASI: Wajib di-await hingga tuntas 100%
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // Validasi keamanan ekstra: pastikan user hanya menghapus miliknya

  // 2. VALIDASI: Jika database gagal, hentikan eksekusi. Jangan sentuh cache.
  if (error) {
    console.error('Delete Error:', error.message)
    return { error: error.message }
  }

  // 3. INVALIDASI: Hanya dieksekusi JIKA DAN HANYA JIKA mutasi di atas sukses.
  // Ini akan memaksa Next.js membuang cache lama dan menarik data segar dari Supabase.
  revalidatePath('/')
  revalidatePath('/income')
  revalidatePath('/expense')

  return { success: true }
}


export async function fetchMoreTransactions(
  type: 'income' | 'expense' | 'transfer',
  lastCursor?: string,
  filters?: TransactionFilters // Parameter opsional baru
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Sesi habis.' }

  // 1. Kueri Dasar (Belum dieksekusi)
  let query = supabase
    .from('transactions')
    .select(`
      id, 
      description, 
      amount, 
      transaction_date, 
      created_at, 
      category_id, 
      categories (name, emoji)
    `)
    .eq('user_id', user.id)
    .eq('type', type)

  // 2. Injeksi Filter Dinamis (Query Chaining)
  if (filters) {
    // Filter Pencarian (Search by Description)
    if (filters.search) {
      query = query.ilike('description', `%${filters.search}%`)
    }

    // Filter Kategori Spesifik
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }

    // Filter Rentang Waktu (Bulan & Tahun)
    if (filters.year) {
      if (filters.month) {
        // Jika ada tahun dan bulan: Ambil dari tanggal 1 sampai hari terakhir bulan tersebut
        const startDate = `${filters.year}-${filters.month}-01`
        // Trik JS untuk mendapatkan hari terakhir dalam suatu bulan
        const endDay = new Date(Number(filters.year), Number(filters.month), 0).getDate()
        const endDate = `${filters.year}-${filters.month}-${endDay}`

        query = query.gte('transaction_date', startDate).lte('transaction_date', endDate)
      } else {
        // Jika hanya tahun: Ambil dari 1 Januari sampai 31 Desember
        const startDate = `${filters.year}-01-01`
        const endDate = `${filters.year}-12-31`

        query = query.gte('transaction_date', startDate).lte('transaction_date', endDate)
      }
    }
  }

  // 3. Kursor untuk Infinite Scroll
  if (lastCursor) {
    query = query.lt('created_at', lastCursor)
  }

  // 4. Eksekusi Mutlak
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Fetch error:', error.message)
    return { data: null, error: error.message }
  }

  return { data: data as TransactionWithCategory[], error: null }

}



export async function getRecentTransactions(limit: number = 5) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Sesi habis.' }

  // Tarik data campuran (income & expense) berdasarkan tanggal terbaru
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id, 
      description, 
      amount, 
      transaction_date, 
      type, 
      categories (name, emoji)
    `)
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Gagal menarik transaksi terakhir:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}


export async function getAllFilteredTransactions(
  type: 'income' | 'expense',
  filters: TransactionFilters
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Sesi habis.' }

  let query = supabase
    .from('transactions')
    .select(`
      id, 
      description, 
      amount, 
      transaction_date, 
      categories (name)
    `)
    .eq('user_id', user.id)
    .eq('type', type)

  // Terapkan filter yang sama persis
  if (filters.search) query = query.ilike('description', `%${filters.search}%`)
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
  if (filters.year) {
    if (filters.month) {
      const startDate = `${filters.year}-${filters.month}-01`
      const endDay = new Date(Number(filters.year), Number(filters.month), 0).getDate()
      const endDate = `${filters.year}-${filters.month}-${endDay}`
      query = query.gte('transaction_date', startDate).lte('transaction_date', endDate)
    } else {
      const startDate = `${filters.year}-01-01`
      const endDate = `${filters.year}-12-31`
      query = query.gte('transaction_date', startDate).lte('transaction_date', endDate)
    }
  }

  // Urutkan berdasarkan tanggal transaksi terupdate
  const { data, error } = await query.order('transaction_date', { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}


export async function getMonthlyTrend(type: 'income' | 'expense') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Tarik data 30 hari terakhir untuk tren grafik
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data } = await supabase
    .from('transactions')
    .select('amount, transaction_date')
    .eq('user_id', user.id)
    .eq('type', type)
    .gte('transaction_date', thirtyDaysAgo.toISOString())
    .order('transaction_date', { ascending: true })

  // Agregasi data (jumlahkan amount per hari)
  const grouped = data?.reduce((acc: any, curr) => {
    acc[curr.transaction_date] = (acc[curr.transaction_date] || 0) + Number(curr.amount)
    return acc
  }, {})

  return Object.keys(grouped || {}).map(date => ({
    date: date.slice(8, 10), // Ambil tanggal (01, 02, dst)
    amount: grouped[date]
  }))
}