"use client";

import { useState } from "react";
import { ArrowRightLeft, Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/lib/categories/store";
import { CATEGORY_TYPE_LABEL, type Category } from "@/lib/categories/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  /** Mengembalikan fokus ke tombol pemicu. Lihat categories-view.tsx. */
  onCloseAutoFocus?: (event: Event) => void;
};

/**
 * Dua jalur penghapusan.
 *
 * KEPUTUSAN DESAIN: menghapus kategori tidak boleh menghilangkan transaksi.
 * Riwayat keuangan dikumpulkan pengguna selama berbulan-bulan; satu aksi di
 * halaman pengaturan tidak boleh memusnahkannya, dan tidak boleh pula
 * meninggalkan transaksi tanpa kategori. Karena itu tidak disediakan opsi
 * "hapus beserta transaksinya" — kalau kategori masih terpakai, satu-satunya
 * jalan adalah memindahkan isinya lebih dulu.
 */
export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  onCloseAutoFocus,
}: Props) {
  const { categories, remove, reassignAndRemove } = useCategories();
  const [targetId, setTargetId] = useState<string>("");
  const [isPending, setIsPending] = useState(false);

  // Reset pilihan tujuan setiap dialog dibuka untuk kategori lain. Disesuaikan
  // saat render, bukan lewat effect, supaya tidak memicu render berantai.
  const sesi = open ? (category?.id ?? "") : null;
  const [sesiTerakhir, setSesiTerakhir] = useState<string | null>(sesi);

  if (sesi !== sesiTerakhir) {
    setSesiTerakhir(sesi);
    setTargetId("");
  }

  if (!category) return null;

  const jumlah = category.transactionCount;
  const terpakai = jumlah > 0;

  // Transaksi pengeluaran tidak boleh mendarat di kategori pemasukan, jadi
  // tujuan pemindahan dibatasi pada tipe yang sama.
  const targets = categories.filter(
    (item) => item.type === category.type && item.id !== category.id
  );
  const tidakAdaTujuan = terpakai && targets.length === 0;

  const bolehLanjut = terpakai ? Boolean(targetId) && !tidakAdaTujuan : true;

  const handleConfirm = async () => {
    setIsPending(true);

    try {
      if (terpakai) {
        // Menjalankan fungsi pindah transaksi & hapus kategori berantai
        await reassignAndRemove(category.id, targetId);
      } else {
        // Menjalankan fungsi hapus kategori kosong secara langsung
        await remove(category.id);
      }

      // Jika baris di atas berjalan lancar tanpa melempar error (throw),
      // artinya mutasi database Supabase sukses murni! Langsung tutup modal otomatis.
      onOpenChange(false);
    } catch (error) {
      // Jika Supabase mendeteksi kegagalan (misal: aturan database Restrict memblokir aksi)
      console.error("Gagal mengeksekusi penghapusan kategori:", error);
      // Dialog tidak akan menutup, sehingga pengguna tetap bisa melihat form
    } finally {
      setIsPending(false); // Matikan indikator loading spinner animasi
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <AlertDialogContent
        onCloseAutoFocus={onCloseAutoFocus}
        className="rounded-2xl border-zinc-200"
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-zinc-900">
            {terpakai ? `Pindahkan isi "${category.name}" dulu` : `Hapus "${category.name}"?`}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {!terpakai &&
              "Kategori ini belum dipakai transaksi mana pun, jadi aman dihapus. Tindakan ini tidak bisa dibatalkan."}

            {terpakai && !tidakAdaTujuan &&
              `Kategori ini dipakai oleh ${jumlah} transaksi. Pilih kategori tujuan — transaksinya dipindahkan ke sana, tidak ada yang hilang.`}

            {tidakAdaTujuan &&
              `Kategori ini dipakai oleh ${jumlah} transaksi dan belum ada kategori ${CATEGORY_TYPE_LABEL[
                category.type
              ].toLowerCase()} lain sebagai tujuan. Buat kategori pengganti dulu, baru kategori ini bisa dihapus.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {terpakai && !tidakAdaTujuan && (
          <div className="space-y-2">
            <label htmlFor="reassign-target" className="text-sm font-medium text-zinc-700">
              Pindahkan {jumlah} transaksi ke
            </label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger id="reassign-target" className="w-full rounded-xl border-zinc-200">
                <SelectValue placeholder="Pilih kategori tujuan" />
              </SelectTrigger>
              <SelectContent>
                {targets.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} className="h-9 rounded-xl">
            Batal
          </AlertDialogCancel>

          {!tidakAdaTujuan && (
            <AlertDialogAction
              onClick={(event) => {
                // Dicegah supaya dialog tidak menutup sebelum permintaan selesai
                // — kalau gagal, pengguna harus tetap melihat dialognya.
                event.preventDefault();
                handleConfirm();
              }}
              disabled={!bolehLanjut || isPending}
              className="h-9 rounded-xl bg-rose-600 text-white hover:bg-rose-600/90"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {terpakai && !isPending && <ArrowRightLeft className="size-4" />}
              {terpakai ? `Pindahkan ${jumlah} transaksi & hapus` : "Hapus kategori"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
