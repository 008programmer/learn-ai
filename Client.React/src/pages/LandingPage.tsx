import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth.store";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSelector } from "@/components/ui/language-selector";

const BG = "var(--lp-bg)";
const FG = "var(--lp-fg)";
const GOLD = "var(--lp-gold)";
const FG_DIM = "var(--lp-fg-dim)";
const FG_FAINT = "var(--lp-fg-faint)";
const BORDER = "var(--lp-border)";

export function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, email, clearAuth } = useAuthStore();
  const loggedIn = isAuthenticated();

  return (
    <div className="min-h-screen flex flex-col lp-sans" style={{ background: BG, color: FG }}>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-6 md:px-12"
        style={{ borderBottom: `1px solid ${BORDER}`, background: "var(--lp-header-bg)", backdropFilter: "blur(18px)" }}
      >
        <span className="lp-serif font-semibold text-xl" style={{ color: GOLD, letterSpacing: "0.08em" }}>
          Modular Monolith
        </span>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <ThemeToggle />
          {loggedIn ? (
            <>
              {email && (
                <span className="lp-sans text-sm" style={{ color: FG, opacity: 0.7 }}>
                  {email}
                </span>
              )}
              <button
                className="lp-btn-gold"
                style={{ padding: "0.35rem 1rem", fontSize: "0.8125rem" }}
                onClick={() => void navigate("/shipments")}
              >
                {t("landing.goToApp")}
              </button>
              <button
                className="lp-btn-ghost"
                style={{ padding: "0.35rem 1rem", fontSize: "0.8125rem" }}
                onClick={() => { clearAuth(); void navigate("/login"); }}
              >
                {t("landing.signOut")}
              </button>
            </>
          ) : (
            <>
              <button
                className="lp-btn-ghost"
                style={{ padding: "0.35rem 1rem", fontSize: "0.8125rem" }}
                onClick={() => void navigate("/login")}
              >
                {t("landing.signIn")}
              </button>
              <button
                className="lp-btn-gold"
                style={{ padding: "0.35rem 1rem", fontSize: "0.8125rem" }}
                onClick={() => void navigate("/register")}
              >
                {t("landing.getStarted")}
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="flex flex-1 flex-col items-center justify-center text-center px-6 pt-16">
        <div className="flex flex-col items-center gap-5 max-w-2xl w-full">
          <h1
            className="lp-reveal lp-serif font-semibold leading-none"
            style={{
              fontSize: "clamp(2.5rem, 8vw, 5rem)",
              color: FG,
              letterSpacing: "-0.02em",
              animationDelay: "0.2s",
            }}
          >
            Modular Monolith Template
          </h1>

          <p
            className="lp-reveal lp-serif"
            style={{
              color: "var(--lp-gold-dim)",
              fontSize: "1.1rem",
              fontStyle: "italic",
              letterSpacing: "0.06em",
              animationDelay: "0.38s",
            }}
          >
            {t("landing.subtitle")}
          </p>

          <p
            className="lp-reveal max-w-md text-base leading-relaxed"
            style={{ color: FG_DIM, fontWeight: 300, animationDelay: "0.54s" }}
          >
            {t("landing.tagline")}
          </p>

          <div
            className="lp-reveal flex flex-wrap gap-3 pt-3 justify-center"
            style={{ animationDelay: "0.7s" }}
          >
            <button className="lp-btn-gold" onClick={() => void navigate("/register")}>
              {t("landing.getStarted")} <ArrowRight size={14} />
            </button>
            <button className="lp-btn-ghost" onClick={() => void navigate("/login")}>
              {t("landing.signIn")}
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer
        className="flex h-12 items-center justify-center gap-3 px-6 text-xs lp-sans"
        style={{ color: FG_FAINT }}
      >
        <span>{t("landing.footer")}</span>
        <span>&#183;</span>
        <span>&#169; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
