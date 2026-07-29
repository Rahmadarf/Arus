"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { toast } from "sonner";

import { SEED_CATEGORIES } from "@/lib/categories/seed";
import type { Category, CategoryInput } from "@/lib/categories/types";

// ============================================================================
// LAPISAN DATA — SATU-SATUNYA TITIK YANG BERUBAH SAAT BACKEND SIAP.
//
// Kelima fungsi di bawah meniru bentuk panggilan HTTP: async, bisa gagal,
// menerima dan mengembalikan tipe domain. Komponen tidak tahu-menahu apakah
// datanya datang dari array di memori atau dari server.
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

// TODO: ganti isi dengan fetch API. Signature dan return type TIDAK boleh berubah.
export async function getCategories(): Promise<Category[]> {
  await simulateRequest(LOAD_FAILURE_RATE);
  return db.map((item) => ({ ...item }));
}

// TODO: ganti isi dengan fetch API. Signature dan return type TIDAK boleh berubah.
export async function createCategory(input: CategoryInput): Promise<Category> {
  await simulateRequest(MUTATION_FAILURE_RATE);

  const created: Category = {
    ...input,
    id: `cat-${Date.now().toString(36)}`,
    transactionCount: 0,
    isDefault: false,
  };

  db = [...db, created];
  return { ...created };
}

// TODO: ganti isi dengan fetch API. Signature dan return type TIDAK boleh berubah.
export async function updateCategory(id: string, input: CategoryInput): Promise<Category> {
  await simulateRequest(MUTATION_FAILURE_RATE);

  const index = db.findIndex((item) => item.id === id);
  if (index === -1) throw new Error("Kategori tidak ditemukan");

  // Tipe tidak ikut diubah: memindahkan kategori antar tipe akan membuat
  // transaksi pengeluaran tercatat sebagai pemasukan.
  const updated: Category = { ...db[index], name: input.name, color: input.color, icon: input.icon };
  db = db.map((item) => (item.id === id ? updated : item));
  return { ...updated };
}

// TODO: ganti isi dengan fetch API. Signature dan return type TIDAK boleh berubah.
export async function deleteCategory(id: string): Promise<void> {
  await simulateRequest(MUTATION_FAILURE_RATE);

  const target = db.find((item) => item.id === id);
  if (!target) throw new Error("Kategori tidak ditemukan");
  if (target.isDefault) throw new Error("Kategori bawaan tidak bisa dihapus");
  if (target.transactionCount > 0) {
    throw new Error("Kategori masih dipakai transaksi");
  }

  db = db.filter((item) => item.id !== id);
}

/**
 * Pindahkan seluruh transaksi milik `fromId` ke `toId`, lalu hapus `fromId`.
 *
 * KEPUTUSAN DESAIN: menghapus kategori tidak boleh menghapus transaksi.
 * Riwayat keuangan adalah catatan yang dibuat pengguna selama berbulan-bulan;
 * satu klik di halaman pengaturan tidak boleh memusnahkannya. Karena itu tidak
 * ada jalur "hapus beserta isinya" — satu-satunya cara menghapus kategori yang
 * masih terpakai adalah memindahkan isinya lebih dulu.
 *
 * Di backend, kedua langkah ini WAJIB satu transaksi database. Kalau UPDATE
 * berhasil tapi DELETE gagal, transaksi pengguna sudah terlanjur pindah.
 */
// TODO: ganti isi dengan fetch API. Signature dan return type TIDAK boleh berubah.
export async function reassignAndDelete(fromId: string, toId: string): Promise<void> {
  await simulateRequest(MUTATION_FAILURE_RATE);

  const from = db.find((item) => item.id === fromId);
  const to = db.find((item) => item.id === toId);

  if (!from || !to) throw new Error("Kategori tidak ditemukan");
  if (from.isDefault) throw new Error("Kategori bawaan tidak bisa dihapus");
  if (from.type !== to.type) {
    throw new Error("Kategori tujuan harus bertipe sama");
  }

  const moved = from.transactionCount;

  db = db
    .filter((item) => item.id !== fromId)
    .map((item) =>
      item.id === toId ? { ...item, transactionCount: item.transactionCount + moved } : item
    );
}

// ============================================================================
// STORE — Context + useReducer. Satu state dipakai bersama seluruh halaman,
// jadi tabel, dialog, dan tab tidak mungkin desinkron.
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
  | { type: "set-items"; items: Category[] };

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

  // Dibaca di dalam aksi tanpa memasukkan `items` ke dependency, supaya
  // fungsi-fungsi aksi tidak dibuat ulang setiap kali daftar berubah.
  // Disinkronkan lewat effect, bukan saat render — menulis ref selama render
  // membuat hasilnya tidak bisa diandalkan.
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

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Pola optimistis yang dipakai semua mutasi: simpan snapshot, tampilkan
   * hasil yang diharapkan lebih dulu, lalu kembalikan snapshot kalau gagal.
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
      // Id sementara diganti id asli begitu "server" menjawab.
      const optimistic: Category = {
        ...input,
        id: `tmp-${Date.now()}`,
        transactionCount: 0,
        isDefault: false,
      };

      return runOptimistic(
        [...itemsRef.current, optimistic],
        async () => {
          const created = await createCategory(input);
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
    (id: string) => {
      const target = itemsRef.current.find((item) => item.id === id);

      return runOptimistic(
        itemsRef.current.filter((item) => item.id !== id),
        () => deleteCategory(id),
        `Kategori "${target?.name ?? ""}" dihapus`
      );
    },
    [runOptimistic]
  );

  const reassignAndRemove = useCallback(
    (fromId: string, toId: string) => {
      const from = itemsRef.current.find((item) => item.id === fromId);
      const moved = from?.transactionCount ?? 0;

      return runOptimistic(
        itemsRef.current
          .filter((item) => item.id !== fromId)
          .map((item) =>
            item.id === toId
              ? { ...item, transactionCount: item.transactionCount + moved }
              : item
          ),
        () => reassignAndDelete(fromId, toId),
        `${moved} transaksi dipindahkan, kategori "${from?.name ?? ""}" dihapus`
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
