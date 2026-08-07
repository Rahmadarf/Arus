"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeCallbackUrl } from "@/lib/auth/callback-url";
import { login } from "@/lib/auth/mock";
import { authErrorMessage } from "@/lib/auth/types";

const schema = z.object({
  email: z.email({ message: "Masukkan alamat email yang valid." }),
  password: z.string().min(8, "Password minimal 8 karakter."),
  remember: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    // Validasi baru berjalan setelah field ditinggalkan, lalu ikut mengetik.
    // Kalau langsung onChange, pengguna dimarahi sejak huruf pertama.
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "", remember: false },
  });

  const { errors, isSubmitting } = formState;

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);

    try {
      await login(data.email, data.password, data.remember);
      router.replace(safeCallbackUrl(searchParams.get("callbackUrl")));
    } catch (error) {
      setServerError(authErrorMessage(error));
    }
  });

  return (
    <Card className="rounded-2xl border-zinc-200 shadow-sm w-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-zinc-900">Masuk ke Arus</CardTitle>
        <CardDescription>Lanjutkan mencatat arus kas Anda.</CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={onSubmit}
          // Galat server dibersihkan begitu pengguna menyentuh form lagi.
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

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
              Password
            </Label>
            <PasswordField
              id="password"
              autoComplete="current-password"
              placeholder="Password Anda"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            {errors.password && (
              <p id="password-error" role="alert" className="text-sm font-medium text-rose-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                disabled={isSubmitting}
                onCheckedChange={(checked) => setValue("remember", checked === true)}
              />
              <Label htmlFor="remember" className="text-sm font-normal text-zinc-600">
                Ingat saya
              </Label>
            </div>

            <Link
              href="/forgot-password"
              className="rounded-sm text-sm text-zinc-600 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Lupa password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 w-full rounded-xl bg-zinc-950 text-white hover:bg-zinc-900"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Memeriksa" : "Masuk"}
          </Button>

          <p className="text-center text-sm text-zinc-500">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="rounded-sm font-medium text-zinc-900 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Daftar
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
