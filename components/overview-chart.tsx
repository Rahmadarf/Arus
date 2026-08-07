"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { formatRupiah, formatRupiahRingkas } from "@/lib/format";

interface MonthlyTrendData {
    bulan: string;
    pemasukan: number;
    pengeluaran: number;
}

interface OverviewChartProps {
    data: MonthlyTrendData[];
}

/**
 * Kunci config WAJIB sama persis dengan dataKey tiap <Area>.
 *
 * Sebelumnya kuncinya "income"/"expense" sedangkan dataKey-nya
 * "pemasukan"/"pengeluaran", jadi tidak ada yang cocok: tooltip menampilkan
 * nama field mentah dan warna dari config tidak pernah terpakai.
 */
const chartConfig = {
    pemasukan: { label: "Pemasukan", color: "var(--chart-1)" },
    pengeluaran: { label: "Pengeluaran", color: "var(--chart-2)" },
} satisfies ChartConfig;

/**
 * Skala sumbu Y pada angka bulat.
 *
 * Kalau domainnya dibiarkan otomatis, Recharts membagi nilai maksimum apa
 * adanya dan menghasilkan tick seperti "Rp 13,5jt" — panjang, sulit dibaca
 * sekilas, dan cukup lebar untuk terlipat jadi dua baris di kolom sumbu.
 * Langkahnya dibulatkan ke 1 / 2 / 2,5 / 5 dikali pangkat sepuluh, jadi
 * ticknya selalu jatuh di angka yang enak dibaca: 0, 5jt, 10jt, 15jt, 20jt.
 */
function skalaBulat(maks: number, jumlahLangkah = 4) {
    if (!Number.isFinite(maks) || maks <= 0) {
        return { domain: [0, 1] as [number, number], ticks: [0, 1] };
    }

    const kasar = maks / jumlahLangkah;
    const pangkat = 10 ** Math.floor(Math.log10(kasar));
    const sisa = kasar / pangkat;
    const pengali = sisa > 5 ? 10 : sisa > 2.5 ? 5 : sisa > 2 ? 2.5 : sisa > 1 ? 2 : 1;
    const langkah = pengali * pangkat;

    const atas = langkah * jumlahLangkah;
    const ticks = Array.from({ length: jumlahLangkah + 1 }, (_, i) => i * langkah);

    return { domain: [0, atas] as [number, number], ticks };
}

export function OverviewChart({ data }: OverviewChartProps) {
    // Tren selalu mengembalikan 12 bulan, termasuk yang kosong — jadi
    // "belum ada data" ditentukan dari isinya, bukan dari panjang arraynya.
    const adaData = data.some((d) => d.pemasukan > 0 || d.pengeluaran > 0);

    const tertinggi = data.reduce(
        (maks, d) => Math.max(maks, d.pemasukan, d.pengeluaran),
        0
    );
    const { domain, ticks } = skalaBulat(tertinggi);

    return (
        <Card className="rounded-2xl border-zinc-200 shadow-sm w-full">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-zinc-900">
                    Ringkasan Arus Keuangan
                </CardTitle>
                <CardDescription>
                    Pemasukan dan pengeluaran per bulan, 12 bulan terakhir.
                </CardDescription>
            </CardHeader>

            <CardContent>
                {!adaData ? (
                    <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-14 text-center">
                        <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-zinc-100">
                            <TrendingUp className="size-5 text-zinc-400" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-zinc-900">
                            Grafik akan muncul setelah ada transaksi
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
                            Catat pemasukan atau pengeluaran pertama Anda lewat tombol
                            Transaksi Baru.
                        </p>
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-70 w-full">
                        {/* margin kiri disediakan untuk label sumbu Y, bawah untuk nama
                            bulan — tanpa itu keduanya terpotong tepi kartu. */}
                        <AreaChart
                            data={data}
                            margin={{ top: 4, right: 8, left: 4, bottom: 0 }}
                        >
                            <defs>
                                {/* Isian memudar ke bawah: pekat tipis di garis, hilang di
                                    dasar. Dua area yang bertumpuk jadi tidak saling
                                    mengeruhkan di titik potongnya. */}
                                <linearGradient id="isiPemasukan" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.18} />
                                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.01} />
                                </linearGradient>
                                <linearGradient id="isiPengeluaran" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.18} />
                                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.01} />
                                </linearGradient>
                            </defs>

                            {/* Garis bantu solid setipis mungkin. Bawaan Recharts putus-putus,
                                dan pola putus-putus terbaca sebagai "proyeksi" padahal ini
                                sekadar kisi. */}
                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="0"
                                stroke="var(--border)"
                            />

                            <XAxis
                                dataKey="bulan"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                className="text-xs"
                                stroke="var(--muted-foreground)"
                            />

                            {/* Sumbu Y sebelumnya tidak ada sama sekali, jadi besaran angkanya
                                mustahil dibaca tanpa hover — dan nilai yang hanya bisa didapat
                                lewat hover berarti tidak terbaca di sentuh, keyboard, maupun
                                cetak. */}
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                // Cukup lebar untuk "Rp 100jt" dalam satu baris. Terlalu
                                // sempit dan labelnya terlipat dua baris.
                                width={72}
                                domain={domain}
                                ticks={ticks}
                                className="text-xs tabular-nums"
                                stroke="var(--muted-foreground)"
                                tickFormatter={(value: number) => formatRupiahRingkas(value)}
                            />

                            <ChartTooltip
                                cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                                content={
                                    <ChartTooltipContent
                                        // Nilai penuh di sini; sumbu Y yang meringkas.
                                        formatter={(value, name) => (
                                            <div className="flex w-full items-center gap-2">
                                                <span
                                                    className="h-2.5 w-1 shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor: `var(--color-${name})`,
                                                    }}
                                                />
                                                <span className="text-zinc-500">
                                                    {chartConfig[name as keyof typeof chartConfig]?.label ??
                                                        name}
                                                </span>
                                                <span className="ml-auto font-medium text-zinc-900 tabular-nums">
                                                    {formatRupiah(Number(value))}
                                                </span>
                                            </div>
                                        )}
                                    />
                                }
                            />

                            {/* Legend wajib begitu ada dua seri: identitas tidak boleh
                                bergantung pada warna saja. Emerald di atas putih hanya
                                mencapai rasio kontras 2,47:1, jadi label inilah yang
                                menanggung keterbacaannya. */}
                            <ChartLegend content={<ChartLegendContent />} />

                            <Area
                                dataKey="pemasukan"
                                type="monotone"
                                fill="url(#isiPemasukan)"
                                stroke="var(--chart-1)"
                                strokeWidth={2}
                                // Titik hanya muncul saat ditunjuk. Dua belas titik permanen
                                // di dua garis menambah 24 tanda tanpa menambah informasi.
                                dot={false}
                                activeDot={{
                                    r: 4,
                                    strokeWidth: 2,
                                    stroke: "var(--card)",
                                }}
                            />
                            <Area
                                dataKey="pengeluaran"
                                type="monotone"
                                fill="url(#isiPengeluaran)"
                                stroke="var(--chart-2)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{
                                    r: 4,
                                    strokeWidth: 2,
                                    stroke: "var(--card)",
                                }}
                            />
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
