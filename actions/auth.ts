'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
})

const registerSchema = loginSchema.extend({
  fullname: z.string()
    .min(3, { message: 'Nama lengkap minimal 3 karakter.' })
    .max(100, { message: 'Nama lengkap terlalu panjang.' }),
})

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message }
  }

  const { error } = await supabase.auth.signInWithPassword(validatedFields.data)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/') 
}

export async function register(formData: FormData) {
  const supabase = await createClient()
  
  const validatedFields = registerSchema.safeParse({
    fullname: formData.get('fullname'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message }
  }

  const { email, password, fullname } = validatedFields.data

  const { error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullname,
      }
    }
  })

  if (authError) return { error: authError.message }

  revalidatePath('/', 'layout')
  redirect('/login') 
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/login')
}