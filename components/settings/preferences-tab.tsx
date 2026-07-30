"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getPreferences, updatePreferences } from "@/lib/settings/mock";
import { settingsErrorMessage, type AppPreferences } from "@/lib/settings/types";
import { cn } from "@/lib/utils";

/**
 * Diset false karena <ThemeProvider> belum dipasang di app/layout.tsx.
 * Paket next-themes sudah ada di dependency, tapi tanpa provider yang
 * membungkus aplikasi, setTheme tidak mengubah apa pun.
 *
 * Ubah ke true SETELAH provider dipasang DAN warna yang dikunci (bg-white,
 * bg-zinc-50, text-zinc-900) diganti token — kalau tidak, temanya berganti
 * tapi tampilannya tetap terang.
 */
const TEMA_SIAP = false;

const OPSI_TEMA: { value: AppPreferences["theme"]; label: string }[] = [
  { value: "light", label: "Terang" },
  { value: "dark", label: "Gelap" },
  { value: "system", label: "Ikut sistem" },
];

const OPSI_TANGGAL: { value: AppPreferences["dateFormat"]; label: string; contoh: string }[] = [
  { value: "dd/mm/yyyy", label: "Hari/Bulan/Tahun", contoh: "30/07/2026" },
  { value: "mm/dd/yyyy", label: "Bulan/Hari/Tahun", contoh: "07/30/2026" },
];

type Status = "idle" | "menyimpan" | "tersimpan";

export function PreferencesTab() {
  const [prefs, setPrefs] = useState<AppPreferences | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let dibatalkan = false;
    getPreferences().then((hasil) => {
      if (!dibatalkan) setPrefs(hasil);
    });
    return () => {
      dibatalkan = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  /**
   * Tersimpan otomatis saat diubah. Tidak ada tombol Simpan terpisah: untuk
   * dua pilihan sesederhana ini, tombol hanya menambah langkah.
   *
   * Nilai barunya ditampilkan lebih dulu, lalu dikembalikan kalau permintaannya
   * gagal — supaya radio-nya tidak terasa lambat.
   */
  const simpan = async (perubahan: Partial<AppPreferences>) => {
    if (!prefs) return;

    const sebelumnya = prefs;
    setPrefs({ ...prefs, ...perubahan });
    setStatus("menyimpan");

    if (timer.current) clearTimeout(timer.current);

    try {
      const hasil = await updatePreferences(perubahan);
      setPrefs(hasil);
      setStatus("tersimpan");
      timer.current = setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      setPrefs(sebelumnya);
      setStatus("idle");
      toast.error(settingsErrorMessage(error));
    }
  };

  return (
    <Card className="rounded-2xl border-zinc-200 shadow-sm w-full">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-bold text-zinc-900">Preferensi</CardTitle>
            <CardDescription>Perubahan langsung tersimpan.</CardDescription>
          </div>

          <span
            aria-live="polite"
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium transition-opacity",
              status === "idle" ? "opacity-0" : "opacity-100",
              status === "tersimpan" ? "text-emerald-600" : "text-zinc-500"
            )}
          >
            {status === "menyimpan" && <Loader2 className="size-3.5 animate-spin" />}
            {status === "tersimpan" && <Check className="size-3.5" />}
            {status === "menyimpan" ? "Menyimpan" : status === "tersimpan" ? "Tersimpan" : ""}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Tema */}
        <fieldset disabled={!TEMA_SIAP || !prefs} className="space-y-3">
          <legend className="text-sm font-medium text-zinc-700">Tema</legend>

          {!TEMA_SIAP && (
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="w-fit cursor-help text-xs text-zinc-400 underline decoration-dotted">
                  Belum tersedia
                </p>
              </TooltipTrigger>
              <TooltipContent>
                Belum tersedia. Aplikasi ini belum punya theme provider.
              </TooltipContent>
            </Tooltip>
          )}

          <RadioGroup
            value={prefs?.theme ?? "system"}
            onValueChange={(value) => simpan({ theme: value as AppPreferences["theme"] })}
            className="gap-2"
          >
            {OPSI_TEMA.map((opsi) => (
              <div key={opsi.value} className="flex items-center gap-2">
                <RadioGroupItem value={opsi.value} id={`tema-${opsi.value}`} />
                <Label
                  htmlFor={`tema-${opsi.value}`}
                  className={cn(
                    "text-sm font-normal",
                    TEMA_SIAP ? "text-zinc-600" : "text-zinc-400"
                  )}
                >
                  {opsi.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </fieldset>

        {/* Format tanggal */}
        <fieldset disabled={!prefs} className="space-y-3">
          <legend className="text-sm font-medium text-zinc-700">Format tanggal</legend>

          <RadioGroup
            value={prefs?.dateFormat ?? "dd/mm/yyyy"}
            onValueChange={(value) =>
              simpan({ dateFormat: value as AppPreferences["dateFormat"] })
            }
            className="gap-2"
          >
            {OPSI_TANGGAL.map((opsi) => (
              <div key={opsi.value} className="flex items-center gap-2">
                <RadioGroupItem value={opsi.value} id={`tanggal-${opsi.value}`} />
                <Label
                  htmlFor={`tanggal-${opsi.value}`}
                  className="text-sm font-normal text-zinc-600"
                >
                  {opsi.label}
                  <span className="ml-1.5 font-mono text-xs text-zinc-400">
                    {opsi.contoh}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </fieldset>

        {/* Mata uang — teks statis, tanpa dropdown. formatRupiah di
            lib/format.ts mengunci id-ID dan IDR, jadi pilihan lain akan jadi
            kontrol yang tidak melakukan apa pun. */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-zinc-700">Mata uang</p>
          <p className="text-sm text-zinc-600">IDR (Rupiah Indonesia)</p>
          <p className="text-xs text-zinc-400">Mata uang lain belum didukung.</p>
        </div>
      </CardContent>
    </Card>
  );
}
