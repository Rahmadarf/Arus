'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

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


export async function fetchMoreTransactions(type: 'income' | 'expense', cursor: string, limit = 10) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized', data: null }

  // Kueri Kursor: Ambil transaksi yang "dibuat lebih lama" (kurang dari) kursor saat ini
  const { data, error } = await supabase
    .from('transactions')
    .select(`id, description, amount, transaction_date, created_at, category_id, categories (name, emoji)`)
    .eq('type', type)
    .lt('created_at', cursor)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Pagination Error:', error.message)
    return { error: error.message, data: null }
  }

  return { error: null, data }
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