"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { NAV_LINKS } from "@/components/landing/nav-links";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

/**
 * Satu-satunya Client Component di halaman ini. Butuh state karena drawer
 * harus bisa dibuka, ditutup lewat Esc, dan menutup sendiri setelah sebuah
 * tautan diklik.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const tutup = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl text-zinc-500 hover:text-zinc-900"
        >
          <Menu className="size-5" />
          <span className="sr-only">Buka menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-72 gap-0 border-zinc-200 bg-white p-0">
        <SheetTitle className="sr-only">Menu navigasi</SheetTitle>

        <div className="flex h-16 items-center border-b border-zinc-100 px-5">
          <Logo size="sm" />
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={tutup}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100/80 hover:text-zinc-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t border-zinc-100 p-4">
          <Button
            className="h-10 w-full rounded-xl bg-zinc-950 text-white hover:bg-zinc-900"
            asChild
          >
            <Link href="/register" onClick={tutup}>
              Daftar
            </Link>
          </Button>
          <Button variant="outline" className="h-10 w-full rounded-xl" asChild>
            <Link href="/login" onClick={tutup}>
              Masuk
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
