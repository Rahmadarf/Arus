import Link from "next/link";

import { Logo } from "@/components/logo";

/**
 * Layout auth: tanpa sidebar, tanpa footer besar.
 *
 * Server Component — tidak ada state di sini, hanya kerangka. Form-nya yang
 * menjadi Client Component.
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            aria-label="Arus, ke beranda"
            className="rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Logo size="lg" withTagline />
          </Link>
        </div>

        {children}

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link
            href="/"
            className="rounded-sm transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Kembali ke beranda
          </Link>
        </p>
      </div>
    </div>
  );
}
