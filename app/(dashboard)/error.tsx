"use client";

import { useEffect } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Batas error untuk seluruh halaman dashboard.
 *
 * Sebelumnya aplikasi ini tidak punya satu pun error.tsx, jadi kegagalan di
 * server component berakhir di layar error bawaan Next — tumpukan stack di
 * pengembangan, halaman putih di produksi.
 *
 * Yang ditampilkan di sini sengaja tidak menebak penyebabnya. Menyalahkan
 * "koneksi internet Anda" saat yang sebenarnya bermasalah adalah database
 * membuat pengguna mengejar masalah yang tidak ada — persis kekeliruan yang
 * dulu ada di halaman masuk.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // digest adalah satu-satunya penanda yang juga muncul di log server, jadi
    // itu yang dipakai untuk mencocokkan laporan pengguna dengan kejadiannya.
    console.error("Dashboard gagal dirender:", error);
  }, [error]);

  return (
    <Card className="rounded-2xl border-zinc-200 shadow-sm w-full">
      <CardContent className="flex flex-col items-center px-6 py-14 text-center">
        <div className="flex size-11 items-center justify-center rounded-xl bg-rose-50">
          <TriangleAlert className="size-5 text-rose-600" />
        </div>

        <p className="mt-4 text-sm font-semibold text-zinc-900">
          Halaman ini gagal dimuat
        </p>
        <p className="mt-1 max-w-sm text-sm text-zinc-500">
          Datanya tidak berhasil diambil dari server. Catatan keuangan Anda
          tidak terpengaruh — tidak ada yang berubah atau terhapus.
        </p>

        <Button onClick={reset} className="mt-5 h-9 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900">
          <RotateCw className="size-4" />
          Coba lagi
        </Button>

        {error.digest && (
          <p className="mt-4 font-mono text-xs text-zinc-400">
            Kode kejadian: {error.digest}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
