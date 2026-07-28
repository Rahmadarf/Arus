"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";

import { SidebarNav } from "@/components/sidebar-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="lg:hidden flex h-16 shrink-0 items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 shadow-sm">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-zinc-500 hover:text-zinc-900"
          >
            <Menu className="size-5" />
            <span className="sr-only">Buka menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-72 gap-0 border-zinc-200 bg-white p-0"
          showCloseButton={false}
        >
          {/* Radix mewajibkan judul untuk pembaca layar. */}
          <SheetTitle className="sr-only">Menu navigasi</SheetTitle>

          {/* Menutup drawer setiap kali sebuah tautan diklik. */}
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2.5">
        <div className="relative size-8 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50">
          <Image src="/images/A.png" alt="Logo Arus" fill sizes="32px" className="object-cover" />
        </div>
        <span className="text-lg font-bold tracking-tight text-zinc-900">Arus.</span>
      </div>
    </header>
  );
}
