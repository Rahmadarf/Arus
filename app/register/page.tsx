'use client'

import { useState } from 'react'
import { register } from '@/actions/auth'
import Link from 'next/link'
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react'
import AuthLayout from '@/components/auth-layout'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await register(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // Jika sukses, Server Action otomatis mengalihkan ke /login
  }

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-1.5 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Buat Akun Baru</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Masukkan data diri untuk mulai melacak keuanganmu
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive border border-destructive/20 text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium leading-none text-zinc-700 dark:text-zinc-300" htmlFor="fullname">
            <User className="h-3.5 w-3.5 text-zinc-400" />
            Nama Lengkap
          </label>
          <input
            id="fullname"
            name="fullname"
            type="text"
            required
            placeholder="Rahmad Arifin"
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 focus-visible:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-600/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium leading-none text-zinc-700 dark:text-zinc-300" htmlFor="email">
            <Mail className="h-3.5 w-3.5 text-zinc-400" />
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="nama@contoh.com"
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 focus-visible:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-600/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium leading-none text-zinc-700 dark:text-zinc-300" htmlFor="password">
            <Lock className="h-3.5 w-3.5 text-zinc-400" />
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 pr-10 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 focus-visible:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-600/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Daftar Akun
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Sudah punya akun?{' '}
        <Link href="/login" className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50">
          Login di sini
        </Link>
      </div>
    </AuthLayout>
  )
}