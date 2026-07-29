import { getTransactionByUserId } from "@/app/actions/transaction";

export type TransactionType = "INCOME" | "EXPENSE";

export type Category = {
  id: string,
  name: string
}

export type Transaction = {
  id: string,
  date: string,
  note: string | null,
  amount: number,
  type: TransactionType,
  category: Category
}

export type TransactionQuery = {
  search: string;
  type: "ALL" | TransactionType; // Nilai type hanya bisa berupa "ALL", "INCOME", atau "EXPENSE"
  category: string;
  page: number;
};


export const PAGE_SIZE = 10


export const categories: Category[] = [
  { id: "gaji", name: "Gaji" },
  { id: "makanan", name: "Makanan" },
  { id: "transportasi", name: "Transportasi" },
  { id: "hiburan", name: "Hiburan" },
]

export async function getTransactions({ search, type, category, page }: TransactionQuery) {

  try {
    const testingUserId = "id-user-testing-rahmad-123";

    const allDbTransaction = await getTransactionByUserId(testingUserId);

    if (!allDbTransaction || allDbTransaction.length === 0) {
      return { rows: [], total: 0, totalAll: 0 }
    }

    const keyword = search.trim().toLocaleLowerCase();

    const filtered = allDbTransaction.filter((tx) => {
      // Filter 1: Kata Kunci Catatan
      if (keyword && !(tx.description ?? "").toLowerCase().includes(keyword)) return false;

      // Filter 2: Tipe Kas (INCOME/EXPENSE)
      const currentTxType = tx.type as string;
      if (type !== "ALL" && currentTxType !== type) return false;

      // Filter 3: Kategori (Mencocokkan nama kategori di DB dengan filter UI)
      if (category !== "ALL") {
        const txCategoryName = tx.category.name.toLowerCase().trim();
        const filterCategoryName = category.toLowerCase().trim();
        if (txCategoryName !== filterCategoryName) return false;
      }

      return true;
    });

    const start = (page - 1) * PAGE_SIZE;
    const paginatedData = filtered.slice(start, start + PAGE_SIZE);

    const rows: Transaction[] = paginatedData.map((tx) => ({
      id: tx.id,
      date: new Date(tx.createdAt).toISOString().split('T')[0],
      note: tx.description,
      amount: tx.amount,
      type: tx.type as TransactionType,
      category: {
        id: tx.categoryId,
        name: tx.category.name
      }
    }));

    return { rows, total: filtered.length, totalAll: allDbTransaction.length };
  } catch (error) {
    console.error("Error fetching transactions", error)
    return { rows: [], total: 0, totalAll: 0 }
  }
}