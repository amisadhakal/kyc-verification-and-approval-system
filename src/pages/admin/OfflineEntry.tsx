import { useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, PlusCircle, Sparkles, Upload } from "lucide-react";
import { useStore } from "../../lib/store";
import { navigate } from "../../lib/router";
import { Field } from "../../components/ui";
import { createSampleIdCard, fileToDataUrl } from "../../lib/image";

export default function OfflineEntry() {
  const { offlineAdd } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    memberName: "",
    phone: "",
    membershipCode: "",
    address: "",
    idDocType: "Citizenship (नागरिकता)",
  });
  const [idDoc, setIdDoc] = useState<{ dataUrl?: string; name?: string }>({});
  const [busy, setBusy] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  const handleFillDemo = () => {
    setForm({
      memberName: "Bikram Thapa",
      phone: "9801234567",
      membershipCode: "MEM008",
      address: "Ward 5, Shanti Tole, Pokhara, Nepal",
      idDocType: "Citizenship",
    });
    setIdDoc({
      dataUrl: createSampleIdCard("Bikram Thapa", "MEM008", "Citizenship"),
      name: "citizenship_offline.svg",
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      const sub = offlineAdd({
        memberName: form.memberName,
        phone: form.phone,
        membershipCode: form.membershipCode,
        address: form.address,
        idDocType: form.idDocType,
        idDocDataUrl: idDoc.dataUrl,
        idDocName: idDoc.name,
      });
      setBusy(false);
      setDoneId(sub.id);
    }, 400);
  };

  if (doneId) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-lg border border-slate-200 animate-fade-in">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="mt-5 text-xl font-black text-slate-900">Offline KYC Created</h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
          The manually recorded KYC for{" "}
          <span className="font-bold text-slate-900">{form.memberName}</span> has been saved in the database
          and placed into the <span className="font-bold text-blue-900">Pending Review</span> queue.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate(`/admin/submissions/${doneId}`)}
            className="flex-1 rounded-2xl bg-blue-700 hover:bg-blue-800 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-700/20 transition"
          >
            Review Submission
          </button>
          <button
            onClick={() => navigate("/admin")}
            className="flex-1 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 py-3 text-xs sm:text-sm font-bold text-slate-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Offline KYC Entry Desk
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Staff can manually record KYC details for members who cannot access smartphones or SMS.
          </p>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-3 py-1.5 text-xs font-bold text-teal-900 hover:bg-teal-100 transition cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-teal-700" /> Auto-fill Sample
        </button>
      </div>

      <form
        onSubmit={submit}
        className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Member Full Name" required>
            <input
              required
              value={form.memberName}
              onChange={(e) => setForm({ ...form, memberName: e.target.value })}
              placeholder="e.g. Ram Bahadur"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs sm:text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            />
          </Field>
          <Field label="Mobile Phone Number" required>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 9812345678"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs sm:text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100 font-mono"
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Membership Code">
            <input
              value={form.membershipCode}
              onChange={(e) => setForm({ ...form, membershipCode: e.target.value })}
              placeholder="e.g. MEM008 (or auto)"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs sm:text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            />
          </Field>
          <Field label="Identity Document Type">
            <select
              value={form.idDocType}
              onChange={(e) => setForm({ ...form, idDocType: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs sm:text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100 bg-white cursor-pointer"
            >
              {[
                "Citizenship (नागरिकता)",
                "National ID (राष्ट्रिय परिचयपत्र)",
                "Passport (राहदानी)",
                "PAN Card (स्थायी लेखा नं.)",
                "Voter ID (मतदाता परिचयपत्र)",
                "Driving License (सवारी चालक अनुमतिपत्र)",
              ].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Permanent Address" required>
          <textarea
            required
            rows={3}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Ward no., street, municipality / rural municipality, district"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs sm:text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          />
        </Field>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">
            Scanned ID Document Photo
          </label>
          {idDoc.dataUrl ? (
            <div className="relative rounded-2xl border border-slate-200 bg-slate-900 p-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-white pl-2">
                ✓ Document Attached
              </span>
              <button
                type="button"
                onClick={() => setIdDoc({})}
                className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-4 px-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <Upload className="h-4 w-4 text-slate-500" />
              Upload Scanned ID Document Image
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const url = await fileToDataUrl(f);
              setIdDoc({ dataUrl: url, name: f.name });
            }}
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-[0.98] py-3.5 text-sm font-bold text-white shadow-md shadow-teal-900/20 transition disabled:opacity-60 cursor-pointer"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="h-4 w-4" />
          )}
          <span>Save KYC to Pending Review Queue</span>
        </button>
      </form>
    </div>
  );
}
