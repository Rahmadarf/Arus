import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

/**
 * baseURL diisi eksplisit. Kalau dibiarkan kosong, better-auth menurunkan origin
 * dari header request — di balik proxy atau saat port dev bergeser (3000 dipakai
 * proses lain, Next pindah ke 3001) callback dan cookie mengarah ke host yang
 * salah, dan login tampak "gagal terhubung" tanpa error yang jelas.
 */
const baseURL =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [baseURL],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true, // Mengaktifkan fitur register & login standar lewat email
  },
});
