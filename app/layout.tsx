import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";


// Import Components
import Sidebar from "@/components/sidebar";

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

        {/* Pembungkus Utama Dashboard - Ditambahkan p-4 */}
        <div className="flex h-screen overflow-hidden p-4 gap-4 bg-zinc-50">

          {/* 1. Kiri: Floating Sidebar */}
          <Sidebar />

          {/* 2. Kanan: Area Konten Utama dengan latar belakang putih agar kontras */}
          <main className="flex-1 overflow-y-auto bg-white border border-zinc-200 rounded-2xl p-6 md:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>

        </div>


      </body>
    </html>
  );
}

