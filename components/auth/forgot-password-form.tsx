"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/auth/mock";
import { authErrorMessage } from "@/lib/auth/types";

const schema = z.object({
  email: z.email({ message: "Masukkan alamat email yang valid." }),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [terkirim, setTerkirim] = useState(false);

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { email: "" },
  });

  const { errors, isSubmitting } = formState;

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);

    try {
      await requestPasswordReset(data.email);

      // Jangan bocorkan apakah email terdaftar — itu memungkinkan enumerasi
      // akun. Pesannya sama persis untuk email yang ada maupun tidak, dan
      // backend harus berperilaku sama: selalu 200, tanpa USER_NOT_FOUND.
      setTerkirim(true);
    } catch (error) {
      // Hanya kegagalan teknis yang ditampilkan, bukan hasil pencarian akun.
      setServerError(authErrorMessage(error));
    }
  });

  if (terkirim) {
    return (
      <Card className="rounded-2xl border-zinc-200 shadow-sm w-full">
        <CardContent className="flex flex-col items-center px-6 py-12 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50">
            <MailCheck className="size-5 text-emerald-600" />
          </div>
          <p className="mt-4 text-sm font-semibold text-zinc-900">Cek email Anda</p>
          <p className="mt-1 max-w-sm text-sm text-zinc-500">
            Kalau email tersebut terdaftar, tautan untuk mengatur ulang password sudah
            dikirim. Tautannya berlaku 1 jam.
          </p>
          <Button variant="outline" className="mt-5 h-9 rounded-xl" asChild>
            <Link href="/login">Kembali ke halaman masuk</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-zinc-200 shadow-sm w-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-zinc-900">Lupa password</CardTitle>
        <CardDescription>
          Masukkan email Anda, kami kirimkan tautan untuk mengatur ulang.
        </CardDescription>
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
            <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
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

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 w-full rounded-xl bg-zinc-950 text-white hover:bg-zinc-900"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Mengirim" : "Kirim tautan reset"}
          </Button>

          <p className="text-center text-sm text-zinc-500">
            Ingat password Anda?{" "}
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
