import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Clock, Users, RefreshCw } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getAccessLimitStatus, type HourlyAccessStatus } from "@/api/accessLimit";

const GOLD = "var(--lp-gold)";
const BG = "var(--lp-bg)";
const FG = "var(--lp-fg)";
const FG_DIM = "var(--lp-fg-dim)";
const BORDER = "var(--lp-border)";

function formatTimeUntil(dateStr: string): string {
  const target = new Date(dateStr);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "now";
  const diffMins = Math.ceil(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""}`;
  const diffHours = Math.floor(diffMins / 60);
  const remMins = diffMins % 60;
  if (remMins === 0) return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
  return `${diffHours}h ${remMins}m`;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function AccessDeniedPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<HourlyAccessStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");

  useEffect(() => {
    getAccessLimitStatus()
      .then((s) => {
        setStatus(s);
        if (s.windowResetsAt) {
          setTimeUntilReset(formatTimeUntil(s.windowResetsAt));
        }
      })
      .catch(() => {
        // ignore — show generic message
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!status?.windowResetsAt) return;
    const interval = setInterval(() => {
      setTimeUntilReset(formatTimeUntil(status.windowResetsAt));
    }, 30000);
    return () => clearInterval(interval);
  }, [status?.windowResetsAt]);

  return (
    <div
      className="min-h-screen flex flex-col lp-sans"
      style={{ background: BG, color: FG }}
    >
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-6 md:px-12"
        style={{
          borderBottom: `1px solid ${BORDER}`,
          background: "var(--lp-header-bg)",
          backdropFilter: "blur(18px)",
        }}
      >
        <button
          className="lp-serif font-semibold text-xl cursor-pointer"
          style={{ color: GOLD, letterSpacing: "0.08em", background: "none", border: "none" }}
          onClick={() => void navigate("/")}
        >
          Modular Monolith
        </button>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button className="lp-btn-ghost" onClick={() => void navigate("/login")}>
            Sign in
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pt-16 text-center gap-8 max-w-xl mx-auto w-full">
        {/* Icon */}
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 72,
            height: 72,
            border: `1.5px solid ${GOLD}`,
            color: GOLD,
          }}
        >
          <Users className="h-8 w-8" />
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-3">
          <h1
            className="lp-serif font-semibold"
            style={{ fontSize: "clamp(1.75rem, 5vw, 2.75rem)", color: FG }}
          >
            Hourly limit reached
          </h1>
          <p className="text-base leading-relaxed" style={{ color: FG_DIM, fontWeight: 300 }}>
            This application limits the number of concurrent users each hour.
            All slots for this hour are currently taken.
          </p>
        </div>

        {/* Status card */}
        {!loading && status && (
          <div
            className="w-full rounded-xl p-6 flex flex-col gap-4 text-left"
            style={{ border: `1px solid ${BORDER}`, background: "var(--lp-gold-bg)" }}
          >
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 shrink-0" style={{ color: GOLD }} />
              <span className="text-sm" style={{ color: FG_DIM }}>
                <span style={{ color: FG, fontWeight: 500 }}>
                  {status.currentUsersInWindow} / {status.maxUsersPerHour}
                </span>{" "}
                slots used this hour
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 shrink-0" style={{ color: GOLD }} />
              <span className="text-sm" style={{ color: FG_DIM }}>
                Next window opens in{" "}
                <span style={{ color: FG, fontWeight: 500 }}>{timeUntilReset}</span>
                {" "}(at {formatTime(status.windowResetsAt)})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 shrink-0 opacity-0" aria-hidden />
              <span className="text-sm" style={{ color: FG_DIM }}>
                Each slot gives you{" "}
                <span style={{ color: FG, fontWeight: 500 }}>
                  {status.sessionDurationMinutes} minutes
                </span>{" "}
                of access
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            className="lp-btn-ghost flex items-center gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" />
            Check again
          </button>
          <button className="lp-btn-gold" onClick={() => void navigate("/")}>
            Back to home
          </button>
        </div>

        <p className="text-xs" style={{ color: "var(--lp-fg-faint)" }}>
          Access is granted on a first-come, first-served basis each hour.
          <br />
          Refresh the page or try again when the window resets.
        </p>
      </main>
    </div>
  );
}
