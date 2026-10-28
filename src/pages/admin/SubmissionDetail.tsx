import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Maximize2,
  Printer,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { navigate } from "../../lib/router";
import { formatDateTime } from "../../lib/utils";
import { Avatar, Modal, StatusPill, StatusStepper } from "../../components/ui";

const QUICK_REJECTION_REASONS = [
  "Address on proof does not match permanent residence",
  "ID document image is blurry or unreadable",
  "Photograph does not meet passport specifications",
  "Incorrect document type uploaded",
  "Name mismatch between ID proof and cooperative record",
];

export default function SubmissionDetail({ id }: { id: string }) {
  const { state, getSubmission, approveSubmission, rejectSubmission, markPrinted } =
    useStore();
  const sub = getSubmission(id);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  if (!sub) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-sm border border-slate-200">
        <FileText className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 font-bold text-slate-700">Submission not found</p>
        <button
          onClick={() => navigate("/admin")}
          className="mt-4 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-800 transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleApprove = () => {
    approveSubmission(sub.id);
    showToast(`✓ Approved KYC for ${sub.memberName}`);
  };

  const handlePrint = () => {
    markPrinted(sub.id);
    navigate(`/print/${sub.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-12">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-900 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Submissions
        </button>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-900 border border-blue-200">
          KYC-{sub.membershipCode}
        </span>
      </div>

      {toast && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-center text-xs font-bold text-emerald-800 animate-fade-in">
          {toast}
        </div>
      )}

      {/* Member Card */}
      <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-3">
          <Avatar name={sub.memberName} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-slate-900 truncate">
              {sub.memberName}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Member Code: <span className="font-bold text-slate-700">{sub.membershipCode}</span> ·
              Phone: <span className="font-bold text-slate-700">+91 {sub.phone}</span>
            </p>
          </div>
          <StatusPill status={sub.status} />
        </div>

        <div className="pt-2 border-t border-slate-100">
          <StatusStepper status={sub.status} />
        </div>
      </div>

      {/* Member Data Details */}
      <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Submitted KYC Information
        </h3>
        <dl className="space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between gap-4 py-1 border-b border-slate-50">
            <dt className="text-slate-500 font-medium">Residential Address</dt>
            <dd className="text-right font-bold text-slate-900 max-w-[65%]">
              {sub.address || "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-1 border-b border-slate-50">
            <dt className="text-slate-500 font-medium">Document Proof Type</dt>
            <dd className="text-right font-bold text-slate-900">
              {sub.idDocType ?? "Government ID"}
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-1 border-b border-slate-50">
            <dt className="text-slate-500 font-medium">Submitted On</dt>
            <dd className="text-right font-bold text-slate-800">
              {formatDateTime(sub.submittedAt)}
            </dd>
          </div>
          {sub.reviewedAt && (
            <div className="flex justify-between gap-4 py-1 border-b border-slate-50">
              <dt className="text-slate-500 font-medium">Review Decision</dt>
              <dd className="text-right font-bold text-slate-800">
                {formatDateTime(sub.reviewedAt)} · {sub.reviewedBy}
              </dd>
            </div>
          )}
          {sub.printedAt && (
            <div className="flex justify-between gap-4 py-1 border-b border-slate-50">
              <dt className="text-slate-500 font-medium">Printed At</dt>
              <dd className="text-right font-bold text-slate-800">
                {formatDateTime(sub.printedAt)}
              </dd>
            </div>
          )}
          {sub.remark && (
            <div className="rounded-2xl bg-rose-50 p-3.5 border border-rose-200 mt-2">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                Manager Rejection Remark:
              </dt>
              <dd className="mt-1 text-xs font-semibold text-rose-900">
                {sub.remark}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Uploaded Documents Review Section */}
      <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Uploaded Documents & Proofs (Tap to enlarge)
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Photo */}
          <div className="rounded-2xl border border-slate-200 p-3 bg-slate-50 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Member Photo</span>
              <span className="text-[10px] text-blue-700 bg-blue-100 font-bold px-2 py-0.5 rounded-md">
                Passport Photo
              </span>
            </div>
            {sub.photoDataUrl ? (
              <div
                onClick={() =>
                  setEnlargedImage({
                    url: sub.photoDataUrl!,
                    title: `Member Photo - ${sub.memberName}`,
                  })
                }
                className="group relative cursor-pointer overflow-hidden rounded-xl bg-slate-900 border border-slate-200"
              >
                <img
                  src={sub.photoDataUrl}
                  alt="Member"
                  className="h-44 w-full object-contain group-hover:scale-105 transition"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                  <Maximize2 className="h-4 w-4" /> Tap to Enlarge
                </div>
              </div>
            ) : (
              <div className="flex h-44 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                No photo uploaded
              </div>
            )}
          </div>

          {/* ID Document */}
          <div className="rounded-2xl border border-slate-200 p-3 bg-slate-50 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">
                {sub.idDocType ?? "ID Document"}
              </span>
              <span className="text-[10px] text-blue-700 bg-blue-100 font-bold px-2 py-0.5 rounded-md">
                Front Proof
              </span>
            </div>
            {sub.idDocDataUrl ? (
              <div
                onClick={() =>
                  setEnlargedImage({
                    url: sub.idDocDataUrl!,
                    title: `${sub.idDocType ?? "ID"} Proof - ${sub.memberName}`,
                  })
                }
                className="group relative cursor-pointer overflow-hidden rounded-xl bg-slate-900 border border-slate-200"
              >
                <img
                  src={sub.idDocDataUrl}
                  alt="ID Document"
                  className="h-44 w-full object-contain group-hover:scale-105 transition"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                  <Maximize2 className="h-4 w-4" /> Tap to Enlarge
                </div>
              </div>
            ) : (
              <div className="flex h-44 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                No ID document uploaded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User-Friendly Mobile-Focused Action Card */}
      <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Manager Action
        </h3>

        {(sub.status === "pending" || sub.status === "submitted") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleApprove}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] py-3.5 px-4 text-sm font-extrabold text-white shadow-md shadow-emerald-600/20 transition focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>Approve KYC</span>
            </button>

            <button
              onClick={() => setRejectOpen(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 active:scale-[0.98] py-3.5 px-4 text-sm font-extrabold transition focus:outline-none focus:ring-4 focus:ring-rose-200"
            >
              <XCircle className="h-5 w-5 text-rose-600" />
              <span>Reject KYC</span>
            </button>
          </div>
        )}

        {sub.status === "approved" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              This KYC is Approved. You can now generate and print the official form.
            </div>
            <button
              onClick={handlePrint}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-blue-950 active:scale-[0.98] py-3.5 text-sm font-extrabold text-white shadow-lg shadow-slate-900/25 transition focus:outline-none focus:ring-4 focus:ring-slate-400"
            >
              <Printer className="h-5 w-5" />
              <span>Print Official KYC Document</span>
            </button>
          </div>
        )}

        {sub.status === "printed" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-2xl bg-blue-50 p-3 text-xs font-bold text-blue-900 border border-blue-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-700" />
              This KYC has been printed and archived in society records.
            </div>
            <button
              onClick={handlePrint}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 py-3 text-xs font-bold text-slate-800 transition"
            >
              <Printer className="h-4 w-4 text-slate-500" />
              <span>Reprint KYC Form</span>
            </button>
          </div>
        )}

        {sub.status === "rejected" && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-800 border border-rose-200">
            <XCircle className="h-4 w-4 shrink-0" />
            Member was notified of rejection. They can resubmit with corrected information.
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <RejectModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={(remark) => {
          rejectSubmission(sub.id, remark);
          showToast(`Marked as Rejected: ${remark}`);
        }}
      />

      {/* Image Lightbox Modal */}
      {enlargedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative max-w-2xl w-full bg-slate-950 rounded-3xl p-4 text-white border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold truncate">{enlargedImage.title}</h4>
              <button
                onClick={() => setEnlargedImage(null)}
                className="rounded-full bg-slate-800 p-1.5 text-slate-300 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img
                src={enlargedImage.url}
                alt="Enlarged"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function RejectModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (remark: string) => void;
}) {
  const [remark, setRemark] = useState("");

  const handleSelectPreset = (reason: string) => {
    setRemark(reason);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reject KYC Submission"
      footer={
        <>
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(remark.trim() || "Information or document did not match records.");
              setRemark("");
              onClose();
            }}
            className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-rose-600/20 transition"
          >
            Confirm Rejection
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          Select or enter the reason for rejection. The member will be notified so they can correct it:
        </p>

        {/* Quick Reasons Chips */}
        <div>
          <label className="text-[11px] font-bold uppercase text-slate-400 mb-1.5 block">
            Quick Reasons:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_REJECTION_REASONS.map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => handleSelectPreset(r)}
                className={`rounded-xl px-2.5 py-1.5 text-left text-[11px] font-semibold transition active:scale-95 ${
                  remark === r
                    ? "bg-rose-100 text-rose-900 border border-rose-300"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Custom remark textarea */}
        <div>
          <label className="text-[11px] font-bold uppercase text-slate-400 mb-1 block">
            Specific Remark:
          </label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={3}
            placeholder="e.g. Address mismatch or blurry Aadhaar copy"
            className="w-full rounded-2xl border border-slate-300 p-3 text-xs text-slate-900 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
          />
        </div>
      </div>
    </Modal>
  );
}
