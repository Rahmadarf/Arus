import Link from "next/link"
import {
    LayoutDashboard,
    User,
    LogOut,
    Wallet,
    BarChart3,
    ArrowUpRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { AddTransactionModal } from "./add-transaction-modal"


export default function Sidebar() {


    const navLinks = [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/budget', label: 'Budget', icon: Wallet },
        { href: '/statistics', label: 'Statistics', icon: BarChart3 },
        { href: '/transactions', label: 'Transactions', icon: ArrowUpRight },
    ]

    const isActive = false;


    return (
        <aside className="w-64 h-full flex flex-col bg-white border border-zinc-200 rounded-2xl shadow-sm shrink-0">
            <div className="h-20 flex items-center gap-3 px-6 border-b border-zinc-100">
                {/* 1. Logo Menggunakan Gambar Anda */}
                <div className="w-9 h-9 shrink-0 relative overflow-hidden rounded-xl bg-zinc-50 border border-zinc-100">
                    <Image
                        src="/images/A.png"
                        alt="Logo Arus"
                        fill
                        sizes="36px"
                        className="object-cover"
                        priority
                    />
                </div>

                {/* 2. Teks Nama dan Tagline */}
                <div className="flex flex-col justify-center">
                    <span className="font-bold text-xl tracking-tight text-zinc-900 leading-none">
                        Arus.
                    </span>
                    <span className="text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-wider">
                        Finance Tracker
                    </span>
                </div>
            </div>

            <nav className="flex-1 flex flex-col px-4 py-6 overflow-y-auto justify-between">

                {/* ================== */}
                {/* Navigation Buttons */}
                {/* ================== */}
                <div className="flex flex-col gap-1">
                    {navLinks.map((link) => {
                        // Catatan MVP: Nanti di sini kita bisa cek halaman aktif menggunakan usePathname()

                        return (
                            <Link
                                href={link.href}
                                key={link.href}
                                className={cn(
                                    // 1. Tata Letak & Ukuran Utama (Ruang klik yang lega dan sudut membulat modern)
                                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium select-none",
                                    // 2. Animasi Transisi Halus (Efek pantulan mikro saat diklik)
                                    "transition-all duration-200 ease-in-out group active:scale-[0.98]",
                                    // 3. Logika Warna Ganti (Active vs Inactive)
                                    isActive && "bg-zinc-950 text-white shadow-md shadow-zinc-950/10 font-semibold",
                                    !isActive && "text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-900"
                                )}
                            >
                                {/* Ikon dengan ukuran tetap agar tidak penyok dan warna yang serasi */}
                                <link.icon className={cn(
                                    "w-5 h-5 shrink-0 transition-transform duration-200",
                                    isActive && "text-white scale-105",
                                    !isActive && "text-zinc-400 group-hover:text-zinc-900 group-hover:scale-105"
                                )} />

                                {/* Label Menu */}
                                <span className="tracking-tight">{link.label}</span>
                            </Link>

                        );
                    })}

                    <div className="px-4 pt-5 pb-2">
                        <AddTransactionModal />
                    </div>
                </div>



                {/* ======================= */}
                {/* Setting & Logout Button */}
                {/* ======================= */}
                <div className={cn(
                    // 1. Tata Letak & Jarak Pembungkus (mt-auto menjaga posisi selalu di paling bawah)
                    "w-full p-4 flex flex-col gap-1 mt-auto",
                    // 2. Gaya Visual & Pembatas (rounded-b-2xl menyatu dengan bentuk melengkung bawah sidebar)
                    "border-t border-zinc-100 bg-white rounded-b-2xl"
                )}>

                    {/* Tombol Settings */}
                    <Link
                        href="/settings"
                        className={cn(
                            // Tata Letak Dasar & Ukuran Sentuh yang Konsisten
                            "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium select-none",
                            // Transisi Mikro-Interaksi Halus saat Ditekan
                            "transition-all duration-200 ease-in-out group active:scale-[0.98]",
                            // Logika Warna Mengikuti Standar Navigasi Atas
                            isActive
                                ? "bg-zinc-950 text-white shadow-md shadow-zinc-950/10 font-semibold"
                                : "text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-900"
                        )}
                    >
                        <User className={cn(
                            "w-5 h-5 shrink-0 transition-transform duration-200",
                            isActive
                                ? "text-white scale-105"
                                : "text-zinc-400 group-hover:text-zinc-900 group-hover:scale-105"
                        )} />
                        <span className="tracking-tight">Settings</span>
                    </Link>

                    {/* Tombol Logout */}
                    <button
                        className={cn(
                            // Tata Letak Dasar, Ukuran, dan Efek Membal yang Sama
                            "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium select-none",
                            "transition-all duration-200 ease-in-out group active:scale-[0.98]",
                            // Sentuhan UX Destructive: Menggunakan aksen Rose/Merah yang Halus
                            "text-zinc-500 hover:bg-rose-50 hover:text-rose-600"
                        )}
                    >
                        <LogOut className="w-5 h-5 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:text-rose-600 group-hover:scale-105" />
                        <span className="tracking-tight">Logout</span>
                    </button>
                </div>

            </nav>



        </aside >
    )
}