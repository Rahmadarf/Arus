import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"; // Sesuaikan jika shadcn Anda ditaruh di components/ui/table
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format";

// 1. Definisikan Struktur Data Transaksi (Tipe TypeScript)
interface TransactionData {
    id: string | null,
    amount: number,
    type: string,
    category: {
        id: string,
        name: string,
        type: string
    },
    description: string | null,
    createdAt: Date
}

interface RecentTransactionsProps {
    data: TransactionData[];
}

export function RecentTransactions({ data }: RecentTransactionsProps) {
    return (
        <Card className="rounded-2xl border-zinc-200 shadow-sm w-full">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-zinc-900">Riwayat Transaksi</CardTitle>
                <CardDescription>Daftar perputaran arus kas terbaru Anda.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-xl border border-zinc-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-zinc-50/70">
                            <TableRow>
                                <TableHead className="w-30 font-medium text-zinc-500">Tanggal</TableHead>
                                <TableHead className="font-medium text-zinc-500">Kategori</TableHead>
                                <TableHead className="font-medium text-zinc-500">Catatan</TableHead>
                                <TableHead className="text-right font-medium text-zinc-500">Nominal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((tx) => (
                                <TableRow key={tx.id} className="hover:bg-zinc-50/50 transition-colors">
                                    <TableCell className="text-zinc-500 text-sm">
                                        {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                                            {tx.category.name}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-zinc-700 font-medium text-sm">{tx.description || "Tanpa Catatan"}</TableCell>
                                    {/* 3. Logika Warna Dinamis: Hijau jika INCOME, Merah jika EXPENSE */}
                                    <TableCell className={cn(
                                        "text-right font-semibold text-sm",
                                        tx.type === "INCOME" ? "text-emerald-600" : "text-rose-600"
                                    )}>
                                        {tx.type === "INCOME" ? "+ " : "- "}
                                        {formatRupiah(tx.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
