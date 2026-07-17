import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { Icon } from "../Icon";

type Props = { children: ReactNode };

const navigation = [
  { label: "Admissions", icon: "clipboard" as const, path: "/admin/gl-process" },
  { label: "Policy Vault", icon: "shield" as const, path: "/admin/policy-vault" },
  { label: "Cases", icon: "users" as const, path: "/admin/patients" },
  { label: "Analytics", icon: "chart" as const, path: "/admin/analytics" },
  { label: "Settings", icon: "settings" as const },
];

export function AdminShell({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white text-[#151c27]">
      <aside className="motion-enter fixed inset-y-0 left-0 hidden w-64 border-r border-[#c3c6d6] bg-[#f0f3ff] px-2 py-8 lg:flex lg:flex-col">
        <div className="px-4">
          <p className="text-2xl font-bold tracking-tight text-[#003d9b]">
            Admin Dashboard
          </p>
          <p className="mt-1 text-sm text-[#555f6c]">Central Hospital HQ</p>
        </div>
        <nav className="mt-12 space-y-2">
          {navigation.map((item) => {
            const isActive =
              item.path === location.pathname ||
              (item.path === "/admin/gl-process" &&
                location.pathname.startsWith("/admin/gl-process/"));

            return (
              <button
                key={item.label}
                type="button"
                onClick={item.path ? () => navigate(item.path) : undefined}
                disabled={!item.path}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium ${isActive ? "bg-[#d9e3f2] text-[#003d9b]" : item.path ? "text-[#555f6c] hover:bg-white/70" : "cursor-not-allowed text-[#9aa3ae]"}`}
              >
                <Icon name={item.icon} className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <button className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-[#003d9b] px-4 py-3 text-sm font-semibold text-white">
          <Icon name="plus" className="h-4 w-4" />
          New admission
        </button>
      </aside>
      <div className="lg:pl-64">
        <header className="motion-header sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#c3c6d6] bg-white px-5 lg:px-10">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-[#003d9b] lg:hidden">
              Rawat Lawat
            </span>
            <label className="relative hidden sm:block">
              <Icon
                name="search"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555f6c]"
              />
              <input
                placeholder="Search patient or GL..."
                className="h-9 w-64 rounded-xl bg-[#f0f3ff] pl-9 pr-3 text-sm outline-none ring-[#003d9b] transition focus:scale-[1.02] focus:ring-2"
              />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-[#003d9b] sm:block">
              Administrator
            </span>
            <span className="floating-avatar grid h-9 w-9 place-items-center rounded-xl border border-[#737685] bg-slate-100 text-xs font-bold text-[#003d9b]">
              AD
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="motion-button grid h-9 w-9 place-items-center rounded-xl border border-[#c3c6d6] text-[#555f6c] transition hover:border-[#003d9b] hover:bg-[#f0f3ff] hover:text-[#003d9b]"
            >
              <Icon name="logout" className="h-4 w-4" />
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
