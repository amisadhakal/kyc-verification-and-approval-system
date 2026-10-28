import { useState, type ReactNode } from "react";
import { Building2, KeyRound, LogIn, Smartphone } from "lucide-react";
import { StoreProvider } from "./lib/store";
import { navigate, useRoute } from "./lib/router";
import KycFlow from "./pages/member/KycFlow";
import AdminApp from "./pages/admin/AdminApp";
import PrintView from "./pages/print/PrintView";

// ── Landing Page ─────────────────────────────────────────────────────────────
// Shown when the user opens the app root without a route.
// Members type their invite code; managers click through to /admin.
function LandingPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleOpen = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please enter your invite code from the SMS.");
      return;
    }
    setError("");
    navigate(`/kyc/${trimmed.toLowerCase()}`);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4">
      {/* Branding */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-700 shadow-2xl ring-1 ring-white/10">
          <Building2 className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Sangam Cooperative
        </h1>
        <p className="mt-1 text-sm text-blue-300">
          KYC Verification &amp; Approval System
        </p>
      </div>

      {/* Member Card */}
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Member KYC Portal
            </h2>
            <p className="text-xs text-slate-500">
              Enter your invite code received via SMS
            </p>
          </div>
        </div>

        <form onSubmit={handleOpen} className="space-y-3">
          <div
            className={`flex items-center gap-2 rounded-2xl border px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-200 ${
              error ? "border-red-400" : "border-slate-300 focus-within:border-blue-600"
            }`}
          >
            <KeyRound className="h-5 w-5 shrink-0 text-blue-700" />
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError("");
              }}
              placeholder="Enter Invite Code (e.g. ABC123)"
              className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-600">{error}</p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 py-3.5 text-sm font-extrabold text-white shadow-md shadow-blue-700/20 transition hover:bg-blue-800 active:scale-[0.98]"
          >
            Open KYC Form
          </button>
        </form>

        {/* Manager link */}
        <div className="mt-5 border-t border-slate-100 pt-4 text-center">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-blue-700"
          >
            <LogIn className="h-3.5 w-3.5" />
            Manager / Staff Portal
          </button>
        </div>
      </div>

      {/* Demo hint */}
      <div className="mt-5 w-full max-w-sm rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur">
        <p className="text-xs font-semibold text-blue-200">
          Demo — Ram Sharma received invite code{" "}
          <button
            onClick={() => navigate("/kyc/abc123")}
            className="font-extrabold text-amber-300 underline underline-offset-2"
          >
            ABC123
          </button>{" "}
          with OTP{" "}
          <span className="font-mono font-extrabold text-amber-300">123456</span>
        </p>
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
  } else if (parts[0] === "admin") {
    page = <AdminApp section={parts[1] ?? "dashboard"} id={parts[2]} />;
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
      <Routes />
    </StoreProvider>
  );
}
