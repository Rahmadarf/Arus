import { createClient } from '@/utils/supabase/server'
import { logout } from '@/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Tag,
  LogOut,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Ambil data user yang sedang login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Ambil data profil dari tabel public.profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  // 3. Ambil ringkasan saldo bulan ini untuk mini-card di sidebar
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const stringFirstDay = firstDayOfMonth.toISOString().split('T')[0]

  const { data: monthTransactions } = await supabase
    .from('transactions')
    .select('amount, type')
    .gte('transaction_date', stringFirstDay)

  let monthIncome = 0
  let monthExpense = 0
  ;(monthTransactions || []).forEach((tx) => {
    const amount = Number(tx.amount)
    if (tx.type === 'income') monthIncome += amount
    else if (tx.type === 'expense') monthExpense += amount
  })
  const monthBalance = monthIncome - monthExpense

  // Format ringkas untuk angka di sidebar (cth: 4.2jt, 850rb)
  const formatCompact = (value: number) => {
    const abs = Math.abs(value)
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.0', '')}jt`
    if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}rb`
    return value.toString()
  }

  // Fungsi untuk mengambil inisial nama (cth: Rahmad Arifin -> RA)
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const fullName = profile?.full_name || 'User'
  const initials = getInitials(fullName)

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/income', label: 'Income', icon: ArrowUpCircle },
    { href: '/expense', label: 'Expense', icon: ArrowDownCircle },
    { href: '/categories', label: 'Kelola Kategori', icon: Tag },
  ]

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Bagian Atas: Profil User */}
        <div className="flex items-center space-x-3 border-b border-zinc-100 pb-5 dark:border-zinc-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 font-medium text-white text-sm ring-2 ring-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-800">
            {initials}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
              {fullName}
            </span>
            <span className="text-xs text-zinc-400 truncate">Pelacak Keuangan</span>
          </div>
        </div>

        {/* Bagian Tengah: Menu Navigasi */}
        <nav className="mt-6 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              <Icon className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-zinc-900 dark:text-zinc-500 dark:group-hover:text-zinc-50" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Mini-card: Saldo Bulan Ini */}
        <Link
          href="/"
          className="mt-5 block rounded-xl bg-zinc-50 p-3.5 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800"
        >
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Saldo Bulan Ini
          </p>
          <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Rp {monthBalance.toLocaleString('id-ID')}
          </p>
          <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium">
            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
              <ArrowUp className="h-3 w-3" />
              {formatCompact(monthIncome)}
            </span>
            <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400">
              <ArrowDown className="h-3 w-3" />
              {formatCompact(monthExpense)}
            </span>
          </div>
        </Link>

        {/* Pengisi sisa ruang sebelum tombol Logout */}
        <div className="flex-1" />

        {/* Bagian Bawah: Tombol Logout */}
        <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <form action={logout}>
            <button
              type="submit"
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4 text-red-400 transition-colors group-hover:text-red-600 dark:text-red-500 dark:group-hover:text-red-400" />
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}