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

function ambilKlien(): PrismaClient {
  const url = connectionString();
  const cache = globalForPrisma.prismaCache;

  if (cache) {
    if (cache.connectionString === url) return cache.client;

    // URL berubah: buang pool lama supaya soketnya tidak menggantung.
    void cache.client.$disconnect().catch(() => {});
    void cache.pool.end().catch(() => {});
  }

  const baru = buatKlien(url);

  // Di production modul hanya dievaluasi sekali, tapi cache tetap dipasang agar
  // jalur kodenya identik dengan dev — lebih sedikit kejutan saat deploy.
  globalForPrisma.prismaCache = baru;

  return baru.client;
}

export const prisma = ambilKlien();
