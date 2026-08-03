# Laporan Audit Performa & Optimasi Aplikasi Arus

> **Tanggal Audit:** 2026-08-03
> **Cakupan:** Modul Dashboard, Statistik, Transaksi, Kategori, dan Settings
> **Metodologi:** Pemeriksaan 5 Indikator Kerawanan Performa (Kueri DB, Data Waterfall, Optimistic UI, Server-Client Payload, Memory Leak)

---

## 1. Ringkasan Eksekutif

Secara umum, aplikasi **Arus** telah dibangun dengan fondasi yang cukup baik: konvensi server actions, penggunaan `select` agregat pada `_count`, dan optimistic UI dengan mekanisme rollback snapshot sudah diterapkan di sebagian besar modul. Namun, audit menemukan **14 titik kerawanan** yang tersebar di modul Dashboard, Statistik, Transaksi, dan Kategori.

**Tingkat risiko diklasifikasikan sebagai berikut:**

| Tingkat | Jumlah Temuan | Karakteristik |
|--------|---------------|---------------|
| 🔴 Kritis | 7 | Mengakibatkan latensi DB tinggi, payload berat, atau potensi crash |
| 🟡 Sedang | 6 | Penurunan performa pada data besar atau render tidak efisien |
| 🟢 Baik | 1 (sudah aman) | Implementasi sesuai standar |

**Dampak bisnis** jika tidak ditangani:
- Halaman `/transactions` melambat signifikan ketika pengguna memiliki lebih dari 1.000 catatan transaksi.
- Halaman `/dashboard` memiliki latensi kumulatif akibat kueri serial.
- Payload JSON dari server action ke klien mengirim kolom yang tidak terpakai, menambah beban parsing browser.
- Risiko state update setelah komponen di-unmount pada store kategori.

**Estimasi perbaikan** dengan menerapkan semua rekomendasi: pengurangan TTFB halaman Dashboard dan Transaksi hingga **30-50%**, penurunan payload JSON hingga **40%**, dan stabilitas render pada tabel 200+ baris.

---

## 2. Temuan Komponen Potensial Lag

### 🔴 2.1 Database Query Efficiency (N+1 & Agregasi)

| No | Lokasi | Baris | Indikator |
|----|--------|-------|-----------|
| 1 | `lib/transactions-mock.ts` | 42 | Menarik SELURUH transaksi tanpa paging/filter SQL |
| 2 | `lib/statistics/mock.ts` | 60 | Agregasi `forEach`/`reduce` di Node, bukan di DB |
| 2b | `app/data/statistic.ts` | 12 | Duplikasi kueri besar tanpa agregasi |
| 3 | `app/data/analytics.ts` | 7 | `select` sudah dipakai, tapi tanpa agregasi grup |

### 🔴 2.2 Blocking Data Waterfalls

| No | Lokasi | Baris | Indikator |
|----|--------|-------|-----------|
| 4 | `app/(dashboard)/dashboard/page.tsx` | 9-13 | Tiga `await` serial untuk kueri independen |
| 5 | `app/(dashboard)/statistics/page.tsx` | 23 | `getPeriodDates` dipanggil dua kali (page + content) |
| 6 | `components/statistics/statistics-content.tsx` | 19 | Tanggal dikonversi dua kali per render |

### 🔴 2.3 Optimistic Updates Validation

| No | Lokasi | Baris | Indikator |
|----|--------|-------|-----------|
| 7 | `lib/categories/store.tsx` | 222 | `set-items` rebuild seluruh array, tabel lain ikut re-render |
| 8 | `components/categories/categories-view.tsx` | 90 | Filter `.filter()` di setiap render `renderBody` |

### 🔴 2.4 Server-Client Data Payload

| No | Lokasi | Baris | Indikator |
|----|--------|-------|-----------|
| 9 | `app/actions/category.ts` | 101 | Mengembalikan SELURUH kolom Prisma mentah |
| 10 | `app/actions/transaction.ts` | 104 | `include: { category: true }` mengirim semua kolom |
| 11 | `app/(dashboard)/dashboard/page.tsx` | 14-25 | Mapping ulang di klien yang seharusnya di server |

### 🔴 2.5 Memory Leaks Guard

| No | Lokasi | Baris | Indikator |
|----|--------|-------|-----------|
| 12 | `components/settings/profile-tab.tsx` | 72-76 | ✅ **Sudah aman** — cleanup `URL.revokeObjectURL` benar |
| 13 | `lib/categories/store.tsx` | 200-209 | Tidak ada race-condition guard untuk `getCategories` |
| 14 | `lib/auth/context.tsx` | 23-37 | ✅ **Sudah aman** — `dibatalkan` flag benar |

---

## 3. Detail Analisis & Rekomendasi Solusi

### 🚀 3.1 Optimasi Kueri Database

#### 🚨 Temuan #1: `getTransactions` menarik seluruh data tanpa filter SQL

