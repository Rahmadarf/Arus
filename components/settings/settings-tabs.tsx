"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SETTINGS_TABS, type SettingsTab } from "@/lib/settings/types";
import { cn } from "@/lib/utils";

/**
 * Navigasi tab. Tab aktif disimpan di URL, bukan state lokal — sama seperti
 * filter di /transactions dan rentang waktu di /statistics, jadi tautan ke
 * sebuah tab bisa dibagikan dan tahan refresh.
 *
 * Vertikal di desktop (kolom kiri ala panel pengaturan), horizontal dan bisa
 * digeser di layar sempit.
 */
export function SettingsTabs({ tab }: { tab: SettingsTab }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pindah = (value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", value);
    router.replace(`/settings?${next.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={tab} onValueChange={pindah} className="lg:w-56 lg:shrink-0">
      <TabsList
        className={cn(
          // Mobile: satu baris yang bisa digeser kalau tidak cukup.
          // overflow-y-hidden wajib menyertainya: CSS memaksa sumbu yang masih
          // visible jadi auto, dan itu memunculkan scrollbar vertikal palsu.
          "w-full justify-start overflow-x-auto overflow-y-hidden",
          // Desktop: tumpukan vertikal. overflow dikembalikan ke visible —
          // overflow-x-auto memaksa overflow-y jadi auto juga, dan itu
          // memunculkan scrollbar vertikal di kolom tab.
          "lg:h-auto lg:w-56 lg:flex-col lg:items-stretch lg:gap-1 lg:overflow-visible lg:bg-transparent lg:p-0"
        )}
      >
        {SETTINGS_TABS.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className={cn(
              "shrink-0",
              "lg:w-full lg:justify-start lg:rounded-xl lg:px-4 lg:py-2.5",
              // Tab zona bahaya diberi aksen rose sejak di navigasi, supaya
              // pengguna tidak masuk ke sana tanpa sadar.
              item.value === "zona-bahaya" &&
                "data-[state=active]:text-rose-600 text-rose-600/70"
            )}
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
