// lib/prisma.ts
import PrismaClientModule from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// 🌟 BEBAS IMPOR: Gunakan any sementara pada globalThis agar compiler tidak mencari tipe PrismaClient mentah [1.4]
const globalForPrisma = globalThis as unknown as { prisma: any };

let prismaInstance: any;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  // Inisialisasi pool koneksi database PostgreSQL secara manual melalui driver adapter
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  
  // 🌟 SINKRONISASI TOTAL: Panggil constructor resmi dari dalam objek modul utama Anda!
  prismaInstance = new PrismaClientModule.PrismaClient({ adapter });
}

// Ekspor instance utama yang akan dikonsumsi oleh seluruh Server Actions proyek Anda
export const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
