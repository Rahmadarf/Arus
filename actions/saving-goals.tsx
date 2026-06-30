'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSavingGoal(formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Otorisasi gagal. Silakan login kembali.' }
    }

    // Ekstraksi data dari form
    const name = formData.get('name') as string
    const targetAmount = formData.get('target_amount')
    const deadline = formData.get('deadline') as string
    const imageUrl = formData.get('image_url') as string

    // Validasi dasar
    if (!name || !targetAmount) {
        return { error: 'Nama barang dan target nominal wajib diisi.' }
    }

    // Insert ke database
    const { error } = await supabase
        .from('saving_goals')
        .insert({
            user_id: user.id,
            name: name,
            target_amount: Number(targetAmount),
            current_amount: 0,
            deadline: deadline ? deadline : null,
            image_url: imageUrl ? imageUrl : null
        })

    if (error) {
        console.error('Error insert saving goal:', error)
        return { error: 'Gagal menyimpan target tabungan.' }
    }

    // Revalidasi halaman agar data baru langsung muncul tanpa reload
    revalidatePath('/goals')
    return { success: true }
}

export async function addFundsToGoal(goalId: string, amount: number, goalName: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Ambil SEMUA transaksi user yang relevan

    const [
        { data: transactions, error: txFetchError },
        { data: profile }
    ] = await Promise.all([
        supabase.from('transactions').select('amount, type, saving_goal_id').eq('user_id', user.id),
        supabase.from('profiles').select('effective_balance').eq('id', user.id).single()
    ])

    if (txFetchError) return { error: 'Gagal mengambil data transaksi.' }

    // 2. Kalkulasi Saldo Efektif
    let totalIncome = 0
    let totalExpense = 0
    let savedAmount = 0

    ;(transactions || []).forEach((tx: any) => {
        const val = Number(tx.amount)
        if (tx.type === 'expense') {
            if (tx.saving_goal_id) savedAmount += val
            else totalExpense += val
        } else if (tx.type === 'income') {
            if (tx.saving_goal_id) savedAmount -= val
            else totalIncome += val
        }
    })

    const effectiveBalance = profile?.effective_balance

    // 3. Validasi Dana
    if (amount > effectiveBalance) {
        return { error: 'Saldo efektif dompet tidak mencukupi.' }
    }

    // 4. Ambil data target
    const { data: goal, error: fetchError } = await supabase
        .from('saving_goals')
        .select('current_amount, target_amount')
        .eq('id', goalId)
        .eq('user_id', user.id) // Penting: pastikan goal milik user ini
        .single()

    if (fetchError || !goal) return { error: 'Target tidak ditemukan.' }

    const currentBalance = Number(goal.current_amount)
    const maxTarget = Number(goal.target_amount)

    if (currentBalance + amount > maxTarget) {
        return { error: `Sisa target hanya Rp ${(maxTarget - currentBalance).toLocaleString('id-ID')}` }
    }

    // 5. Eksekusi Perubahan (Gunakan Database Transaction jika mungkin, atau berurutan)
    const { error: txError } = await supabase
        .from('transactions')
        .insert({
            user_id: user.id,
            amount: amount,
            type: 'expense',
            description: `Menabung untuk: ${goalName}`,
            transaction_date: new Date().toISOString().split('T')[0],
            saving_goal_id: goalId
        })

    if (txError) return { error: 'Gagal mencatat transaksi.' }

    const { error: updateError } = await supabase
        .from('saving_goals')
        .update({ current_amount: currentBalance + amount })
        .eq('id', goalId)

    if (updateError) return { error: 'Gagal memperbarui saldo target.' }

    revalidatePath('/goals')
    revalidatePath('/')
    return { success: true }
}


export async function withdrawFundsFromGoal(goalId: string, amount: number, goalName: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: goal } = await supabase
        .from('saving_goals')
        .select('current_amount')
        .eq('id', goalId)
        .single()

    if (!goal) return { error: 'Target tidak ditemukan.' }

    // Tambahkan log untuk debugging (cek di terminal VS Code)
    console.log('Saldo awal:', goal.current_amount, 'Penarikan:', amount);

    // Jalankan transaksi
    const { error: txError } = await supabase
        .from('transactions')
        .insert({
            user_id: user.id,
            amount: amount,
            type: 'income',
            description: `Pencairan tabungan: ${goalName}`,
            transaction_date: new Date().toISOString().split('T')[0],
            saving_goal_id: goalId
        })

    if (txError) return { error: 'Gagal mencatat transaksi.' }

    const { error: updateError } = await supabase
        .from('saving_goals')
        .update({ current_amount: Number(goal.current_amount) - amount })
        .eq('id', goalId)

    if (updateError) {
        console.error('Update Error:', updateError); // Lihat error spesifik di terminal
        return { error: 'Gagal memperbarui saldo target.' }
    }

    // REVALIDASI AGRESIF
    // Gunakan 'layout' agar semua rute yang menggunakan layout ini ter-refresh
    revalidatePath('/', 'layout')
    return { success: true }
}


export async function deleteSavingGoal(goalId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Ambil sisa uang sebelum target dihapus
    const { data: goal } = await supabase
        .from('saving_goals')
        .select('current_amount, name')
        .eq('id', goalId)
        .eq('user_id', user.id)
        .single()

    if (!goal) return { error: 'Target tidak ditemukan' }

    const remainingAmount = Number(goal.current_amount || 0)

    // 2. Catat penarikan (Pencairan)
    if (remainingAmount > 0) {
        await supabase
            .from('transactions')
            .insert({
                user_id: user.id,
                amount: remainingAmount,
                type: 'income',
                saving_goal_id: goalId, // ID ini akan tetap tersimpan selamanya
                description: `Pencairan sisa dana: ${goal.name}`,
                transaction_date: new Date().toISOString().split('T')[0]
            })
    }

    // 3. Hapus target secara permanen
    const { error: deleteError } = await supabase
        .from('saving_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id)

    if (deleteError) return { error: 'Gagal menghapus target.' }

    revalidatePath('/')
    revalidatePath('/goals')
    return { success: true }
}

