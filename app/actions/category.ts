"use server"

import { prisma } from "@/lib/prisma";
import { clean } from "better-auth/react";
import { revalidatePath } from "next/cache";
import { success } from "zod";

const testUserId = "id-user-testing-rahmad-123";

interface CategoryInput {
    name: string,
    type: "income" | "expense",
    color: string,
    icon?: string
}

export async function createCategoriesByUserId(input: CategoryInput) {
    try {

        const cleanName = input.name.toLocaleLowerCase().trim();
        const dbType = input.type.toLocaleUpperCase() as "INCOME" | "EXPENSE";

        const existing = await prisma.category.findFirst({
            where:{
                name: cleanName,
                type: dbType,
                userId: testUserId
            }
        })

        if (existing) {
            return { success: false, error: "Category already created!" }
        }

        const created = await prisma.category.create({
            data: {
                name: cleanName,
                type: dbType,
                color: input.color,
                icon: input.icon,
                userId: testUserId
            }
        })

        revalidatePath('/categories');
        return { success: true, data: created }
    } catch (e) {
        console.error("Error creating category", e);
        return { succes: false, error: "An internal error occurred on the database server."}
    }
}


export async function updateCategory(id: string, input: CategoryInput) {
    try {
        
        const dbType = input.type.toLocaleUpperCase() as "INCOME" | "EXPENSE"

        const updated = await prisma.category.update({
            where: { id },
            data: {
                name: input.name.toLocaleLowerCase().trim(),
                color: input.color,
                icon: input.icon,
            }
        })

        revalidatePath('/categories')
        return { success: true, data: updated }
    } catch (e) {
        console.error("Error updating category", e);
        return { success: false, error: "Internal server error" }
    }
}


export async function getCategoriesById() {
    try {
        const dbCategories = await prisma.category.findMany({
            where: {
                userId: testUserId
            },
            orderBy: {
                name: 'asc'
            }
        })

        return { success: true, data: dbCategories }
    } catch (e) {
        console.error('Error get categories', e);
        return { success: false, error: 'Internal server error' }
    }
}


export async function reassignAndDeleteCategory(fromId: string, toId: string) {
    try {
        if (!fromId || !toId) {
            return { success: false, error: "Category ID is required" }
        }

        if (fromId === toId) {
            return { success: false, error: "Category to be moved and moved to must be different" }
        }

        await prisma.$transaction(async (tx) => {

            // Langkah A: Alihkan semua baris transaksi ke ID kategori tujuan yang baru
            await tx.transaction.updateMany({
                where: {
                    categoryId: fromId
                },
                data: {
                    categoryId: toId
                }
            })

            // Langkah B: Hapus kategori lama yang sekarang posisinya sudah kosong murni
            await tx.category.delete({
                where: { id: fromId }
            })
        })

        revalidatePath('/categories');
        revalidatePath('/')
        return { success: true }
    } catch (e) {
        console.error("Error reassign and delete category", e);
        return { success: false, error: "Internal server error" }
    }
}


export async function deleteCategory(id: string) {
    try {
        if (!id) {
            return { success: false, error: "Category ID is required" }
        }

        await prisma.category.delete({
            where: {
                id
            }
        })

        revalidatePath('/categories')
        revalidatePath('/')

        return { success: true }
    } catch (e) {
        console.error("Error deleting category", e);
        return { success: false, error: "Internal server error" }
    }
}