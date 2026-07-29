"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CategoryIcon } from "@/components/categories/category-icon";
import type { Category } from "@/lib/categories/types";

type Props = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

export function CategoriesTable({ categories, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-xl border border-zinc-100 overflow-hidden">
      <Table className="table-fixed">
        <TableHeader className="bg-zinc-50/70">
          <TableRow>
            <TableHead className="font-medium text-zinc-500">Kategori</TableHead>
            <TableHead className="w-32 text-right font-medium text-zinc-500">
              Transaksi
            </TableHead>
            <TableHead className="w-24 text-right font-medium text-zinc-500">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
              <TableRow key={category.id} className="hover:bg-zinc-50/50 transition-colors">
                <TableCell>
                  <div className="flex min-w-0 items-center gap-2.5">
                    {/* Warna diambil dari data, bukan dari urutan baris — jadi
                        titik ini selalu cocok dengan potongan donat di Statistik. */}
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <CategoryIcon name={category.icon} className="size-4 shrink-0 text-zinc-400" />
                    <span className="truncate text-sm font-medium text-zinc-700">
                      {category.name}
                    </span>
                    {category.isDefault && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600"
                      >
                        Bawaan
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right text-sm text-zinc-500 tabular-nums">
                  {category.transactionCount.toLocaleString("id-ID")}
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Ubah kategori ${category.name}`}
                      onClick={() => onEdit(category)}
                      className="rounded-lg text-zinc-500 hover:text-zinc-900"
                    >
                      <Pencil className="size-4" />
                    </Button>

                    {category.isDefault ? (
                      <Tooltip>
                        {/* Tombol nonaktif tidak memancarkan event pointer, jadi
                            pemicu tooltip dipasang di span pembungkus. tabIndex
                            membuatnya tetap terjangkau keyboard. */}
                        <TooltipTrigger asChild>
                          <span tabIndex={0} className="inline-flex rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled
                              aria-label={`Kategori ${category.name} tidak bisa dihapus`}
                              className="pointer-events-none rounded-lg text-rose-600"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          Kategori bawaan tidak bisa dihapus. Ubah namanya kalau perlu.
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Hapus kategori ${category.name}`}
                        onClick={() => onDelete(category)}
                        className="rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function CategoriesTableSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-100 overflow-hidden">
      <div className="h-10 bg-zinc-50/70" />
      <div className="divide-y divide-zinc-100">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 p-2">
            <Skeleton className="size-2.5 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="ml-auto h-4 w-10 rounded-md" />
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
