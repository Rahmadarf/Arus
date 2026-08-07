import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionsTableSkeleton } from "@/components/transactions/transactions-table-skeleton";

/** Tampil seketika saat menu Transaksi ditekan. Lihat catatan di dashboard/loading.tsx. */
export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Transaksi</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Cari, saring, dan kelola seluruh catatan keuangan Anda.
        </p>
      </div>

      <Card className="rounded-2xl border-zinc-200 shadow-sm w-full">
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Baris filter: satu kolom di ponsel, sebaris di layar lebar. */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Skeleton className="h-9 w-full rounded-xl sm:max-w-xs" />
            <Skeleton className="h-9 w-full rounded-xl sm:w-40" />
            <Skeleton className="h-9 w-full rounded-xl sm:w-52" />
          </div>

          <TransactionsTableSkeleton />
        </CardContent>
      </Card>
    </div>
  );
}
