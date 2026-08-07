import { StatisticsSkeleton } from "@/components/statistics/statistics-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/** Tampil seketika saat menu Statistik ditekan. Lihat catatan di dashboard/loading.tsx. */
export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Statistik</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Lihat ke mana uang Anda paling banyak pergi.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-9 w-full rounded-xl sm:w-52" />
        <Skeleton className="h-5 w-44 rounded-md" />
      </div>

      <StatisticsSkeleton />
    </div>
  );
}
