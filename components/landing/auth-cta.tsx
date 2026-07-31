import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  /** "sm" untuk navbar, "lg" untuk hero dan CTA penutup. */
  size?: "sm" | "lg";
  className?: string;
};

/**
 * Tombol ajakan di landing page: selalu Daftar dan Masuk, tanpa memeriksa
 * status login.
 *
 * Dipakai di navbar, hero, dan CTA penutup — satu komponen, jadi ketiganya
 * tidak mungkin berbeda isi. Server Component, nol JavaScript.
 */
export function AuthCta({ size = "sm", className }: Props) {
  const tinggi = size === "lg" ? "h-10 px-5" : "h-9 px-4";

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Button
        className={cn("rounded-xl bg-zinc-950 text-white hover:bg-zinc-900", tinggi)}
        asChild
      >
        <Link href="/register">Daftar</Link>
      </Button>
      <Button variant="outline" className={cn("rounded-xl", tinggi)} asChild>
        <Link href="/login">Masuk</Link>
      </Button>
    </div>
  );
}
