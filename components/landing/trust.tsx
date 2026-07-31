import { CircleDollarSign, EyeOff, Hammer } from "lucide-react";

// ============================================================================
// VERIFIKASI KLAIM INI SEBELUM PRODUCTION
//
// Section ini menggantikan social proof. Tidak ada testimoni, angka pengguna,
// rating, atau logo perusahaan — karena belum ada penggunanya.
//
// Setiap poin di bawah harus kamu periksa sendiri sebelum rilis:
//
// 1. "Tanpa iklan dan pelacak"  -> benar hari ini: tidak ada skrip analitik,
//    pixel, atau iklan di app/layout.tsx. Batal berlaku begitu kamu memasang
//    Google Analytics, Meta Pixel, atau sejenisnya.
// 2. "Gratis selama pengembangan" -> benar hari ini: tidak ada kode pembayaran
//    maupun paket berlangganan di proyek ini.
// 3. "Masih dalam pengembangan"  -> pernyataan status, bukan janji.
//
// YANG SENGAJA TIDAK DITULIS DI SINI, dan alasannya:
//   - "Data hanya untuk akunmu" — belum bisa dijamin. lib/transactions-mock.ts
//     masih memakai testingUserId yang di-hardcode, jadi transaksi belum
//     benar-benar terpisah per akun. Tulis klaim ini HANYA setelah setiap query
//     disaring memakai id pengguna dari session.
//   - "Terenkripsi end-to-end", "keamanan setara bank", "bersertifikasi" —
//     tidak ada dasarnya, dan untuk aplikasi keuangan klaim kosong semacam ini
//     justru merusak kepercayaan yang sedang dibangun.
// ============================================================================

const POIN = [
  {
    icon: Hammer,
    judul: "Masih dalam pengembangan",
    isi: "Arus dibangun tim kecil dan belum dipakai publik. Fitur bisa berubah, dan sebaiknya belum kamu andalkan sebagai satu-satunya catatan keuanganmu.",
  },
  {
    icon: EyeOff,
    judul: "Tanpa iklan dan pelacak",
    isi: "Tidak ada iklan, tidak ada skrip analitik pihak ketiga. Halaman ini tidak mengirim apa pun tentang kunjunganmu ke layanan lain.",
  },
  {
    icon: CircleDollarSign,
    judul: "Gratis selama pengembangan",
    isi: "Belum ada paket berbayar maupun kode pembayaran di aplikasi ini. Kalau nanti berubah, kamu akan diberi tahu lebih dulu.",
  },
];

export function Trust() {
  return (
    <section
      id="kepercayaan"
      aria-labelledby="kepercayaan-judul"
      className="py-12 sm:py-16"
    >
      <h2
        id="kepercayaan-judul"
        className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl"
      >
        Status project ini
      </h2>
      <p className="mt-2 max-w-xl text-base text-zinc-500">
        Belum ada testimoni atau angka pengguna untuk ditunjukkan. Jadi ini saja yang
        bisa kami sampaikan apa adanya.
      </p>

      <dl className="mt-8 grid gap-4 md:grid-cols-3">
        {POIN.map((poin) => (
          <div
            key={poin.judul}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-100">
              <poin.icon className="size-4 text-zinc-500" />
            </div>
            <dt className="mt-3 text-base font-semibold text-zinc-900">{poin.judul}</dt>
            <dd className="mt-1 text-sm text-zinc-500">{poin.isi}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
