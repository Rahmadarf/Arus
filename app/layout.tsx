import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

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
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable
      )}
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
