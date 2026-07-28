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

// 1. Definisikan Struktur Data Transaksi (Tipe TypeScript)
type Transaction = {
    id: string;
    date: string;
    category: string;
    description: string;
    type: "INCOME" | "EXPENSE";
    amount: number;
};

// 2. Data Latihan (Mock Data) untuk Tampilan Grafik & Tabel MVP
const transactions: Transaction[] = [
    {
        id: "tx-1",
        date: "24 Feb 2026",
        category: "Gaji",
        description: "Gaji Bulanan Utama",
        type: "INCOME",
        amount: 5000000,
    },
    {
        id: "tx-2",
        date: "23 Feb 2026",
        category: "Makanan",
        description: "Beli Kopi dan Cemilan Sore",
        type: "EXPENSE",
        amount: 75000,
    },
    {
        id: "tx-3",
        date: "22 Feb 2026",
        category: "Transportasi",
        description: "Isi Saldo E-Toll Bulanan",
        type: "EXPENSE",
        amount: 200000,
    },
];

// Helper untuk format rupiah yang rapi
const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
};

export function RecentTransactions() {
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
                            {transactions.map((tx) => (
                                <TableRow key={tx.id} className="hover:bg-zinc-50/50 transition-colors">
                                    <TableCell className="text-zinc-500 text-sm">{tx.date}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                                            {tx.category}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-zinc-700 font-medium text-sm">{tx.description}</TableCell>
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
