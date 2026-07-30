"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PasswordField } from "@/components/auth/password-field";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/lib/settings/mock";
import { isSettingsFailure, settingsErrorMessage } from "@/lib/settings/types";

const schema = z
  .object({
    current: z.string().min(1, "Masukkan password Anda saat ini."),
    next: z.string().min(8, "Password baru minimal 8 karakter."),
    confirm: z.string().min(1, "Ulangi password baru."),
  })
  .refine((values) => values.next === values.confirm, {
    path: ["confirm"],
    message: "Konfirmasi password tidak sama.",
  })
  .refine((values) => values.next !== values.current, {
    path: ["next"],
    message: "Password baru harus berbeda dari password saat ini.",
  });

type FormValues = z.infer<typeof schema>;

const KOSONG: FormValues = { current: "", next: "", confirm: "" };

export function SecurityTab() {
  const [galat, setGalat] = useState<string | null>(null);

  const { register, handleSubmit, reset, control, setError, formState } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      mode: "onBlur",
      reValidateMode: "onChange",
      defaultValues: KOSONG,
    });

  const { errors, isSubmitting } = formState;
  const passwordBaru = useWatch({ control, name: "next" });

  const onSubmit = handleSubmit(async (data) => {
    setGalat(null);

    try {
      await changePassword(data.current, data.next);

      // Field dikosongkan setelah berhasil. Membiarkan password baru tertinggal
      // di form berarti ia masih terlihat siapa pun yang lewat di depan layar.
      reset(KOSONG);
      toast.success("Password berhasil diganti.");
    } catch (error) {
      // Password saat ini yang salah ditempelkan ke field-nya sendiri, bukan
      // jadi galat umum — pengguna langsung tahu kolom mana yang harus dibetulkan.
      if (isSettingsFailure(error) && error.code === "WRONG_CURRENT_PASSWORD") {
        setError("current", { message: settingsErrorMessage(error) });
        return;
      }

      setGalat(settingsErrorMessage(error));
    }
  });

  return (
    <Card className="rounded-2xl border-zinc-200 shadow-sm w-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-zinc-900">Keamanan</CardTitle>
        <CardDescription>Ganti password akun Anda.</CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={onSubmit}
          onChange={() => setGalat(null)}
          className="max-w-md space-y-5"
          noValidate
        >
          {galat && (
            <Alert variant="destructive" role="alert" className="rounded-xl">
              <AlertDescription>{galat}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="current" className="text-sm font-medium text-zinc-700">
              Password Saat Ini
            </Label>
            <PasswordField
              id="current"
              autoComplete="current-password"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.current)}
              aria-describedby={errors.current ? "current-error" : undefined}
              {...register("current")}
            />
            {errors.current && (
              <p
                id="current-error"
                role="alert"
                className="text-sm font-medium text-rose-600"
              >
                {errors.current.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="next" className="text-sm font-medium text-zinc-700">
              Password Baru
            </Label>
            <PasswordField
              id="next"
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.next)}
              aria-describedby={errors.next ? "next-error" : undefined}
              {...register("next")}
            />
            {/* Indikator yang sama dengan halaman register. */}
            <PasswordStrengthMeter password={passwordBaru} />
            {errors.next && (
              <p id="next-error" role="alert" className="text-sm font-medium text-rose-600">
                {errors.next.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-sm font-medium text-zinc-700">
              Konfirmasi Password Baru
            </Label>
            <PasswordField
              id="confirm"
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.confirm)}
              aria-describedby={errors.confirm ? "confirm-error" : undefined}
              {...register("confirm")}
            />
            {errors.confirm && (
              <p
                id="confirm-error"
                role="alert"
                className="text-sm font-medium text-rose-600"
              >
                {errors.confirm.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-900"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Mengganti" : "Ganti password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
