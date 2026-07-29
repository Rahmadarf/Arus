"use client";

import { evaluatePassword } from "@/lib/auth/password-strength";
import { cn } from "@/lib/utils";

const WARNA_BAR = {
  kosong: "bg-zinc-200",
  lemah: "bg-rose-500",
  sedang: "bg-amber-500",
  kuat: "bg-emerald-500",
} as const;

const WARNA_TEKS = {
  kosong: "text-zinc-400",
  lemah: "text-rose-600",
  sedang: "text-amber-600",
  kuat: "text-emerald-600",
} as const;

/** Kriteria penilaian ada di lib/auth/password-strength.ts, bukan di sini. */
export function PasswordStrengthMeter({ password }: { password: string }) {
  const { level, label, score, hint } = evaluatePassword(password);

  if (level === "kosong") return null;

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex gap-1.5">
        {[1, 2, 3].map((segmen) => (
          <div
            key={segmen}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              segmen <= score ? WARNA_BAR[level] : "bg-zinc-200"
            )}
          />
        ))}
      </div>

      <p className="text-xs text-zinc-500">
        <span className={cn("font-medium", WARNA_TEKS[level])}>{label}</span>
        {hint && <> — {hint}</>}
      </p>
    </div>
  );
}
