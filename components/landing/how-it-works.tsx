// Nomor dipakai di sini karena isinya memang berurutan: langkah tiga tidak
// masuk akal sebelum langkah satu. Bukan penomoran hiasan.
const LANGKAH = [
  {
    judul: "Daftar",
    isi: "Cukup nama, email, dan password. Tanpa verifikasi kartu, tanpa data rekening.",
  },
  {
    judul: "Catat transaksi",
    isi: "Masukkan nominal, pilih kategori, tambahkan catatan singkat. Beberapa detik per transaksi.",
  },
  {
    judul: "Lihat pola pengeluaran",
    isi: "Setelah terkumpul, halaman statistik memecah pengeluaranmu per kategori dan mengurutkannya dari yang terbesar.",
  },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" aria-labelledby="cara-kerja-judul" className="py-12 sm:py-16">
      <h2
        id="cara-kerja-judul"
        className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl"
      >
        Cara kerjanya
      </h2>

      <ol className="mt-8 grid gap-4 md:grid-cols-3">
        {LANGKAH.map((langkah, index) => (
          <li
            key={langkah.judul}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <span
              aria-hidden
              className="flex size-7 items-center justify-center rounded-lg bg-zinc-950 text-xs font-semibold text-white tabular-nums"
            >
              {index + 1}
            </span>
            <h3 className="mt-3 text-base font-semibold text-zinc-900">{langkah.judul}</h3>
            <p className="mt-1 text-sm text-zinc-500">{langkah.isi}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
