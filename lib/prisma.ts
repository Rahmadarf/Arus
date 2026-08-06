// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

/**
 * Klien Prisma tunggal untuk seluruh proses.
 *
 * Kenapa di-cache di globalThis: `next dev` mengevaluasi ulang modul ini setiap
 * hot reload. Tanpa cache, setiap reload membuat pool baru dan koneksi lama
 * tidak pernah ditutup — beberapa menit menyunting berkas sudah cukup untuk
 * menghabiskan jatah koneksi Supabase.
 *
 * Kenapa cache-nya dikunci ke connection string: cache versi sebelumnya hanya
 * menyimpan klien tanpa mencatat URL asalnya. Begitu DATABASE_URL di .env
 * berubah (atau modul ini sempat dievaluasi sebelum .env termuat, sehingga pool
 * jatuh ke default pg — localhost:5432), pool basi itu bertahan selamanya dan
 * SEMUA query gagal ECONNREFUSED sampai server dev dimatikan. Di UI gejalanya
 * muncul sebagai "Gagal terhubung ke server", padahal database sehat.
 */
type PrismaCache = {
  client: PrismaClient;
  pool: pg.Pool;
  /** URL yang dipakai saat pool dibuat, jadi perubahan .env bisa dideteksi. */
  connectionString: string;
};

const globalForPrisma = globalThis as unknown as {
  prismaCache: PrismaCache | undefined;
};

function connectionString(): string {
  const url = process.env.DATABASE_URL;

  // Gagal keras dan jelas. `new pg.Pool({ connectionString: undefined })` tidak
  // melempar apa pun — ia diam-diam menyambung ke localhost:5432 dan baru
  // meledak saat query pertama, dengan pesan yang tidak menyebut penyebabnya.
  if (!url) {
    throw new Error(
      "DATABASE_URL belum diset. Isi di .env lalu jalankan ulang `npm run dev`."
    );
  }

  return url;
}

function buatKlien(url: string): PrismaCache {
  const pool = new pg.Pool({
    connectionString: url,
    // Supabase memakai pooler bersama; puluhan koneksi menganggur dari satu
    // proses dev akan menghabiskan kuota proyek.
    max: 5,
    idleTimeoutMillis: 30_000,
    // Tanpa batas ini, request menggantung tanpa akhir kalau pooler tidak
    // menjawab — di UI terlihat sebagai tombol yang berputar selamanya.
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
  });

  // Koneksi menganggur bisa diputus sepihak oleh pooler. Tanpa handler ini,
  // 'error' pada pool tak tertangani akan mematikan proses Node.
  pool.on("error", (error) => {
    console.error("[prisma] koneksi pool idle terputus:", error.message);
  });

  return {
    pool,
    client: new PrismaClient({ adapter: new PrismaPg(pool) }),
    connectionString: url,
  };
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
