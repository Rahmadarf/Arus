"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from "@/components/ui/select";

export function AddTransactionModal() {
    const [open, setOpen] = useState(false);

    // Fungsi penanganan submit sementara untuk MVP
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Transaksi berhasil dicatat! (Fungsi MVP)");
        setOpen(false); // Otomatis menutup modal setelah simpan
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* 1. TOMBOL PEMICU DI SIDEBAR */}
            <DialogTrigger asChild>
                <Button className="w-full flex items-center justify-center gap-2 bg-zinc-950 text-white hover:bg-zinc-900 rounded-xl py-6 text-sm font-semibold shadow-md active:scale-[0.98] transition-all">
                    <Plus className="w-4 h-4 stroke-3" />
                    <span>Transaksi Baru</span>
                </Button>
            </DialogTrigger>

            {/* 2. JENDELA FORM POP-UP */}
            <DialogContent className="sm:max-w-[425px] rounded-2xl p-6 border-zinc-150 bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-zinc-900">Catat Arus Kas</DialogTitle>
                    <DialogDescription className="text-zinc-500 text-sm">
                        Masukkan detail pemasukan atau pengeluaran keuangan Anda di sini.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    {/* Input Tipe Transaksi */}
                    <div className="space-y-2">
                        <Label htmlFor="type" className="text-sm font-medium text-zinc-700">Tipe Arus Kas</Label>
                        <Select required>
                            <SelectTrigger id="type" className="rounded-xl border-zinc-200">
                                <SelectValue placeholder="Pilih tipe..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="INCOME" className="text-emerald-600 font-medium">Pemasukan (+)</SelectItem>
                                <SelectItem value="EXPENSE" className="text-rose-600 font-medium">Pengeluaran (-)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Input Nominal */}
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-sm font-medium text-zinc-700">Nominal Uang (Rp)</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="Contoh: 50000"
                            required
                            className="rounded-xl border-zinc-200"
                        />
                    </div>

                    {/* Input Kategori */}
                    <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium text-zinc-700">Kategori</Label>
                        <Select required>
                            <SelectTrigger id="category" className="rounded-xl border-zinc-200">
                                <SelectValue placeholder="Pilih kategori..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="gaji">Gaji / Pendapatan</SelectItem>
                                <SelectItem value="makanan">Makanan & Minuman</SelectItem>
                                <SelectItem value="transportasi">Transportasi</SelectItem>
                                <SelectItem value="hiburan">Hiburan / Hiburan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Input Deskripsi Catatan */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-zinc-700">Catatan Ringkas</Label>
                        <Input
                            id="description"
                            placeholder="Beli kopi susu, bonus projek, dll"
                            className="rounded-xl border-zinc-200"
                        />
                    </div>

                    {/* Tombol Aksi Kirim */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="rounded-xl"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="bg-zinc-950 text-white hover:bg-zinc-900 rounded-xl px-5"
                        >
                            Simpan Catatan
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
