"use server"


import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId, requireUserId } from "@/lib/auth/session";
import { lemparUlangKalauKontrolNext } from "@/lib/next-errors";

export { getAuthenticatedUserId };


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

    const userId = await getAuthenticatedUserId()

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
  } catch (e: any) {
    console.error("Error Backend Transaction", e);
    return { success: false, error: "An internal error occurred on the database server." }
  }
}


export async function getTransactionByUserId() {
  try {
    const userId = await getAuthenticatedUserId()
    const transaction = await prisma.transaction.findMany({
      where: {
        userId: userId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      //Urutkan dari yang terbaru
      orderBy: {
        createdAt: "desc"
      }
    })
    return transaction
  } catch (e: any) {
    console.error("Error fetching transaction", e)
    return [];
  }
}


export async function deleteTransaction(transactionId: string) {
  try {
    const userId = await getAuthenticatedUserId()

    if (!transactionId) {
      return { succes: false, error: "Invalid Transaction ID!" }
    }

    await prisma.transaction.delete({
      where: {
        id: transactionId,
        userId: userId
      }
    })

    revalidatePath('/');
    revalidatePath('/transaction');

    return { ok: true }
  } catch (error: any) {
    console.error("Error deleting transaction", error)
    return { ok: false, message: "Internal server error" }
  }
}

/**
 * 📥 AMBIL TRANSAKSI DENGAN FILTER & PAGING SQL MURNI
 * Mengambil daftar transaksi dengan filter keyword/tipe/kategori dan paging di tingkat database untuk performa optimal.
 * @param {object} args - Parameter filter dan paging.
 * @param {string} args.search - Kata kunci pencarian pada deskripsi (kosong = semua).
 * @param {"ALL" | "INCOME" | "EXPENSE"} args.type - Filter tipe transaksi.
 * @param {string} args.category - Nama kategori (atau "ALL").
 * @param {number} args.page - Halaman saat ini (1-based).
 * @param {number} args.pageSize - Jumlah baris per halaman.
 * @returns {Promise<{rows: any[], total: number, totalAll: number}>} Baris pada halaman ini, jumlah hasil filter, dan total semua.
 */
// 🚀 OPTIMASI: Filter + paging dilakukan di SQL, bukan JavaScript
export async function getTransactionsPaginated({
  search,
  type,
  category,
  page,
  pageSize,
}: {
  search: string;
  type: "ALL" | "INCOME" | "EXPENSE";
  category: string;
  page: number;
  pageSize: number;
}) {
  try {
    // requireUserId, bukan getAuthenticatedUserId: fungsi ini dipanggil saat
    // halaman /transactions dirender, bukan sebagai mutasi. Sesi basi harus
    // mengalihkan ke /login, bukan menghasilkan tabel kosong yang terbaca
    // seperti "Anda belum punya transaksi".
    const userId = await requireUserId();

    const where: any = { userId };
    if (search.trim()) {
      where.description = { contains: search.trim(), mode: "insensitive" };
    }
    if (type !== "ALL") {
      where.type = type;
    }
    if (category !== "ALL") {
      where.category = { name: { equals: category, mode: "insensitive" } };
    }

    const [rows, total, totalAll] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.transaction.count({ where }),
      prisma.transaction.count({ where: { userId } }),
    ]);

    return { rows, total, totalAll };
  } catch (e: any) {
    // redirect() milik requireUserId lewat sini sebagai exception. Tanpa baris
    // ini ia ditelan, pengalihan ke /login tidak pernah terjadi, dan pengguna
    // melihat tabel kosong.
    lemparUlangKalauKontrolNext(e);

    console.error("Error fetching transactions paginated", e);
    return { rows: [], total: 0, totalAll: 0 };
  }
}