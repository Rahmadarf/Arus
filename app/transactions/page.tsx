import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { TransactionsTableSkeleton } from "@/components/transactions/transactions-table-skeleton";
import { categories } from "@/lib/transactions-mock";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const readParam = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : "";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Next 16: searchParams adalah Promise, wajib di-await.
  const params = await searchParams;

  const search = readParam(params.search).trim();
  const rawType = readParam(params.type);
  const type = rawType === "INCOME" || rawType === "EXPENSE" ? rawType : "ALL";
  const category = readParam(params.category) || "ALL";
  const page = Math.max(1, Number.parseInt(readParam(params.page), 10) || 1);

  // Key Suspense = gabungan filter, supaya skeleton muncul setiap filter berubah.
  const suspenseKey = `${search}|${type}|${category}|${page}`;

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Transaksi</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Cari, saring, dan kelola seluruh catatan keuangan Anda.
        </p>
      </div>

      <Card className="rounded-2xl border-zinc-200 shadow-sm w-full">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-zinc-900">Daftar Transaksi</CardTitle>
          <CardDescription>Semua pemasukan dan pengeluaran yang tercatat.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TransactionFilters categories={categories} />

          <Suspense key={suspenseKey} fallback={<TransactionsTableSkeleton />}>
            <TransactionsTable
              search={search}
              type={type}
              category={category}
              page={page}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
