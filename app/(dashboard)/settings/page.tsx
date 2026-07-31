import { Suspense } from "react";

import { DangerZoneTab } from "@/components/settings/danger-zone-tab";
import { PreferencesTab } from "@/components/settings/preferences-tab";
import { ProfileTab } from "@/components/settings/profile-tab";
import { SecurityTab } from "@/components/settings/security-tab";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { parseSettingsTab } from "@/lib/settings/types";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * Satu route untuk seluruh pengaturan akun. Tidak ada /profile terpisah —
 * bagi pengguna ini satu hal ("akun saya"), dan memecahnya jadi dua route
 * berarti menduplikasi navigasi serta layout untuk konsep yang sama.
 *
 * Server Component: tab aktif dibaca dari searchParams. Isi tiap tab adalah
 * Client Component tersendiri, bukan satu komponen raksasa — form profil tidak
 * perlu ikut dimuat saat pengguna sedang membuka zona bahaya.
 */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const tab = parseSettingsTab(params.tab);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Pengaturan</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Kelola profil, keamanan, dan preferensi akun Anda.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <Suspense fallback={<Skeleton className="h-9 w-full rounded-xl lg:h-40 lg:w-56" />}>
          <SettingsTabs tab={tab} />
        </Suspense>

        <div className="min-w-0 flex-1">
          {tab === "profil" && <ProfileTab />}
          {tab === "keamanan" && <SecurityTab />}
          {tab === "preferensi" && <PreferencesTab />}
          {tab === "zona-bahaya" && <DangerZoneTab />}
        </div>
      </div>
    </div>
  );
}
