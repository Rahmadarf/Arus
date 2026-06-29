'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string()
    .min(2, { message: 'Nama kategori minimal 2 karakter.' })
    .max(50, { message: 'Nama kategori maksimal 50 karakter.' }),
  type: z.enum(['income', 'expense'], { message: 'Tipe kategori tidak valid.' }),
  emoji: z.string()
    .min(1, { message: 'Emoji wajib dipilih.' })
    // Regex dasar untuk memastikan panjang string tidak berlebihan jika user memanipulasi form
    .max(10, { message: 'Format emoji tidak valid.' }) 
})

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Sesi habis, silakan login kembali.' }

  const validatedFields = categorySchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    emoji: formData.get('emoji'),
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message }
  }

  const { error } = await supabase.from('categories').insert([
    {
      user_id: user.id,
      ...validatedFields.data,
    },
  ])

  if (error) return { error: error.message }

  revalidatePath('/categories')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Sesi habis, silakan login kembali.' }

  // 1. INSPEKSI RELASI: Hitung apakah ada transaksi yang memakai ID kategori ini
  const { count, error: countError } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true }) // head: true menghemat bandwidth karena hanya meminta jumlah (count), bukan isi datanya
    .eq('category_id', id)
    .eq('user_id', user.id)

  if (countError) return { error: countError.message }

  // 2. BLOKIR JIKA DIGUNAKAN
  if (count && count > 0) {
    return { 
      error: `Gagal. Kategori ini tidak bisa dihapus karena masih digunakan pada ${count} riwayat transaksi.` 
    }
  }

  // 3. EKSEKUSI HAPUS JIKA AMAN
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/categories')
  // Wajib revalidate halaman transaksi juga jika kamu menampilkan daftar kategori di sana
  revalidatePath('/income') 
  revalidatePath('/expense')
  return { success: true }
}

export async function seedDefaultCategories() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  // 1. Hitung jumlah kategori yang dimiliki pengguna saat ini
  const { count, error } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (error) {
    console.error('Gagal memverifikasi kategori:', error.message)
    return
  }

  // 2. Jika kosong mutlak (pengguna baru), suntikkan fondasi data
  if (count === 0) {
    const defaultCategories = [
      { user_id: user.id, name: 'Gaji', emoji: '💰', type: 'income' },
      { user_id: user.id, name: 'Investasi', emoji: '📈', type: 'income' },
      { user_id: user.id, name: 'Makanan & Minuman', emoji: '🍔', type: 'expense' },
      { user_id: user.id, name: 'Transportasi', emoji: '🚗', type: 'expense' },
      { user_id: user.id, name: 'Belanja', emoji: '🛒', type: 'expense' },
      { user_id: user.id, name: 'Tagihan bulanan', emoji: '📄', type: 'expense' },
      { user_id: user.id, name: 'Hiburan', emoji: '🎮', type: 'expense' }
    ]

    const { error: insertError } = await supabase
      .from('categories')
      .insert(defaultCategories)

    if (insertError) {
      console.error('Gagal menyuntikkan kategori default:', insertError.message)
    }
  }
}