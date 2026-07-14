import type { Session } from "./authStore";

type MockUser = Session & {
  password: string;
};

const mockUsers: MockUser[] = [
  {
    name: "Aisha Rahman",
    email: "patient@example.com",
    password: "Patient123!",
    role: "user",
  },
  {
    name: "Hospital Administrator",
    email: "admin@hospital.com",
    password: "Admin123!",
    role: "admin",
  },
];

export function authenticateMockUser(
  email: string,
  password: string,
): Session | null {
  const user = mockUsers.find(
    (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase(),
  );

  if (!user || user.password !== password) {
    return null;
  }

  return {
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export const demoLogin = {
  email: mockUsers[0].email,
  password: mockUsers[0].password,
};
