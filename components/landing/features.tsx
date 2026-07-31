import { ArrowUpRight, BarChart3, Tags } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Ketiganya sudah benar-benar ada di aplikasi: /transactions, /statistics,
// /categories. Tidak ada fitur yang disebut di sini yang belum dibangun.
const FITUR = [
  {
    icon: ArrowUpRight,
    judul: "Pencatatan dengan pencarian dan filter",
    isi: "Cari transaksi lewat isi catatannya, saring per tipe atau kategori. Hasil filter tersimpan di URL, jadi bisa dibagikan atau di-refresh tanpa hilang.",
  },
  {
    icon: BarChart3,
    judul: "Statistik pengeluaran per kategori",
    isi: "Donat dan tabel peringkat menunjukkan kategori mana yang paling menguras, untuk bulan ini, tiga bulan terakhir, atau setahun.",
  },
  {
    icon: Tags,
    judul: "Kategori yang kamu atur sendiri",
    isi: "Buat kategori beserta warnanya. Saat sebuah kategori dihapus, transaksinya dipindahkan dulu — riwayat keuanganmu tidak pernah ikut terhapus.",
  },
];

export function Features() {
  return (
    <section id="fitur" aria-labelledby="fitur-judul" className="py-12 sm:py-16">
      <h2
        id="fitur-judul"
        className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl"
      >
        Apa yang bisa kamu lakukan
      </h2>
      <p className="mt-2 max-w-xl text-base text-zinc-500">
        Tiga hal ini sudah jalan hari ini. Tidak ada daftar tunggu.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {FITUR.map((fitur) => (
          <Card key={fitur.judul} className="rounded-2xl border-zinc-200 shadow-sm">
            <CardHeader>
              <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-100">
                <fitur.icon className="size-4 text-zinc-500" />
              </div>
              <CardTitle className="mt-3 text-base font-semibold text-zinc-900">
                {fitur.judul}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500">{fitur.isi}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
