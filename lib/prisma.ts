// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Gunakan any agar compiler global tidak protes saat proses build produksi Vercel berjalan
const globalForPrisma = globalThis as unknown as { prisma: any };

let prismaInstance: any;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  // Inisialisasi pool koneksi database PostgreSQL secara manual melalui driver adapter
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  
  // 🌟 PANGGIL CONSTRUCTOR RESMI: Named export ini adalah satu-satunya standar resmi Prisma
  prismaInstance = new PrismaClient({ adapter });
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