**Kode Lama (Masalah):**
```tsx
// lib/transactions-mock.ts:42
const allDbTransaction = await getTransactionByUserId(testingUserId);

if (!allDbTransaction || allDbTransaction.length === 0) {
  return { rows: [], total: 0, totalAll: 0 }
}

// ... 70 baris berikutnya: filter keyword, tipe, kategori di JavaScript
const filtered = allDbTransaction.filter((tx) => { /* ... */ });
```

**Rekomendasi Kode Baru:**
```tsx
const where: Prisma.TransactionWhereInput = { userId: testingUserId };
if (keyword) where.description = { contains: keyword, mode: "insensitive" };
if (type !== "ALL") where.type = type;
if (category !== "ALL") {
  where.category = { name: { equals: category, mode: "insensitive" } };
}

const [allDbTransaction, total] = await Promise.all([
  prisma.transaction.findMany({
    where,
    include: { category: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  }),
  prisma.transaction.count({ where }),
]);
```

#### 🚨 Temuan #2: `getStatistics` melakukan agregasi di Node

**Kode Lama (Masalah):**
```tsx
// lib/statistics/mock.ts:60
const dbExpenses = await prisma.transaction.findMany({
  where: { userId: String(TESTING_USER_ID), type: "EXPENSE", /* ... */ },
  include: { category: true },
});

const totalExpense = dbExpenses.reduce((sum, tx) => sum + tx.amount, 0);
// ... forEach + map untuk mengelompokkan per kategori
```

**Rekomendasi Kode Baru:**
```tsx
const aggregated = await prisma.transaction.groupBy({
  by: ["categoryId"],
  where: { userId, type: "EXPENSE", createdAt: { gte: startDate, lte: endDate } },
  _sum: { amount: true },
  _count: { _all: true },
});

const total = await prisma.transaction.aggregate({
  where: { userId, type: "EXPENSE", createdAt: { gte: startDate, lte: endDate } },
  _sum: { amount: true },
  _count: { _all: true },
});
```

### 🌊 3.2 Optimasi Data Waterfall

#### 🚨 Temuan #4: Dashboard menjalankan tiga kueri secara serial

**Kode Lama (Masalah):**
```tsx
// app/(dashboard)/dashboard/page.tsx:9-13
const userId = await getAuthenticatedUserId()
const txData = await getTransactionByUserId(userId)
const trendChartData = await getMonthlyTrendData(userId)
```

**Rekomendasi Kode Baru:**
```tsx
const userId = await getAuthenticatedUserId();
const [txData, trendChartData] = await Promise.all([
  getTransactionByUserId(userId),
  getMonthlyTrendData(userId),
]);
```

#### 🚨 Temuan #5: `getStatistics` dipanggil dua kali untuk rentang yang sama

**Rekomendasi:** Gunakan `cache()` dari React untuk memoisasi per-request:

```tsx
// lib/statistics/mock.ts
import { cache } from "react";

export const getStatistics = cache(async (range: TimeRange): Promise<StatisticsData> => {
  // ... implementasi yang sudah ada
});
```

### 🎨 3.3 Optimasi Optimistic UI

#### 🚨 Temuan #7: `set-items` memicu render seluruh tabel

**Kode Lama (Masalah):**
```tsx
// lib/categories/store.tsx
type Action =
  | { type: "load-start" }
  | { type: "load-success"; items: Category[] }
  | { type: "load-error"; error: string }
  | { type: "set-items"; items: Category[] }; // ← Rebuild SELURUH array

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set-items":
      return { ...state, items: action.items }; // ← Semua baris di-render ulang
  }
}
```

**Rekomendasi Kode Baru:**
```tsx
type Action =
  | { type: "load-start" }
  | { type: "load-success"; items: Category[] }
  | { type: "load-error"; error: string }
  | { type: "patch-item"; id: string; changes: Partial<Category> }
  | { type: "remove-item"; id: string }
  | { type: "set-items"; items: Category[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "patch-item":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, ...action.changes } : item
        ),
      };
    case "remove-item":
      return { ...state, items: state.items.filter((item) => item.id !== action.id) };
    case "set-items":
      return { ...state, items: action.items };
  }
}
```

**Tambahan:** Bungkus `TableRow` dengan `React.memo` agar baris yang tidak berubah tidak ikut re-render.

#### 🚨 Temuan #8: Filter array dua kali per render

**Kode Lama (Masalah):**
```tsx
// components/categories/categories-view.tsx:90
const renderBody = (tabType: CategoryType) => {
  // ...
  const rows = categories.filter((item) => item.type === tabType); // ← Dipanggil 2x
};
```

**Rekomendasi Kode Baru:**
```tsx
const incomeItems = useMemo(
  () => categories.filter((c) => c.type === "income"),
  [categories]
);
const expenseItems = useMemo(
  () => categories.filter((c) => c.type === "expense"),
  [categories]
);
```

### 📦 3.4 Optimasi Server-Client Payload

#### 🚨 Temuan #9: `getCategoriesById` mengembalikan kolom mentah Prisma

