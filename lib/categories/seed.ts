import { CATEGORY_COLORS, type Category } from "@/lib/categories/types";

const [EMERALD, ROSE, AMBER, INDIGO, TEAL, MUTED] = CATEGORY_COLORS;

/**
 * Data awal. Sengaja dibuat tidak rapi supaya semua cabang UI teruji:
 * - Kesehatan & Pendidikan punya transactionCount 0  -> jalur hapus A
 * - Langganan Digital punya transactionCount 7       -> jalur hapus B
 * - Beberapa isDefault: true                         -> tombol hapus mati
 * - Investasi (income) bernilai 0 dan bukan bawaan   -> jalur A di tab income
 */
export const SEED_CATEGORIES: Category[] = [
  // ---- Pengeluaran ----
  {
    id: "cat-makanan",
    name: "Makanan & Minuman",
    type: "expense",
    color: EMERALD,
    icon: "utensils",
    transactionCount: 128,
    isDefault: true,
  },
  {
    id: "cat-transportasi",
    name: "Transportasi",
    type: "expense",
    color: ROSE,
    icon: "car",
    transactionCount: 64,
    isDefault: true,
  },
  {
    id: "cat-belanja",
    name: "Belanja",
    type: "expense",
    color: AMBER,
    icon: "shopping-bag",
    transactionCount: 41,
    isDefault: false,
  },
  {
    id: "cat-tagihan",
    name: "Tagihan",
    type: "expense",
    color: INDIGO,
    icon: "receipt",
    transactionCount: 23,
    isDefault: true,
  },
  {
    id: "cat-hiburan",
    name: "Hiburan",
    type: "expense",
    color: TEAL,
    icon: "film",
    transactionCount: 12,
    isDefault: false,
  },
  {
    id: "cat-langganan",
    name: "Langganan Digital",
    type: "expense",
    color: MUTED,
    icon: "receipt",
    transactionCount: 7,
    isDefault: false,
  },
  {
    id: "cat-kesehatan",
    name: "Kesehatan",
    type: "expense",
    color: ROSE,
    icon: "heart",
    transactionCount: 0,
    isDefault: false,
  },
  {
    id: "cat-pendidikan",
    name: "Pendidikan",
    type: "expense",
    color: INDIGO,
    icon: "tag",
    transactionCount: 0,
    isDefault: false,
  },

  // ---- Pemasukan ----
  {
    id: "cat-gaji",
    name: "Gaji",
    type: "income",
    color: EMERALD,
    icon: "wallet",
    transactionCount: 18,
    isDefault: true,
  },
  {
    id: "cat-bonus",
    name: "Bonus",
    type: "income",
    color: AMBER,
    icon: "gift",
    transactionCount: 3,
    isDefault: false,
  },
  {
    id: "cat-investasi",
    name: "Investasi",
    type: "income",
    color: TEAL,
    icon: "trending-up",
    transactionCount: 0,
    isDefault: false,
  },
  {
    id: "cat-lainnya",
    name: "Lainnya",
    type: "income",
    color: MUTED,
    icon: "tag",
    transactionCount: 5,
    isDefault: true,
  },
];
