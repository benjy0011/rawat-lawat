import { useState } from "react";
import { AuthContext, type Session } from "./authStore";
const storageKey = "admission-accelerator-session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const saved = sessionStorage.getItem(storageKey);
    return saved ? (JSON.parse(saved) as Session) : null;
  });

  const signIn = (nextSession: Session) => {
    sessionStorage.setItem(storageKey, JSON.stringify(nextSession));
    setSession(nextSession);
  };
  const signOut = () => {
    sessionStorage.removeItem(storageKey);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
