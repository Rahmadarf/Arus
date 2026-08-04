import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";

// ============================================================================
// Pratinjau statis, dibangun dari komponen UI yang sama dengan aplikasi —
// bukan tangkapan layar. Tangkapan layar akan basi setiap kali UI berubah;
// pratinjau berbasis komponen selalu ikut design system.
//
// Server Component murni: tanpa state, tanpa interaksi, tanpa fetch, nol
// JavaScript dikirim ke pengunjung.
// ============================================================================

const RINGKASAN = [
  { label: "Total Saldo", nilai: 5540000, warna: "text-zinc-900", tanda: "" },
  { label: "Pemasukan", nilai: 15000000, warna: "text-emerald-600", tanda: "+ " },
  { label: "Pengeluaran", nilai: 9460000, warna: "text-rose-600", tanda: "- " },
];

// Persentase sudah dihitung tangan supaya jumlahnya tepat 100 dan nominalnya
// benar-benar berjumlah 9.460.000 — angka di aplikasi keuangan tidak boleh
// terlihat mengarang.
const KATEGORI = [
  { nama: "Makanan & Minuman", nominal: 3970000, persen: 42, warna: "var(--chart-1)" },
  { nama: "Transportasi", nominal: 2270000, persen: 24, warna: "var(--chart-2)" },
  { nama: "Belanja", nominal: 1800000, persen: 19, warna: "var(--chart-3)" },
  { nama: "Lainnya", nominal: 1420000, persen: 15, warna: "var(--chart-4)" },
];

const TRANSAKSI = [
  { tanggal: "2026-07-24", kategori: "Gaji", catatan: "Gaji bulanan", nominal: 8500000, masuk: true },
  { tanggal: "2026-07-23", kategori: "Belanja", catatan: "Belanja bulanan", nominal: 1250000, masuk: false },
  { tanggal: "2026-07-22", kategori: "Transportasi", catatan: "Isi saldo e-toll", nominal: 200000, masuk: false },
  { tanggal: "2026-07-21", kategori: "Makanan", catatan: "Kopi dan cemilan", nominal: 75000, masuk: false },
];

const TOTAL_PENGELUARAN = KATEGORI.reduce((jumlah: number, item: { nominal: number }) => jumlah + item.nominal, 0);

/**
 * Titik mulai setiap potongan donat, dihitung sekali saat modul dimuat.
 * Sengaja tidak diakumulasi di dalam map saat render — mutasi selama render
 * membuat hasilnya bergantung pada urutan render.
 */
const SEGMEN = KATEGORI.map((item: { nominal: number; persen: number; nama: string; warna: string }, index: number) => ({
  ...item,
  mulai: KATEGORI.slice(0, index).reduce((jumlah: number, s: { persen: number }) => jumlah + s.persen, 0),
}));

/**
 * Donat digambar sebagai SVG biasa, bukan lewat Recharts.
 *
 * Recharts butuh DOM, jadi memakainya di sini memaksa seluruh pratinjau jadi
 * Client Component dan mengirim puluhan kilobyte JavaScript ke satu-satunya
 * halaman yang dibaca mesin pencari. Warnanya tetap var(--chart-N) yang sama
 * dengan donat sungguhan di /statistics, jadi palet tidak bercabang.
 */
function Donat() {
  const radius = 38;
  const lingkar = 2 * Math.PI * radius;

  return (
    <svg viewBox="0 0 100 100" className="size-32 shrink-0 -rotate-90" role="presentation">
      {SEGMEN.map((item) => {
        const panjang = (item.persen / 100) * lingkar;
        const offset = -((item.mulai / 100) * lingkar);

        return (
          <circle
            key={item.nama}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={item.warna}
            strokeWidth="12"
            // Celah 1.5 unit memberi jarak antar potongan, seperti strokeWidth
            // pemisah pada donat aslinya.
            strokeDasharray={`${Math.max(panjang - 1.5, 0)} ${lingkar - panjang + 1.5}`}
            strokeDashoffset={offset}
          />
        );
      })}
    </svg>
  );
}

