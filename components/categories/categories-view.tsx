"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Tags, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriesTable, CategoriesTableSkeleton } from "@/components/categories/categories-table";
import { CategoryDialog } from "@/components/categories/category-dialog";
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog";
import { useCategories } from "@/lib/categories/store";
import { CATEGORY_TYPE_LABEL, type Category, type CategoryType } from "@/lib/categories/types";

export function CategoriesView({ type }: { type: CategoryType }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, error, categories, refresh } = useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);

  // 🚀 OPTIMASI: Filter dijalankan sekali per perubahan store, bukan dua kali per render
  const incomeItems = useMemo(
    () => categories.filter((item) => item.type === "income"),
    [categories]
  );
  const expenseItems = useMemo(
    () => categories.filter((item) => item.type === "expense"),
    [categories]
  );

  // Tab aktif hidup di URL, bukan state lokal — sama seperti filter di
  // /transactions dan rentang waktu di /statistics, jadi tautannya bisa
  // dibagikan dan tahan refresh.
  const handleTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("type", value);
    router.replace(`/categories?${next.toString()}`, { scroll: false });
  };

  // Dialog di halaman ini dibuka lewat state, bukan lewat <DialogTrigger>,
  // jadi Radix tidak punya elemen pemicu untuk dikembalikan fokusnya saat
  // ditutup — tanpa ini fokus keyboard jatuh ke <body>. Elemen pemicunya
  // dicatat sendiri, lalu dikembalikan lewat onCloseAutoFocus milik Radix.
  const triggerRef = useRef<HTMLElement | null>(null);

  const ingatPemicu = () => {
    triggerRef.current = document.activeElement as HTMLElement | null;
  };

  const kembalikanFokus = (event: Event) => {
    const node = triggerRef.current;
    // Kalau barisnya sudah terhapus, biarkan Radix memakai perilaku bawaannya.
    if (!node?.isConnected) return;

    event.preventDefault();
    node.focus();
  };

  const openCreate = useCallback(() => {
    ingatPemicu();
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((category: Category) => {
    ingatPemicu();
    setEditing(category);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((category: Category) => {
    ingatPemicu();
    setDeleting(category);
    setDeleteOpen(true);
  }, []);

  const renderBody = (tabType: CategoryType) => {
    if (status === "loading") return <CategoriesTableSkeleton />;

    if (status === "error") {
      return (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-14 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-rose-50">
            <TriangleAlert className="size-5 text-rose-600" />
          </div>
          <p className="mt-4 text-sm font-semibold text-zinc-900">Kategori gagal dimuat</p>
          <p className="mt-1 text-sm text-zinc-500">{error}</p>
          <Button variant="outline" className="mt-5 h-9 rounded-xl" onClick={refresh}>
            Coba lagi
          </Button>
        </div>
      );
    }

    const rows = tabType === "income" ? incomeItems : expenseItems;

    if (rows.length > 0) {
      return <CategoriesTable categories={rows} onEdit={openEdit} onDelete={openDelete} />;
    }

    // Dua kekosongan yang berbeda: aplikasi benar-benar kosong, atau tab ini
    // saja yang kosong sementara tab sebelah berisi.
    const benarBenarKosong = categories.length === 0;
    const label = CATEGORY_TYPE_LABEL[tabType].toLowerCase();

    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-14 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-zinc-100">
          <Tags className="size-5 text-zinc-400" />
        </div>
        <p className="mt-4 text-sm font-semibold text-zinc-900">
          {benarBenarKosong ? "Belum ada kategori" : `Belum ada kategori ${label}`}
        </p>
        <p className="mt-1 max-w-sm mx-auto text-sm text-zinc-500">
          {benarBenarKosong
            ? "Kategori mengelompokkan transaksi dan mewarnai grafik di Statistik. Buat satu untuk memulai."
            : `Transaksi ${label} butuh setidaknya satu kategori sebelum bisa dicatat.`}
        </p>
        <Button className="mt-5 h-9 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900" onClick={openCreate}>
          <Plus className="size-4" />
          Tambah Kategori
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Kategori</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Atur pengelompokan transaksi dan warnanya di grafik.
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="h-9 shrink-0 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900"
        >
          <Plus className="size-4" />
          Tambah Kategori
        </Button>
      </div>

      <Card className="rounded-2xl border-zinc-200 shadow-sm w-full">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-zinc-900">Daftar Kategori</CardTitle>
          <CardDescription>
            Kategori bawaan tidak bisa dihapus, tapi namanya boleh diubah.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={type} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="expense">{CATEGORY_TYPE_LABEL.expense}</TabsTrigger>
              <TabsTrigger value="income">{CATEGORY_TYPE_LABEL.income}</TabsTrigger>
            </TabsList>

            <TabsContent value="expense" className="mt-4">
              {renderBody("expense")}
            </TabsContent>
            <TabsContent value="income" className="mt-4">
              {renderBody("income")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CategoryDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
        defaultType={type}
        onCloseAutoFocus={kembalikanFokus}
      />

      <DeleteCategoryDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={deleting}
        onCloseAutoFocus={kembalikanFokus}
      />
    </div>
  );
}