**Kode Lama (Masalah):**
```tsx
// app/actions/category.ts:101
const dbCategories = await prisma.category.findMany({
  where: { userId: userId },
  orderBy: { name: 'asc' },
  include: {
    _count: { select: { transactions: true } }
  }
});

return { success: true, data: dbCategories };
// Mengirim: id, name, type, color, icon, userId, createdAt, updatedAt, _count
```

**Rekomendasi Kode Baru:**
```tsx
const dbCategories = await prisma.category.findMany({
  where: { userId: userId },
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
return { success: true, data: dbCategories };
```

#### 🚨 Temuan #10: `getTransactionByUserId` mengirim seluruh kolom Category

**Kode Lama (Masalah):**
```tsx
// app/actions/transaction.ts:104
const transaction = await prisma.transaction.findMany({
  where: { userId: userId },
  include: { category: true }, // ← Semua kolom
  orderBy: { createdAt: "desc" }
});
```

**Rekomendasi Kode Baru:**
```tsx
const transaction = await prisma.transaction.findMany({
  where: { userId: userId },
  include: {
    category: {
      select: { id: true, name: true, type: true },
    },
  },
  orderBy: { createdAt: "desc" },
});
```

### 🧹 3.5 Optimasi Memory Leak Guard

#### 🚨 Temuan #13: Tidak ada race-condition guard di `CategoriesProvider`

**Kode Lama (Masalah):**
```tsx
// lib/categories/store.tsx:200-209
const refresh = useCallback(() => {
  dispatch({ type: "load-start" });
  getCategories()
    .then((items) => dispatch({ type: "load-success", items })) // ← Bisa update setelah unmount
    .catch((error) => dispatch({ type: "load-error", error: errorMessage(error) }));
}, []);
```

**Rekomendasi Kode Baru:**
```tsx
useEffect(() => {
  let dibatalkan = false;

  const muat = () => {
    dispatch({ type: "load-start" });
    getCategories()
      .then((items) => {
        if (!dibatalkan) dispatch({ type: "load-success", items });
      })
      .catch((error) => {
        if (!dibatalkan) dispatch({ type: "load-error", error: errorMessage(error) });
      });
  };

  muat();
  return () => {
    dibatalkan = true;
  };
}, []);
```

#### ✅ Temuan #12: `profile-tab.tsx` sudah aman

**Kode Saat Ini (Tetap Pertahankan):**
```tsx
// components/settings/profile-tab.tsx:72-76
useEffect(() => {
  return () => {
    if (previewAvatar) URL.revokeObjectURL(previewAvatar);
  };
}, [previewAvatar]);
```

---

## 4. Kesimpulan & Langkah Selanjutnya

### 📊 Ringkasan Dampak Optimasi

| Area | Sebelum | Sesudah Optimasi |
|------|---------|------------------|
| TTFB `/dashboard` | T1 + T2 + T3 | max(T2, T3) — **turun ~30-50%** |
| Payload `getCategoriesById` | ~9 kolom | 5 kolom — **turun ~40%** |
| Payload `getTransactionByUserId` | Category lengkap | Category parsial — **turun ~60%** |
| Render tabel 200 baris kategori | Full re-render | Hanya baris berubah — **stabil** |
| `/transactions` untuk 10.000 baris | Scan JS penuh | SQL filter + paging — **skalabel** |

### 🗺️ Roadmap Implementasi Bertahap

**🟢 Fase 1 — Quick Wins (1-2 hari):**
- Tambahkan `Promise.all` di DashboardPage.
- Ganti `include` menjadi `select` di `getCategoriesById` dan `getTransactionByUserId`.
- Hapus duplikasi `getPeriodDates` dengan React `cache()`.

**🟡 Fase 2 — Optimasi Menengah (3-5 hari):**
- Pindahkan filter `getTransactions` ke Prisma `where`.
- Implementasikan `prisma.transaction.groupBy` di statistik.
- Tambahkan `React.memo` pada `TableRow` kategori.

**🔴 Fase 3 — Refactor Arsitektur (1-2 minggu):**
- Ubah reducer kategori menjadi `patch-item` / `remove-item` granular.
- Tambahkan race-condition guard di seluruh store.
- Buat index DB pada `(userId, type, createdAt)` untuk optimasi planner.

### ⚠️ Catatan Penting

- Semua rekomendasi **tidak mengubah fungsionalitas** aplikasi yang sudah berjalan sukses.
- Autentikasi, transaksi, dan kategori tetap beroperasi seperti semula — hanya jalur internal yang lebih efisien.
- Pengujian end-to-end tetap diperlukan setelah setiap fase untuk memastikan tidak ada regresi UX.

### 📌 Rekomendasi Tambahan

1. **Monitoring**: Pasang logging TTFB di Vercel Analytics atau Sentry untuk melacak dampak nyata.
2. **Database Index**: Tambahkan index pada kolom yang sering difilter (`userId`, `type`, `createdAt`).
3. **Pagination**: Pertahankan `take: PAGE_SIZE` di Prisma, jangan ambil seluruh data lalu paging di JS.

---

*Laporan ini disusun berdasarkan audit statis terhadap kode sumber. Pengujian beban (load testing) direkomendasikan untuk validasi dampak aktual pada produksi.*
