/**
 * Next memakai exception sebagai alur kendali: redirect(), notFound(), dan
 * penandaan "rute ini tidak bisa statis" semuanya dilempar sebagai Error yang
 * membawa properti `digest`.
 *
 * Artinya `catch (e) { return [] }` yang polos bisa menelan sebuah redirect
 * dan membuatnya tidak pernah terjadi — pengguna tetap di halaman yang
 * seharusnya ia tinggalkan. Panggil ini lebih dulu di setiap catch yang
 * membungkus kode Next.
 */
export function lemparUlangKalauKontrolNext(e: unknown): void {
  if (
    e !== null &&
    typeof e === "object" &&
    "digest" in e &&
    typeof (e as { digest: unknown }).digest === "string"
  ) {
    throw e;
  }
}
