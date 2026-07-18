import { createContext } from "react";

export type Role = "user" | "doctor" | "admin";
export type Session = { id: string; name: string; email: string; role: Role };

export type AuthContextValue = {
  session: Session | null;
  // True while the initial session is being restored on startup.
  loading: boolean;
  // Each returns an error message on failure, or null on success.
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
