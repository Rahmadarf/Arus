"use client"; //

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Mock data keuangan
const chartData = [
    { month: "Jan", income: 4500000, expense: 2400000 },
    { month: "Feb", income: 5000000, expense: 1800000 },
    // ... data lainnya
];

// Konfigurasi shadcn/ui
const chartConfig = {
    income: { label: "Pemasukan", color: "var(--chart-1)" },
    expense: { label: "Pengeluaran", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function OverviewChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Ringkasan Arus Keuangan</CardTitle>
                <CardDescription>Pemasukan vs Pengeluaran</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <AreaChart data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} /> {/* */}
                        <Area
                            dataKey="income"
                            type="monotone"
                            fill="var(--chart-1)"         
                            fillOpacity={0.2}      
                            stroke="var(--chart-1)"       
                            strokeWidth={2}
                        />
                        <Area
                            dataKey="expense"
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
