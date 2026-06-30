import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Footer from '@/components/footer'
import NavigationShell from '@/components/navigation-shell' // <--- IMPORT KOMPONEN KLIEN
import { Analytics } from "@vercel/analytics/next"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Ambil data user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // 2. Ambil Profil & Transaksi (Gunakan Promise.all agar efisien)
  const today = new Date()
  const stringFirstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]

  const [
    { data: profile },
    { data: monthTransactions },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name, effective_balance').eq('id', user.id).single(),
    supabase.from('transactions').select('amount, type, saving_goal_id').gte('transaction_date', stringFirstDay),
  ])

  // 3. Hitung Finansial
  let monthIncome = 0
  let monthExpense = 0

    ; (monthTransactions || []).forEach((tx) => {
      const amount = Number(tx.amount)
      if (tx.type === 'income' && !tx.saving_goal_id) monthIncome += amount
      else if (tx.type === 'expense' && !tx.saving_goal_id) monthExpense += amount
    })

  const fullName = profile?.full_name || 'User'
  const initials = fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()

  const userProfile = { fullName, initials }
  const finances = {
    monthBalance: monthIncome - monthExpense,
    monthIncome,
    monthExpense,
    effectiveBalance: profile?.effective_balance,
  }

  // 4. Bungkus Konten dengan Shell Navigasi
  return (
    <NavigationShell userProfile={userProfile} finances={finances}>
      <Analytics />
      {children}
      <Footer />
    </NavigationShell>
  )
}