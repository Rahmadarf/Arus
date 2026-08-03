// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

// ✨ KUNCI SINKRONISASI: Ekspor objek induk agar dikenali oleh lib/auth/mock.ts
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
});

// Tetap pertahankan ekspor destrukturisasi milik rekan Anda agar UI tidak error [1.4]
export const { signIn, signUp, signOut, useSession } = authClient;
