// ============================================================================
// DATA LATIHAN (MOCK) — sementara, sampai backend siap.
//
// Ganti isi file ini dengan pemanggilan API/ORM asli. Bentuk tipe & signature
// `getTransactions` sengaja dibuat menyerupai hasil query berpaginasi supaya
// komponen di components/transactions/ tidak perlu diubah saat backend masuk.
// ============================================================================

export type TransactionType = "INCOME" | "EXPENSE";

export type Category = {
  id: string;
  name: string;
};

export type Transaction = {
  id: string;
  date: string; // ISO 8601
  note: string | null;
  amount: number;
  type: TransactionType;
  category: Category;
};

export const PAGE_SIZE = 10;

export const categories: Category[] = [
  { id: "cat-gaji", name: "Gaji" },
  { id: "cat-makanan", name: "Makanan" },
  { id: "cat-transportasi", name: "Transportasi" },
  { id: "cat-belanja", name: "Belanja" },
  { id: "cat-hiburan", name: "Hiburan" },
  { id: "cat-tagihan", name: "Tagihan" },
  { id: "cat-investasi", name: "Investasi" },
];

const byId = (id: string) => categories.find((item) => item.id === id)!;

// Mutable supaya tombol hapus terasa nyata saat pengembangan frontend.
const transactions: Transaction[] = [
  { id: "tx-01", date: "2026-02-24", note: "Gaji bulanan utama", amount: 8500000, type: "INCOME", category: byId("cat-gaji") },
  { id: "tx-02", date: "2026-02-23", note: "Beli kopi dan cemilan sore", amount: 75000, type: "EXPENSE", category: byId("cat-makanan") },
  { id: "tx-03", date: "2026-02-22", note: "Isi saldo e-toll bulanan", amount: 200000, type: "EXPENSE", category: byId("cat-transportasi") },
  { id: "tx-04", date: "2026-02-21", note: "Belanja bulanan supermarket", amount: 1250000, type: "EXPENSE", category: byId("cat-belanja") },
  { id: "tx-05", date: "2026-02-20", note: "Langganan streaming", amount: 65000, type: "EXPENSE", category: byId("cat-hiburan") },
  { id: "tx-06", date: "2026-02-19", note: "Tagihan listrik", amount: 430000, type: "EXPENSE", category: byId("cat-tagihan") },
  { id: "tx-07", date: "2026-02-18", note: "Freelance desain landing page", amount: 3200000, type: "INCOME", category: byId("cat-gaji") },
  { id: "tx-08", date: "2026-02-17", note: "Makan siang tim", amount: 185000, type: "EXPENSE", category: byId("cat-makanan") },
  { id: "tx-09", date: "2026-02-16", note: "Top up reksa dana", amount: 1000000, type: "EXPENSE", category: byId("cat-investasi") },
  { id: "tx-10", date: "2026-02-15", note: "Ojek online ke kantor", amount: 48000, type: "EXPENSE", category: byId("cat-transportasi") },
  { id: "tx-11", date: "2026-02-14", note: null, amount: 92000, type: "EXPENSE", category: byId("cat-makanan") },
  { id: "tx-12", date: "2026-02-13", note: "Tagihan internet rumah", amount: 350000, type: "EXPENSE", category: byId("cat-tagihan") },
  { id: "tx-13", date: "2026-02-12", note: "Tiket bioskop akhir pekan", amount: 120000, type: "EXPENSE", category: byId("cat-hiburan") },
  { id: "tx-14", date: "2026-02-11", note: "Bonus proyek kuartal", amount: 2500000, type: "INCOME", category: byId("cat-gaji") },
  { id: "tx-15", date: "2026-02-10", note: "Servis motor rutin", amount: 275000, type: "EXPENSE", category: byId("cat-transportasi") },
  { id: "tx-16", date: "2026-02-09", note: "Beli sepatu lari", amount: 890000, type: "EXPENSE", category: byId("cat-belanja") },
  { id: "tx-17", date: "2026-02-08", note: "Dividen saham", amount: 640000, type: "INCOME", category: byId("cat-investasi") },
  { id: "tx-18", date: "2026-02-07", note: "Kopi pagi", amount: 32000, type: "EXPENSE", category: byId("cat-makanan") },
  { id: "tx-19", date: "2026-02-06", note: "Tagihan air", amount: 145000, type: "EXPENSE", category: byId("cat-tagihan") },
  { id: "tx-20", date: "2026-02-05", note: "Bensin mingguan", amount: 150000, type: "EXPENSE", category: byId("cat-transportasi") },
  { id: "tx-21", date: "2026-02-04", note: "Konser musik", amount: 750000, type: "EXPENSE", category: byId("cat-hiburan") },
  { id: "tx-22", date: "2026-02-03", note: "Penjualan barang bekas", amount: 400000, type: "INCOME", category: byId("cat-belanja") },
  { id: "tx-23", date: "2026-02-02", note: "Makan malam keluarga", amount: 320000, type: "EXPENSE", category: byId("cat-makanan") },
  { id: "tx-24", date: "2026-02-01", note: "Top up emas digital", amount: 500000, type: "EXPENSE", category: byId("cat-investasi") },
  { id: "tx-25", date: "2026-01-31", note: "Gaji bulanan utama", amount: 8500000, type: "INCOME", category: byId("cat-gaji") },
  { id: "tx-26", date: "2026-01-30", note: null, amount: 67000, type: "EXPENSE", category: byId("cat-transportasi") },
  { id: "tx-27", date: "2026-01-29", note: "Beli buku desain", amount: 210000, type: "EXPENSE", category: byId("cat-belanja") },
  { id: "tx-28", date: "2026-01-28", note: "Tagihan telepon", amount: 100000, type: "EXPENSE", category: byId("cat-tagihan") },
];

export type TransactionQuery = {
  search: string;
  type: "ALL" | TransactionType;
  category: string;
  page: number;
};

export type TransactionResult = {
  rows: Transaction[];
  total: number; // jumlah hasil setelah filter — untuk batas pagination
  totalAll: number; // jumlah seluruh data — untuk membedakan dua empty state
};

export function getTransactions({ search, type, category, page }: TransactionQuery): TransactionResult {
  const keyword = search.trim().toLowerCase();

  const filtered = transactions.filter((tx) => {
    if (keyword && !(tx.note ?? "").toLowerCase().includes(keyword)) return false;
    if (type !== "ALL" && tx.type !== type) return false;
    if (category !== "ALL" && tx.category.id !== category) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  const start = (page - 1) * PAGE_SIZE;

  return {
    rows: sorted.slice(start, start + PAGE_SIZE),
    total: sorted.length,
    totalAll: transactions.length,
  };
}

export function removeTransaction(id: string): boolean {
  const index = transactions.findIndex((tx) => tx.id === id);
  if (index === -1) return false;
  transactions.splice(index, 1);
  return true;
}
