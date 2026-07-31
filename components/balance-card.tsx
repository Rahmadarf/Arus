import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "./ui/card";
import { formatRupiah } from "@/lib/format";

interface BalanceCardProps {
    balance: number,
    income: number,
    expense: number
}

export default function BalanceCard({ balance, income, expense }: BalanceCardProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* KARTU TOTAL SALDO */}
            <Card className="rounded-2xl border-zinc-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardDescription className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Total Saldo
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CardTitle className="text-2xl font-bold text-zinc-900">
                        {formatRupiah(balance)}
                    </CardTitle>
                </CardContent>
            </Card>

            {/* KARTU PEMASUKAN */}
            <Card className="rounded-2xl border-zinc-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardDescription className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Total Pemasukan
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CardTitle className="text-2xl font-bold text-emerald-600">
                        {formatRupiah(income)}
                    </CardTitle>
                </CardContent>
            </Card>

            {/* KARTU PENGELUARAN */}
            <Card className="rounded-2xl border-zinc-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardDescription className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Total Pengeluaran
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CardTitle className="text-2xl font-bold text-rose-600">
                        {formatRupiah(expense)}
                    </CardTitle>
                </CardContent>
            </Card>

        </div>
    )
}