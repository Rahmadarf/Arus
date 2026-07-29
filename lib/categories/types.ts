import { CHART_COLORS, MUTED_COLOR } from "@/lib/statistics/utils";

export type CategoryType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;

  /**
   * Token warna CSS, contoh "var(--chart-1)".
   *
   * DUA ATURAN YANG TIDAK BOLEH DILANGGAR:
   *
   * 1. Nilainya WAJIB salah satu dari CATEGORY_COLORS di bawah — palet yang
   *    sama persis dengan donut chart di /statistics (lihat CHART_COLORS di
   *    lib/statistics/utils.ts). Hex bebas dilarang: warna mentah tidak ikut
   *    berubah saat dark mode, dan titik warna di halaman ini akan berbeda
   *    dari potongan chart yang mewakili kategori yang sama.
   *
   * 2. Warna DISIMPAN per kategori, bukan digenerate saat render. Kalau warna
   *    ditentukan dari urutan atau hash saat render, satu transaksi baru bisa
   *    menggeser peringkat kategori dan seluruh chart berganti warna tanpa
   *    sebab yang bisa dipahami pengguna.
   */
  color: string;

  /** Nama ikon lucide. Lihat CATEGORY_ICONS di lib/categories/icons.ts. */
  icon?: string;

  /** Dipakai untuk memilih jalur penghapusan. Lihat delete-category-dialog.tsx. */
  transactionCount: number;

  /** Kategori bawaan sistem — tidak bisa dihapus. */
  isDefault: boolean;
}

/** Field yang boleh diisi pengguna. `id` dan `transactionCount` milik server. */
export type CategoryInput = Pick<Category, "name" | "type" | "color"> & {
  icon?: string;
};

/**
 * Palet resmi kategori. Diturunkan langsung dari palet chart supaya keduanya
 * tidak mungkin melenceng — kalau CHART_COLORS berubah, halaman ini ikut.
 * MUTED_COLOR disertakan karena chart memakainya untuk potongan "Lainnya".
 */
export const CATEGORY_COLORS: readonly string[] = [...CHART_COLORS, MUTED_COLOR];

export const CATEGORY_TYPE_LABEL: Record<CategoryType, string> = {
  expense: "Pengeluaran",
  income: "Pemasukan",
};

export const DEFAULT_TYPE: CategoryType = "expense";

/** Kembalikan tipe yang valid, atau default kalau param URL ngawur. */
export function parseCategoryType(value: unknown): CategoryType {
  return value === "income" || value === "expense" ? value : DEFAULT_TYPE;
}
