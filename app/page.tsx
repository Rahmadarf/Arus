import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BarChart3, Tags } from "lucide-react";

import { ClosingCta } from "@/components/landing/closing-cta";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingNav } from "@/components/landing/landing-nav";
import { Trust } from "@/components/landing/trust";
import { Footer } from "@/components/footer";

const JUDUL = "Arus — Catat pemasukan dan pengeluaran harian";
const DESKRIPSI =
  "Aplikasi pencatat keuangan pribadi: catat transaksi, saring per kategori, dan lihat komposisi pengeluaranmu per bulan. Gratis selama masa pengembangan.";

/**
 * metadataBase dibutuhkan agar URL gambar Open Graph jadi absolut. Setel
 * NEXT_PUBLIC_SITE_URL di lingkungan produksi; localhost hanya cadangan untuk
 * pengembangan.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: JUDUL,
  description: DESKRIPSI,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Arus",
    title: JUDUL,
    description: DESKRIPSI,
    // Berkas ini harus kamu sediakan sendiri di public/og-image.png (1200x630).
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Arus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: JUDUL,
    description: DESKRIPSI,
    images: ["/og-image.png"],
  },
};

/**
 * Landing page publik.
 *
 * Berada di app/page.tsx — di luar route group (auth) maupun (dashboard) —
 * jadi ia hanya memakai root layout. Tidak ada sidebar, tidak ada
 * AuthProvider, dan tidak perlu route group (marketing) tersendiri.
 *
 * Seluruh halaman ini Server Component. Satu-satunya JavaScript yang dikirim
 * berasal dari menu mobile di components/landing/mobile-menu.tsx.
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-zinc-950 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Lewati ke konten utama
      </a>

      <LandingNav />

<<<<<<< HEAD
      <main
        id="konten"
        className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8"
      >
        <Hero />
        <Features />
        <HowItWorks />
        <Trust />
        <ClosingCta />
=======
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
>>>>>>> a0eba47884ba769162da62fb2a67c7c589de35a5
      </main>

      <Footer />
    </div>
  );
}
