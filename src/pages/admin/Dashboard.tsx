import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Printer,
  Sparkles,
  Users as UsersIcon,
  XCircle,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { navigate } from "../../lib/router";
import { formatDateTime, timeAgo } from "../../lib/utils";
import { Avatar, StatusPill } from "../../components/ui";
import { RejectModal } from "./SubmissionDetail";
import type { KycSubmission, KycStatus } from "../../lib/types";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All Submissions" },
  { key: "pending", label: "Pending Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "printed", label: "Printed" },
];

export default function Dashboard() {
  const { state } = useStore();
  const [filter, setFilter] = useState("all");

  const stats = useMemo(() => {
    const subs = state.submissions;
    const count = (s: KycStatus) => subs.filter((x) => x.status === s).length;
    return {
      pending: subs.filter((x) => x.status === "pending").length,
      submitted: subs.filter((x) => x.status === "submitted").length,
      approved: count("approved"),
      rejected: count("rejected"),
      printed: count("printed"),
      members: state.members.length,
    };
  }, [state]);

  const filtered = useMemo(() => {
    const list = [...state.submissions].sort((a, b) => b.submittedAt - a.submittedAt);
    if (filter === "all") return list;
    if (filter === "pending") return list.filter((x) => x.status === "pending");
    if (filter === "approved") return list.filter((x) => x.status === "approved");
    if (filter === "rejected") return list.filter((x) => x.status === "rejected");
    if (filter === "printed") return list.filter((x) => x.status === "printed");
    return list;
  }, [state.submissions, filter]);

  const cards = [
    {
      label: "Pending Review",
      value: stats.pending,
      icon: Clock,
      cls: "bg-amber-50 text-amber-600 border border-amber-200/80",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle2,
      cls: "bg-emerald-50 text-emerald-600 border border-emerald-200/80",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      cls: "bg-rose-50 text-rose-600 border border-rose-200/80",
    },
    {
      label: "Printed",
      value: stats.printed,
      icon: Printer,
      cls: "bg-[#DDF3E7] text-[#145C45] border border-[#145C45]/20",
    },
    {
      label: "Total Members",
      value: stats.members,
      icon: UsersIcon,
      cls: "bg-slate-50 text-slate-700 border border-slate-200/80",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Manager Review Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Review submitted member KYC documents, approve or reject, and print official KYC forms.
          </p>
        </div>
      </div>

      {/* Pending Review Alert Banner */}
      {stats.pending > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-[#145C45] via-[#1a7357] to-[#145C45] p-4 text-white shadow-lg border border-[#0f4534]/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-400/30">
                <Clock className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white">
                  {stats.pending} Submission{stats.pending > 1 ? "s" : ""} Waiting for Review
                </p>
                <p className="text-xs text-[#DDF3E7]">
                  New member KYC submissions have been received and need your decision.
                </p>
              </div>
            </div>
            <button
              onClick={() => setFilter("pending")}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#DDF3E7] hover:bg-white active:scale-95 px-4 py-2 text-xs font-bold text-[#145C45] transition self-start sm:self-auto shadow-sm cursor-pointer"
            >
              Filter Pending Queue →
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className={`rounded-2xl p-3.5 shadow-sm bg-white border transition hover:shadow-md ${c.cls}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 truncate">{c.label}</span>
                <Icon className="h-4 w-4 shrink-0" />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{c.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs & Submissions List */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap justify-center transition active:scale-95 cursor-pointer ${
                filter === f.key
                  ? "bg-[#145C45] text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-[#DDF3E7] hover:text-[#145C45] hover:border-[#145C45]/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List of Submissions */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <FileText className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-600">No submissions found</p>
              <p className="mt-1 text-xs text-slate-400">
                KYC submissions will appear here once members submit the online form.
              </p>
            </div>
          )}

          {filtered.map((s) => (
            <SubmissionCard key={s.id} sub={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SubmissionCard({ sub }: { sub: KycSubmission }) {
  const { approveSubmission, rejectSubmission } = useStore();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleApprove = () => {
    approveSubmission(sub.id);
    showToast(`✓ Approved KYC for ${sub.memberName}`);
  };

  return (
    <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200/80 transition hover:shadow-md space-y-3">
      {/* Toast */}
      {toast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-center text-xs font-bold text-emerald-800 animate-fade-in">
          {toast}
        </div>
      )}

      {/* Member Header Info */}
      <div className="flex items-start gap-3">
        <Avatar name={sub.memberName} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-extrabold text-slate-900">
              {sub.memberName}
            </h3>
            <StatusPill status={sub.status} />
          </div>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">
            Code: <span className="font-bold text-slate-700">{sub.membershipCode}</span> · Phone:{" "}
            <span className="font-bold text-slate-700 font-mono">+977 {sub.phone}</span> · {timeAgo(sub.submittedAt)}
          </p>
          {sub.address && (
            <p className="mt-1 text-xs text-slate-600 truncate">
              📍 {sub.address}
            </p>
          )}
          {sub.remark && (
            <p className="mt-1 text-xs text-rose-700 bg-rose-50/80 rounded-lg p-1.5 border border-rose-200 inline-block font-semibold">
              Remark: {sub.remark}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-100">
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2">
          {/* View Details */}
          <button
            onClick={() => navigate(`/admin/submissions/${sub.id}`)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[#145C45]/30 bg-[#DDF3E7]/60 hover:bg-[#DDF3E7] text-[#145C45] font-bold py-2.5 px-3 text-xs sm:text-sm active:scale-[0.98] transition focus:outline-none focus:ring-2 focus:ring-[#145C45]/30 cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            <span>View Details</span>
          </button>

          {/* Approve and Reject */}
          {(sub.status === "pending" || sub.status === "submitted") && (
            <>
              <button
                onClick={handleApprove}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold py-2.5 px-3.5 text-xs sm:text-sm shadow-sm shadow-emerald-600/20 active:scale-[0.98] transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve</span>
              </button>

              <button
                onClick={() => setRejectOpen(true)}
                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2.5 px-3 text-xs sm:text-sm active:scale-[0.98] transition focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                <XCircle className="h-4 w-4 text-rose-600" />
                <span>Reject</span>
              </button>
            </>
          )}

          {/* Print Button */}
          {sub.status === "approved" && (
            <button
              onClick={() => navigate(`/print/${sub.id}`)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#145C45] hover:bg-[#0f4534] text-white font-bold py-2.5 px-4 text-xs sm:text-sm shadow-sm active:scale-[0.98] transition focus:outline-none focus:ring-2 focus:ring-[#145C45] cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print KYC Form</span>
            </button>
          )}

          {/* Reprint */}
          {sub.status === "printed" && (
            <button
              onClick={() => navigate(`/print/${sub.id}`)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2.5 px-3 text-xs sm:text-sm active:scale-[0.98] transition"
            >
              <Printer className="h-4 w-4 text-slate-500" />
              <span>Reprint</span>
            </button>
          )}
        </div>
      </div>

      <RejectModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={(remark) => {
          rejectSubmission(sub.id, remark);
          showToast(`Marked as Rejected: ${remark}`);
        }}
      />
    </div>
  );
}
