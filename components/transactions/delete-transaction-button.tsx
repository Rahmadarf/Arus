"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteTransaction } from "@/app/transactions/actions";

type Props = {
  id: string;
  note: string | null;
  amountLabel: string;
};

export function DeleteTransactionButton({ id, note, amountLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteTransaction(id);
      if (result.ok) setOpen(false);
      else setError(result.message);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Hapus transaksi"
          className="rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-2xl border-zinc-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-zinc-900">
            Hapus transaksi ini?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Transaksi berikut akan dihapus permanen dan tidak bisa dikembalikan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Tampilkan nominal & catatan supaya user tahu persis apa yang dihapus. */}
        <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 px-4 py-3">
          <p className="text-base font-semibold text-zinc-900">{amountLabel}</p>
          <p className="mt-0.5 text-sm text-zinc-500">{note || "Tanpa catatan"}</p>
        </div>

        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} className="h-9 rounded-xl">
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="h-9 rounded-xl bg-rose-600 text-white hover:bg-rose-600/90"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Menghapus" : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
