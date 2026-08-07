// app/actions/category.ts
"use server"


import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "@/lib/auth/session";

export { getAuthenticatedUserId };

interface CategoryInput {
    name: string,
    type: "income" | "expense",
    color: string,
    icon?: string
}

/**
 * ➕ TAMBAH KATEGORI BARU
 * Membuat kategori baru milik pengguna aktif setelah memastikan tidak ada nama duplikat.
 * @param {CategoryInput} input - Data kategori baru (nama, tipe, warna, ikon).
 * @returns {Promise<{success: boolean, data?: any, error?: string}>} Status operasi beserta data kategori atau pesan kesalahan.
 */
export async function createCategoriesByUserId(input: CategoryInput) {
    try {
        const cleanName = input.name.toLowerCase().trim();
        const dbType = input.type.toUpperCase() as "INCOME" | "EXPENSE";

        const userId = await getAuthenticatedUserId()

        const existing = await prisma.category.findFirst({
            where: {
                name: cleanName,
                type: dbType,
                userId: userId
            }
        })

        if (existing) {
            return { success: false, error: "Kategori tersebut sudah pernah dibuat!" }
        }

        const created = await prisma.category.create({
            data: {
                name: cleanName,
                type: dbType,
                color: input.color,
                icon: input.icon || null,
                userId: userId
            }
        })

        revalidatePath('/categories');
        return { success: true, data: created }
    } catch (e: any) {
        console.error("Error creating category", e);
        return { success: false, error: e.message || "Terjadi kesalahan internal pada server database." }
    }
}

/**
 * ✏️ UBAH KATEGORI
 * Memperbarui nama, warna, dan ikon kategori berdasarkan ID dengan validasi kepemilikan pengguna.
 * @param {string} id - ID kategori yang akan diperbarui.
 * @param {CategoryInput} input - Data kategori terbaru.
 * @returns {Promise<{success: boolean, data?: any, error?: string}>} Status operasi beserta data kategori yang diperbarui.
 */
export async function updateCategory(id: string, input: CategoryInput) {
    try {
        const userId = await getAuthenticatedUserId()

        const updated = await prisma.category.update({
            where: {
                id,
                userId // Filter pemilik: hanya pemilik asli yang bisa mengubah
            },
            data: {
                name: input.name.toLowerCase().trim(),
                color: input.color,
                icon: input.icon || null,
            }
        })

        revalidatePath('/categories')
        return { success: true, data: updated }
    } catch (e: any) {
        console.error("Error updating category", e);
        return { success: false, error: "Gagal memperbarui data kategori." }
    }
}

/**
 * 📥 AMBIL DAFTAR KATEGORI MILIK PENGGUNA AKTIF
 * Mengambil seluruh kategori yang dimiliki pengguna login, diurutkan berdasarkan nama.
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>} Status operasi beserta daftar kategori.
 */
export async function getCategoriesById() {
    try {
        const userId = await getAuthenticatedUserId()
        const dbCategories = await prisma.category.findMany({
            where: {
                userId: userId // Filter eksklusif milik akun aktif
            },
            orderBy: {
                name: 'asc'
            },
            select: {
                id: true,
                name: true,
                type: true,
                color: true,
                icon: true,
                _count: {
                    select: {
                        transactions: true
                    }
                }
            }
        })

        return { success: true, data: dbCategories }
    } catch (e: any) {
        console.error('Error get categories', e);
        return { success: false, error: 'Gagal mengambil data dari database.' }
    }
}

/**
 * 🔄 PINDAHKAN TRANSAKSI & HAPUS KATEGORI
 * Memindahkan seluruh transaksi dari kategori asal ke kategori tujuan, lalu menghapus kategori asal dalam satu transaksi atomik.
 * @param {string} fromId - ID kategori asal yang akan dihapus.
 * @param {string} toId - ID kategori tujuan penerima transaksi.
 * @returns {Promise<{success: boolean, error?: string}>} Status operasi.
 */
export async function reassignAndDeleteCategory(fromId: string, toId: string) {
    try {
        if (!fromId || !toId) {
            return { success: false, error: "ID Kategori wajib diisi!" }
        }

        if (fromId === toId) {
            return { success: false, error: "Kategori asal dan tujuan tidak boleh sama!" }
        }

        // Validasi sesi aktif untuk keamanan berlapis
        const userId = await getAuthenticatedUserId()

        await prisma.$transaction(async (tx: any) => {
            // Langkah A: Alihkan transaksi ke kategori tujuan
            await tx.transaction.updateMany({
                where: {
                    categoryId: fromId,
                    userId: userId // Kunci keamanan finansial
                },
                data: {
                    categoryId: toId
                }
            })

            // Langkah B: Hapus kategori lama yang kini kosong
            await tx.category.delete({
                where: {
                    id: fromId,
                    userId: userId
                }
            })
        })

        revalidatePath('/categories');
        revalidatePath('/')
        return { success: true }
    } catch (e: any) {
        console.error("Error reassign and delete category", e);
        return { success: false, error: "Gagal memproses pengalihan data transaksi keuangan." }
    }
}

/**
 * 🗑️ HAPUS KATEGORI KOSONG LANGSUNG
 * Menghapus kategori yang tidak lagi memiliki transaksi milik pengguna aktif.
 * @param {string} id - ID kategori yang akan dihapus.
 * @returns {Promise<{success: boolean, error?: string}>} Status operasi.
 */
export async function deleteCategoryAction(id: string) {
    try {
        if (!id) {
            return { success: false, error: "ID Kategori wajib diisi!" }
        }

        // Proteksi: pastikan pengguna hanya menghapus miliknya sendiri
        const userId = await getAuthenticatedUserId()

        await prisma.category.delete({
            where: {
                id,
                userId // Cegah manipulasi ID lintas akun
            }
        })

        revalidatePath('/categories')
        revalidatePath('/')

        return { success: true }
    } catch (e: any) {
        console.error("Error deleting category", e);
        return { success: false, error: "Gagal menghapus kategori dari database." }
    }
}