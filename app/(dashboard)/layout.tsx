import Sidebar from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/lib/auth/context";
import { CategoriesProvider } from "@/lib/categories/store";

/**
 * Kerangka dashboard. Route group `(dashboard)` tidak muncul di URL, jadi
 * /transactions tetap /transactions.
 *
 * AuthProvider dipasang di sini, bukan di root layout, supaya halaman auth
 * tidak ikut membaca session — di sana belum ada session yang perlu dibaca.
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <CategoriesProvider>
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
      </CategoriesProvider>
    </AuthProvider>
  );
}
