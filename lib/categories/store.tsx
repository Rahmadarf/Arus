"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { toast } from "sonner";

import { SEED_CATEGORIES } from "@/lib/categories/seed";
import type { Category, CategoryInput, CategoryType } from "@/lib/categories/types";

import { createCategoriesByUserId, getCategoriesById, reassignAndDeleteCategory, deleteCategoryAction } from "@/app/actions/category";

const testUserId = "id-user-testing-rahmad-123";

// ============================================================================
// LAPISAN DATA — Pemanggil server actions dengan kontrak respons yang seragam.
// ============================================================================

/** Naikkan untuk menguji error state. 0 = selalu berhasil. */
const MUTATION_FAILURE_RATE = 0.15;

/**
 * Sengaja 0. Halaman yang gagal dimuat pada 1 dari 10 refresh membuat semua
 * fitur lain mustahil diuji. Ubah ke 1 untuk melihat error state + "Coba lagi".
 */
const LOAD_FAILURE_RATE = 0;

const LATENCY_MS = 400;

/** Sumber data tiruan. Diganti database saat backend siap. */
let db: Category[] = SEED_CATEGORIES.map((item) => ({ ...item }));

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function simulateRequest(failureRate: number) {
  await wait(LATENCY_MS);
  if (Math.random() < failureRate) {
    throw new Error("Jaringan bermasalah");
  }
}

/**
 * 📥 AMBIL DAFTAR KATEGORI MILIK PENGGUNA AKTIF
 * Mengambil seluruh kategori pengguna dan memetakan struktur database menjadi tipe domain UI.
 * @returns {Promise<Category[]>} Daftar kategori siap pakai untuk komponen UI.
 */
export async function getCategories(): Promise<Category[]> {

  try {
    const result = await getCategoriesById();

    if (!result.success || !result.data) {
      return []
    }

    return result.data.map((cat) => ({
      id: cat.id,
      name: cat.name,
      type: cat.type.toLowerCase() as CategoryType,
      color: cat.color || "A1A1AA",
      icon: cat.icon || undefined,
      transactionCount: cat._count.transactions,
      isDefault: false
    }))
  } catch (e) {
    console.error(e)
    return []
  }
}

/**
 * ➕ BUAT KATEGORI BARU
 * Membuat kategori baru melalui server action dan mengembalikan data domain kategori.
 * @param {any} input - Data kategori baru (nama, tipe, warna, ikon).
 * @returns {Promise<Category>} Kategori yang berhasil dibuat.
 * @throws {Error} Jika server action mengembalikan status gagal.
 */
export async function createCategories(input: any): Promise<Category> {
  const result = await createCategoriesByUserId(input)

  if (!result.success) {
    throw new Error(result.error || "Gagal membuat kategori")
  }

  return {
    id: result.data?.id as string,
    name: result.data?.name as string,
    type: result.data?.type.toLowerCase() as CategoryType,
    color: result.data?.color || "A1A1AA",
    icon: result.data?.icon || undefined,
    transactionCount: 0,
    isDefault: false
  }

}

/**
 * ✏️ PERBARUI KATEGORI (TIRUAN SEMENTARA)
 * Mensimulasikan pembaruan kategori dengan latensi dan kemungkinan kegagalan acak.
 * Tipe tidak ikut diubah: memindahkan kategori antar tipe akan membuat
 * transaksi pengeluaran tercatat sebagai pemasukan.
 * @param {string} id - ID kategori yang akan diperbarui.
 * @param {CategoryInput} input - Data kategori terbaru.
 * @returns {Promise<Category>} Kategori yang telah diperbarui.
 * @throws {Error} Jika kategori tidak ditemukan atau simulasi jaringan gagal.
 */
export async function updateCategory(id: string, input: CategoryInput): Promise<Category> {
  await simulateRequest(MUTATION_FAILURE_RATE);

  const index = db.findIndex((item) => item.id === id);
  if (index === -1) throw new Error("Kategori tidak ditemukan");

  const updated: Category = { ...db[index], name: input.name, color: input.color, icon: input.icon };
  db = db.map((item) => (item.id === id ? updated : item));
  return { ...updated };
}

