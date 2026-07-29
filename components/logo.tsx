import Image from "next/image";

import { cn } from "@/lib/utils";

const UKURAN = {
  xs: { kotak: "size-5", rounded: "rounded-md", px: 20, teks: "text-sm" },
  sm: { kotak: "size-8", rounded: "rounded-lg", px: 32, teks: "text-lg" },
  md: { kotak: "size-9", rounded: "rounded-xl", px: 36, teks: "text-xl" },
  lg: { kotak: "size-12", rounded: "rounded-2xl", px: 48, teks: "text-2xl" },
} as const;

type Props = {
  size?: keyof typeof UKURAN;
  /** Tampilkan tagline kecil di bawah nama. */
  withTagline?: boolean;
  /** Sembunyikan teks, sisakan lambangnya saja. */
  markOnly?: boolean;
  /**
   * Kosong berarti dekoratif — pilihan yang benar kalau nama "Arus" sudah
   * tertulis di sebelahnya, karena pembaca layar tidak perlu menyebutnya dua
   * kali. Isi hanya bila lambang ini satu-satunya penanda identitas.
   */
  alt?: string;
  className?: string;
};

/**
 * Lambang aplikasi. Diekstrak dari markup yang sebelumnya disalin di sidebar,
 * top bar mobile, dan footer — satu aset, satu perlakuan visual.
 *
 * Permukaannya memakai token (border-border, bg-muted), bukan zinc yang
 * dikunci, supaya lambang ini ikut berubah saat dark mode aktif.
 */
export function Logo({
  size = "md",
  withTagline = false,
  markOnly = false,
  alt = "",
  className,
}: Props) {
  const ukuran = UKURAN[size];

  // Semuanya <span>, bukan <div>: footer menaruh lambang ini di dalam <p>,
  // dan <div> di dalam <p> adalah HTML tidak sah — browser memindahkannya saat
  // parsing, yang membuat markup server dan klien berbeda lalu hydration gagal.
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "relative block shrink-0 overflow-hidden border border-border bg-muted",
          ukuran.kotak,
          ukuran.rounded
        )}
      >
        <Image
          src="/images/A.png"
          alt={alt}
          fill
          sizes={`${ukuran.px}px`}
          className="object-cover"
          priority
        />
      </span>

      {!markOnly && (
        <span className="flex flex-col justify-center">
          <span
            className={cn(
              "font-bold tracking-tight text-foreground leading-none",
              ukuran.teks
            )}
          >
            Arus.
          </span>
          {withTagline && (
            <span className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-wider">
              Finance Tracker
            </span>
          )}
        </span>
      )}
    </span>
  );
}
