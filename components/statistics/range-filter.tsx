"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIME_RANGES, type TimeRange } from "@/lib/statistics/types";

type Props = {
  range: TimeRange;
  periodLabel: string;
};

export function RangeFilter({ range, periodLabel }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pilihan disimpan di URL, bukan state lokal — sama seperti filter di
  // /transactions, jadi hasilnya bisa dibagikan dan tahan refresh.
  const handleChange = (value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("range", value);
    router.replace(`/statistics?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Select value={range} onValueChange={handleChange}>
        <SelectTrigger
          className="h-9 w-full rounded-xl border-zinc-200 sm:w-52"
          aria-label="Pilih rentang waktu"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIME_RANGES.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <p className="text-sm text-zinc-500">{periodLabel}</p>
    </div>
  );
}
