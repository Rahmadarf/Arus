'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Pastikan komponen sudah terpasang di browser sebelum merender ikon asli
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        // Kembalikan kotak kosong dengan ukuran sama agar tata letak (layout) tidak melompat saat dimuat
        return <div className="h-9 w-9 rounded-md border border-zinc-200 dark:border-zinc-800" />
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-transparent text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            aria-label="Ubah Tema"
        >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
    )
}