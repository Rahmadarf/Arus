import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// display: "swap" — teks langsung tampil dengan font sistem lalu berganti saat
// font tiba, alih-alih menyisakan blok kosong selama unduhan.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Geist Sans dihapus: ia diunduh di setiap kunjungan tapi tidak pernah dipakai —
// globals.css memetakan --font-sans ke Inter, dan tidak ada satu pun kelas yang
// memakai --font-geist-sans. Geist Mono tetap ada karena `font-mono` dipakai
// untuk angka, badge versi, dan konfirmasi di zona bahaya.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arus",
  description: "Inovative Finance Tracker",
};

/**
 * Root layout sengaja hanya memuat html/body, font, dan provider global.
 * Kerangka dashboard (sidebar, top bar, footer) pindah ke
 * app/(dashboard)/layout.tsx supaya halaman auth tidak ikut memakainya.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={cn("h-full antialiased", geistMono.variable, inter.variable)}
    >
      {/* Gunakan font-sans di body agar font Inter menjadi default aplikasi */}
      <body className="h-full font-sans bg-zinc-50 text-zinc-900 antialiased">
        {/* TooltipProvider dipasang di akar: Radix butuh satu provider untuk
            mengatur jeda tampil antar tooltip di seluruh aplikasi. */}
        <TooltipProvider>
          {children}
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
