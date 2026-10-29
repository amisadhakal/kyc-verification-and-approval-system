import { useEffect, type ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { navigate, useRoute } from "../lib/router";
import { hasManagerDemoSession } from "../lib/auth";

/**
 * Reusable protected route for manager / staff content.
 *
 * Frontend-only demo guard: if no demo manager session exists in sessionStorage,
 * the user is redirected to the Manager Login page (`/manager-login`) instead of
 * the protected content. Once a demo session is active, the content renders.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthed = hasManagerDemoSession();
  const route = useRoute();

  useEffect(() => {
    if (!isAuthed) {
      navigate("/manager-login");
    }
  }, [isAuthed, route]);

  if (!isAuthed) {
    return (
      <div className="min-h-dvh bg-[#F8FAFC] flex flex-col items-center justify-center gap-3 px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#145C45] text-white shadow-md shadow-[#145C45]/20">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-slate-500">
          Verifying manager access…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
