"use client";

import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * LoginForm membaca callbackUrl lewat useSearchParams, yang wajib berada di
 * bawah batas Suspense agar sisa halaman tetap bisa dirender lebih dulu.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFormSkeleton() {
  return (
    <Card className="rounded-2xl border-zinc-200 shadow-sm w-full">
      <CardContent className="space-y-5 py-8">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}