export function ProductPreview() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Bilah jendela: penanda bahwa ini tampilan aplikasi, dibuat dari
          border dan warna yang sudah ada — tanpa pustaka mockup. */}
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-zinc-200" />
          <span className="size-2.5 rounded-full bg-zinc-200" />
          <span className="size-2.5 rounded-full bg-zinc-200" />
        </span>
        <span className="mx-auto rounded-md bg-zinc-50 px-3 py-1 font-mono text-[11px] text-zinc-400">
          arus / transaksi
        </span>
      </div>

      <div className="space-y-4 bg-zinc-50/50 p-3 sm:p-5">
        {/* Ringkasan saldo */}
        {/* Di 360px tiga kolom tidak cukup untuk nominal sepanjang
            "+ Rp 15.000.000". Saldo melebar penuh di baris atas, dua sisanya
            berdampingan — tetap satu komponen, hanya kelas grid yang berubah. */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
          {RINGKASAN.map((item, index) => (
            <Card
              key={item.label}
              data-lebar={index === 0 ? "penuh" : undefined}
              // Card punya overflow-hidden, jadi isi yang terlalu lebar akan
              // terpotong. Padding dipersempit lewat token --card-spacing yang
              // sudah ada supaya nominal Rupiah tetap utuh di layar 360px.
              className="rounded-2xl border-zinc-200 shadow-sm [--card-spacing:--spacing(3)] data-[lebar=penuh]:col-span-2 sm:[--card-spacing:--spacing(4)] sm:data-[lebar=penuh]:col-span-1"
            >
              <CardHeader className="pb-1 sm:pb-2">
                <CardDescription className="text-[9px] font-medium uppercase tracking-wide text-zinc-500 sm:text-xs sm:tracking-wider">
                  {item.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CardTitle
                  className={cn(
                    "text-[11px] font-bold tabular-nums sm:text-base",
                    item.warna
                  )}
                >
                  {item.tanda}
                  {formatRupiah(item.nilai)}
                </CardTitle>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          {/* Komposisi pengeluaran */}
          <Card className="rounded-2xl border-zinc-200 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-zinc-900">
                Komposisi Pengeluaran
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Donat />

              <ul className="min-w-0 space-y-1.5">
                {KATEGORI.map((item) => (
                  <li key={item.nama} className="flex items-center gap-2 text-xs">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.warna }}
                    />
                    <span className="truncate text-zinc-500">{item.nama}</span>
                    <span className="ml-auto shrink-0 font-medium text-zinc-700 tabular-nums">
                      {item.persen}%
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Potongan tabel transaksi */}
          <Card className="rounded-2xl border-zinc-200 shadow-sm lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-zinc-900">Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border border-zinc-100">
                <Table className="table-fixed">
                  <TableHeader className="bg-zinc-50/70">
                    <TableRow>
                      {/* Kolom tanggal dan kategori disembunyikan lewat CSS di
                          layar sempit — satu komponen, bukan dua versi. */}
                      <TableHead className="hidden w-28 font-medium text-zinc-500 sm:table-cell">
                        Tanggal
                      </TableHead>
                      <TableHead className="hidden font-medium text-zinc-500 sm:table-cell">
                        Kategori
                      </TableHead>
                      <TableHead className="font-medium text-zinc-500">Catatan</TableHead>
                      <TableHead className="w-28 text-right font-medium text-zinc-500">
                        Nominal
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TRANSAKSI.map((tx) => (
                      <TableRow key={tx.tanggal}>
                        <TableCell className="hidden text-xs text-zinc-500 sm:table-cell">
                          {formatTanggal(tx.tanggal)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            variant="secondary"
                            className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-800"
                          >
                            {tx.kategori}
                          </Badge>
                        </TableCell>
                        <TableCell className="truncate text-xs font-medium text-zinc-700">
                          {tx.catatan}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right text-xs font-semibold tabular-nums",
                            tx.masuk ? "text-emerald-600" : "text-rose-600"
                          )}
                        >
                          {tx.masuk ? "+ " : "- "}
                          {formatRupiah(tx.nominal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/** Dipakai sebagai keterangan yang bisa dibaca semua orang, termasuk screen reader. */
export const PREVIEW_CAPTION = `Tampilan aplikasi: tiga kartu ringkasan berisi saldo ${formatRupiah(
  5540000
)}, pemasukan ${formatRupiah(15000000)}, dan pengeluaran ${formatRupiah(
  TOTAL_PENGELUARAN
)}; donat komposisi pengeluaran dengan Makanan & Minuman 42%, Transportasi 24%, Belanja 19%, Lainnya 15%; serta potongan tabel transaksi terbaru.`;
