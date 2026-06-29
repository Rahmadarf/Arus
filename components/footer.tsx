import Link from 'next/link'
import { GitForkIcon, Mail, Wallet } from 'lucide-react'
import Image from 'next/image'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/50">
            <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">

                    {/* Bagian Kiri: Branding */}
                    <div className="flex flex-col items-center gap-2 md:items-start">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-50">
                                <Image
                                    src="/A.png"
                                    alt="Arus Logo"
                                    width={36}
                                    height={36}
                                    className="rounded-lg"
                                />              </div>
                            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                Arus
                            </span>
                        </div>
                        <p className="max-w-xs text-center text-xs text-zinc-500 md:text-left dark:text-zinc-400">
                            Kendali arus kas, raih target tabungan.
                        </p>
                    </div>

                    {/* Bagian Kanan: Kredit & Links */}
                    <div className="flex flex-col items-center gap-3 md:items-end">
                        <div className="flex items-center gap-1">
                            <Link
                                href="https://github.com/username-kamu"
                                target="_blank"
                                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                            >
                                <GitForkIcon className="h-3.5 w-3.5" />
                                GitHub
                            </Link>
                            <Link
                                href="mailto:email-kamu@contoh.com"
                                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                            >
                                <Mail className="h-3.5 w-3.5" />
                                Kontak
                            </Link>
                        </div>

                        <div className="hidden h-px w-32 bg-zinc-200 md:block dark:bg-zinc-800" />

                        <p className="text-center text-xs text-zinc-500 md:text-right dark:text-zinc-400">
                            © {currentYear} Arus. Developed by{' '}
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                Rahmad Arifin Susilo
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}