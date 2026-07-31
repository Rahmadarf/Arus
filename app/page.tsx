import type { Metadata } from "next";

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

      <main
        id="konten"
        className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8"
      >
        <Hero />
        <Features />
        <HowItWorks />
        <Trust />
        <ClosingCta />
      </main>

      <Footer />
    </div>
  );
}
