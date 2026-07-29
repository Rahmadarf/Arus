"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Input password dengan tombol lihat/sembunyikan.
 *
 * Menerima `ref` sebagai prop biasa (React 19), jadi bisa langsung menerima
 * hasil spread dari register() milik react-hook-form.
 */
export function PasswordField({ className, ...props }: React.ComponentProps<"input">) {
  const [terlihat, setTerlihat] = useState(false);

  return (
    <div className="relative">
      <Input
        type={terlihat ? "text" : "password"}
        className={cn("rounded-xl border-zinc-200 pr-10", className)}
        {...props}
      />

      <button
        type="button"
        onClick={() => setTerlihat((nilai) => !nilai)}
        // Tombol ini tidak boleh ikut urutan Tab di antara field — pengguna
        // keyboard yang mengetik password jarang ingin mampir ke sini.
        tabIndex={-1}
        disabled={props.disabled}
        aria-label={terlihat ? "Sembunyikan password" : "Tampilkan password"}
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-400 transition-colors hover:text-zinc-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {terlihat ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
