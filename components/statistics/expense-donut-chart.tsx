"use client";

import { Label, Pie, PieChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatRupiah } from "@/lib/format";
import type { ChartSlice } from "@/lib/statistics/types";

type Props = {
  slices: ChartSlice[];
  totalExpense: number;
};

export function ExpenseDonutChart({ slices, totalExpense }: Props) {
  // Label potongan diambil dari config, jadi kunci config harus sama dengan
  // nameKey yang dipakai tooltip.
  const chartConfig = slices.reduce<ChartConfig>((config, slice) => {
    config[slice.key] = { label: slice.name, color: slice.color };
    return config;
  }, {});

  // Recharts mewarnai sektor lewat properti `fill` pada data, bukan `color`.
  const chartData = slices.map((slice) => ({ ...slice, fill: slice.color }));

  return (
    <div className="flex flex-col items-center gap-5">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full max-w-[260px]"
      >
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                nameKey="key"
                formatter={(_value, _name, item) => {
                  const slice = (item as { payload?: ChartSlice }).payload;
                  if (!slice) return null;

                  return (
                    <div className="flex w-full items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className="text-zinc-500">{slice.name}</span>
                      <span className="ml-auto flex items-center gap-1.5 font-medium text-zinc-900 tabular-nums">
                        {formatRupiah(slice.value)}
                        <span className="font-normal text-zinc-400">{slice.percentage}%</span>
                      </span>
                    </div>
                  );
                }}
              />
            }
          />

          <Pie data={chartData} dataKey="value" nameKey="key" innerRadius={60} strokeWidth={4}>
            {/* Lubang donat dipakai untuk angka yang paling dicari pengguna. */}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox)) return null;
                const { cx = 0, cy = 0 } = viewBox;

                return (
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={cx} y={cy - 6} className="fill-zinc-900 text-base font-bold">
                      {formatRupiah(totalExpense)}
                    </tspan>
                    <tspan x={cx} y={cy + 16} className="fill-zinc-500 text-xs">
                      Total Pengeluaran
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* Legend ditulis sebagai HTML di bawah chart, bukan lewat <Legend> Recharts:
          Recharts memberi legend tinggi tetap, jadi label panjang akan meluber
          menutupi lubang donat. Sebagai HTML ia bebas membungkus ke bawah. */}
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {slices.map((slice) => (
          <li key={slice.key} className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            {slice.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
