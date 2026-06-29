import { Wallet, PieChart, Tags, ShieldCheck } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
}

// Panel kiri berisi branding + highlight fitur, dipakai bersama oleh Login & Register
// agar halaman auth tidak lagi terasa kosong (sebelumnya hanya satu card kecil di tengah layar).
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800">
        {/* PANEL KIRI: Branding & Pitch (disembunyikan di mobile) */}
        <div className="hidden w-1/2 flex-col justify-between bg-zinc-100 p-10 lg:flex dark:bg-zinc-900">
          <div>
            <div className="mb-8 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
                <Wallet className="h-4.5 w-4.5" />
              </div>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Pelacak Keuangan</span>
            </div>
            <h2 className="text-2xl font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">
              Catat setiap rupiah, kenali setiap kebiasaan.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Pantau pemasukan dan pengeluaranmu setiap hari, lalu lihat polanya lewat grafik yang sederhana dan mudah dipahami.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
              <PieChart className="h-4 w-4 shrink-0 text-zinc-400" />
              Grafik tren harian otomatis
            </div>
            <div className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
              <Tags className="h-4 w-4 shrink-0 text-zinc-400" />
              Kategori custom dengan emoji
            </div>
            <div className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
              <ShieldCheck className="h-4 w-4 shrink-0 text-zinc-400" />
              Data tersimpan aman per akun
            </div>
          </div>
        </div>

        {/* PANEL KANAN: Form (Login / Register) */}
        <div className="w-full bg-white p-8 lg:w-1/2 lg:p-10 dark:bg-zinc-950">
          {children}
        </div>
      </div>
    </div>
  )
}