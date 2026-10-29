import {
  ArrowLeft,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { navigate } from "../../lib/router";
import Dashboard from "./Dashboard";
import Members from "./Members";
import OfflineEntry from "./OfflineEntry";
import SubmissionDetail from "./SubmissionDetail";
import OrgSettingsView from "./OrgSettingsView";
import { CoopLogo } from "../../components/CoopLogo";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "members", label: "Members", icon: Users },
  { key: "offline", label: "Offline Entry", icon: ClipboardList },
  { key: "settings", label: "Organization", icon: Settings },
];

export default function AdminApp({
  section,
  id,
}: {
  section: string;
  id?: string;
}) {
  const { state } = useStore();
  const isDetail = section === "submissions";
  const org = state.orgSettings;

  return (
    <div className="min-h-dvh bg-[#F8FAFC] text-slate-900">
      {/* ── Main Dark Green Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-[#0f4534] bg-[#145C45] shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          {/* Left: logo / back */}
          <div className="flex items-center gap-3 min-w-0">
            {isDetail ? (
              <button
                onClick={() => navigate("/admin")}
                className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 active:scale-95 cursor-pointer shrink-0"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <CoopLogo settings={org} className="h-10 w-10 sm:h-11 sm:w-11" />
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm font-black text-white leading-tight sm:text-base truncate">
                  {org.nameNepali}
                </h1>
                {org.isSample && (
                  <span className="hidden sm:inline-block rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 text-[10px] font-bold">
                    Sample / Placeholder
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-[#DDF3E7] truncate">
                {org.nameEnglish} &middot; {org.addressNepali || org.addressEnglish}
              </p>
            </div>
          </div>

          {/* Right: role badge */}
          <div className="shrink-0 flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-bold text-[#DDF3E7]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              व्यवस्थापक (Manager)
            </span>
          </div>
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
                    className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition active:scale-95 sm:text-sm cursor-pointer ${
                      active
                        ? "bg-[#DDF3E7] text-[#145C45] shadow-md font-extrabold"
                        : "bg-white/10 text-[#DDF3E7] hover:bg-white/20 hover:text-white"
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
        ) : section === "settings" ? (
          <OrgSettingsView />
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  );
}
