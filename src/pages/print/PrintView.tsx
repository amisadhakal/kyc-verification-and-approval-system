import { ArrowLeft, CheckCircle2, FileText, Printer } from "lucide-react";
import { useStore } from "../../lib/store";
import { navigate } from "../../lib/router";
import { formatDateTime } from "../../lib/utils";
import { StatusPill } from "../../components/ui";

export default function PrintView({ id }: { id: string }) {
  const { getSubmission, markPrinted } = useStore();
  const sub = getSubmission(id);

  if (!sub) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-100 p-6 text-center">
        <FileText className="h-10 w-10 text-slate-400" />
        <p className="font-bold text-slate-700">KYC form not found.</p>
        <button
          onClick={() => navigate("/admin")}
          className="rounded-2xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800 transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const doPrint = () => {
    markPrinted(sub.id);
    window.print();
  };

  return (
    <div className="min-h-dvh bg-slate-100 pb-12">
      {/* Action Bar (Hidden during actual paper print) */}
      <div className="no-print sticky top-0 z-30 border-b border-blue-950 bg-slate-900 px-4 py-3 shadow-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <button
            onClick={() => navigate(`/admin/submissions/${sub.id}`)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-200 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Submission
          </button>
          <button
            onClick={doPrint}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 px-5 py-2 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-blue-600/30 transition"
          >
            <Printer className="h-4 w-4" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Official KYC Document (Printable Area) */}
      <div className="print-area mx-auto mt-6 max-w-3xl rounded-3xl bg-white p-8 sm:p-10 shadow-xl border border-slate-200/80">
        {/* Navy Header */}
        <div className="border-b-2 border-blue-950 pb-5 text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-blue-900">
            SANGAM COOPERATIVE SOCIETY LIMITED
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            KNOW YOUR MEMBER (KYC) VERIFICATION FORM
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Membership No: <span className="font-bold text-slate-900">{sub.membershipCode}</span> ·
            Document Status: <span className="font-bold text-emerald-700">APPROVED</span> · Verification ID: KYC-{sub.id.slice(-6).toUpperCase()}
          </p>
        </div>

        {/* Member Profile Block */}
        <div className="mt-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-200 pb-6">
          <div className="w-36 shrink-0">
            {sub.photoDataUrl ? (
              <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-slate-900 shadow-sm">
                <img
                  src={sub.photoDataUrl}
                  alt="Member"
                  className="h-44 w-36 object-contain bg-slate-900"
                />
              </div>
            ) : (
              <div className="flex h-44 w-36 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                Passport Photo
              </div>
            )}
            <p className="mt-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Verified Photo
            </p>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Full Member Name
              </p>
              <h2 className="text-2xl font-black text-slate-900">
                {sub.memberName}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left text-xs">
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-400">Member Code</p>
                <p className="font-extrabold text-blue-950 mt-0.5">{sub.membershipCode}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-400">Mobile Number</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">+91 {sub.phone}</p>
              </div>
              <div className="col-span-2 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-400">Residential Address</p>
                <p className="font-semibold text-slate-800 mt-0.5">{sub.address || "—"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-400">ID Proof Type</p>
                <p className="font-bold text-slate-800 mt-0.5">{sub.idDocType ?? "Aadhaar"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-400">Verification Source</p>
                <p className="font-bold text-slate-800 mt-0.5">SMS OTP + Document</p>
              </div>
            </div>
          </div>
        </div>

        {/* Audit & Decision Log */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl border border-slate-200 p-2.5">
            <p className="text-[10px] font-bold uppercase text-slate-400">Submitted On</p>
            <p className="font-bold text-slate-800 mt-1">{formatDateTime(sub.submittedAt)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-2.5">
            <p className="text-[10px] font-bold uppercase text-slate-400">Decision</p>
            <p className="font-bold text-emerald-700 mt-1">APPROVED</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-2.5">
            <p className="text-[10px] font-bold uppercase text-slate-400">Review Officer</p>
            <p className="font-bold text-slate-800 mt-1">{sub.reviewedBy || "Manager · Suresh"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-2.5">
            <p className="text-[10px] font-bold uppercase text-slate-400">Printed On</p>
            <p className="font-bold text-slate-800 mt-1">
              {formatDateTime(sub.printedAt || Date.now())}
            </p>
          </div>
        </div>

        {/* ID Proof Display */}
        {sub.idDocDataUrl && (
          <div className="mt-5 border-t border-slate-200 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Attached Identification Proof Document ({sub.idDocType ?? "Government ID"})
            </p>
            <div className="overflow-hidden rounded-2xl border border-slate-300 bg-slate-900">
              <img
                src={sub.idDocDataUrl}
                alt="ID Proof"
                className="h-48 w-full object-contain bg-slate-900"
              />
            </div>
          </div>
        )}

        {/* Signatures & Seal Section */}
        <div className="mt-10 flex justify-between border-t-2 border-slate-300 pt-6 text-center text-xs">
          <div className="w-44">
            <div className="border-b border-dashed border-slate-400 pb-10" />
            <p className="mt-2 font-bold text-slate-800">Authorized Manager</p>
            <p className="text-[10px] text-slate-400">Sangam Cooperative Society</p>
          </div>
          <div className="w-44">
            <div className="border-b border-dashed border-slate-400 pb-10" />
            <p className="mt-2 font-bold text-slate-800">Member Signature</p>
            <p className="text-[10px] text-slate-400">{sub.memberName}</p>
          </div>
          <div className="w-32">
            <div className="border-b border-dashed border-slate-400 pb-10" />
            <p className="mt-2 font-bold text-slate-800">Official Seal</p>
            <p className="text-[10px] text-slate-400">Office Stamp</p>
          </div>
        </div>
      </div>
    </div>
  );
}
