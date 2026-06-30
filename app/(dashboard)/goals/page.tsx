import { createClient } from '@/utils/supabase/server'
import GoalCard from '@/components/goal-card'
import CreateGoalButton from '@/components/create-goal-button'
import { Target, PiggyBank } from 'lucide-react'
// import CreateGoalModal dari tempat lain nanti

export default async function GoalsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
    }

    const [{ data: goals }, { data: transactions }, { data: profile }] = await Promise.all([
        supabase
            .from('saving_goals')
            .select('*')
            .order('created_at', { ascending: false }),
        supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id),
        supabase
            .from('profiles')
            .select('effective_balance')
            .eq('id', user.id)
            .single()
    ])

    // --- AGREGASI DATA PERIODE SAAT INI ---
    let totalIncome = 0
    let totalExpense = 0
    let savedAmount = 0

        ; (transactions || []).forEach((tx) => {
            const amount = Number(tx.amount)
            if (tx.type === 'expense') {
                if (tx.saving_goal_id) savedAmount += amount
                else totalExpense += amount
            } else if (tx.type === 'income') {
                if (tx.saving_goal_id) savedAmount -= amount
                else totalIncome += amount
            }
        })

    const effectiveBalance = profile?.effective_balance

    const hasGoals = goals && goals.length > 0
    const formatMoney = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Target Tabungan</h1>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Fokuskan alokasi danamu untuk mencapai impian finansial.</p>
                </div>

                <CreateGoalButton />
            </div>

            {/* Strip Ringkasan: Total Tersimpan & Saldo Tersedia */}
            {hasGoals && (
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <PiggyBank className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                Total Tersimpan di Semua Target
                            </p>
                            <p className="mt-0.5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                                {formatMoney(savedAmount)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            <Target className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                Saldo Tersedia untuk Ditabung
                            </p>
                            <p className={`mt-0.5 text-lg font-semibold ${effectiveBalance >= 0 ? 'text-zinc-900 dark:text-zinc-50' : 'text-red-500'}`}>
                                {formatMoney(effectiveBalance)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {!hasGoals ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/50 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                        <Target className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Belum ada target</h3>
                    <p className="mb-5 mt-2 max-w-sm text-sm text-zinc-500">
                        Mulai rencanakan pembelian barang impianmu dengan menetapkan target tabungan yang jelas.
                    </p>
                    <CreateGoalButton />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {goals.map((goal) => (
                        <GoalCard key={goal.id} goal={goal} effectiveBalance={effectiveBalance} />
                    ))}
                </div>
            )}
        </div>
    )
}