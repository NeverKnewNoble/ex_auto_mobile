import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loadApiBase, loadSession, login as loginService, logout as logoutService } from "@/services";
import type { AuthUser, LoginCredentials } from "@/types/auth";

interface SessionValue {
  user: AuthUser | null;
  isAuthed: boolean;
  /** True until the stored session has been read from secure storage on boot. */
  booting: boolean;
  signIn: (creds: LoginCredentials) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    // Restore the saved site URL before any call, then the session.
    loadApiBase()
      .then(() => loadSession())
      .then((s) => setUser(s?.user ?? null))
      .finally(() => setBooting(false));
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      user,
      isAuthed: !!user,
      booting,
      signIn: async (creds) => {
        const u = await loginService(creds);
        setUser(u);
        return u;
      },
      signOut: async () => {
        await logoutService();
        setUser(null);
      },
    }),
    [user, booting]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
