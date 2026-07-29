"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Logo } from "@/components/logo";
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

      <Logo size="sm" className="gap-2.5" />
    </header>
  );
}
