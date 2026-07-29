import { createAuthClient } from "better-auth/react";

// Export hook dan fungsi bawaan yang akan dipasang teman Anda di UI
export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
});