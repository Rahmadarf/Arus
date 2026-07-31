import Link from "next/link";

import { AuthCta } from "@/components/landing/auth-cta";
import { MobileMenu } from "@/components/landing/mobile-menu";
import { NAV_LINKS } from "@/components/landing/nav-links";
import { Logo } from "@/components/logo";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-zinc-50/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Arus, beranda"
          className="rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Logo size="sm" />
        </Link>

        <nav aria-label="Navigasi halaman" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <AuthCta size="sm" />
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
