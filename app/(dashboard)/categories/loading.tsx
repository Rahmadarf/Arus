import { CategoriesTableSkeleton } from "@/components/categories/categories-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Tampil seketika saat menu Kategori ditekan. Lihat catatan di dashboard/loading.tsx. */
export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Kategori</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Atur pengelompokan transaksi dan warnanya di grafik.
          </p>
        </div>
        <Skeleton className="h-9 w-40 rounded-xl" />
      </div>

      <Card className="rounded-2xl border-zinc-200 shadow-sm w-full">
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-9 w-56 rounded-xl" />
          <CategoriesTableSkeleton />
        </CardContent>
      </Card>
    </div>
  );
}
