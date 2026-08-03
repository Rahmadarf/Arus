import { prisma } from "@/lib/prisma";


interface GetStatsArgs {
  userId: string;
  startDate: Date;
  endDate: Date;
}

export async function getStatisticData({ userId, startDate, endDate }: GetStatsArgs) {
    try {
        const expenseTransactions = await prisma.transaction.findMany({
            where: {
                userId: userId,
                type: "EXPENSE",
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            }, 
            include: {
                category: true
            }
        })

        const totalPengeluaran = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0)

        const categoryMap: Record<string, {
            id: string,
            name: string,
            color: string,
            amount: number,
            count: number
        }> = {};

        expenseTransactions.forEach((tx) => {
            const catId = tx.categoryId;
            if (!categoryMap[catId]) {
                categoryMap[catId] = {
                    id: catId,
                    name: tx.category.name,
                    color: tx.category.color || "#A1A1AA",
                    amount: 0,
                    count: 0
                };
            }
            categoryMap[catId].amount += tx.amount
            categoryMap[catId].count += 1
        });

        const rawCategories = Object.values(categoryMap).map((cat) => {
            const persentase = totalPengeluaran > 0 ? Math.round((cat.amount / totalPengeluaran) * 100) : 0;
            return {
                ...cat,
                persentase
            }
        });

        const sortedCategories = rawCategories.sort((a, b) => b.amount - a.amount);

        return {
            totalPengeluaran,
            totalTransaksiCount: expenseTransactions.length,
            categoriesRank: sortedCategories 
        }
    } catch (e) {
        console.error("Failed to process statistic")
        return {
            totalPengeluaran: 0,
            totalTransaksiCount: 0,
            categoriesRank: [] 
        }
    }
}