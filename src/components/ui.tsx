import type { ReactNode } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { KycStatus } from "../lib/types";
import { KYC_FLOW, STATUS_LABEL } from "../lib/types";

const STATUS_STYLES: Record<string, { pill: string; dot: string; text: string; bg: string }> = {
  invited: {
    pill: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    text: "text-slate-700",
    bg: "bg-slate-100",
  },
  submitted: {
    pill: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
    text: "text-indigo-700",
    bg: "bg-indigo-50",
  },
  pending: {
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
  },
  approved: {
    pill: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-600",
    text: "text-orange-700",
    bg: "bg-orange-50",
  },
  rejected: {
    pill: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-500",
    text: "text-red-600",
    bg: "bg-red-50",
  },
  printed: {
    pill: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-600",
    text: "text-orange-700",
    bg: "bg-orange-50",
  },
};

export function StatusPill({ status }: { status: KycStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.invited;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function StatusIcon({ status, className = "h-5 w-5" }: { status: KycStatus; className?: string }) {
  switch (status) {
    case "approved":
    case "printed":
      return <FileText className={`${className} text-amber-600`} />;
    case "rejected":
      return <XCircle className={`${className} text-red-500`} />;
    case "pending":
      return <Clock className={`${className} text-amber-500`} />;
    case "submitted":
      return <Clock className={`${className} text-indigo-500`} />;
    case "invited":
      return <Clock className={`${className} text-slate-400`} />;
    default:
      return <Clock className={`${className} text-slate-400`} />;
  }
}

export function StatusStepper({ status }: { status: KycStatus }) {
  if (status === "rejected") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-700">This KYC was rejected</p>
        <p className="mt-1 text-sm text-red-600/80">The member was asked to correct and resubmit.</p>
      </div>
    );
  }
  const currentIdx = KYC_FLOW.indexOf(status as (typeof KYC_FLOW)[number]);
  return (
    <ol className="flex items-center">
      {KYC_FLOW.map((step, i) => {
        const state = i < currentIdx ? "done" : i === currentIdx ? "current" : "todo";
        const labels = ["Invitation Sent", "Submitted", "Pending Review", "Approved", "Printed"];
        return (
          <li key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  state === "done"
                    ? "bg-amber-600 text-white"
                    : state === "current"
                    ? "bg-amber-600 text-white ring-4 ring-amber-100"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {state === "done" ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  state === "current" || state === "done" ? "text-amber-700" : "text-slate-400"
                }`}
              >
                {labels[i]}
              </span>
            </div>
            {i < KYC_FLOW.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 ${i < currentIdx ? "bg-amber-600" : "bg-slate-200"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const sizes = size === "sm" ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm";
  const parts = name.trim().split(/\s+/);
  const initial = (parts[0]?.[0] ?? "?").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
  return (
    <div className={`${sizes} shrink-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white`}>
      {initial}
    </div>
  );
}

export function Field({
  label,
  error,
  required,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-900/50 animate-fade-in" onClick={onClose} />
      <div className="animate-slide-up relative w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="text-sm text-slate-600">{children}</div>
        {footer && <div className="mt-4 flex gap-2">{footer}</div>}
      </div>
    </div>
  );
}
