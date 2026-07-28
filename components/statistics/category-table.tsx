import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/lib/format";
import type { CategoryStat } from "@/lib/statistics/types";

type Props = {
  categories: CategoryStat[];
};

export function CategoryTable({ categories }: Props) {
  return (
    <div className="rounded-xl border border-zinc-100 overflow-hidden">
      {/* table-fixed: lebar kolom ditentukan header, jadi nama kategori yang
          panjang memendek dengan elipsis alih-alih memaksa tabel melebar. */}
      <Table className="table-fixed">
        <TableHeader className="bg-zinc-50/70">
          <TableRow>
            {/* Peringkat disembunyikan di ponsel: urutannya sudah terbaca dari
                susunan baris, dan ruang layar lebih berguna untuk nominal. */}
            <TableHead className="hidden w-10 font-medium text-zinc-500 sm:table-cell">#</TableHead>
            <TableHead className="font-medium text-zinc-500">Kategori</TableHead>
            <TableHead className="w-32 text-right font-medium text-zinc-500">Nominal</TableHead>
            <TableHead className="w-12 text-right font-medium text-zinc-500">
              <span className="sr-only">Persentase</span>
              <span aria-hidden>%</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category, index) => (
            <TableRow key={category.categoryId} className="hover:bg-zinc-50/50 transition-colors">
              <TableCell className="hidden text-sm text-zinc-400 tabular-nums sm:table-cell">
                #{index + 1}
              </TableCell>

              <TableCell className="w-full min-w-0">
                <div className="flex items-center gap-2">
                  {/* Titik warna sengaja sama persis dengan potongan di donat. */}
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="truncate text-sm font-medium text-zinc-700">
                    {category.categoryName}
                  </span>
                </div>

                {/* Bar tipis: lebarnya = persentase, bikin "terboros" langsung terbaca. */}
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${category.percentage}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </TableCell>

              <TableCell className="text-right text-sm font-semibold text-rose-600 tabular-nums">
                {formatRupiah(category.total)}
              </TableCell>

              <TableCell className="text-right text-sm text-zinc-500 tabular-nums">
                {category.percentage}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
