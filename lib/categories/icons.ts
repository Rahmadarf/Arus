import {
  Car,
  Film,
  Gift,
  Heart,
  Receipt,
  ShoppingBag,
  Tag,
  TrendingUp,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * Daftar ikon yang boleh dipakai kategori. Sengaja dibatasi, bukan mengimpor
 * seluruh lucide secara dinamis — impor dinamis akan menyeret ribuan ikon ke
 * dalam bundle demi belasan yang benar-benar terpakai.
 */
export const CATEGORY_ICONS = {
  utensils: { label: "Makanan", Icon: Utensils },
  car: { label: "Kendaraan", Icon: Car },
  "shopping-bag": { label: "Belanja", Icon: ShoppingBag },
  receipt: { label: "Tagihan", Icon: Receipt },
  film: { label: "Hiburan", Icon: Film },
  heart: { label: "Kesehatan", Icon: Heart },
  wallet: { label: "Dompet", Icon: Wallet },
  gift: { label: "Hadiah", Icon: Gift },
  "trending-up": { label: "Investasi", Icon: TrendingUp },
  tag: { label: "Umum", Icon: Tag },
} as const;

export type CategoryIconName = keyof typeof CATEGORY_ICONS;

export const CATEGORY_ICON_OPTIONS = Object.entries(CATEGORY_ICONS).map(
  ([value, { label }]) => ({ value, label })
);

/** Ikon tanpa nama, atau nama yang tidak dikenal, jatuh ke Tag. */
export function getCategoryIcon(name?: string): LucideIcon {
  if (name && name in CATEGORY_ICONS) {
    return CATEGORY_ICONS[name as CategoryIconName].Icon;
  }
  return Tag;
}
