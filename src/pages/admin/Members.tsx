import { useMemo, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, ClipboardList, Link2, Plus, RefreshCcw, Upload, UserPlus, Users as UsersIcon, XCircle } from "lucide-react";
import { useStore } from "../../lib/store";
import { Avatar, Field, StatusPill } from "../../components/ui";
import { downloadSampleCsv, parseCsv } from "../../lib/csv";

export default function Members() {
  const { state, addMembers, resendInvite } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState<{ rows: { name: string; phone: string; membershipCode: string }[]; errors: string[] } | null>(null);
  const [fileName, setFileName] = useState("");
  const [notice, setNotice] = useState("");
  const [manual, setManual] = useState({ name: "", phone: "", membershipCode: "" });

  const members = useMemo(() => [...state.members].sort((a, b) => a.invitedAt - b.invitedAt), [state.members]);

  const onFile = async (file: File) => {
    const text = await file.text();
    const result = parseCsv(text);
    setParsed(result);
    setFileName(file.name);
    setNotice(result.errors[0] ?? "");
  };

  const copyInvite = async (code: string) => {
    const link = `${window.location.origin}${window.location.pathname}#/kyc/${code}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // clipboard may be unavailable; ignore
    }
  };

  const submitManual = (e: FormEvent) => {
    e.preventDefault();
    if (!manual.name.trim() || !manual.phone.trim()) return;
    addMembers([{ name: manual.name, phone: manual.phone, membershipCode: manual.membershipCode }]);
    setManual({ name: "", phone: "", membershipCode: "" });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Member Management</h2>
        <p className="mt-0.5 text-sm text-slate-500">Add members via CSV upload or manual entry. They receive an SMS invite with OTP.</p>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) void onFile(f);
          }}
          onClick={() => fileRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
            dragOver ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-slate-50"
          }`}
        >
          <Upload className={`h-9 w-9 ${dragOver ? "text-emerald-600" : "text-slate-400"}`} />
          <p className="text-sm font-bold text-slate-700">Drag & drop member list (CSV)</p>
          <p className="text-xs text-slate-400">or click to browse — columns: Name, Phone Number, Membership Code</p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
            }}
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => {
              const blob = new Blob([downloadSampleCsv()], { type: "text/csv" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "members-sample.csv";
              a.click();
            }}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600"
          >
            Download sample CSV
          </button>
        </div>

        {parsed && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700">Preview — {fileName}</p>
              <button
                onClick={() => {
                  addMembers(parsed.rows);
                  setParsed(null);
                  setFileName("");
                }}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
              >
                <Plus className="h-4 w-4" /> Add {parsed.rows.length} Members
              </button>
            </div>
            {parsed.errors[0] && <p className="mt-2 text-xs font-medium text-red-600">{parsed.errors[0]}</p>}
            <div className="mt-3 max-h-40 overflow-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 font-bold">#</th>
                    <th className="px-3 py-2 font-bold">Name</th>
                    <th className="px-3 py-2 font-bold">Phone</th>
                    <th className="px-3 py-2 font-bold">Member Code</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2 font-semibold">{r.name}</td>
                      <td className="px-3 py-2">{r.phone}</td>
                      <td className="px-3 py-2">{r.membershipCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.rows.length > 10 && (
                <p className="border-t border-slate-100 p-2 text-center text-xs text-slate-400">
                  + {parsed.rows.length - 10} more rows
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={submitManual} className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <UserPlus className="h-5 w-5 text-emerald-600" /> Add Member Manually
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Field label="Full Name" required>
            <input required value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} placeholder="Ram Sharma" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </Field>
          <Field label="Phone Number" required>
            <input required value={manual.phone} onChange={(e) => setManual({ ...manual, phone: e.target.value })} placeholder="919812345678" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </Field>
          <Field label="Membership Code">
            <input value={manual.membershipCode} onChange={(e) => setManual({ ...manual, membershipCode: e.target.value })} placeholder="MEM006" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </Field>
        </div>
        <button type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white sm:w-auto sm:px-8">
          <Plus className="h-4 w-4" /> Add Member
        </button>
        {notice && <p className="mt-3 text-xs font-medium text-amber-700">{notice}</p>}
      </form>

      <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <UsersIcon className="h-5 w-5 text-emerald-600" /> All Members ({members.length})
        </h3>
        <div className="mt-4 space-y-2">
          {members.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No members added yet.</p>}
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl p-2.5">
              <Avatar name={m.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{m.name}</p>
                <p className="text-xs text-slate-500">
                  {m.membershipCode} · {m.phone}
                </p>
              </div>
              <StatusPill status={m.status} />
              <button
                onClick={() => void copyInvite(m.inviteCode)}
                className="rounded-lg bg-slate-100 p-2 text-slate-500"
                aria-label="Copy invite link"
              >
                <Link2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => resendInvite(m.id)}
                className="rounded-lg bg-amber-50 p-2 text-amber-600"
                aria-label="Resend invite"
              >
                <RefreshCcw className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {notice && !parsed && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-5 w-5" /> Members added successfully.
        </div>
      )}
    </div>
  );
}
