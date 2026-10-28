import { useState } from "react";
import { ArrowLeft, CheckCircle2, FileText, Loader2, Printer, XCircle } from "lucide-react";
import { useStore } from "../../lib/store";
import { navigate } from "../../lib/router";
import { formatDateTime } from "../../lib/utils";
import { Avatar, Modal, StatusPill, StatusStepper } from "../../components/ui";

export default function SubmissionDetail({ id }: { id: string }) {
  const { state, getSubmission, startReview, approveSubmission, rejectSubmission, markPrinted } = useStore();
  const sub = getSubmission(id);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [remark, setRemark] = useState("");

  if (!sub) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-sm border border-slate-100">
        <FileText className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 font-bold text-slate-700">Submission not found</p>
        <button onClick={() => navigate("/admin")} className="mt-4 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const act = (fn: () => void) => () => fn();

  const print = () => {
    markPrinted(sub.id);
    window.print();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/admin")} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">KYC-{sub.membershipCode}</span>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <Avatar name={sub.memberName} />
          <div className="flex-1">
            <p className="text-lg font-extrabold text-slate-900">{sub.memberName}</p>
            <p className="text-xs text-slate-500">
              {sub.membershipCode} · {sub.phone}
            </p>
          </div>
          <StatusPill status={sub.status} />
        </div>
        <div className="mt-5">
          <StatusStepper status={sub.status} />
        </div>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">KYC Information</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Address</dt>
            <dd className="text-right font-semibold text-slate-800">{sub.address || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">ID Document</dt>
            <dd className="text-right font-semibold text-slate-800">{sub.idDocType ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Submitted</dt>
            <dd className="text-right font-semibold text-slate-800">{formatDateTime(sub.submittedAt)}</dd>
          </div>
          {sub.reviewedAt && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Reviewed</dt>
              <dd className="text-right font-semibold text-slate-800">
                {formatDateTime(sub.reviewedAt)}
                {sub.reviewedBy ? ` · ${sub.reviewedBy}` : ""}
              </dd>
            </div>
          )}
          {sub.printedAt && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Printed</dt>
              <dd className="text-right font-semibold text-slate-800">{formatDateTime(sub.printedAt)}</dd>
            </div>
          )}
          {sub.remark && (
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Manager Remark</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-700">{sub.remark}</dd>
            </div>
          )}
        </dl>

        {(sub.photoDataUrl || sub.idDocDataUrl) && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {sub.photoDataUrl && (
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Member Photo</p>
                <img src={sub.photoDataUrl} alt="Member" className="w-full rounded-2xl border border-slate-200 object-cover" />
              </div>
            )}
            {sub.idDocDataUrl && (
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">ID Document</p>
                <img src={sub.idDocDataUrl} alt="ID" className="w-full rounded-2xl border border-slate-200 object-cover" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
        {sub.status === "submitted" && (
          <button onClick={act(() => startReview(sub.id))} className="flex-1 rounded-2xl bg-amber-100 px-4 py-3 text-sm font-bold text-amber-900">
            Start Review
          </button>
        )}
        {(sub.status === "submitted" || sub.status === "pending") && (
          <>
            <button
              onClick={act(() => approveSubmission(sub.id))}
              className="flex-1 rounded-2xl bg-amber-600 px-4 py-3 text-sm font-bold text-white shadow-sm"
            >
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Approve
              </span>
            </button>
            <button
              onClick={() => {
                setRemark("");
                setRejectOpen(true);
              }}
              className="flex-1 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
            >
              <span className="flex items-center justify-center gap-2">
                <XCircle className="h-4 w-4" /> Reject
              </span>
            </button>
          </>
        )}
        {sub.status === "approved" && (
          <button
            onClick={act(() => {
              markPrinted(sub.id);
              window.print();
            })}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-700 px-4 py-3 text-sm font-bold text-white shadow-sm"
          >
            <Printer className="h-4 w-4" /> Print Approved KYC Form
          </button>
        )}
        {sub.status === "printed" && (
          <div className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
            <CheckCircle2 className="h-5 w-5" /> This KYC was printed and marked as Printed.
          </div>
        )}
      </div>

      <RejectModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={(r) => rejectSubmission(sub.id, r)}
      />
    </div>
  );
}

export function RejectModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: (remark: string) => void }) {
  const [remark, setRemark] = useState("");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reject KYC Submission"
      footer={
        <>
          <button onClick={onClose} className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(remark.trim() || "Information does not match");
              setRemark("");
              onClose();
            }}
            className="flex-1 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            <span className="flex items-center justify-center gap-2">
              <XCircle className="h-4 w-4" /> Confirm Rejection
            </span>
          </button>
        </>
      }
    >
      <p className="mb-3 text-sm text-slate-600">The member will be notified and asked to correct the information and resubmit.</p>
      <textarea
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        rows={3}
        placeholder="Reason for rejection (optional)"
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
      />
    </Modal>
  );
}
