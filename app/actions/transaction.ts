"use server"


import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { success } from "better-auth";


export async function createTransaction(formData: FormData) {
  try {
    // 1. Mengambil Sesi User yang login dari Better Auth.
    // const session = await auth.api.getSession({
    //   headers: await headers(),
    // });

    // // Return jika user belum login.
    // if (!session || !session.user) {
    //   return { success: false, error: "Denied! You are not authorized!" }
    // }

    const userId = "id-user-testing-rahmad-123"

    // 2. Mengambil dan Membersihkan Input dari Form.
    const type = formData.get('type') as string;
    const amountStr = formData.get('amount') as string;
    const categoryName = formData.get('category') as string;
    const description = formData.get('description') as string;

    // Return jika field tidak di isi user.
    if (!type || !amountStr || !categoryName) {
      return { succes: false, error: "Missing required field!" }
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return { succes: false, error: "Invalid Amount!" }
    }

    // 3. Cari id kategori custom milik user berdasarkan nama.
    let category = await prisma.category.findFirst({
      where: {
        name: categoryName.toLocaleLowerCase().trim(),
        type: type,
        userId: userId
      },
    });

    // Jika kategori tersebut belum ada di tabel Category milik user, 
    // otomatis buatkan secara instan agar transaksi tidak gagal simpan
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName.toLocaleLowerCase().trim(),
          type: type,
          userId: userId,
        },
      });
    }

    // 4. Simpan Transaksi dengan Mengikat userId dan categoryId yang Valid
    await prisma.transaction.create({
      data: {
        amount,
        type,
        description: description || null,
        userId: userId,
        categoryId: category.id
      }
    })


    // 5. Perbarui cache visual Next.js halaman dashboard
    revalidatePath("/");

    return { success: true }
  } catch (e) {
    console.error("Error Backend Transaction", e);
    return { success: false, error: "An internal error occurred on the database server." }
  }
}


export async function getTransactionByUserId(userId: String) {
  try {
    const transaction = await prisma.transaction.findMany({
      where: {
        userId: String(userId)
      },
      include: {
        category: true
      },
      //Urutkan dari yang terbaru
      orderBy: {
        createdAt: "desc"
      }
    })
    return transaction
  } catch (e) {
    console.error("Error fetching transaction", e)
    return [];
  }
}


export async function deleteTransaction(transactionId: string) {
  try {
    if (!transactionId) {
      return { succes: false, error: "Invalid Transaction ID!" }
    }

    await prisma.transaction.delete({
      where: {
        id: transactionId
      }
    })

    revalidatePath('/');
    revalidatePath('/transaction');

    return { ok: true }
  } catch (error) {
    console.error("Error deleting transaction", error)
    return { ok: false, message: "Internal server error" }
  }
}