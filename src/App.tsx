import { useEffect, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowRight,
  ChevronRight,
  KeyRound,
  Loader2,
  MapPin,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { StoreProvider, useStore } from "./lib/store";
import { I18nProvider, useI18n } from "./lib/i18n";
import { navigate, useRoute } from "./lib/router";
import KycFlow from "./pages/member/KycFlow";
import AdminApp from "./pages/admin/AdminApp";
import ManagerLogin from "./pages/admin/ManagerLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import PrintView from "./pages/print/PrintView";
import { CoopLogo } from "./components/CoopLogo";
import LanguageToggle from "./components/LanguageToggle";

// ── Landing Page ─────────────────────────────────────────────────────────────
// Refined, trustworthy landing page tailored for Nepali Cooperatives.
// Members enter their SMS invitation code to initiate OTP verification;
// Cooperative staff/managers navigate to the review dashboard.
function LandingPage() {
  const { state, findByInviteCode } = useStore();
  const { t } = useI18n();
  const org = state.orgSettings;
  const [code, setCode] = useState("");
  const [selectedDemoId, setSelectedDemoId] = useState("");
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const demoMembers = state.members.filter((member) => member.isDemo);

  // Landing page renders as a full-screen single page → remove page scrollbar
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("no-page-scroll");
    return () => root.classList.remove("no-page-scroll");
  }, []);

  const handleOpen = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();

    if (!trimmed) {
      setError(t("inviteCodeRequired"));
      return;
    }

    setIsValidating(true);
    setError("");

    // Simulate realistic validation feedback
    setTimeout(() => {
      // Find member by invite code or membership code
      const memberByInvite = findByInviteCode(trimmed);
      const memberByCode = state.members.find(
        (m) => m.membershipCode.toUpperCase() === trimmed
      );
      const matched = memberByInvite || memberByCode;

      if (!matched) {
        setIsValidating(false);
        setError(t("inviteCodeNotFound"));
        return;
      }

      setIsValidating(false);
      navigate(`/kyc/${matched.inviteCode.toLowerCase()}`);
    }, 320);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#145C45] via-[#115E59] to-[#0A382A] text-slate-900 px-4 py-8 sm:py-12 selection:bg-[#DDF3E7] selection:text-[#145C45] overflow-x-hidden">
      {/* Language toggle (English / नेपाली) */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageToggle />
      </div>
      {/* ── Background Subtle Decorative Elements (Restrained) ───────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.06]"
      >
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          fill="none"
        >
          <defs>
            <pattern
              id="coop-grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#coop-grid)" />
        </svg>
      </div>

      {/* Ambient Radial Highlights */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#DDF3E7]/10 blur-3xl"
      />

      {/* ── Single centered white card: branding, form & actions ─────── */}
      <div className="relative z-10 w-full max-w-md my-auto rounded-3xl bg-white p-8 shadow-2xl border border-slate-200/70 animate-fade-up">
        {/* ── Header: Cooperative Identity & Branding ─────────────────── */}
        <header className="relative z-10 w-full text-center mb-6 sm:mb-8 animate-fade-down">
        {/* Logo Container */}
        <div className="mx-auto mb-3 flex items-center justify-center">
          <div className="rounded-2xl p-1 bg-[#DDF3E7]/60 ring-2 ring-[#145C45]/20 shadow-2xl">
            <CoopLogo
              settings={org}
              showStatusDot={false}
              className="h-16 w-16 sm:h-20 sm:w-20 shadow-inner"
              iconClassName="h-9 w-9 sm:h-11 sm:w-11"
            />
          </div>
        </div>

        {/* Nepali Name */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight text-balance">
          {org.nameNepali}
        </h1>

        {/* English Name */}
        <p className="mt-1 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#145C45]">
          {org.nameEnglish}
        </p>

        {/* Address and Registration Badges */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 font-medium">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-[#145C45]/80" />
            {org.addressNepali || org.addressEnglish}
          </span>
          {org.regNo && (
            <span className="hidden sm:inline-block text-slate-400">
              &middot; {org.regNo}
            </span>
          )}
        </div>

      </header>

      {/* ── Center: Member Login Card ───────────────────────────────── */}
      <main className="relative z-10 w-full animate-fade-up">
        <div>
          {/* Card Header */}
          <div className="mb-6 flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#145C45] text-white shadow-md shadow-[#145C45]/20">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                  {t("memberPortalTitle")}
                </h2>
              </div>
              <p className="text-xs font-semibold text-[#145C45] uppercase tracking-wide mt-0.5">
                {org.nameEnglish}
              </p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                {t("memberPortalHint")}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleOpen} className="space-y-4">
            <div>
              <label
                htmlFor="invite-code-input"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                {t("inviteCode")}
              </label>

              <div
                className={`relative flex items-center rounded-xl border bg-slate-50/70 transition-all focus-within:bg-white ${
                  error
                    ? "border-rose-400 bg-rose-50/20 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-100"
                    : "border-slate-300 hover:border-slate-400 focus-within:border-[#145C45] focus-within:ring-4 focus-within:ring-[#DDF3E7]"
                }`}
              >
                <div className="pointer-events-none pl-3.5 text-slate-400 flex items-center">
                  <KeyRound className="h-5 w-5 text-[#145C45]/80" />
                </div>
                <input
                  id="invite-code-input"
                  type="text"
                  value={code}
                  disabled={isValidating}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setSelectedDemoId("");
                    if (error) setError("");
                  }}
                  placeholder="e.g. ABC123"
                  className="h-12 w-full bg-transparent px-3 text-sm sm:text-base font-bold font-mono tracking-wider text-slate-900 outline-none placeholder:font-normal placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 disabled:opacity-50"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={12}
                  autoComplete="one-time-code"
                />
                {code && !isValidating && (
                  <button
                    type="button"
                    onClick={() => {
                      setCode("");
                      setError("");
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 transition"
                    aria-label="Clear code"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Validation Error Message */}
              {error && (
                <div className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 rounded-lg p-2.5 border border-rose-200 animate-fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <p className="leading-tight">{error}</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isValidating}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#15803D] hover:bg-[#145C45] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-md shadow-[#15803D]/25 transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("verifyingCode")}</span>
                </>
              ) : (
                <>
                  <span>{t("openKycForm")}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <section className="mt-5 border-t border-slate-200 pt-4">
            <div className="mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
                Try a demo member
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                Select an available member to fill their code. Use the displayed OTP on the next screen.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoMembers.map((member) => {
                const available = member.status === "invited";
                const selected = selectedDemoId === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    disabled={!available}
                    onClick={() => {
                      setCode(member.membershipCode);
                      setSelectedDemoId(member.id);
                      setError("");
                    }}
                    className={`rounded-xl border p-2.5 text-left transition ${
                      selected
                        ? "border-[#145C45] bg-[#DDF3E7]/70 ring-2 ring-[#145C45]/15"
                        : available
                        ? "border-slate-200 bg-slate-50 hover:border-[#145C45]/50 hover:bg-[#DDF3E7]/40"
                        : "cursor-not-allowed border-slate-200 bg-slate-100 opacity-60"
                    }`}
                  >
                    <span className="block truncate text-xs font-bold text-slate-800">
                      {member.name}
                    </span>
                    <span className="mt-1 block font-mono text-[11px] font-bold text-[#145C45]">
                      Member: {member.membershipCode.toLowerCase()}
                    </span>
                    <span className="block font-mono text-[11px] text-slate-600">
                      OTP: {member.otp}
                    </span>
                    {!available && (
                      <span className="mt-1 block text-[10px] font-semibold capitalize text-slate-500">
                        {member.status}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Clean Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">
                {t("staffAccess")}
              </span>
            </div>
          </div>

          {/* Manager / Staff Portal Navigation */}
          <button
            onClick={() => navigate("/manager-login")}
            className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-[#DDF3E7]/60 hover:border-[#145C45]/30 p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[#145C45]/20 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-[#145C45] group-hover:border-[#145C45]/40 transition shadow-xs">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 group-hover:text-[#145C45] transition truncate">
                  {t("managerPortal")}
                </p>
                <p className="text-[11px] text-slate-500">
                  {t("managerPortalHint")}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#145C45] group-hover:translate-x-0.5 transition" />
          </button>
        </div>

      </main>

      {/* ── Footer: Copyright & System Note ──────────────────────────── */}
      <footer className="relative z-10 w-full text-center mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
        <p>
          &copy; {new Date().getFullYear()} {org.nameNepali} &middot; {org.nameEnglish}
        </p>
        <p className="text-[10px] text-slate-400">
          Cooperative KYC Verification &amp; KYM Approval Management System (Nepal)
        </p>
      </footer>
      </div>
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────
function Routes() {
  const route = useRoute();
  const parts = route.split("/").filter(Boolean);

  // Root or empty → landing page (no auto-redirect to /admin)
  if (!parts.length) {
    return <LandingPage />;
  }

  let page: ReactNode;

  if (parts[0] === "kyc" || parts[0] === "form") {
    const code = parts[1] ?? "";
    if (!code) return <LandingPage />;
    page = <KycFlow key={code.toLowerCase()} code={code.toLowerCase()} />;
  } else if (parts[0] === "manager-login") {
    page = <ManagerLogin />;
  } else if (parts[0] === "admin") {
    page = (
      <ProtectedRoute>
        <AdminApp section={parts[1] ?? "dashboard"} id={parts[2]} />
      </ProtectedRoute>
    );
  } else if (parts[0] === "print" && parts[1]) {
    page = <PrintView id={parts[1]} />;
  } else {
    return <LandingPage />;
  }

  return <div className="min-h-dvh bg-slate-100 font-sans">{page}</div>;
}

export default function App() {
  return (
    <StoreProvider>
      <I18nProvider>
        <Routes />
      </I18nProvider>
    </StoreProvider>
  );
}
