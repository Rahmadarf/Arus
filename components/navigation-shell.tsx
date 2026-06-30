'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Tag,
  LogOut,
  ArrowUp,
  ArrowDown,
  Goal,
  Menu,
  X
} from 'lucide-react'
import { logout } from '@/actions/auth'
import ThemeToggle from '@/components/theme-toggle'

// Tipe data untuk menerima kiriman dari Server Layout
interface NavShellProps {
  children: React.ReactNode
  userProfile: { fullName: string; initials: string }
  finances: { monthBalance: number; monthIncome: number; monthExpense: number, effectiveBalance: number }
}

export default function NavigationShell({ children, userProfile, finances }: NavShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const formatCompact = (value: number) => {
    const abs = Math.abs(value)
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.0', '')}jt`
    if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}rb`
    return value.toString()
  }

  // Menu Inti untuk Bottom Nav (Maksimal 4)
  const primaryNavItems = [
    { href: '/', label: 'Dasbor', icon: LayoutDashboard },
    { href: '/income', label: 'Pemasukan', icon: ArrowUpCircle },
    { href: '/expense', label: 'Pengeluaran', icon: ArrowDownCircle },
    { href: '/goals', label: 'Target', icon: Goal }
  ]

  // Menu Sekunder untuk Laci/Drawer Mobile & Sidebar Desktop
  const secondaryNavItems = [
    { href: '/categories', label: 'Kelola Kategori', icon: Tag }
  ]

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">

      {/* 1. DESKTOP SIDEBAR (Tersembunyi di Mobile) */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 z-40">
        {/* Bagian Atas: Profil */}
        <div className="flex items-center space-x-3 border-b border-zinc-100 pb-5 dark:border-zinc-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 font-medium text-white text-sm ring-2 ring-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-800">
            {userProfile.initials}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
              {userProfile.fullName}
            </span>
            <span className="text-xs text-zinc-400 truncate">Money Tracker</span>
          </div>
        </div>

        {/* Navigasi Desktop (Gabungan Primary & Secondary) */}
        <nav className="mt-6 space-y-1 flex-1">
          {[...primaryNavItems, ...secondaryNavItems].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Icon className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50" />
              {label}
            </Link>
          ))}

          {/* Mini-card Saldo Desktop */}
          <div className="mt-6 block rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Saldo Bulan Ini</p>
            <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Rp {finances.effectiveBalance.toLocaleString('id-ID')}
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium">
              <span className="flex items-center gap-0.5 text-emerald-600"><ArrowUp className="h-3 w-3" />{formatCompact(finances.monthIncome)}</span>
              <span className="flex items-center gap-0.5 text-red-600"><ArrowDown className="h-3 w-3" />{formatCompact(finances.monthExpense)}</span>
            </div>
          </div>
        </nav>

        {/* Bawah Desktop: Tema & Logout */}
        <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="flex items-center justify-between px-3 py-2 mb-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tampilan</span>
            <ThemeToggle />
          </div>
          <form action={logout}>
            <button type="submit" className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </form>
        </div>
      </aside>


      {/* 2. KONTEN UTAMA */}
      {/* Di mobile: tambah padding bottom (pb-20) agar konten tidak tertutup bottom nav */}
      {/* Di desktop: margin left (md:ml-64) agar konten bergeser dari sidebar */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 pb-20 md:pb-0 min-w-0">
        {/* Mini-card Saldo Mobile: tampil di atas konten, hanya di layar kecil */}
        <div className="md:hidden px-4 pt-4">
          <div className="rounded-xl bg-white border border-zinc-200 p-3.5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Saldo Bulan Ini</p>
                <p className="mt-0.5 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  Rp {finances.effectiveBalance.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-[11px] font-medium">
                <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                  <ArrowUp className="h-3 w-3" />{formatCompact(finances.monthIncome)}
                </span>
                <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400">
                  <ArrowDown className="h-3 w-3" />{formatCompact(finances.monthExpense)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-grow p-4 sm:p-5 md:p-8 min-w-0">
          {children}
        </main>
      </div>


      {/* 3. MOBILE BOTTOM NAVIGATION (Tersembunyi di Desktop) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 z-40 flex justify-around items-center h-16 px-1 safe-area-bottom pb-env">
        {primaryNavItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex flex-col items-center justify-center w-full h-full space-y-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 min-w-0">
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-medium truncate max-w-full">{label}</span>
          </Link>
        ))}
        {/* Tombol "Lainnya" untuk membuka Laci */}
        <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center justify-center w-full h-full space-y-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-medium">Lainnya</span>
        </button>
      </nav>


      {/* 4. MOBILE DRAWER (Overlay & Menu Tarik) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Latar Belakang Gelap (Klik untuk tutup) */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />

          {/* Konten Laci meluncur dari bawah */}
          <div className="relative w-full max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-t-2xl p-5 shadow-xl animate-in slide-in-from-bottom-full duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 font-medium text-white text-sm">{userProfile.initials}</div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">{userProfile.fullName}</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="shrink-0 p-2 text-zinc-500 bg-zinc-100 rounded-full dark:bg-zinc-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {secondaryNavItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <Icon className="h-5 w-5 text-zinc-400 shrink-0" /> {label}
                </Link>
              ))}

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mode Gelap</span>
                <ThemeToggle />
              </div>

              <form action={logout}>
                <button type="submit" className="flex items-center w-full gap-3 p-3 rounded-xl bg-red-50 text-sm font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  <LogOut className="h-5 w-5 shrink-0" /> Keluar Akun
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}