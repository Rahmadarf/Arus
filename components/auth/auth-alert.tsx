import { TriangleAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Galat dari server tampil di sini, di atas form — bukan sebagai toast.
 * Toast menghilang sendiri sebelum pengguna selesai membaca, sementara pesan
 * gagal masuk perlu tetap terlihat sambil mereka mengetik ulang.
 */
export function AuthAlert({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <Alert variant="destructive" role="alert" className="rounded-xl">
      <TriangleAlert className="size-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
