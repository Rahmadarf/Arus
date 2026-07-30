import { AuthCta } from "@/components/landing/auth-cta";

export function ClosingCta() {
  return (
    <section aria-labelledby="penutup-judul" className="pb-16 pt-4 sm:pb-20">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {/* Garis penanda yang sama dengan footer: emerald untuk pemasukan,
            rose untuk pengeluaran — dua kutub yang jadi inti aplikasi ini. */}
        <div
          aria-hidden
          className="h-px w-full bg-linear-to-r from-chart-1/60 via-border to-chart-2/60"
        />

        <div className="px-6 py-10 text-center sm:px-10 sm:py-12">
          <h2
            id="penutup-judul"
            className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl"
          >
            Mulai dari transaksi pertama
          </h2>
          <p className="mx-auto mt-2 max-w-md text-base text-zinc-500">
            Satu bulan pencatatan sudah cukup untuk melihat polanya.
          </p>

          <AuthCta size="lg" className="mt-6 justify-center" />
        </div>
      </div>
    </section>
  );
}
