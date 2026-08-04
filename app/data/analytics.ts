import { prisma } from "@/lib/prisma";

export async function getMonthlyTrendData(userId: string) {

    try {
        // 1. Tarik semua transaksi user tertentu
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: userId
            },
            select: {
                amount: true,
                type: true,
                createdAt: true
            }
        })

        // 2. Wadah kosong untuk 12 bulan [jan - des]
        const namaBulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        const chartDataMap = namaBulan.reduce((acc: Record<string, { bulan: string; pemasukan: number; pengeluaran: number }>, bulan) => {
            acc[bulan] = { bulan, pemasukan: 0, pengeluaran: 0 }
            return acc
        }, {} as Record<string, { bulan: string; pemasukan: number; pengeluaran: number }>)

        transactions.forEach((tx: { amount: number; type: string; createdAt: Date }) => {
            const date = new Date(tx.createdAt)
            const bulanSesuai = namaBulan[date.getMonth()]

            if (tx.type === "INCOME") {
                chartDataMap[bulanSesuai].pemasukan += tx.amount;
            } else if (tx.type === "EXPENSE") {
                chartDataMap[bulanSesuai].pengeluaran += tx.amount;
            }

        })

        return Object.values(chartDataMap)

    } catch (e: any) {
        console.error("Error fetching analytics data:", e);
        return [];
    }
}