import { CategoriesView } from "@/components/categories/categories-view";
import { parseCategoryType } from "@/lib/categories/types";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Next 16: searchParams adalah Promise, wajib di-await.
  const params = await searchParams;

  // Param kosong atau tidak valid jatuh ke 'expense'.
  const type = parseCategoryType(params.type);

  // CategoriesProvider TIDAK dipasang lagi di sini. Ia sudah membungkus seluruh
  // dashboard di app/(dashboard)/layout.tsx; provider kedua di halaman ini
  // membuat store terpisah yang mengambil data kategori untuk kedua kalinya,
  // dan mutasi di satu store tidak terlihat oleh store yang lain.
  return <CategoriesView type={type} />;
}
