import { createContext } from "react";

export type Role = "user" | "admin";
export type Session = { name: string; email: string; role: Role };
export type AuthContextValue = {
  session: Session | null;
  signIn: (session: Session) => void;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
