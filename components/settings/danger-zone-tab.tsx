"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, TriangleAlert } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteAccount } from "@/lib/settings/mock";
import { NAMA_COOKIE_SESSION } from "@/lib/auth/types";
import { DELETE_CONFIRMATION, settingsErrorMessage } from "@/lib/settings/types";

// ============================================================================
// Bagian paling merusak di seluruh aplikasi: menghapus akun berarti menghapus
// seluruh riwayat keuangan pengguna.
//
// Karena itu konfirmasinya BUKAN satu klik. Pengguna harus mengetik ulang
// sebuah kata, dan tombolnya tetap mati sampai teksnya cocok persis. Mengetik
// memaksa membaca; satu klik bisa terjadi karena refleks.
// ============================================================================

export function DangerZoneTab() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [proses, setProses] = useState(false);

  const cocok = konfirmasi === DELETE_CONFIRMATION;

  const tutup = (next: boolean) => {
    if (proses) return;
    setOpen(next);
    if (!next) {
      setKonfirmasi("");
      setGalat(null);
    }
  };

  const hapus = async () => {
    if (!cocok) return;

    setProses(true);
    setGalat(null);

    try {
      await deleteAccount(konfirmasi);

      // Cookie session dibersihkan supaya pengguna benar-benar keluar. Semua
      // nama dicoba karena aplikasi ini punya dua jalur auth (better-auth dan
      // mock) yang memakai nama berbeda.
      for (const nama of NAMA_COOKIE_SESSION) {
        document.cookie = `${nama}=; Path=/; Max-Age=0; SameSite=Lax`;
      }

      // replace, bukan push: akun sudah tidak ada, halaman pengaturan tidak
      // boleh bisa diraih lagi lewat tombol Back.
      router.replace("/");
    } catch (error) {
      setGalat(settingsErrorMessage(error));
      setProses(false);
    }
  };

  return (
    <Card className="w-full rounded-2xl border-rose-200 bg-rose-50/30 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-rose-700">
          <TriangleAlert className="size-4" />
          Zona Bahaya
        </CardTitle>
        <CardDescription className="text-rose-700/70">
          Tindakan di bawah ini permanen dan tidak bisa dibatalkan.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Hapus akun</p>
          <p className="mt-1 max-w-lg text-sm text-zinc-600">
            Menghapus akun akan menghapus seluruh transaksi dan kategori yang pernah Anda
            catat. Tidak ada cara mengembalikannya.
          </p>
        </div>

        <AlertDialog open={open} onOpenChange={tutup}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="h-10 rounded-xl bg-rose-600 px-5 text-white hover:bg-rose-600/90"
            >
              Hapus Akun Saya
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent className="rounded-2xl border-zinc-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-bold text-zinc-900">
                Hapus akun ini?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Seluruh transaksi, kategori, dan data akun akan dihapus permanen dan tidak
                bisa dikembalikan.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-2">
              <Label htmlFor="konfirmasi-hapus" className="text-sm font-medium text-zinc-700">
                Ketik{" "}
                <span className="font-mono font-semibold text-rose-600">
                  {DELETE_CONFIRMATION}
                </span>{" "}
                untuk melanjutkan
              </Label>
              <Input
                id="konfirmasi-hapus"
                value={konfirmasi}
                onChange={(event) => setKonfirmasi(event.target.value)}
                disabled={proses}
                autoComplete="off"
                placeholder={DELETE_CONFIRMATION}
                className="rounded-xl border-zinc-200 font-mono"
              />
            </div>

            {galat && (
              <Alert variant="destructive" role="alert" className="rounded-xl">
                <AlertDescription>{galat}</AlertDescription>
              </Alert>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={proses} className="h-9 rounded-xl">
                Batal
              </AlertDialogCancel>

              {/* Bukan AlertDialogAction: komponen itu menutup dialog begitu
                  diklik, sedangkan di sini dialognya harus tetap terbuka
                  selama proses berjalan dan saat galat muncul. */}
              <Button
                type="button"
                onClick={hapus}
                disabled={!cocok || proses}
                className="h-9 rounded-xl bg-rose-600 text-white hover:bg-rose-600/90"
              >
                {proses && <Loader2 className="size-4 animate-spin" />}
                {proses ? "Menghapus" : "Hapus akun permanen"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
