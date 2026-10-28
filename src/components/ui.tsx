import { useState, type ReactNode } from "react";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  MessageSquare,
  Smartphone,
  X,
  XCircle,
} from "lucide-react";
import type { KycStatus } from "../lib/types";
import { KYC_FLOW, STATUS_LABEL } from "../lib/types";
import { navigate } from "../lib/router";

const STATUS_STYLES: Record<
  string,
  { pill: string; dot: string; text: string; bg: string }
> = {
  invited: {
    pill: "bg-slate-100 text-slate-700 border-slate-300",
    dot: "bg-slate-400",
    text: "text-slate-700",
    bg: "bg-slate-100",
  },
  submitted: {
    pill: "bg-sky-50 text-sky-800 border-sky-200",
    dot: "bg-sky-500",
    text: "text-sky-800",
    bg: "bg-sky-50",
  },
  pending: {
    pill: "bg-amber-50 text-amber-900 border-amber-300 font-semibold",
    dot: "bg-amber-500 animate-pulse",
    text: "text-amber-900",
    bg: "bg-amber-50",
  },
  approved: {
    pill: "bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold",
    dot: "bg-emerald-600",
    text: "text-emerald-800",
    bg: "bg-emerald-50",
  },
  rejected: {
    pill: "bg-rose-50 text-rose-800 border-rose-200 font-semibold",
    dot: "bg-rose-500",
    text: "text-rose-800",
    bg: "bg-rose-50",
  },
  printed: {
    pill: "bg-blue-50 text-blue-900 border-blue-300 font-semibold",
    dot: "bg-blue-700",
    text: "text-blue-900",
    bg: "bg-blue-50",
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

export function StatusIcon({
  status,
  className = "h-5 w-5",
}: {
  status: KycStatus;
  className?: string;
}) {
  switch (status) {
    case "approved":
    case "printed":
      return <FileText className={`${className} text-emerald-600`} />;
    case "rejected":
      return <XCircle className={`${className} text-rose-600`} />;
    case "pending":
      return <Clock className={`${className} text-amber-600`} />;
    case "submitted":
      return <Clock className={`${className} text-sky-600`} />;
    case "invited":
    default:
      return <Clock className={`${className} text-slate-400`} />;
  }
}

export function StatusStepper({ status }: { status: KycStatus }) {
  if (status === "rejected") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-rose-900">This KYC was rejected</p>
            <p className="text-xs text-rose-700">
              The member can correct their details and resubmit using their invite link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIdx = KYC_FLOW.indexOf(status as (typeof KYC_FLOW)[number]);

  return (
    <div className="w-full">
      <ol className="flex items-center justify-between">
        {KYC_FLOW.map((step, i) => {
          const state =
            i < currentIdx ? "done" : i === currentIdx ? "current" : "todo";
          const labels = [
            "Invited",
            "Submitted",
            "Review",
            "Approved",
            "Printed",
          ];
          return (
            <li key={step} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    state === "done"
                      ? "bg-blue-900 text-white shadow-sm"
                      : state === "current"
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {state === "done" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-semibold text-center whitespace-nowrap ${
                    state === "current"
                      ? "text-blue-900 font-bold"
                      : state === "done"
                      ? "text-slate-700"
                      : "text-slate-400"
                  }`}
                >
                  {labels[i]}
                </span>
              </div>
              {i < KYC_FLOW.length - 1 && (
                <div
                  className={`mx-1 sm:mx-2 h-0.5 flex-1 transition-colors ${
                    i < currentIdx ? "bg-blue-900" : "bg-slate-200"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes =
    size === "sm"
      ? "h-9 w-9 text-xs"
      : size === "lg"
      ? "h-14 w-14 text-base"
      : "h-11 w-11 text-sm";
  const parts = name.trim().split(/\s+/);
  const initial =
    (parts[0]?.[0] ?? "?").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
  return (
    <div
      className={`${sizes} shrink-0 rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 flex items-center justify-center font-extrabold text-white shadow-sm ring-1 ring-white/20`}
    >
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
      <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="text-rose-500 font-bold">*</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs font-medium text-rose-600">
          {error}
        </span>
      )}
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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in transition-opacity"
        onClick={onClose}
      />
      <div className="animate-slide-up relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 active:scale-95 transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="text-sm text-slate-600">{children}</div>
        {footer && <div className="mt-5 flex gap-2.5">{footer}</div>}
      </div>
    </div>
  );
}

/**
 * Mobile SMS Simulator Modal showing the exact SMS received by the member
 * (e.g. kyc.coop/abc123 + OTP 123456)
 */
export function SmsModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: {
    name: string;
    phone: string;
    inviteCode: string;
    otp: string;
    link?: string;
  } | null;
}) {
  const [copied, setCopied] = useState(false);
  if (!open || !data) return null;

  const smsText = `Sangam Cooperative: Dear ${data.name}, please complete your KYC form at kyc.coop/${data.inviteCode.toLowerCase()} . Your verification OTP is: ${data.otp} (Valid for 10 min).`;

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(smsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleOpenLink = () => {
    onClose();
    navigate(`/kyc/${data.inviteCode.toLowerCase()}`);
  };

  return (
    <Modal open={open} onClose={onClose} title="SMS Delivered to Member">
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl bg-blue-50/80 p-3.5 border border-blue-100">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-900/70">
              Recipient: <span className="font-bold text-blue-950">{data.name}</span>
            </p>
            <p className="text-xs text-blue-800 font-mono">+91 {data.phone}</p>
          </div>
        </div>

        {/* Realistic Mobile SMS Card */}
        <div className="rounded-2xl border-2 border-slate-200 bg-slate-900 p-4 text-white shadow-inner">
          <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-blue-300">
              <MessageSquare className="h-3 w-3" /> SMS · SANGAM-COOP
            </span>
            <span>Just now</span>
          </div>
          <div className="rounded-xl bg-slate-800 p-3.5 text-sm leading-relaxed text-slate-100 border border-slate-700">
            <p>
              Dear <span className="font-semibold text-white">{data.name}</span>,
            </p>
            <p className="mt-1">
              Please complete your cooperative KYC verification using this secure
              link:
            </p>
            <div className="my-2.5 rounded-lg bg-blue-950/80 p-2.5 border border-blue-800/80 font-mono text-xs text-blue-200">
              <div className="flex items-center justify-between">
                <span>🔗 Link:</span>
                <span className="font-bold text-white underline">
                  kyc.coop/{data.inviteCode.toLowerCase()}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>🔑 OTP Code:</span>
                <span className="text-base font-extrabold tracking-widest text-amber-300">
                  {data.otp}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Valid for 10 minutes. Do not share this OTP with anyone.
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <button
            onClick={handleOpenLink}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 hover:bg-blue-800 active:scale-[0.99] py-3.5 text-sm font-bold text-white shadow-md shadow-blue-700/20 transition"
          >
            <ExternalLink className="h-4 w-4" /> Open Member KYC Form (Step 3)
          </button>
          <div className="flex gap-2">
            <button
              onClick={copyText}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {copied ? "✓ Copied to clipboard!" : "Copy SMS Text"}
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
