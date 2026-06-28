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

  if (!user) {
    return { error: 'Sesi habis, silakan login kembali.' }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // Proteksi mutlak: memastikan user hanya bisa menghapus kategori miliknya sendiri

  if (error) {
    // Kode eror '23503' adalah standar PostgreSQL untuk Foreign Key Violation (RESTRICT)
    if (error.code === '23503') {
      return { 
        error: 'Kategori gagal dihapus. Kategori ini masih digunakan oleh beberapa data transaksi. Hapus atau pindahkan transaksi tersebut terlebih dahulu.' 
      }
    }
    return { error: error.message }
  }

  revalidatePath('/categories')
  return { success: true }
}