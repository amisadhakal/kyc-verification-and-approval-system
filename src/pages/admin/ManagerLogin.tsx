import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { CoopLogo } from "../../components/CoopLogo";
import { useStore } from "../../lib/store";
import { useI18n } from "../../lib/i18n";
import { navigate } from "../../lib/router";
import LanguageToggle from "../../components/LanguageToggle";
import {
  isValidManagerCredentials,
  startManagerDemoSession,
} from "../../lib/auth";

export default function ManagerLogin() {
  const { state } = useStore();
  const { t } = useI18n();
  const org = state.orgSettings;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    setError("");
    setIsProcessing(true);

    // Simulate a short authentication round-trip (frontend demo only)
    await new Promise((resolve) => setTimeout(resolve, 700));

    const isValid = isValidManagerCredentials(email, password);
    setIsProcessing(false);

    if (!isValid) {
      setError(t("invalidCredentials"));
      return;
    }

    // Demo session flag only — password is never stored.
    startManagerDemoSession();
    navigate("/admin");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-start overflow-x-clip bg-gradient-to-br from-[#145C45] via-[#115E59] to-[#0A382A] px-3 pb-6 pt-16 text-slate-900 sm:px-6 sm:py-12 lg:px-8">
      {/* Language toggle (English / नेपाली) */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageToggle />
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

      {/* ── Login Card ─────────────────────────────────────────────────── */}
      <div className="relative z-10 my-0 w-full max-w-md rounded-3xl border border-slate-200/70 bg-white p-5 shadow-2xl animate-fade-up sm:my-auto sm:p-8">
        {/* Card Header: Cooperative Identity */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mx-auto mb-3 flex items-center justify-center rounded-2xl p-1 bg-white/10 backdrop-blur-md ring-2 ring-white/20 shadow-2xl">
            <CoopLogo
              settings={org}
              showStatusDot={false}
              className="h-16 w-16 sm:h-20 sm:w-20 shadow-inner"
              iconClassName="h-9 w-9 sm:h-11 sm:w-11 text-white"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight text-balance">
            {org.nameNepali}
          </h1>

          <p className="mt-1 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#145C45]">
            {org.nameEnglish}
          </p>

          <p className="mt-1 text-[11px] font-medium text-slate-500">
            {org.addressNepali || org.addressEnglish}
          </p>
        </div>

        {/* Heading & Description */}
        <div className="mb-6 text-center">
          <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
            {t("managerLogin")}
          </h2>
          <p className="mt-1.5 text-xs text-slate-500">
            {t("managerLoginSubtitle")}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email Input */}
          <div>
            <label
              htmlFor="manager-email"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              {t("email")}
            </label>
            <div
              className={`relative flex items-center rounded-xl border bg-slate-50/70 transition-all focus-within:bg-white ${
                error
                  ? "border-rose-400 bg-rose-50/20 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-100"
                  : "border-slate-300 hover:border-slate-400 focus-within:border-[#145C45] focus-within:ring-4 focus-within:ring-[#DDF3E7]"
              }`}
            >
              <div className="pointer-events-none pl-3.5 text-slate-400 flex items-center">
                <Mail className="h-5 w-5 text-[#145C45]/80" />
              </div>
              <input
                id="manager-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="manager@demo.com"
                autoComplete="email"
                required
                className="h-12 w-full bg-transparent px-3 text-sm sm:text-base font-bold text-slate-900 outline-none placeholder:font-normal placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Password Input with Show/Hide Toggle */}
          <div>
            <label
              htmlFor="manager-password"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              {t("password")}
            </label>
            <div
              className={`relative flex items-center rounded-xl border bg-slate-50/70 transition-all focus-within:bg-white ${
                error
                  ? "border-rose-400 bg-rose-50/20 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-100"
                  : "border-slate-300 hover:border-slate-400 focus-within:border-[#145C45] focus-within:ring-4 focus-within:ring-[#DDF3E7]"
              }`}
            >
              <div className="pointer-events-none pl-3.5 text-slate-400 flex items-center">
                <Lock className="h-5 w-5 text-[#145C45]/80" />
              </div>
              <input
                id="manager-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                className="h-12 w-full bg-transparent px-3 text-sm sm:text-base font-bold text-slate-900 outline-none placeholder:font-normal placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="p-2.5 text-slate-400 hover:text-slate-600 transition focus:outline-none cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message for Invalid Credentials */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 rounded-lg p-2.5 border border-rose-200 animate-fade-in"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <p className="leading-tight">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#15803D] hover:bg-[#145C45] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-md shadow-[#15803D]/25 transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("signingIn")}</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>{t("signIn")}</span>
              </>
            )}
          </button>
        </form>

        {/* Return to Landing Page */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={handleBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#145C45] hover:text-[#0f4534] transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#145C45]/30 rounded-lg px-2 py-1"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{t("returnToHome")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
