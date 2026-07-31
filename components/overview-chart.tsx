"use client"; //

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Interface
interface MonthlyTrendData {
    bulan: string;
    pemasukan: number;
    pengeluaran: number;
}

interface OverviewChartProps {
    data: MonthlyTrendData[]
}

// Konfigurasi shadcn/ui
const chartConfig = {
    income: { label: "Pemasukan", color: "var(--chart-1)" },
    expense: { label: "Pengeluaran", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function OverviewChart({
    data
}: OverviewChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Ringkasan Arus Keuangan</CardTitle>
                <CardDescription>Pemasukan vs Pengeluaran</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-75 w-full">
                    <AreaChart data={data}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="bulan" tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} /> {/* */}
                        <Area
                            dataKey="pemasukan"
                            type="monotone"
                            fill="var(--chart-1)"         
                            fillOpacity={0.2}      
                            stroke="var(--chart-1)"       
                            strokeWidth={2}
                        />
                        <Area
                            dataKey="pengeluaran"
                            type="monotone"
                            fill="var(--chart-2)"
                            fillOpacity={0.2}
                            stroke="var(--chart-2)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
