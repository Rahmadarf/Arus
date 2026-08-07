import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Kerangka sementara untuk tiap bagian dashboard.
 *
 * Ukurannya sengaja menyamai komponen aslinya. Kalau kerangkanya lebih pendek
 * dari isi sebenarnya, konten di bawahnya akan meloncat saat data tiba — dan
 * pergeseran itu terasa lebih buruk daripada menunggu sebentar.
 */

export function BalanceCardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Card key={i} className="rounded-2xl border-zinc-200 shadow-sm">
          <CardHeader className="pb-2">
            <Skeleton className="h-3 w-28 rounded-md" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-36 rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function OverviewChartSkeleton() {
  return (
    <Card className="rounded-2xl border-zinc-200 shadow-sm">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-52 rounded-md" />
        <Skeleton className="h-4 w-40 rounded-md" />
      </CardHeader>
      <CardContent>
        {/* h-75 menyamai tinggi ChartContainer di overview-chart.tsx. */}
        <Skeleton className="h-75 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

export function RecentTransactionsSkeleton() {
  return (
    <Card className="rounded-2xl border-zinc-200 shadow-sm w-full">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-44 rounded-md" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-zinc-100 overflow-hidden">
          <div className="h-10 bg-zinc-50/70" />
          <div className="divide-y divide-zinc-100">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 flex-1 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
