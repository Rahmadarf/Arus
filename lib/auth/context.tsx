"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getSession, logout as logoutRequest } from "@/lib/auth/mock";
import type { Session } from "@/lib/auth/types";

type AuthContextValue = {
  session: Session | null;
  /** true selama session pertama kali dibaca. */
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let dibatalkan = false;

    getSession()
      .then((hasil) => {
        if (!dibatalkan) setSession(hasil);
      })
      .finally(() => {
        if (!dibatalkan) setIsLoading(false);
      });

    return () => {
      dibatalkan = true;
    };
  }, []);

  const signOut = useCallback(async () => {
    await logoutRequest();
    setSession(null);
    // replace, bukan push: halaman dashboard tidak boleh bisa diraih lagi
    // lewat tombol Back setelah keluar.
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ session, isLoading, signOut }),
    [session, isLoading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  }
  return context;
}
