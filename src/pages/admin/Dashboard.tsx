import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Printer, Users as UsersIcon, XCircle } from "lucide-react";
import { useStore } from "../../lib/store";
import { navigate } from "../../lib/router";
import { formatDateTime, timeAgo } from "../../lib/utils";
import { Avatar, StatusPill } from "../../components/ui";
import type { KycSubmission, KycStatus } from "../../lib/types";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
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
    { label: "Pending Review", value: stats.pending, icon: Clock, cls: "bg-amber-50 text-amber-600" },
    { label: "Awaiting Action", value: stats.submitted, icon: AlertTriangle, cls: "bg-indigo-50 text-indigo-600" },
    { label: "Approved", value: stats.approved, icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, cls: "bg-red-50 text-red-500" },
    { label: "Printed", value: stats.printed, icon: Printer, cls: "bg-teal-50 text-teal-600" },
    { label: "Members Added", value: stats.members, icon: UsersIcon, cls: "bg-slate-100 text-slate-600" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Manager Dashboard</h2>
        <p className="mt-0.5 text-sm text-slate-500">Review member KYC submissions and track approvals.</p>
      </div>

      {stats.pending > 0 && (
        <button
          onClick={() => navigate("/admin")}
          className="flex w-full items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-left"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <Clock className="h-5 w-5 text-amber-600" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-bold text-amber-900">
              {stats.pending} submission{stats.pending > 1 ? "s" : ""} waiting for review
            </span>
            <span className="block text-xs text-amber-700">New KYC submissions need your decision.</span>
          </span>
          <span className="text-amber-600">→</span>
        </button>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.cls}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{c.value}</p>
              <p className="text-xs font-semibold text-slate-500">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
                filter === f.key
                  ? "bg-emerald-700 text-white shadow"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {filtered.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <FileText className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-500">No submissions found</p>
              <p className="mt-1 text-xs text-slate-400">KYC submissions will appear here once members submit.</p>
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
  const { startReview, approveSubmission } = useStore();
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
      <div className="flex items-start gap-3">
        <Avatar name={sub.memberName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-bold text-slate-900">{sub.memberName}</p>
            <StatusPill status={sub.status} />
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {sub.membershipCode} · {sub.phone} · {timeAgo(sub.submittedAt)}
          </p>
          {sub.remark && (
            <p className="mt-1 text-xs text-slate-500">
              <span className="font-semibold">Remark:</span> {sub.remark}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
        <button
          onClick={() => navigate(`/admin/submissions/${sub.id}`)}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
        >
          View Details
        </button>
        {sub.status === "submitted" && (
          <button
            onClick={() => startReview(sub.id)}
            className="flex-1 rounded-xl bg-amber-100 px-3 py-2 text-sm font-bold text-amber-800"
          >
            Start Review
          </button>
        )}
        {(sub.status === "pending" || sub.status === "submitted") && (
          <>
            <button
              onClick={() => approveSubmission(sub.id)}
              className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white"
            >
              Approve
            </button>
            <button
              onClick={() => navigate(`/admin/submissions/${sub.id}`)}
              className="flex-1 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600"
            >
              Reject
            </button>
          </>
        )}
        {sub.status === "approved" && (
          <button
            onClick={() => navigate(`/admin/submissions/${sub.id}`)}
            className="flex-1 rounded-xl bg-teal-600 px-3 py-2 text-sm font-bold text-white"
          >
            Print
          </button>
        )}
      </div>
    </div>
  );
}
