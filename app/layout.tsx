import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";


// Import Components
import Sidebar from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arus",
  description: "Inovative Finance Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable
      )}
    >
      {/* Gunakan font-sans di body agar font Inter menjadi default aplikasi */}
      <body className="h-full font-sans bg-zinc-50 text-zinc-900 antialiased">

        {/* Pembungkus Utama Dashboard */}
        <div className="flex h-screen overflow-hidden p-3 gap-3 md:p-4 md:gap-4 bg-zinc-50">

          {/* 1. Kiri: Floating Sidebar (hanya lg ke atas) */}
          <Sidebar />

          {/* 2. Kanan: Top bar mobile + area konten utama.
                 min-w-0 wajib: tanpa itu anak flex menolak menyusut dan
                 konten meluber keluar layar di ponsel. */}
          <div className="flex flex-1 min-w-0 flex-col gap-3 md:gap-4">
            <MobileNav />

            {/* Kartu konten. Footer duduk di sini sebagai saudara <main>,
                BUKAN di dalamnya: <main> punya overflow-y-auto sendiri, jadi
                footer yang ditaruh di dalamnya akan ikut ter-scroll dan hilang.
                min-h-0 wajib — tanpa itu anak flex menolak menyusut dan
                scroll pindah ke kartu, bukan ke <main>. */}
            <div className="flex flex-1 min-h-0 flex-col overflow-hidden bg-white border border-zinc-200 rounded-2xl">
              <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                <div className="max-w-7xl mx-auto w-full">
                  {children}
                </div>
              </main>

              <Footer />
            </div>
          </div>

        </div>


      </body>
    </html>
  );
}

