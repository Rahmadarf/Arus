import { createClient } from '@/utils/supabase/server'
import { logout } from '@/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Bagian Atas: Profil User */}
        <div className="flex items-center space-x-3 border-b border-zinc-100 pb-5 dark:border-zinc-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 font-medium text-white text-sm dark:bg-zinc-100 dark:text-zinc-900">
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
        <nav className="mt-6 flex-1 space-y-1">
          <Link
            href="/"
            className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            Dashboard
          </Link>
          <Link
            href="/income"
            className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            Income
          </Link>
          <Link
            href="/expense"
            className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            Expense
          </Link>
          <Link
            href="/categories"
            className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            Kelola Kategori
          </Link>
        </nav>

        {/* Bagian Bawah: Tombol Logout */}
        <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
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