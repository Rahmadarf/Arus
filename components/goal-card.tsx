'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Target, Trash2, Plus, Minus, Loader2, CalendarDays, Wallet } from 'lucide-react'
import Drawer from './ui/drawer'
import { toast } from 'sonner'
import { addFundsToGoal, withdrawFundsFromGoal, deleteSavingGoal } from '@/actions/saving-goals'

type Goal = {
    id: string
    name: string
    target_amount: number
    current_amount: number
    deadline: string | null
    image_url: string | null
}

interface GoalCardProps {
    goal: Goal
    effectiveBalance: number // <--- INI PROPS YANG HARUS DIKIRIM DARI PARENT
}

export default function GoalCard({ goal, effectiveBalance }: GoalCardProps) {
    // State untuk mengontrol Drawer
    const [drawerType, setDrawerType] = useState<'deposit' | 'withdraw' | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // State terpisah untuk tombol hapus
    const [isDeleting, setIsDeleting] = useState(false)

    const rawPercentage = (goal.current_amount / goal.target_amount) * 100
    const percentage = Math.min(Math.round(rawPercentage), 100)
    const isComplete = percentage >= 100
    const maxDeposit = goal.target_amount - goal.current_amount
    const formatMoney = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`

    // Logika Pemrosesan Form (Menabung / Menarik)
    function handleTransaction(event: React.FormEvent<HTMLFormElement>) {
        // 1. Sinkron: Blokir aksi bawaan browser dan tangkap referensi DOM
        event.preventDefault()
        const form = event.currentTarget

        // 2. Sinkron: Validasi Form Dasar (Cegat di awal)
        if (!form.checkValidity()) {
            toast.error('Isi form dengan lengkap.')
            return
        }

        const formData = new FormData(form)
        const amount = Number(formData.get('amount'))

        // 3. Sinkron: Validasi Logika Bisnis
        if (amount <= 0) {
            toast.error('Nominal tidak valid.')
            return
        }

        if (drawerType === 'deposit' && amount > effectiveBalance) {
            toast.error('Saldo tidak cukup untuk menambah tabungan.')
            return
        }

        if (drawerType === 'withdraw' && amount > goal.current_amount) {
            toast.error('Nominal penarikan melebihi saldo tabungan saat ini.')
            return
        }

        if (drawerType === 'deposit' && amount > maxDeposit) {
            toast.error('Nominal melebihi target tabungan')
            return
        }

        // 4. Asinkron: Hanya berisi komunikasi database dan error handling server
        const action = async () => {
            setLoading(true)
            let result

            try {
                if (drawerType === 'deposit') {
                    result = await addFundsToGoal(goal.id, amount, goal.name)
                } else if (drawerType === 'withdraw') {
                    result = await withdrawFundsFromGoal(goal.id, amount, goal.name)
                }

                // Jika server menolak, lempar error agar ditangkap oleh toast merah
                if (result?.error) {
                    throw new Error(result.error)
                }

                // Bersihkan UI HANYA JIKA SUKSES
                setDrawerType(null)
                router.refresh()

                return result
            } finally {
                setLoading(false)
            }
        }

        // 5. Eksekusi dengan pemanggilan fungsi ()
        const actionName = drawerType === 'deposit' ? 'menambahkan' : 'menarik'
        const successName = drawerType === 'deposit' ? 'ditambahkan ke' : 'ditarik dari'

        toast.promise(action(), {
            loading: `Sedang ${actionName} saldo...`,
            success: `Saldo berhasil ${successName} ${goal.name}`,
            error: (err) => err.message || `Gagal ${actionName} saldo.`
        })
    }

    // Logika Penghapusan
    const handleDelete = () => {
        setIsDeleting(true)
        toast.promise(
            deleteSavingGoal(goal.id).finally(() => setIsDeleting(false)),
            {
                loading: 'Sedang memproses...',
                success: 'Target berhasil dihapus & saldo dikembalikan.',
                error: (err: any) => err?.error || 'Gagal menghapus target.',
            }
        )
    }

    return (
        <>
            <div className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                <div className="relative h-40 w-full bg-zinc-100 dark:bg-zinc-800">
                    {goal.image_url ? (
                        <img src={goal.image_url} alt={goal.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-300 dark:text-zinc-700">
                            <Target className="h-10 w-10" />
                        </div>
                    )}
                    <div
                        className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm backdrop-blur-sm ${
                            isComplete
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white/90 text-zinc-900 dark:bg-zinc-900/90 dark:text-zinc-50'
                        }`}
                    >
                        {percentage}%
                    </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                    <div className="mb-4">
                        <h3 className="truncate font-semibold text-zinc-900 dark:text-zinc-50">{goal.name}</h3>
                        {goal.deadline ? (
                            <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                                <CalendarDays className="h-3 w-3" />
                                Tenggat: {new Date(goal.deadline).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                            </p>
                        ) : (
                            <p className="mt-1 text-xs text-zinc-400">Tanpa tenggat waktu</p>
                        )}
                    </div>

                    <div className="mt-auto space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-emerald-600 dark:text-emerald-400">{formatMoney(goal.current_amount)}</span>
                            <span className="text-zinc-400">{formatMoney(goal.target_amount)}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                            <div
                                className={`h-full transition-all duration-1000 ease-out ${isComplete ? 'bg-emerald-500' : 'bg-emerald-500'}`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                        <div className="flex gap-2">
                            {/* Tombol Tabung */}
                            <button
                                onClick={() => setDrawerType('deposit')}
                                disabled={isComplete} // Disable jika sudah penuh
                                title={isComplete ? 'Target sudah tercapai' : 'Tabung dana'}
                                className="flex h-8 items-center justify-center rounded-md bg-zinc-100 px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                            >
                                <Plus className="mr-1 h-3 w-3" /> Tabung
                            </button>

                            {/* Tombol Tarik (Disabled jika saldo 0) */}
                            <button
                                onClick={() => setDrawerType('withdraw')}
                                disabled={goal.current_amount <= 0}
                                title={goal.current_amount <= 0 ? 'Belum ada saldo untuk ditarik' : 'Tarik dana'}
                                className="flex h-8 items-center justify-center rounded-md border border-zinc-200 bg-transparent px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                <Minus className="mr-1 h-3 w-3" /> Tarik
                            </button>
                        </div>

                        {/* Tombol Hapus */}
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            title="Hapus target"
                            aria-label="Hapus target"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Drawer Dinamis (Menangani Tabung & Tarik) */}
            <Drawer
                isOpen={drawerType !== null}
                onClose={() => setDrawerType(null)}
                title={drawerType === 'deposit' ? 'Tabung Dana' : 'Tarik Dana'}
            >
                <form noValidate onSubmit={handleTransaction} className="space-y-5">
                    <div className="space-y-1.5">
                        <label htmlFor="amount" className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            <Wallet className="h-3.5 w-3.5 text-zinc-400" />
                            Nominal {drawerType === 'deposit' ? 'Tabungan' : 'Penarikan'} (Rp)
                        </label>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            required
                            placeholder="Contoh: 50000"
                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 dark:border-zinc-800"
                        />

                        {/* Helper text dinamis */}
                        {drawerType === 'withdraw' && (
                            <p className="text-xs text-zinc-500">Maksimal penarikan: {formatMoney(goal.current_amount)}</p>
                        )}
                        {drawerType === 'deposit' && (
                            <p className="text-xs text-zinc-500">Sisa target: {formatMoney(maxDeposit)}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${drawerType === 'deposit'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            'Konfirmasi'
                        )}
                    </button>
                </form>
            </Drawer>
        </>
    )
}