/**
 * 🔄 PINDAHKAN TRANSAKSI DAN HAPUS KATEGORI
 * Memindahkan seluruh transaksi dari kategori asal ke kategori tujuan, lalu menghapus kategori asal.
 * @param {string} fromId - ID kategori asal yang akan dihapus.
 * @param {string} toId - ID kategori tujuan penerima transaksi.
 * @returns {Promise<void>} Tidak mengembalikan nilai saat sukses.
 * @throws {Error} Jika proses pengalihan gagal di server.
 */
export async function reassignAndDelete(fromId: string, toId: string): Promise<void> {

  const result = await reassignAndDeleteCategory(fromId, toId);

  if (!result.success) {
    throw new Error(result.error || "Gagal memindahkan kategori")
  }
}

/**
 * 🗑️ HAPUS KATEGORI KOSONG
 * Menghapus kategori yang sudah tidak memiliki transaksi melalui server action.
 * @param {string} id - ID kategori yang akan dihapus.
 * @returns {Promise<void>} Tidak mengembalikan nilai saat sukses.
 * @throws {Error} Jika server action mengembalikan status gagal.
 */
export async function deleteCategory(id: string): Promise<void> {
  const result = await deleteCategoryAction(id);

  // Lemparkan kesalahan agar store dapat melakukan rollback
  if (!result.success) {
    throw new Error(result.error || "Gagal menghapus kategori");
  }

  // Sukses: fungsi selesai tanpa mengembalikan objek
}

// ============================================================================
// STORE — Context + useReducer untuk menyatukan status seluruh halaman.
// ============================================================================

type Status = "loading" | "ready" | "error";

type State = {
  status: Status;
  items: Category[];
  error: string | null;
};

type Action =
  | { type: "load-start" }
  | { type: "load-success"; items: Category[] }
  | { type: "load-error"; error: string }
  /** Dipakai untuk pembaruan optimistis sekaligus rollback-nya. */
  | { type: "set-items"; items: Category[] }
  /** 🚀 OPTIMASI: patch granular — hanya baris yang berubah yang di-render ulang */
  | { type: "patch-item"; id: string; changes: Partial<Category> }
  /** 🚀 OPTIMASI: hapus satu ID tanpa rebuild seluruh array */
  | { type: "remove-item"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load-start":
      return { ...state, status: "loading", error: null };
    case "load-success":
      return { status: "ready", items: action.items, error: null };
    case "load-error":
      return { ...state, status: "error", error: action.error };
    case "set-items":
      return { ...state, items: action.items };
    case "patch-item":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, ...action.changes } : item
        ),
      };
    case "remove-item":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
      };
  }
}

