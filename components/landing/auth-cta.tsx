import Link from "next/link";

import { Button } from "@/components/ui/button";
import { isLoggedIn } from "@/lib/auth/session-server";
import { cn } from "@/lib/utils";

type Props = {
  /** "sm" untuk navbar, "lg" untuk hero dan CTA penutup. */
  size?: "sm" | "lg";
  className?: string;
};

/**
 * Tombol ajakan yang sadar status login. Dipakai di navbar, hero, dan CTA
 * penutup — satu komponen, jadi ketiganya tidak mungkin desinkron.
 *
 * Server Component: statusnya sudah diketahui saat HTML dikirim, tanpa kedipan.
 */
export async function AuthCta({ size = "sm", className }: Props) {
  const sudahMasuk = await isLoggedIn();

  const tinggi = size === "lg" ? "h-10 px-5" : "h-9 px-4";

  if (sudahMasuk) {
    return (
      <div className={cn("flex flex-wrap items-center gap-3", className)}>
        <Button
          className={cn("rounded-xl bg-zinc-950 text-white hover:bg-zinc-900", tinggi)}
          asChild
        >
          <Link href="/transactions">Buka Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Button
        className={cn("rounded-xl bg-zinc-950 text-white hover:bg-zinc-900", tinggi)}
        asChild
      >
        <Link href="/register">Mulai Gratis</Link>
      </Button>
      <Button variant="outline" className={cn("rounded-xl", tinggi)} asChild>
        <Link href="/login">Masuk</Link>
      </Button>
    </div>
  );
}
