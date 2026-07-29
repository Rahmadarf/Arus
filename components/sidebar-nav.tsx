"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Tags,
  User,
  Wallet,
} from "lucide-react";

import { AddTransactionModal } from "@/components/add-transaction-modal";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/transactions", label: "Transactions", icon: ArrowUpRight },
  { href: "/categories", label: "Categories", icon: Tags },
];

// Dipakai bersama oleh sidebar desktop dan drawer mobile, jadi tidak ada
// daftar menu yang terduplikat.
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const itemClass = (active: boolean) =>
    cn(
      // 1. Tata Letak & Ukuran Utama
      "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium select-none",
      // 2. Animasi Transisi Halus
      "transition-all duration-200 ease-in-out group active:scale-[0.98]",
      // 3. Logika Warna Ganti (Active vs Inactive)
      active
        ? "bg-zinc-950 text-white shadow-md shadow-zinc-950/10 font-semibold"
        : "text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-900"
    );

  const iconClass = (active: boolean) =>
    cn(
      "w-5 h-5 shrink-0 transition-transform duration-200",
      active
        ? "text-white scale-105"
        : "text-zinc-400 group-hover:text-zinc-900 group-hover:scale-105"
    );

  return (
    <div className="flex h-full flex-col">
      <div className="h-20 flex items-center gap-3 px-6 border-b border-zinc-100 shrink-0">
        <div className="w-9 h-9 shrink-0 relative overflow-hidden rounded-xl bg-zinc-50 border border-zinc-100">
          <Image
            src="/images/A.png"
            alt="Logo Arus"
            fill
            sizes="36px"
            className="object-cover"
            priority
          />
        </div>

        <div className="flex flex-col justify-center">
          <span className="font-bold text-xl tracking-tight text-zinc-900 leading-none">
            Arus.
          </span>
          <span className="text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-wider">
            Finance Tracker
          </span>
        </div>
      </div>

      <nav className="flex-1 flex flex-col px-4 py-6 overflow-y-auto justify-between">
        <div className="flex flex-col gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                href={link.href}
                key={link.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={itemClass(active)}
              >
                <link.icon className={iconClass(active)} />
                <span className="tracking-tight">{link.label}</span>
              </Link>
            );
          })}

          <div className="px-4 pt-5 pb-2">
            <AddTransactionModal />
          </div>
        </div>

        <div
          className={cn(
            "w-full p-4 flex flex-col gap-1 mt-auto",
            "border-t border-zinc-100 bg-white rounded-b-2xl"
          )}
        >
          <Link
            href="/settings"
            onClick={onNavigate}
            aria-current={isActive("/settings") ? "page" : undefined}
            className={itemClass(isActive("/settings"))}
          >
            <User className={iconClass(isActive("/settings"))} />
            <span className="tracking-tight">Settings</span>
          </Link>

          <button
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium select-none",
              "transition-all duration-200 ease-in-out group active:scale-[0.98]",
              // Sentuhan UX Destructive: aksen Rose yang halus
              "text-zinc-500 hover:bg-rose-50 hover:text-rose-600"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:text-rose-600 group-hover:scale-105" />
            <span className="tracking-tight">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
