import Link from "next/link";
import { ArrowUpRight, BarChart3, Tags } from "lucide-react";

import { Footer } from "@/components/footer";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Halaman publik. Berada di app/page.tsx, di luar kedua route group, jadi ia
 * hanya memakai root layout — tanpa sidebar, tanpa AuthProvider.
 *
 * proxy.ts memperlakukan "/" sebagai rute tamu: pengunjung yang sudah punya
 * session dialihkan ke aplikasi, bukan disuguhi halaman promosi lagi.
 */

// Contoh isi buku kas. Sengaja memakai formatter yang sama dengan aplikasi
// supaya angka di sini persis seperti yang nanti dilihat pengguna.
const CONTOH = [
  { tanggal: "2026-07-24", catatan: "Gaji bulanan", nominal: 8500000, masuk: true },
  { tanggal: "2026-07-23", catatan: "Belanja bulanan", nominal: 1250000, masuk: false },
  { tanggal: "2026-07-22", catatan: "Isi saldo e-toll", nominal: 200000, masuk: false },
];

const FITUR = [
  {
    href: "/transactions",
    icon: ArrowUpRight,
    judul: "Catat dan saring",
    isi: "Setiap pemasukan dan pengeluaran tersimpan rapi. Cari lewat catatan, saring per tipe atau kategori.",
  },
  {
    href: "/statistics",
    icon: BarChart3,
    judul: "Lihat komposisinya",
    isi: "Donat dan tabel peringkat menunjukkan kategori mana yang paling menguras, per bulan atau per tahun.",
  },
  {
    href: "/categories",
    icon: Tags,
    judul: "Atur pengelompokan",
    isi: "Buat kategori sendiri lengkap dengan warnanya. Menghapus kategori tidak pernah menghapus transaksi.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo size="sm" />

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="h-9 rounded-xl" asChild>
            <Link href="/login">Masuk</Link>
          </Button>
          <Button
            className="h-9 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900"
            asChild
          >
            <Link href="/register">Daftar</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6">
        <section className="py-14 sm:py-20">
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Catat arus kas. Lihat polanya.
          </h1>
          <p className="mt-3 max-w-xl text-base text-zinc-500">
            Arus menyimpan pemasukan dan pengeluaran harian Anda, lalu menunjukkan ke
            mana uang itu benar-benar pergi.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              className="h-10 rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-900"
              asChild
            >
              <Link href="/register">Buat akun</Link>
            </Button>
            <Button variant="outline" className="h-10 rounded-xl px-5" asChild>
              <Link href="/login">Sudah punya akun</Link>
            </Button>
          </div>

          {/* Pratinjau buku kas: hal paling khas dari produk ini, ditampilkan
              apa adanya alih-alih digambarkan lewat ilustrasi. */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            {/* Garis penanda yang sama dengan footer: emerald untuk pemasukan,
                rose untuk pengeluaran — dua kutub yang jadi inti aplikasi. */}
            <div
              aria-hidden
              className="h-px w-full bg-linear-to-r from-chart-1/60 via-border to-chart-2/60"
            />

            <ul className="divide-y divide-zinc-100">
              {CONTOH.map((baris) => (
                <li
                  key={baris.tanggal}
                  className="flex items-center gap-3 px-4 py-3.5 sm:px-6"
                >
                  {/* Tanggal disembunyikan di layar sempit: di pratinjau ini
                      catatan dan nominal yang perlu terbaca utuh. */}
                  <span className="hidden w-24 shrink-0 text-sm text-zinc-500 sm:block">
                    {formatTanggal(baris.tanggal)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-700">
                    {baris.catatan}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums",
                      baris.masuk ? "text-emerald-600" : "text-rose-600"
                    )}
                  >
                    {baris.masuk ? "+ " : "- "}
                    {formatRupiah(baris.nominal)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid gap-4 pb-16 sm:grid-cols-3">
          {FITUR.map((fitur) => (
            <div
              key={fitur.href}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-100">
                <fitur.icon className="size-4 text-zinc-500" />
              </div>
              <h2 className="mt-3.5 text-sm font-semibold text-zinc-900">
                {fitur.judul}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">{fitur.isi}</p>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
