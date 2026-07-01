'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'

const easeOut = [0.22, 1, 0.36, 1] as const

function UnderConstructionIllustration() {
  return (
    <svg
      width="200"
      height="180"
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Shadow bawah layar */}
      <ellipse cx="100" cy="166" rx="52" ry="6" fill="currentColor" className="text-zinc-200 dark:text-zinc-800" />

      {/* Layar / monitor */}
      <rect x="38" y="30" width="124" height="88" rx="8" fill="currentColor" className="text-zinc-100 dark:text-zinc-800" stroke="currentColor" strokeWidth="1.5" style={{ stroke: 'var(--screen-stroke)' }} />

      {/* Sisi dalam layar */}
      <rect x="47" y="39" width="106" height="70" rx="4" fill="currentColor" className="text-white dark:text-zinc-900" />

      {/* Kaki monitor */}
      <rect x="90" y="118" width="20" height="16" rx="2" fill="currentColor" className="text-zinc-200 dark:text-zinc-700" />
      <rect x="74" y="132" width="52" height="6" rx="3" fill="currentColor" className="text-zinc-300 dark:text-zinc-600" />

      {/* Ikon tool / kunci inggris */}
      <g transform="translate(62, 50)">
        {/* Body kunci */}
        <path
          d="M22 6 C22 3 20 0 16 0 C12 0 10 3 10 6 C10 8 11 10 13 11 L4 22 C2 24 2 27 4 29 C6 31 9 31 11 29 L22 18 C24 17 26 16 26 12 C26 8 24 6 22 6Z"
          fill="currentColor"
          className="text-zinc-400 dark:text-zinc-500"
        />
        {/* Kepala kunci (lingkaran) */}
        <circle cx="16" cy="7" r="5" fill="currentColor" className="text-zinc-200 dark:text-zinc-700" />
        <circle cx="16" cy="7" r="2.5" fill="currentColor" className="text-zinc-400 dark:text-zinc-500" />
        {/* Handle bawah */}
        <circle cx="5.5" cy="27.5" r="3" fill="currentColor" className="text-zinc-300 dark:text-zinc-600" />
      </g>

      {/* Ikon pensil / edit */}
      <g transform="translate(108, 54)">
        <path
          d="M0 22 L16 6 C18 4 21 4 23 6 C25 8 25 11 23 13 L7 29 L0 30 L0 22Z"
          fill="currentColor"
          className="text-zinc-400 dark:text-zinc-500"
        />
        <path
          d="M16 6 L23 13"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-zinc-200 dark:text-zinc-700"
          fill="none"
        />
        {/* Ujung pensil */}
        <path
          d="M0 22 L2 28 L7 29"
          stroke="currentColor"
          strokeWidth="1"
          className="text-zinc-300 dark:text-zinc-600"
          fill="none"
        />
      </g>

      {/* Titik-titik loading / progress dots di bawah ikon */}
      <circle cx="85" cy="96" r="3" fill="currentColor" className="text-zinc-300 dark:text-zinc-600" />
      <circle cx="100" cy="96" r="3" fill="currentColor" className="text-zinc-400 dark:text-zinc-500" />
      <circle cx="115" cy="96" r="3" fill="currentColor" className="text-zinc-200 dark:text-zinc-700" />

      {/* Garis dekoratif kecil (kode / garis kerja) di sisi kiri */}
      <rect x="50" y="52" width="8" height="2" rx="1" fill="currentColor" className="text-zinc-200 dark:text-zinc-700" />
      <rect x="50" y="57" width="12" height="2" rx="1" fill="currentColor" className="text-zinc-200 dark:text-zinc-700" />
      <rect x="50" y="62" width="6" height="2" rx="1" fill="currentColor" className="text-zinc-200 dark:text-zinc-700" />

      {/* Garis dekoratif di sisi kanan */}
      <rect x="140" y="85" width="8" height="2" rx="1" fill="currentColor" className="text-zinc-200 dark:text-zinc-700" />
      <rect x="135" y="90" width="12" height="2" rx="1" fill="currentColor" className="text-zinc-200 dark:text-zinc-700" />

      {/* Percikan / sparkle kecil */}
      <circle cx="44" cy="38" r="2" fill="currentColor" className="text-zinc-300 dark:text-zinc-600" />
      <circle cx="158" cy="34" r="1.5" fill="currentColor" className="text-zinc-200 dark:text-zinc-700" />
      <circle cx="152" cy="125" r="2" fill="currentColor" className="text-zinc-300 dark:text-zinc-600" />
    </svg>
  )
}

export default function ComingSoonPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12 text-center dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="flex flex-col items-center"
      >
        {/* Ilustrasi */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05, ease: easeOut }}
          className="mb-8 text-zinc-400 dark:text-zinc-500"
        >
          <UnderConstructionIllustration />
        </motion.div>

        {/* Badge status */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: easeOut }}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 dark:bg-amber-500" />
          Sedang dikerjakan
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: easeOut }}
          className="mb-3 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50"
        >
          Halaman ini belum siap
        </motion.h1>

        {/* Deskripsi */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.27, ease: easeOut }}
          className="mb-8 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400"
        >
          Fitur ini masih dalam tahap pengembangan. Developer sedang membangunnya — kembali lagi dalam beberapa waktu ke depan.
        </motion.p>

        {/* Tombol kembali */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.34, ease: easeOut }}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => router.push('/')}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </motion.button>
      </motion.div>
    </div>
  )
}