type CategoriesContextValue = {
  status: Status;
  error: string | null;
  categories: Category[];
  refresh: () => void;
  create: (input: CategoryInput) => Promise<boolean>;
  update: (id: string, input: CategoryInput) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  reassignAndRemove: (fromId: string, toId: string) => Promise<boolean>;
};

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Terjadi kesalahan";

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    status: "loading",
    items: [],
    error: null,
  });

  // Ref sinkron agar aksi tidak perlu memasukkan items ke dependency
  const itemsRef = useRef(state.items);
  useEffect(() => {
    itemsRef.current = state.items;
  }, [state.items]);

  const refresh = useCallback(() => {
    dispatch({ type: "load-start" });
    getCategories()
      .then((items) => dispatch({ type: "load-success", items }))
      .catch((error) => dispatch({ type: "load-error", error: errorMessage(error) }));
  }, []);

  // ��� OPTIMASI: Race-condition guard agar dispatch tidak terjadi setelah unmount
  useEffect(() => {
    let dibatalkan = false;
    dispatch({ type: "load-start" });
    getCategories()
      .then((items) => {
        if (!dibatalkan) dispatch({ type: "load-success", items });
      })
      .catch((error) => {
        if (!dibatalkan) dispatch({ type: "load-error", error: errorMessage(error) });
      });
    return () => {
      dibatalkan = true;
    };
  }, []);

  /**
   * Pola optimistis: simpan snapshot, tampilkan hasil lebih dulu,
   * lalu kembalikan snapshot bila gagal.
   */
  const runOptimistic = useCallback(
    async (
      optimisticItems: Category[],
      request: () => Promise<Category[] | void>,
      successMessage: string
    ): Promise<boolean> => {
      const snapshot = itemsRef.current;
      dispatch({ type: "set-items", items: optimisticItems });

      try {
        const settled = await request();
        if (settled) dispatch({ type: "set-items", items: settled });
        toast.success(successMessage);
        return true;
      } catch (error) {
        dispatch({ type: "set-items", items: snapshot });
        toast.error("Perubahan dibatalkan", { description: errorMessage(error) });
        return false;
      }
    },
    []
  );

  const create = useCallback(
    (input: CategoryInput) => {
      // ID sementara diganti ID asli saat server menjawab
      const optimistic: Category = {
        ...input,
        id: `tmp-${Date.now()}`,
        transactionCount: 0,
        isDefault: false,
      };

      return runOptimistic(
        [...itemsRef.current, optimistic],
        async () => {
          const created = await createCategories(input);
          return [...itemsRef.current.filter((item) => item.id !== optimistic.id), created];
        },
        `Kategori "${input.name}" ditambahkan`
      );
    },
    [runOptimistic]
  );

  const update = useCallback(
    (id: string, input: CategoryInput) =>
      runOptimistic(
        itemsRef.current.map((item) =>
          item.id === id ? { ...item, name: input.name, color: input.color, icon: input.icon } : item
        ),
        async () => {
          const updated = await updateCategory(id, input);
          return itemsRef.current.map((item) => (item.id === id ? updated : item));
        },
        `Kategori "${input.name}" disimpan`
      ),
    [runOptimistic]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      // Ambil snapshot nama untuk teks notifikasi sukses
      const target = itemsRef.current.find((item) => item.id === id);

      // Jalankan pembaruan optimistis dengan server action penghapusan
      return runOptimistic(
        // Skenario sukses: tabel langsung menyaring keluar ID
        itemsRef.current.filter((item) => item.id !== id),

        // Panggil server action penghapusan kategori
        () => deleteCategory(id),

        `Kategori "${target?.name ?? ""}" berhasil dihapus`
      );
    },
    [runOptimistic]
  );

  const reassignAndRemove = useCallback(
    async (fromId: string, toId: string): Promise<boolean> => {
      const from = itemsRef.current.find((item) => item.id === fromId);
      const to = itemsRef.current.find((item) => item.id === toId);
      const movedCount = from?.transactionCount ?? 0;

      // Jalankan pembaruan optimistis dengan transaksi berantai Prisma
      return runOptimistic(
        // Skenario sukses: hapus kategori lama dan tambahkan jumlah transaksi ke kategori baru
        itemsRef.current
          .filter((item) => item.id !== fromId)
          .map((item) =>
            item.id === toId ? { ...item, transactionCount: item.transactionCount + movedCount } : item
          ),

        // Panggil server action transaksi berantai
        () => reassignAndDelete(fromId, toId),

        `Berhasil memindahkan ${movedCount} transaksi ke "${to?.name ?? ""}"`
      );
    },
    [runOptimistic]
  );

  const value = useMemo<CategoriesContextValue>(
    () => ({
      status: state.status,
      error: state.error,
      categories: state.items,
      refresh,
      create,
      update,
      remove,
      reassignAndRemove,
    }),
    [state.status, state.error, state.items, refresh, create, update, remove, reassignAndRemove]
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories harus dipakai di dalam <CategoriesProvider>");
  }
  return context;
}