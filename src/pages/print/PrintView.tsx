import { ArrowLeft, CheckCircle2, Printer } from "lucide-react";
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
        <p className="font-bold text-slate-700">KYC form not found.</p>
        <button onClick={() => navigate("/admin")} className="rounded-2xl bg-emerald-600 px-6 py-3 font-bold text-white">
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
    <div>
      <div className="no-print sticky top-0 z-10 border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div className="mx-auto flex max-w-3xl gap-2">
          <button
            onClick={() => navigate(`/admin/submissions/${sub.id}`)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button onClick={doPrint} className="flex-1 rounded-xl bg-emerald-600 px-4 py2 text-sm font-bold text-white">
            <span className="flex items-center justify-center gap-2">
              <Printer className="h-4 w-4" /> Mark as Printed & Print PDF
            </span>
          </button>
        </div>
      </div>

      <div className="print-area mx-auto max-w-3xl bg-white p-6 shadow-2xl">
        <div className="border-b-2 border-emerald-800 pb-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Sangam Cooperative Society</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Know Your Member (KYC) Form</h1>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            Form No: {sub.membershipCode} · Status: <span className="text-emerald-700">Approved</span>
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
          <div className="w-40 shrink-0">
            {sub.photoDataUrl ? (
              <img src={sub.photoDataUrl} alt="Member" className="h-40 w-40 rounded-2xl border border-slate-200 object-cover" />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">No Photo</div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Member Name</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{sub.memberName}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-left text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Member Code</p>
                <p className="font-bold text-slate-800">{sub.membershipCode}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Phone</p>
                <p className="font-bold text-slate-800">{sub.phone}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Address</p>
                <p className="font-bold text-slate-800">{sub.address || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">ID Document</p>
                <p className="font-bold text-slate-800">{sub.idDocType ?? "—"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Submitted On</p>
            <p className="font-bold text-slate-800">{formatDateTime(sub.submittedAt)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Reviewed On</p>
            <p className="font-bold text-slate-800">{formatDateTime(sub.reviewedAt)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Printed On</p>
            <p className="font-bold text-slate-800">{formatDateTime(sub.printedAt)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Review Remarks</p>
            <p className="font-bold text-slate-800">{sub.remark || "—"}</p>
          </div>
        </div>

        {sub.idDocDataUrl && (
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">ID Proof</p>
            <img src={sub.idDocDataUrl} alt="ID" className="mt-2 h-40 w-full rounded-xl border border-slate-200 object-cover" />
          </div>
        )}

        <div className="mt-10 flex justify-between border-t border-slate-300 pt-4">
          <div className="w-44 text-center">
            <div className="border-b border-slate-400 pb-8" />
            <p className="mt-2 text-xs font-bold text-slate-600">Authorized Signatory</p>
          </div>
          <div className="w-44 text-center">
            <div className="border-b border-slate-400 pb-8" />
            <p className="mt-2 text-xs font-bold text-slate-600">Member Signature</p>
          </div>
          <div className="w-44 text-center">
            <div className="border-b border-slate-400 pb-8" />
            <p className="mt-2 text-xs font-bold text-slate-600">Date</p>
          </div>
        </div>
      </div>

      <div className="no-print mx-auto mt-4 max-w-3xl rounded-2xl bg-emerald-950 p-4 text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-100">
          <CheckCircle2 className="h-5 w-5" /> KYC {sub.membershipCode} for {sub.memberName} approved — ready to print.
        </p>
      </div>
    </div>
  );
}
