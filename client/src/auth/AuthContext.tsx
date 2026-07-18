import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { AuthContext, type Role, type Session } from "./authStore";

// Build our Session (with role) from a Supabase auth user by reading the
// matching profile row. Defaults to the "user" role if no profile is found.
async function buildSession(authUser: User | null): Promise<Session | null> {
  if (!authUser) return null;

  const { data } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", authUser.id)
    .maybeSingle();

  return {
    id: authUser.id,
    email: authUser.email ?? "",
    name: data?.name || authUser.email || "",
    role: (data?.role as Role) ?? "user",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const applyUser = async (authUser: User | null) => {
      const next = await buildSession(authUser);
      if (active) setSession(next);
    };

    // Restore any persisted session on startup, then release the loading gate.
    supabase.auth.getSession().then(async ({ data }) => {
      await applyUser(data.session?.user ?? null);
      if (active) setLoading(false);
    });

    // React to later sign-in / sign-out. Defer the profile lookup out of the
    // callback so it never runs a Supabase query inside the auth callback.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      window.setTimeout(() => {
        void applyUser(next?.user ?? null);
      }, 0);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error ? error.message : null;
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return error ? error.message : null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
