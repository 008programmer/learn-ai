import { NavLink, Link, Outlet, useNavigate } from "react-router";
import {
  Package,
  Truck,
  Boxes,
  Users,
  LogOut,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth.store";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSelector } from "@/components/ui/language-selector";

export function Shell() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const email = useAuthStore((s) => s.email);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navItems = [
    { to: "/shipments", label: t("nav.shipments"), icon: Package },
    { to: "/carriers", label: t("nav.carriers"), icon: Truck },
    { to: "/stocks", label: t("nav.stocks"), icon: Boxes },
    { to: "/users", label: t("nav.users"), icon: Users },
  ];

  function handleLogout() {
    clearAuth();
    void navigate("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden lp-sans" style={{ background: "var(--lp-bg)", color: "var(--lp-fg)" }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className="flex w-56 flex-col"
        style={{ borderRight: "1px solid var(--lp-border)", background: "var(--lp-header-bg)", backdropFilter: "blur(18px)" }}
      >
        {/* Brand */}
        <Link
          to="/"
          className="flex h-14 items-center px-5 transition-opacity hover:opacity-80"
          style={{ borderBottom: "1px solid var(--lp-border)" }}
        >
          <span className="lp-serif font-semibold text-xl" style={{ color: "var(--lp-gold)", letterSpacing: "0.08em" }}>
            Modular Monolith
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => isActive ? {
                background: "var(--lp-gold-bg)",
                color: "var(--lp-gold)",
                borderLeft: "2px solid var(--lp-gold)",
                paddingLeft: "calc(0.75rem - 2px)",
              } : {
                color: "var(--lp-fg-dim)",
                borderLeft: "2px solid transparent",
                paddingLeft: "calc(0.75rem - 2px)",
              }}
              className="flex items-center gap-3 rounded-r-md px-3 py-2 text-sm transition-all duration-150 hover:bg-[var(--lp-gold-bg)] hover:text-[var(--lp-fg)]"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 space-y-2" style={{ borderTop: "1px solid var(--lp-border)" }}>
          {email && (
            <p className="truncate px-2 text-xs" style={{ color: "var(--lp-fg-faint)" }}>
              {email}
            </p>
          )}
          <LanguageSelector />
          <div className="flex items-center gap-1">
            <button
              className="lp-btn-ghost flex-1 justify-start gap-2 text-xs"
              style={{ padding: "0.4rem 0.75rem", fontSize: "0.8125rem" }}
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
              {t("common.signOut")}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
