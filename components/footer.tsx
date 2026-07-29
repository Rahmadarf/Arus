import Link from "next/link";

import { Logo } from "@/components/logo";

const APP_NAME = "Arus";

// NEXT_PUBLIC_* di-inline saat build, bukan dibaca saat runtime — mengganti
// nilainya butuh build ulang. Awalan "v" ditambahkan hanya bila belum ada,
// supaya fallback tidak berubah jadi "vdev".
const rawVersion = process.env.NEXT_PUBLIC_APP_VERSION;
const APP_VERSION = rawVersion
  ? rawVersion.startsWith("v")
    ? rawVersion
    : `v${rawVersion}`
  : "dev";

const linkClass =
  "rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

// Server Component: tahun dihitung saat render di server, jadi tidak ada
// risiko hydration mismatch.
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0">
      {/* Garis pemisah sekaligus penanda: beralih dari emerald (pemasukan) ke
          rose (pengeluaran) — dualitas yang jadi inti aplikasi ini. Memakai
          token chart yang sudah dipakai grafik, jadi ikut dark mode. */}
      <div
        aria-hidden
        className="h-px w-full bg-linear-to-r from-chart-1/60 via-border to-chart-2/60"
      />

      <div className="px-4 py-4 text-xs text-muted-foreground sm:px-6 md:px-8">
        {/* max-w-7xl menyamai lebar konten di <main> supaya sejajar. */}
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="flex items-center gap-2">
            {/* markOnly: nama aplikasi sudah tertulis di baris hak cipta
                sebelah kanan lambang, jadi wordmark-nya tidak perlu diulang.
                alt dibiarkan kosong karena teks itu sudah mewakilinya. */}
            <Logo size="xs" markOnly className="gap-0" />
            © {year} {APP_NAME}
          </p>

          <div className="flex items-center gap-4">
            <Link href="/privasi" className={linkClass}>
              Privasi
            </Link>
            <Link href="/ketentuan" className={linkClass}>
              Ketentuan
            </Link>
            {/* Versi dipakai saat pengguna melaporkan bug — dibuat sedikit
                menonjol supaya gampang dibacakan, tanpa jadi ramai. */}
            <span
              className="rounded bg-muted px-1.5 py-0.5 font-mono tabular-nums"
              title="Versi aplikasi"
            >
              {APP_VERSION}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
