import { ArrowLeft, CheckCircle2, FileText, Printer } from "lucide-react";
import { useStore } from "../../lib/store";
import { navigate } from "../../lib/router";
import { formatDateTime } from "../../lib/utils";
import { CoopLogo } from "../../components/CoopLogo";

export default function PrintView({ id }: { id: string }) {
  const { state, getSubmission, markPrinted } = useStore();
  const sub = getSubmission(id);
  const org = state.orgSettings;

  if (!sub) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-100 p-6 text-center">
        <FileText className="h-10 w-10 text-slate-400" />
        <p className="font-bold text-slate-700">KYC form not found.</p>
        <button
          onClick={() => navigate("/admin")}
          className="rounded-2xl bg-teal-700 px-6 py-3 font-bold text-white hover:bg-teal-800 transition cursor-pointer"
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
      <div className="no-print sticky top-0 z-30 border-b border-teal-900 bg-teal-950 px-4 py-3 shadow-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <button
            onClick={() => navigate(`/admin/submissions/${sub.id}`)}
            className="flex items-center gap-1.5 rounded-xl bg-teal-900/80 hover:bg-teal-800 px-3.5 py-2 text-xs sm:text-sm font-bold text-teal-200 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Submission
          </button>
          <button
            onClick={doPrint}
            className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 px-5 py-2 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-teal-950/30 transition cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Official KYC Document (Printable Area) */}
      <div className="print-area mx-auto mt-6 max-w-3xl rounded-3xl bg-white p-8 sm:p-10 shadow-xl border border-slate-200/80">
        {/* Organization Header with Logo */}
        <div className="border-b-2 border-teal-900 pb-5">
          <div className="flex items-center justify-center gap-4 text-center">
            <CoopLogo settings={org} className="h-14 w-14 sm:h-16 sm:w-16 shrink-0" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {org.nameNepali}
              </h1>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-900">
                {org.nameEnglish}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {org.addressNepali || org.addressEnglish}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                {org.regNo} &middot; {org.panNo} &middot; फोन: {org.phone}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-teal-50/80 border border-teal-200/80 p-2 text-center">
            <h2 className="text-sm sm:text-base font-extrabold text-teal-950 tracking-tight">
              व्यक्तिगत सदस्य पहिचान (KYM) फारम / MEMBER IDENTIFICATION (KYC) FORM
            </h2>
            <p className="text-[10px] text-teal-800 font-medium">
              सहकारी ऐन, २०७४ तथा सम्बन्धित नियमहरूको अधिनमा रही प्रमाणित गरिएको आधिकारिक विवरण
            </p>
            {org.isSample && (
              <p className="text-[10px] font-bold text-amber-700 mt-0.5">
                [नमूना फारम / Sample Official Record · Organization details configurable]
              </p>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500 px-1">
            <span>
              सदस्यता नं. (Membership No): <strong className="text-slate-900">{sub.membershipCode}</strong>
            </span>
            <span>
              प्रमाणीकरण स्थिति: <strong className="text-emerald-700 font-bold">APPROVED (प्रमाणित)</strong>
            </span>
            <span>
              KYC ID: <strong className="text-slate-900 font-mono">KYC-{sub.id.slice(-6).toUpperCase()}</strong>
            </span>
          </div>
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
                सदस्यको पूरा नाम (Full Member Name)
              </p>
              <h2 className="text-2xl font-black text-slate-900">
                {sub.memberName}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left text-xs">
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-400">सदस्य कोड (Member Code)</p>
                <p className="font-extrabold text-teal-950 mt-0.5">{sub.membershipCode}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-400">सम्पर्क फोन (Mobile)</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">+977 {sub.phone}</p>
              </div>
              <div className="col-span-2 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-400">स्थायी ठेगाना (Permanent Address)</p>
                <p className="font-semibold text-slate-800 mt-0.5">{sub.address || "—"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-400">पहिचान प्रमाण (ID Proof Type)</p>
                <p className="font-bold text-slate-800 mt-0.5">{sub.idDocType ?? "Citizenship (नागरिकता)"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-400">प्रमाणीकरण माध्यम (Verification Source)</p>
                <p className="font-bold text-slate-800 mt-0.5">SMS OTP + Scanned ID Documents</p>
              </div>
            </div>
          </div>
        </div>

        {/* Audit & Decision Log */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl border border-slate-200 p-2.5">
            <p className="text-[10px] font-bold uppercase text-slate-400">आवेदन मिति (Submitted)</p>
            <p className="font-bold text-slate-800 mt-1">{formatDateTime(sub.submittedAt)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-2.5">
            <p className="text-[10px] font-bold uppercase text-slate-400">निर्णय (Decision)</p>
            <p className="font-bold text-emerald-700 mt-1">APPROVED (स्वीकृत)</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-2.5">
            <p className="text-[10px] font-bold uppercase text-slate-400">रुजु गर्ने अधिकृत (Review Officer)</p>
            <p className="font-bold text-slate-800 mt-1">{sub.reviewedBy || "व्यवस्थापक (Manager)"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-2.5">
            <p className="text-[10px] font-bold uppercase text-slate-400">प्रिन्ट मिति (Printed Date)</p>
            <p className="font-bold text-slate-800 mt-1">
              {formatDateTime(sub.printedAt || Date.now())}
            </p>
          </div>
        </div>

        {/* ID Proof Display */}
        {sub.idDocDataUrl && (
          <div className="mt-5 border-t border-slate-200 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              संलग्न परिचयपत्र कागजात ({sub.idDocType ?? "Identification Document"})
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
            <p className="mt-2 font-bold text-slate-800">अधिकृत व्यवस्थापक (Manager)</p>
            <p className="text-[10px] text-slate-500">{org.nameNepali}</p>
          </div>
          <div className="w-44">
            <div className="border-b border-dashed border-slate-400 pb-10" />
            <p className="mt-2 font-bold text-slate-800">सदस्यको हस्ताक्षर (Signature)</p>
            <p className="text-[10px] text-slate-500">{sub.memberName}</p>
          </div>
          <div className="w-32">
            <div className="border-b border-dashed border-slate-400 pb-10" />
            <p className="mt-2 font-bold text-slate-800">कार्यालय छाप (Seal)</p>
            <p className="text-[10px] text-slate-500">Official Stamp</p>
          </div>
        </div>
      </div>
    </div>
  );
}
