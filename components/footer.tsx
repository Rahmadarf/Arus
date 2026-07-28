import Link from "next/link";

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
    <footer className="shrink-0 border-t border-border px-4 py-4 text-xs text-muted-foreground sm:px-6 md:px-8">
      {/* max-w-7xl menyamai lebar konten di <main> supaya sejajar. */}
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p>
          © {year} {APP_NAME}
        </p>

        <div className="flex items-center gap-4">
          <Link href="/privasi" className={linkClass}>
            Privasi
          </Link>
          <Link href="/ketentuan" className={linkClass}>
            Ketentuan
          </Link>
          {/* Versi dipakai saat pengguna melaporkan bug. */}
          <span className="font-mono" title="Versi aplikasi">
            {APP_VERSION}
          </span>
        </div>
      </div>
    </footer>
  );
}
