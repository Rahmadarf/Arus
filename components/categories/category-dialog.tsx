"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryIcon } from "@/components/categories/category-icon";
import { CATEGORY_ICON_OPTIONS } from "@/lib/categories/icons";
import { useCategories } from "@/lib/categories/store";
import {
  CATEGORY_COLORS,
  CATEGORY_TYPE_LABEL,
  type Category,
  type CategoryType,
} from "@/lib/categories/types";
import { cn } from "@/lib/utils";

/** Nama warna untuk pembaca layar — swatch tanpa label tidak terbaca. */
const COLOR_LABELS = ["Hijau", "Merah", "Kuning", "Ungu", "Tosca", "Abu-abu"];

const NO_ICON = "none";

type FormValues = {
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
};

/**
 * Skema dibangun ulang tiap kali daftar kategori berubah karena aturan keunikan
 * bergantung pada isi daftar itu.
 */
function buildSchema(categories: Category[], editingId?: string) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Nama minimal 2 karakter")
        .max(30, "Nama maksimal 30 karakter"),
      type: z.enum(["income", "expense"]),
      color: z.string().min(1, "Pilih satu warna"),
      icon: z.string(),
    })
    .superRefine((values, ctx) => {
      // KEUNIKAN NAMA, per tipe, tanpa membedakan huruf besar/kecil.
      //
      // "Makanan" dan "makanan" harus dianggap sama: kalau keduanya lolos,
      // /statistics akan memecahnya jadi dua potongan donat yang terlihat
      // seperti kategori berbeda, dan pengguna tidak punya cara menebak kenapa
      // pengeluaran mereka terbelah dua.
      //
      // Dibatasi per tipe supaya "Lainnya" boleh ada di pemasukan sekaligus
      // pengeluaran — keduanya memang kategori yang berbeda.
      //
      // Saat mengedit, kategori itu sendiri dikecualikan; kalau tidak, menyimpan
      // tanpa mengubah nama akan ditolak oleh namanya sendiri.
      const candidate = values.name.trim().toLocaleLowerCase("id-ID");

      const bentrok = categories.some(
        (item) =>
          item.id !== editingId &&
          item.type === values.type &&
          item.name.trim().toLocaleLowerCase("id-ID") === candidate
      );

      if (bentrok) {
        ctx.addIssue({
          code: "custom",
          path: ["name"],
          message: `Kategori "${values.name.trim()}" sudah ada`,
        });
      }
    });
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Diisi berarti mode edit. */
  category?: Category | null;
  /** Tipe awal saat menambah — mengikuti tab yang sedang aktif. */
  defaultType: CategoryType;
  /** Mengembalikan fokus ke tombol pemicu. Lihat categories-view.tsx. */
  onCloseAutoFocus?: (event: Event) => void;
};

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  defaultType,
  onCloseAutoFocus,
}: Props) {
  const { categories, create, update } = useCategories();
  const isEdit = Boolean(category);

  const schema = useMemo(
    () => buildSchema(categories, category?.id),
    [categories, category?.id]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      type: defaultType,
      color: CATEGORY_COLORS[0],
      icon: NO_ICON,
    },
  });

  const { register, handleSubmit, reset, control, setValue, formState } = form;

  // useWatch, bukan watch(): watch() mengembalikan fungsi baru tiap render
  // sehingga React Compiler melewatkan memoisasi seluruh komponen ini.
  const nameValue = useWatch({ control, name: "name" });
  const typeValue = useWatch({ control, name: "type" });
  const colorValue = useWatch({ control, name: "color" });
  const iconValue = useWatch({ control, name: "icon" });

  // Isi ulang form setiap dialog dibuka, supaya sisa isian sebelumnya tidak
  // bocor ke sesi berikutnya.
  useEffect(() => {
    if (!open) return;

    reset({
      name: category?.name ?? "",
      type: category?.type ?? defaultType,
      color: category?.color ?? CATEGORY_COLORS[0],
      icon: category?.icon ?? NO_ICON,
    });
  }, [open, category, defaultType, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const input = {
      name: data.name.trim(),
      type: data.type,
      color: data.color,
      icon: data.icon === NO_ICON ? undefined : data.icon,
    };

    const ok = category ? await update(category.id, input) : await create(input);
    if (ok) onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onCloseAutoFocus={onCloseAutoFocus}
        className="sm:max-w-110 rounded-2xl border-zinc-200 bg-white p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-zinc-900">
            {isEdit ? "Ubah Kategori" : "Kategori Baru"}
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">
            {isEdit
              ? "Nama, warna, dan ikon bisa diubah. Tipe dikunci agar transaksi lama tidak berpindah sisi."
              : "Kategori dipakai untuk mengelompokkan transaksi dan mewarnai grafik di Statistik."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-4 space-y-5">
          {/* Nama */}
          <div className="space-y-2">
            <Label htmlFor="category-name" className="text-sm font-medium text-zinc-700">
              Nama
            </Label>
            <Input
              id="category-name"
              placeholder="Contoh: Makanan & Minuman"
              autoComplete="off"
              aria-invalid={Boolean(formState.errors.name)}
              aria-describedby={formState.errors.name ? "category-name-error" : undefined}
              className="rounded-xl border-zinc-200"
              {...register("name")}
            />
            {formState.errors.name && (
              <p id="category-name-error" className="text-sm font-medium text-rose-600">
                {formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Tipe */}
          <div className="space-y-2">
            <Label htmlFor="category-type" className="text-sm font-medium text-zinc-700">
              Tipe
            </Label>
            <Select
              value={typeValue}
              onValueChange={(value) => setValue("type", value as CategoryType)}
              disabled={isEdit}
            >
              <SelectTrigger id="category-type" className="w-full rounded-xl border-zinc-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">{CATEGORY_TYPE_LABEL.expense}</SelectItem>
                <SelectItem value="income">{CATEGORY_TYPE_LABEL.income}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Warna: pilihan terbatas, bukan color picker bebas — lihat alasannya
              di komentar `color` pada lib/categories/types.ts. */}
          <div className="space-y-2">
            <span className="block text-sm font-medium text-zinc-700">Warna</span>
            <div role="radiogroup" aria-label="Warna kategori" className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((color, index) => {
                const selected = colorValue === color;

                return (
                  <button
                    key={color}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={COLOR_LABELS[index] ?? `Warna ${index + 1}`}
                    onClick={() => setValue("color", color)}
                    className={cn(
                      "size-8 rounded-full border-2 transition-transform",
                      "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      selected ? "scale-110 border-zinc-900" : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                  />
                );
              })}
            </div>
          </div>

          {/* Ikon */}
          <div className="space-y-2">
            <Label htmlFor="category-icon" className="text-sm font-medium text-zinc-700">
              Ikon <span className="font-normal text-zinc-400">(opsional)</span>
            </Label>
            <Select
              value={iconValue}
              onValueChange={(value) => setValue("icon", value)}
            >
              <SelectTrigger id="category-icon" className="w-full rounded-xl border-zinc-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_ICON}>Tanpa ikon</SelectItem>
                {CATEGORY_ICON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pratinjau: memperlihatkan baris seperti yang nanti muncul di tabel
              dan titik warna seperti di chart. */}
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Pratinjau
            </p>
            <div className="mt-2 flex items-center gap-2.5">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: colorValue }}
              />
              <CategoryIcon
                name={iconValue === NO_ICON ? undefined : iconValue}
                className="size-4 shrink-0 text-zinc-400"
              />
              <span className="truncate text-sm font-medium text-zinc-700">
                {nameValue.trim() || "Nama kategori"}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-xl"
              onClick={() => onOpenChange(false)}
              disabled={formState.isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="h-9 rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-900"
              disabled={formState.isSubmitting}
            >
              {formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Simpan perubahan" : "Tambah kategori"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
