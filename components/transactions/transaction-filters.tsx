"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CategoryOption = { id: string; name: string };

export function TransactionFilters({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "ALL";
  const category = searchParams.get("category") ?? "ALL";

  const [searchDraft, setSearchDraft] = useState(search);
  const [lastSearch, setLastSearch] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sinkronkan input saat URL berubah dari luar (tombol reset, back/forward).
  if (search !== lastSearch) {
    setLastSearch(search);
    setSearchDraft(search);
  }

  const pushParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "ALL") next.delete(key);
      else next.set(key, value);
    }

    // Filter berubah -> selalu balik ke halaman 1.
    next.delete("page");

    const query = next.toString();
    router.replace(query ? `/transactions?${query}` : "/transactions", { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    setSearchDraft(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams({ search: value.trim() }), 400);
  };

  const handleReset = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchDraft("");
    router.replace("/transactions", { scroll: false });
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const hasActiveFilter = Boolean(search) || type !== "ALL" || category !== "ALL";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={searchDraft}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Cari catatan transaksi"
          aria-label="Cari catatan transaksi"
          className="h-9 rounded-xl border-zinc-200 pl-9 text-sm"
        />
      </div>

      <Select value={type} onValueChange={(value) => pushParams({ type: value })}>
        <SelectTrigger className="h-9 w-full rounded-xl border-zinc-200 sm:w-40" aria-label="Filter tipe">
          <SelectValue placeholder="Semua" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Semua</SelectItem>
          <SelectItem value="INCOME">Pemasukan</SelectItem>
          <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
        </SelectContent>
      </Select>

      <Select value={category} onValueChange={(value) => pushParams({ category: value })}>
        <SelectTrigger className="h-9 w-full rounded-xl border-zinc-200 sm:w-52" aria-label="Filter kategori">
          <SelectValue placeholder="Semua Kategori" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Semua Kategori</SelectItem>
          {categories.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilter && (
        <Button
          variant="ghost"
          onClick={handleReset}
          className="h-9 rounded-xl text-zinc-500 hover:text-zinc-900 sm:ml-auto"
        >
          <X className="size-4" />
          Reset Filter
        </Button>
      )}
    </div>
  );
}
