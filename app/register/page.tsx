'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { register } from '@/actions/auth'
import Link from 'next/link'
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react'
import AuthLayout from '@/components/auth-layout'

const easeOut = [0.22, 1, 0.36, 1] as const

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

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
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOut }}
        className="flex flex-col space-y-1.5 mb-6"
      >
        <h1 className="text-2xl font-semibold tracking-tight">Buat Akun Baru</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Masukkan data diri untuk mulai melacak keuanganmu
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        noValidate
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-4"
      >
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="overflow-hidden rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive border border-destructive/20 text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={fieldVariants} transition={{ duration: 0.35, ease: easeOut }} className="space-y-1.5">
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
        </motion.div>

        <motion.div variants={fieldVariants} transition={{ duration: 0.35, ease: easeOut }} className="space-y-1.5">
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
        </motion.div>

        <motion.div variants={fieldVariants} transition={{ duration: 0.35, ease: easeOut }} className="space-y-1.5">
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
            <motion.button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              whileTap={{ scale: 0.85 }}
              title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <AnimatePresence mode="wait" initial={false}>
                {showPassword ? (
                  <motion.span
                    key="eye-off"
                    initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                    transition={{ duration: 0.18, ease: easeOut }}
                    className="flex"
                  >
                    <EyeOff className="h-4 w-4" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="eye-on"
                    initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                    transition={{ duration: 0.18, ease: easeOut }}
                    className="flex"
                  >
                    <Eye className="h-4 w-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>

        <motion.button
          variants={fieldVariants}
          transition={{ duration: 0.35, ease: easeOut }}
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90"
        >
          <AnimatePresence mode="wait" initial={false}>
            {loading ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Daftar Akun
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400"
      >
        Sudah punya akun?{' '}
        <Link href="/login" className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50">
          Login di sini
        </Link>
      </motion.div>
    </AuthLayout>
  )
}