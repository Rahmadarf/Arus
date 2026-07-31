"use server";

import { revalidatePath } from "next/cache";
import { removeTransaction } from "@/lib/transactions-mock";

// PLACEHOLDER: masih memakai data mock di memori.
// TODO(backend): ganti `removeTransaction` dengan panggilan API/ORM asli.
export async function deleteTransaction(id: string) {
  if (!id) {
    return { ok: false as const, message: "Transaksi tidak ditemukan." };
  }

  const deleted = removeTransaction(id);

  if (!deleted) {
    return { ok: false as const, message: "Gagal menghapus transaksi. Coba lagi." };
  }

  revalidatePath("/transactions");
  return { ok: true as const };
}
