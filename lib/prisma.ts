// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

/**
 * Klien Prisma tunggal, aman terhadap hot-reload.
 *
 * Cache-nya DIKUNCI KE CONNECTION STRING, bukan hanya ke globalThis. Alasannya
 * pahit: pg.Pool dibuat sekali lalu hidup selamanya lintas hot-reload, jadi
 * kalau DATABASE_URL berubah — atau pool sempat terbentuk sebelum .env termuat —
 * pool basi itu terus dipakai dan setiap kueri gagal ECONNREFUSED sampai server
 * dev dimatikan. Menyimpan URL-nya membuat perubahan itu terdeteksi.
 */
type PrismaCache = {
  client: PrismaClient;
  pool: pg.Pool;
  url: string;
};

const globalForPrisma = globalThis as unknown as {
  prismaCache: PrismaCache | undefined;
};

function buatKlien(url: string): PrismaCache {
  const pool = new pg.Pool({
    connectionString: url,
    // Serverless dan hot-reload gampang meninggalkan koneksi menganggur.
    // Batas ini menjaga kuota koneksi Supabase tidak habis.
    max: 5,
    idleTimeoutMillis: 30_000,
    // Tanpa batas ini, database yang tidak menjawab akan menggantung request
    // sampai timeout bawaan Node — pengguna hanya melihat halaman diam.
    connectionTimeoutMillis: 10_000,
  });

  // Pooler Supabase memutus koneksi menganggur. Tanpa handler ini, error pada
  // koneksi idle naik menjadi uncaught exception dan mematikan proses Node.
  pool.on("error", (error) => {
    console.error("[prisma] koneksi menganggur bermasalah:", error.message);
  });

  return { client: new PrismaClient({ adapter: new PrismaPg(pool) }), pool, url };
}

function ambilKlien(): PrismaClient {
  const url = process.env.DATABASE_URL;

  // pg.Pool menerima connectionString undefined tanpa protes, lalu diam-diam
  // menyambung ke localhost:5432. Kegagalannya jadi tampak seperti masalah
  // jaringan, padahal env-nya yang belum termuat.
  if (!url) {
    throw new Error(
      "DATABASE_URL belum diset. Periksa berkas .env, lalu jalankan ulang server."
    );
  }

  const cache = globalForPrisma.prismaCache;

  if (cache) {
    if (cache.url === url) return cache.client;

    // URL berganti: pool lama sudah menunjuk ke database yang salah.
    void cache.pool.end().catch(() => {});
  }

  const baru = buatKlien(url);
  if (process.env.NODE_ENV !== "production") globalForPrisma.prismaCache = baru;
  return baru.client;
}

export const prisma = ambilKlien();
