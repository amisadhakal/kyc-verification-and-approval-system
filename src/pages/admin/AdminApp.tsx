import type { ReactNode } from "react";
import { ArrowLeft, ClipboardList, LayoutDashboard, Users } from "lucide-react";
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

export default function AdminApp({ section, id }: { section: string; id?: string }) {
  const isDetail = section === "submissions";

  return (
    <div className="min-h-dvh bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-amber-800 bg-amber-900">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/admin")}
            className="rounded-full bg-white/10 p-2 text-amber-50"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-extrabold text-white leading-tight">Sangam Cooperative</h1>
            <p className="text-[11px] font-medium text-amber-200">KYC Collection Portal · Manager</p>
          </div>
          <span className="rounded-full bg-amber-700 px-3 py-1 text-[11px] font-bold text-amber-50 ring-1 ring-amber-600">
            Staff
          </span>
        </div>
        {!isDetail && (
          <nav className="mx-auto max-w-5xl px-4">
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = section === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => navigate(t.key === "dashboard" ? "/admin" : `/admin/${t.key}`)}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active ? "bg-white text-amber-900" : "bg-amber-800 text-amber-100"
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

      <main className="mx-auto max-w-5xl px-4 py-5">
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
