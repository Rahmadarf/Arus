import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TransactionsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/70">
            <TableRow>
              <TableHead className="w-30 font-medium text-zinc-500">Tanggal</TableHead>
              <TableHead className="font-medium text-zinc-500">Kategori</TableHead>
              <TableHead className="font-medium text-zinc-500">Catatan</TableHead>
              <TableHead className="text-right font-medium text-zinc-500">Nominal</TableHead>
              <TableHead className="w-16 text-right font-medium text-zinc-500">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-24 rounded-md" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48 rounded-md" />
                </TableCell>
                <TableCell className="flex justify-end">
                  <Skeleton className="h-4 w-28 rounded-md" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto size-8 rounded-lg" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
