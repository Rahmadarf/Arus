import { createElement } from "react";

import { getCategoryIcon } from "@/lib/categories/icons";

/**
 * Merender ikon kategori dari namanya.
 *
 * Memakai createElement, bukan `const Icon = getCategoryIcon(name)` lalu
 * `<Icon />`: pola itu terbaca oleh React Compiler sebagai komponen yang dibuat
 * saat render. Di sini komponennya tidak dibuat — hanya diambil dari peta statis
 * di lib/categories/icons.ts — tapi menulisnya seperti ini membuat maksudnya
 * jelas bagi pembaca maupun linter.
 */
export function CategoryIcon({ name, className }: { name?: string; className?: string }) {
  return createElement(getCategoryIcon(name), { className });
}
