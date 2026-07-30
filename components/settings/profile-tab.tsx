"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProfile, updateProfile } from "@/lib/settings/mock";
import { AVATAR_MAX_BYTES, settingsErrorMessage, type UserProfile } from "@/lib/settings/types";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(50, "Nama maksimal 50 karakter."),
  email: z.email({ message: "Masukkan alamat email yang valid." }),
});

type FormValues = z.infer<typeof schema>;

function inisial(nama: string) {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((bagian) => bagian[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileTab() {
  const [profil, setProfil] = useState<UserProfile | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  // Preview lokal saja, hilang saat refresh sampai backend upload siap.
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [galatAvatar, setGalatAvatar] = useState<string | null>(null);
  const inputBerkas = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, control, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { name: "", email: "" },
  });

  const { errors, isSubmitting } = formState;
  const emailSekarang = useWatch({ control, name: "email" });

  useEffect(() => {
    let dibatalkan = false;

    getProfile().then((hasil) => {
      if (dibatalkan) return;
      setProfil(hasil);
      reset({ name: hasil.name, email: hasil.email });
    });

    return () => {
      dibatalkan = true;
    };
  }, [reset]);

  // URL objek harus dilepas, kalau tidak blob-nya menggantung di memori.
  useEffect(() => {
    return () => {
      if (previewAvatar) URL.revokeObjectURL(previewAvatar);
    };
  }, [previewAvatar]);

  const pilihBerkas = (event: React.ChangeEvent<HTMLInputElement>) => {
    const berkas = event.target.files?.[0];
    if (!berkas) return;

    setGalatAvatar(null);

    // Divalidasi di klien sebelum dipratinjau. Backend WAJIB memeriksa ulang —
    // pemeriksaan di klien hanya demi umpan balik cepat, bukan pengamanan.
    if (!berkas.type.startsWith("image/")) {
      setGalatAvatar("Pilih berkas gambar (JPG, PNG, atau WebP).");
      event.target.value = "";
      return;
    }

    if (berkas.size > AVATAR_MAX_BYTES) {
      setGalatAvatar("Ukuran gambar maksimal 2 MB.");
      event.target.value = "";
      return;
    }

    if (previewAvatar) URL.revokeObjectURL(previewAvatar);
    setPreviewAvatar(URL.createObjectURL(berkas));
    event.target.value = "";
  };

  const hapusPreview = () => {
    if (previewAvatar) URL.revokeObjectURL(previewAvatar);
    setPreviewAvatar(null);
    setGalatAvatar(null);
  };

  const onSubmit = handleSubmit(async (data) => {
    setGalat(null);

    try {
      const hasil = await updateProfile(data);
      setProfil(hasil);
      reset({ name: hasil.name, email: hasil.email });
      toast.success("Profil tersimpan.");
    } catch (error) {
      setGalat(settingsErrorMessage(error));
    }
  });

  const emailBerubah = Boolean(profil) && emailSekarang !== profil?.email;
  const sumberAvatar = previewAvatar ?? profil?.avatarUrl ?? undefined;

  return (
    <Card className="rounded-2xl border-zinc-200 shadow-sm w-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-zinc-900">Profil</CardTitle>
        <CardDescription>Nama dan email yang dipakai di akun Anda.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex flex-wrap items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={sumberAvatar} alt="" />
            <AvatarFallback className="bg-zinc-100 text-base font-semibold text-zinc-600">
              {profil ? inisial(profil.name) : "—"}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Input berkas disembunyikan tapi tetap terhubung ke label, jadi
                  masih bisa dicapai keyboard dan dibaca screen reader. */}
              <input
                ref={inputBerkas}
                id="avatar"
                type="file"
                accept="image/*"
                onChange={pilihBerkas}
                className="sr-only"
              />
              <Label
                htmlFor="avatar"
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted focus-within:ring-3 focus-within:ring-ring/50"
              >
                <Upload className="size-4" />
                Ganti gambar
              </Label>

              {previewAvatar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={hapusPreview}
                  aria-label="Buang gambar pilihan"
                  className="rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>

            <p className="text-xs text-zinc-500">JPG, PNG, atau WebP. Maksimal 2 MB.</p>
            {galatAvatar && (
              <p role="alert" className="text-sm font-medium text-rose-600">
                {galatAvatar}
              </p>
            )}
          </div>
        </div>

        {previewAvatar && (
          <Alert className="rounded-xl">
            <Info className="size-4" />
            <AlertDescription>
              Ini pratinjau di perangkat Anda saja. Gambarnya belum diunggah dan akan
              hilang saat halaman dimuat ulang.
            </AlertDescription>
          </Alert>
        )}

        {/* Form nama dan email, terpisah dari avatar dan punya submit sendiri. */}
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {galat && (
            <Alert variant="destructive" role="alert" className="rounded-xl">
              <AlertDescription>{galat}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-zinc-700">
              Nama
            </Label>
            <Input
              id="name"
              autoComplete="name"
              disabled={isSubmitting || !profil}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              className="rounded-xl border-zinc-200"
              {...register("name")}
            />
            {errors.name && (
              <p id="name-error" role="alert" className="text-sm font-medium text-rose-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isSubmitting || !profil}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="rounded-xl border-zinc-200"
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="text-sm font-medium text-rose-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {emailBerubah && (
            <Alert className="rounded-xl">
              <Info className="size-4" />
              <AlertDescription>
                Perubahan email di production akan memerlukan verifikasi ulang — ini
                disimulasikan sebagai sukses langsung untuk keperluan development.
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !profil}
            className="h-10 rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-900"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Menyimpan" : "Simpan perubahan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
