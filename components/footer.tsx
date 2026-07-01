import Link from 'next/link'
import { Mail } from 'lucide-react'
import Image from 'next/image'

// Ikon GitHub di-render manual sebagai inline SVG, bukan dari lucide-react,
// karena ikon brand "Github" sempat deprecated/dihapus di beberapa versi lucide-react
// (lihat: github.com/lucide-icons/lucide, isu terkait ikon brand pihak ketiga).
function GithubIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            aria-hidden="true"
        >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.793-.262.793-.582 0-.287-.01-1.046-.016-2.054-3.338.726-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.082-.73.082-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.835 2.808 1.305 3.492.998.108-.776.42-1.305.763-1.605-2.665-.303-5.467-1.333-5.467-5.93 0-1.31.468-2.382 1.236-3.222-.124-.303-.536-1.524.117-3.176 0 0 1.008-.323 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.553 3.297-1.23 3.297-1.23.655 1.652.243 2.873.12 3.176.77.84 1.234 1.912 1.234 3.222 0 4.61-2.807 5.624-5.48 5.92.43.372.823 1.103.823 2.222 0 1.604-.014 2.896-.014 3.29 0 .322.19.7.8.58C20.565 21.795 24 17.298 24 12c0-6.63-5.37-12-12-12Z" />
        </svg>
    )
}

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const productLinks = [
        { href: '/', label: 'Dasbor' },
        { href: '/goals', label: 'Target Tabungan' },
        { href: '/categories', label: 'Kelola Kategori' },
    ]

    return (
        <footer className="border-t border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/50">
            <div className="mx-auto max-w-6xl px-6 py-12">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">

                    {/* Kolom 1: Branding (mengambil 2 kolom di breakpoint md agar tidak sempit) */}
                    <div className="sm:col-span-2 md:col-span-2 flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
                        <div className="flex items-center gap-2.5">
                            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-zinc-900 dark:bg-zinc-50">
                                <Image
                                    src="/A.png"
                                    alt="Arus Logo"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                Arus
                            </span>
                        </div>
                        <p className="max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                            Kendali arus kas, raih target tabungan. Catat setiap rupiah, kenali setiap kebiasaan finansialmu.
                        </p>
                    </div>

                    {/* Kolom 2: Navigasi Produk */}
                    <div className="flex flex-col items-center gap-3 sm:items-start">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Produk
                        </h3>
                        <nav className="flex flex-col items-center gap-2.5 sm:items-start">
                            {productLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Kolom 3: Kontak & Sosial */}
                    <div className="flex flex-col items-center gap-3 sm:items-start">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Terhubung
                        </h3>
                        <div className="flex flex-col items-center gap-2.5 sm:items-start">
                            <Link
                                href="https://github.com/username-kamu"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                            >
                                <GithubIcon className="h-4 w-4" />
                                GitHub
                            </Link>
                            <Link
                                href="mailto:email-kamu@contoh.com"
                                className="flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                            >
                                <Mail className="h-4 w-4" />
                                Kontak
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Garis Pemisah & Copyright */}
                <div className="mt-10 flex flex-col items-center gap-4 border-t border-zinc-100 pt-6 dark:border-zinc-900 sm:flex-row sm:justify-between">
                    <p className="text-center text-xs text-zinc-500 sm:text-left dark:text-zinc-400">
                        © {currentYear} Arus. Developed by{' '}
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            Rahmad Arifin Susilo
                        </span>
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Semua sistem berjalan normal
                    </div>
                </div>
            </div>
        </footer>
    )
}