import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "./ui/card";

export default function BalanceCard() {
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
                        Rp 12.500.000
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
                        + Rp 15.000.000
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
                        - Rp 2.500.000
                    </CardTitle>
                </CardContent>
            </Card>

        </div>
    )
}