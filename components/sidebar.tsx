import { SidebarNav } from "@/components/sidebar-nav";

// Sidebar tetap di layar lebar. Di bawah lg ia disembunyikan dan digantikan
// oleh MobileNav, karena lebar tetap 256px menyisakan terlalu sedikit ruang
// untuk konten di layar ponsel.
export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 h-full flex-col bg-white border border-zinc-200 rounded-2xl shadow-sm shrink-0">
      <SidebarNav />
    </aside>
  );
}
