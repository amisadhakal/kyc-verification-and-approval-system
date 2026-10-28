import {
  ArrowLeft,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { navigate } from "../../lib/router";
import Dashboard from "./Dashboard";
import Members from "./Members";
import OfflineEntry from "./OfflineEntry";
import SubmissionDetail from "./SubmissionDetail";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "members", label: "Members", icon: Users },
  { key: "offline", label: "Offline Entry", icon: ClipboardList },
];

export default function AdminApp({
  section,
  id,
}: {
  section: string;
  id?: string;
}) {
  const isDetail = section === "submissions";

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900">
      {/* ── Main Navy Blue Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-blue-950 bg-slate-900 shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          {/* Left: logo / back */}
          <div className="flex items-center gap-3">
            {isDetail ? (
              <button
                onClick={() => navigate("/admin")}
                className="rounded-full bg-slate-800 p-2 text-slate-200 transition hover:bg-slate-700 active:scale-95"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-sm ring-1 ring-white/10">
                <Building2 className="h-5 w-5" />
              </div>
            )}
            <div>
              <h1 className="text-base font-black text-white leading-tight sm:text-lg">
                Sangam Cooperative
              </h1>
              <p className="text-[11px] font-medium text-blue-200">
                KYC Verification &amp; Approval System &middot; Manager Desk
              </p>
            </div>
          </div>

          {/* Right: role badge */}
          <span className="hidden items-center gap-1.5 rounded-full bg-blue-950 px-3 py-1 text-xs font-bold text-blue-300 ring-1 ring-blue-800 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Manager &middot; Suresh
          </span>
        </div>

        {/* ── Tab Navigation ──────────────────────────────────────────── */}
        {!isDetail && (
          <nav className="mx-auto max-w-5xl px-4 pb-2.5">
            <div className="no-scrollbar flex gap-2 overflow-x-auto pt-1">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = section === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() =>
                      navigate(
                        t.key === "dashboard" ? "/admin" : `/admin/${t.key}`
                      )
                    }
                    className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition active:scale-95 sm:text-sm ${
                      active
                        ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 ring-1 ring-blue-400/40"
                        : "bg-slate-800/80 text-blue-100 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-3 py-5 sm:px-4">
        {isDetail ? (
          <SubmissionDetail id={id ?? ""} />
        ) : section === "dashboard" ? (
          <Dashboard />
        ) : section === "members" ? (
          <Members />
        ) : section === "offline" ? (
          <OfflineEntry />
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  );
}
