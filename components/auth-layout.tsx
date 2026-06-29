'use client'

import { motion } from 'motion/react'
import { PieChart, Tags, ShieldCheck } from 'lucide-react'
import Image from 'next/image'

interface AuthLayoutProps {
  children: React.ReactNode
}

const easeOut = [0.22, 1, 0.36, 1] as const

const features = [
  { icon: PieChart, label: 'Grafik tren harian otomatis' },
  { icon: Tags, label: 'Kategori custom dengan emoji' },
  { icon: ShieldCheck, label: 'Data tersimpan aman per akun' },
]

// Panel kiri berisi branding + highlight fitur, dipakai bersama oleh Login & Register
// agar halaman auth tidak lagi terasa kosong (sebelumnya hanya satu card kecil di tengah layar).
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="flex w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800"
      >
        {/* PANEL KIRI: Branding & Pitch (disembunyikan di mobile) */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
          className="hidden w-1/2 flex-col justify-between bg-zinc-100 p-10 lg:flex dark:bg-zinc-900"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: easeOut }}
              className="mb-8 flex items-center gap-2.5"
            >
              <Image
                src="/A.png"
                alt="Arus Logo"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Arus</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25, ease: easeOut }}
              className="text-2xl font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              Catat setiap rupiah, kenali setiap kebiasaan.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.32, ease: easeOut }}
              className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400"
            >
              Pantau pemasukan dan pengeluaranmu setiap hari, lalu lihat polanya lewat grafik yang sederhana dan mudah dipahami.
            </motion.p>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.08, delayChildren: 0.4 },
              },
            }}
            className="space-y-3.5"
          >
            {features.map(({ icon: Icon, label }) => (
              <motion.div
                key={label}
                variants={{
                  hidden: { opacity: 0, x: -12 },
                  visible: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.35, ease: easeOut }}
                className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-300"
              >
                <Icon className="h-4 w-4 shrink-0 text-zinc-400" />
                {label}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* PANEL KANAN: Form (Login / Register) */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
          className="w-full bg-white p-8 lg:w-1/2 lg:p-10 dark:bg-zinc-950"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  )
}