"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { PasswordField } from "@/components/auth/password-field";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_REDIRECT } from "@/lib/auth/callback-url";
import { register as registerAccount } from "@/lib/auth/mock";
import { authErrorMessage } from "@/lib/auth/types";

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama minimal 2 karakter.")
      .max(50, "Nama maksimal 50 karakter."),
    email: z.email({ message: "Masukkan alamat email yang valid." }),
    password: z.string().min(8, "Password minimal 8 karakter."),
    confirmPassword: z.string().min(1, "Ulangi password Anda."),
    agree: z.boolean(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    // Ditempelkan ke field konfirmasi, bukan ke akar form, supaya pesannya
    // muncul tepat di bawah kolom yang harus diperbaiki.
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama.",
  })
  .refine((values) => values.agree, {
    path: ["agree"],
    message: "Centang persetujuan untuk melanjutkan.",
  });

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, control, setValue, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", agree: false },
  });

  const { errors, isSubmitting } = formState;
  const passwordValue = useWatch({ control, name: "password" });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);

    try {
      // register() sekaligus membuat session, jadi tidak perlu login ulang.
      await registerAccount(data.name, data.email, data.password);
      router.replace(DEFAULT_REDIRECT);
    } catch (error) {
      setServerError(authErrorMessage(error));
    }
  });

  return (
    <Card className="rounded-2xl border-zinc-200 shadow-sm w-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-zinc-900">Buat akun Arus</CardTitle>
        <CardDescription>Mulai catat pemasukan dan pengeluaran Anda.</CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={onSubmit}
          onChange={() => setServerError(null)}
          className="space-y-5"
          noValidate
        >
          <AuthAlert message={serverError} />

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-zinc-700">
              Nama
            </Label>
            <Input
              id="name"
              autoComplete="name"
              autoFocus
              placeholder="Nama lengkap Anda"
              disabled={isSubmitting}
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
              placeholder="nama@email.com"
              disabled={isSubmitting}
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

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
              Password
            </Label>
            <PasswordField
              id="password"
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            <PasswordStrengthMeter password={passwordValue} />
            {errors.password && (
              <p id="password-error" role="alert" className="text-sm font-medium text-rose-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700">
              Konfirmasi Password
            </Label>
            <PasswordField
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Ulangi password"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p id="confirm-error" role="alert" className="text-sm font-medium text-rose-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Checkbox
                id="agree"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.agree)}
                aria-describedby={errors.agree ? "agree-error" : undefined}
                onCheckedChange={(checked) =>
                  setValue("agree", checked === true, { shouldValidate: true })
                }
                className="mt-0.5"
              />
              <Label htmlFor="agree" className="text-sm font-normal leading-snug text-zinc-600">
                Saya setuju dengan{" "}
                <Link href="/ketentuan" className="font-medium text-zinc-900 hover:underline">
                  Ketentuan
                </Link>{" "}
                dan{" "}
                <Link href="/privasi" className="font-medium text-zinc-900 hover:underline">
                  Kebijakan Privasi
                </Link>
                .
              </Label>
            </div>
            {errors.agree && (
              <p id="agree-error" role="alert" className="text-sm font-medium text-rose-600">
                {errors.agree.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 w-full rounded-xl bg-zinc-950 text-white hover:bg-zinc-900"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Membuat akun" : "Daftar"}
          </Button>

          <p className="text-center text-sm text-zinc-500">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="rounded-sm font-medium text-zinc-900 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Masuk
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
