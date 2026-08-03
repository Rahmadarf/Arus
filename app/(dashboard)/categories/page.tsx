import { CategoriesView } from "@/components/categories/categories-view";
import { CategoriesProvider } from "@/lib/categories/store";
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

  return (
    <CategoriesProvider>
      <CategoriesView type={type} />
    </CategoriesProvider>
  );
}
