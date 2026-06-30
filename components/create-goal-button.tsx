'use client'

import { useState } from 'react'
import Drawer from './ui/drawer'
import { createSavingGoal } from '@/actions/saving-goals'
import { Loader2, Target, Wallet, CalendarDays, Image as ImageIcon, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function CreateGoalButton() {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        // 1. Blokir refresh browser secepat mungkin (Synchronous)
        event.preventDefault()

        const form = event.currentTarget

        // 2. Validasi HTML Bawaan (Cegat sebelum eksekusi berlanjut)
        if (!form.checkValidity()) {
            toast.error('Mohon lengkapi form dengan benar.')
            return // Hentikan eksekusi. Jangan masuk ke database.
        }

        const formData = new FormData(form)
        const amount = Number(formData.get('target_amount'))

        // 3. Validasi Logika Bisnis (Cegat sebelum eksekusi berlanjut)
        if (amount <= 0) {
            toast.error('Nominal tidak valid.')
            return
        }

        // 4. Jika semua validasi lolos, baru delegasikan ke server
        const action = async () => {
            setLoading(true)
            try {
                const result = await createSavingGoal(formData)

                if (result?.error) {
                    throw new Error(result.error)
                }

                // 5. Cleanup murni tanpa campur tangan state loading manual
                setIsOpen(false)
                form.reset()

                return result
            } finally {
                setLoading(false)
            }
        }

        // Eksekusi janji (promise) ke server
        toast.promise(action(), {
            loading: 'Membuat target tabungan...',
            success: 'Target tabungan berhasil dibuat!',
            error: (err) => err.message || 'Terjadi kesalahan sistem.'
        })
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90"
            >
                <Plus className="h-4 w-4" />
                Buat Target Baru
            </button>

            <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Target Tabungan Baru">
                <form noValidate onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            <Target className="h-3.5 w-3.5 text-zinc-400" />
                            Nama Barang/Target
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            placeholder="Contoh: MacBook Air M4"
                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 dark:border-zinc-800"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="target_amount" className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            <Wallet className="h-3.5 w-3.5 text-zinc-400" />
                            Target Nominal (Rp)
                        </label>
                        <input
                            type="number"
                            id="target_amount"
                            name="target_amount"
                            required
                            placeholder="15000000"
                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 dark:border-zinc-800"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="deadline" className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            <CalendarDays className="h-3.5 w-3.5 text-zinc-400" />
                            Tenggat Waktu <span className="font-normal text-zinc-400">(Opsional)</span>
                        </label>
                        <input
                            type="date"
                            id="deadline"
                            name="deadline"
                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 dark:border-zinc-800"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="image_url" className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            <ImageIcon className="h-3.5 w-3.5 text-zinc-400" />
                            Tautan Gambar <span className="font-normal text-zinc-400">(Opsional)</span>
                        </label>
                        <input
                            type="url"
                            id="image_url"
                            name="image_url"
                            placeholder="https://contoh.com/gambar.jpg"
                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 dark:border-zinc-800"
                        />
                        <p className="text-xs text-zinc-500">Salin tautan gambar dari toko daring agar targetmu lebih memotivasi.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            'Simpan Target'
                        )}
                    </button>
                </form>
            </Drawer>
        </>
    )
}