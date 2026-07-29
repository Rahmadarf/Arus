import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteTransactionButton } from "@/components/transactions/delete-transaction-button";
import { getTransactions, PAGE_SIZE, type TransactionQuery } from "@/lib/transactions-mock";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = TransactionQuery;

const buildHref = ({ search, type, category }: Props, page: number) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (type !== "ALL") params.set("type", type);
  if (category !== "ALL") params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/transactions?${query}` : "/transactions";
};

export async function TransactionsTable(props: Props) {
  const { page } = props;

  // Sumber data sementara. Saat backend siap, cukup ganti isi getTransactions()
  // di lib/transactions-mock.ts — komponen ini tidak perlu berubah.
  const { rows: transactions, total, totalAll } = await getTransactions(props);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Dua empty state yang berbeda: data kosong vs filter tidak menemukan apa pun.
  if (transactions.length === 0) {
    const belumAdaData = totalAll === 0;

    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-14 text-center">
        <p className="text-sm font-semibold text-zinc-900">
          {belumAdaData ? "Belum ada transaksi" : "Tidak ada hasil"}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          {belumAdaData
            ? "Catat pemasukan atau pengeluaran pertama Anda lewat tombol Tambah Transaksi."
            : "Tidak ada transaksi yang cocok dengan filter ini. Ubah kata kunci atau reset filter."}
        </p>
      </div>
    );
  }

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
            {transactions.map((tx) => (
              <TableRow key={tx.id} className="hover:bg-zinc-50/50 transition-colors">
                <TableCell className="text-zinc-500 text-sm">{formatTanggal(tx.date)}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800"
                  >
                    {tx.category.name}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-700 font-medium text-sm">
                  {tx.note || <span className="text-zinc-400">—</span>}
                </TableCell>
                {/* Hijau untuk pemasukan, merah untuk pengeluaran — sama seperti dashboard. */}
                <TableCell
                  className={cn(
                    "text-right font-semibold text-sm",
                    tx.type === "INCOME" ? "text-emerald-600" : "text-rose-600"
                  )}
                >
                  {tx.type === "INCOME" ? "+ " : "- "}
                  {formatRupiah(tx.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <DeleteTransactionButton
                    id={tx.id}
                    note={tx.note}
                    amountLabel={`${tx.type === "INCOME" ? "+ " : "- "}${formatRupiah(tx.amount)}`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Halaman {page} dari {totalPages}
        </p>

        <div className="flex items-center gap-2">
          {page <= 1 ? (
            <Button variant="outline" className="h-9 rounded-xl" disabled>
              Previous
            </Button>
          ) : (
            <Button variant="outline" className="h-9 rounded-xl" asChild>
              <Link href={buildHref(props, page - 1)} scroll={false}>
                Previous
              </Link>
            </Button>
          )}

          {page >= totalPages ? (
            <Button variant="outline" className="h-9 rounded-xl" disabled>
              Next
            </Button>
          ) : (
            <Button variant="outline" className="h-9 rounded-xl" asChild>
              <Link href={buildHref(props, page + 1)} scroll={false}>
                Next
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
