import { useRef, useState, type FormEvent } from "react";
import { Loader2, PlusCircle } from "lucide-react";
import { useStore } from "../../lib/store";
import { navigate } from "../../lib/router";
import { Field } from "../../components/ui";

export default function OfflineEntry() {
  const { offlineAdd } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    memberName: "",
    phone: "",
    membershipCode: "",
    address: "",
    idDocType: "Aadhaar",
  });
  const [idDoc, setIdDoc] = useState<{ dataUrl?: string; name?: string }>({});
  const [busy, setBusy] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
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
  };

  if (doneId) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-sm border border-slate-100">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
          <PlusCircle className="h-10 w-10 text-amber-600" />
        </div>
        <h2 className="mt-5 text-xl font-extrabold text-slate-900">Entry Created</h2>
        <p className="mt-2 text-sm text-slate-500">
          The manually entered KYC for <span className="font-bold text-slate-700">{form.memberName}</span> was
          saved and sent to the manager review queue.
        </p>
        <div className="mt-6 flex gap-2">
          <button onClick={() => navigate(`/admin/submissions/${doneId}`)} className="flex-1 rounded-2xl bg-amber-600 py-3 text-sm font-bold text-white">
            View Submission
          </button>
          <button onClick={() => navigate("/admin")} className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-700">
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Offline Entry</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Staff can manually enter KYC details for members who cannot complete the online form.
        </p>
      </div>

      <form onSubmit={submit} className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Member Name" required>
            <input required value={form.memberName} onChange={(e) => setForm({ ...form, memberName: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
          </Field>
          <Field label="Phone Number" required>
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Membership Code">
            <input value={form.membershipCode} onChange={(e) => setForm({ ...form, membershipCode: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
          </Field>
          <Field label="ID Document Type">
            <select value={form.idDocType} onChange={(e) => setForm({ ...form, idDocType: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100">
              {["Aadhaar", "PAN", "Voter ID", "Passport", "Driving License"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Address">
          <textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
        </Field>
        <Field label="ID Document (photo)">
          <input ref={fileRef} type="file" accept="image/*" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const { fileToDataUrl } = await import("../../lib/image");
            setIdDoc({ dataUrl: await fileToDataUrl(f), name: f.name });
          }} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
        </Field>
        <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-sm font-bold text-white disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
          Create Submission
        </button>
      </form>
    </div>
  );
}
