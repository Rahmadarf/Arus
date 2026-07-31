import { AuthCta } from "@/components/landing/auth-cta";
import { PREVIEW_CAPTION, ProductPreview } from "@/components/landing/product-preview";

export function Hero() {
  return (
    <section aria-labelledby="hero-judul" className="py-12 sm:py-16 lg:py-20">
      <h1
        id="hero-judul"
        className="max-w-3xl text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl"
      >
        Catat pemasukan dan pengeluaran, lihat ke mana uangmu pergi.
      </h1>

      <p className="mt-4 max-w-xl text-base text-zinc-500 sm:text-lg">
        Untuk kamu yang sudah rajin menabung tapi tetap bingung uangnya habis ke mana.
        Arus mencatat setiap transaksi, lalu memecahnya per kategori supaya polanya
        kelihatan.
      </p>

      <AuthCta size="lg" className="mt-8" />

      {/* Pratinjau dekoratif: aria-hidden supaya pembaca layar tidak menyusuri
          tabel palsu, lalu isinya diringkas sebagai teks di bawahnya. */}
      <div className="mt-12" aria-hidden>
        <ProductPreview />
      </div>

      <p className="mt-3 text-sm text-zinc-500">{PREVIEW_CAPTION}</p>
    </section>
  );
}
