import { getTransactionsPaginated } from "@/app/actions/transaction";
import { lemparUlangKalauKontrolNext } from "@/lib/next-errors";

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
    // 🚀 OPTIMASI: Filter + paging dilakukan di SQL melalui helper paginated
    const { rows: paginatedData, total, totalAll } = await getTransactionsPaginated({
      search,
      type,
      category,
      page,
      pageSize: PAGE_SIZE,
    });

    if (!paginatedData || paginatedData.length === 0) {
      return { rows: [], total, totalAll }
    }

    const rows: Transaction[] = paginatedData.map((tx: any) => ({
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

    return { rows, total, totalAll };
  } catch (error: any) {
    // Lapisan kedua yang menelan redirect. getTransactionsPaginated sudah
    // melempar ulang NEXT_REDIRECT, tapi pembungkus ini menangkapnya lagi —
    // akibatnya pengalihan ke /login batal dan pengguna dengan sesi basi
    // melihat "Belum ada transaksi".
    lemparUlangKalauKontrolNext(error);

    console.error("Error fetching transactions", error)
    return { rows: [], total: 0, totalAll: 0 }
  }
}
