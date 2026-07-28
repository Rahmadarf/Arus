import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatisticsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="rounded-2xl border-zinc-200 shadow-sm lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-5 w-44 rounded-md" />
          <Skeleton className="h-4 w-56 rounded-md" />
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {/* Cincin abu meniru bentuk donat supaya tinggi kartu tidak melompat. */}
          <div className="relative aspect-square w-full max-w-[240px]">
            <Skeleton className="size-full rounded-full" />
            <div className="absolute inset-[28%] rounded-full bg-white" />
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-20 rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-zinc-200 shadow-sm lg:col-span-3">
        <CardHeader>
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-4 w-48 rounded-md" />
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-zinc-100 overflow-hidden">
            <div className="h-10 bg-zinc-50/70" />
            <div className="divide-y divide-zinc-100">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-4 w-6 rounded-md" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40 rounded-md" />
                    <Skeleton className="h-1 w-full rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-4 w-10 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
