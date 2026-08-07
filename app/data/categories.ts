import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth/session";
import { lemparUlangKalauKontrolNext } from "@/lib/next-errors";
import { MUTED_COLOR } from "@/lib/statistics/utils";
import type { Category, CategoryType } from "@/lib/categories/types";

/**
 * 📥 KATEGORI SIAP PAKAI UNTUK KOMPONEN KLIEN
 *
 * Dipanggil dari layout dashboard supaya daftar kategori ikut terkirim bersama
 * HTML. Bentuk kembaliannya sengaja sama persis dengan tipe domain `Category`
 * yang dipakai store, jadi provider bisa langsung memakainya tanpa memetakan
 * ulang di klien.
 *
 * Sesi tidak sah ditangani requireUserId dengan mengalihkan ke /login. Yang
 * ditelan catch di bawah hanyalah kegagalan sungguhan (misalnya database tidak
 * bisa dihubungi), dan itu sengaja tidak fatal.
 */
export const getCategoriesForClient = cache(async (): Promise<Category[]> => {
  try {
    const userId = await requireUserId();

    const rows = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        color: true,
        icon: true,
        _count: { select: { transactions: true } },
      },
    });

    return rows.map((cat) => ({
      id: cat.id,
      name: cat.name,
      type: cat.type.toLowerCase() as CategoryType,
      color: cat.color || MUTED_COLOR,
      icon: cat.icon || undefined,
      transactionCount: cat._count.transactions,
      isDefault: false,
    }));
  } catch (e) {
    lemparUlangKalauKontrolNext(e);

    // Kategori sengaja TIDAK fatal: kalau gagal, dropdown "Transaksi Baru"
    // kosong tapi sisa dashboard tetap bisa dipakai. Layout tidak boleh
    // menjatuhkan seluruh halaman hanya karena daftar ini gagal dimuat.
    console.error("Gagal mengambil kategori untuk klien:", e);
    return [];
  }
});
