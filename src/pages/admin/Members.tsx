import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  Building2,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Link2,
  MessageSquare,
  Plus,
  RefreshCcw,
  Send,
  Smartphone,
  Sparkles,
  Upload,
  UserPlus,
  Users as UsersIcon,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { Avatar, Field, SmsModal, StatusPill } from "../../components/ui";
import { parseCsv } from "../../lib/csv";
import { navigate } from "../../lib/router";

export default function Members() {
  const { state, addMembers, resendInvite, sendMemberSms } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState<{
    rows: { name: string; phone: string; membershipCode: string }[];
    errors: string[];
  } | null>(null);
  const [fileName, setFileName] = useState("");
  const [notice, setNotice] = useState("");
  const [manual, setManual] = useState({ name: "", phone: "", membershipCode: "" });
  const [activeSms, setActiveSms] = useState<{
    name: string;
    phone: string;
    inviteCode: string;
    otp: string;
    link: string;
  } | null>(null);

  const members = useMemo(
    () => [...state.members].sort((a, b) => a.invitedAt - b.invitedAt),
    [state.members]
  );

  const onFile = async (file: File) => {
    const text = await file.text();
    const result = parseCsv(text);
    setParsed(result);
    setFileName(file.name);
    setNotice(result.errors[0] ?? "");
  };

  const handleSendSms = (memberId: string) => {
    const sms = sendMemberSms(memberId);
    if (sms) {
      setActiveSms(sms);
    }
  };

  const copyInvite = async (code: string) => {
    const link = `${window.location.origin}${window.location.pathname}#/kyc/${code.toLowerCase()}`;
    try {
      await navigator.clipboard.writeText(link);
      setNotice(`✓ Link copied for code ${code}!`);
      setTimeout(() => setNotice(""), 2500);
    } catch {
      // ignore
    }
  };

  const submitManual = (e: FormEvent) => {
    e.preventDefault();
    if (!manual.name.trim() || !manual.phone.trim()) return;
    addMembers([
      {
        name: manual.name,
        phone: manual.phone,
        membershipCode: manual.membershipCode,
      },
    ]);
    setManual({ name: "", phone: "", membershipCode: "" });
    setNotice("✓ Member added! SMS invite generated.");
    setTimeout(() => setNotice(""), 3000);
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Member Management & SMS Dispatch
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage member directory and trigger SMS invitations containing personalized links and OTP codes.
        </p>
      </div>

      {/* Step 2 Callout Banner: Ram's SMS Link */}
      <div className="rounded-3xl bg-gradient-to-br from-[#145C45] via-[#1a7357] to-[#0f4534] p-5 text-white shadow-xl border border-[#145C45]/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#145C45]/50 px-2.5 py-0.5 text-[11px] font-bold text-[#DDF3E7] border border-[#1a7357]/60">
              <Sparkles className="h-3 w-3 text-amber-300" /> Step 2: Member Receives SMS
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              Send SMS to Ram Sharma (+977 9812345678)
            </h3>
            <p className="text-xs text-[#DDF3E7] leading-relaxed max-w-xl">
              System sends Ram a personalized link and OTP:{" "}
              <span className="font-mono font-bold text-amber-300">
                kyc.coop/abc123 + OTP 123456
              </span>
              . Ram can then verify the OTP and fill the pre-filled form.
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => handleSendSms("mem_ram")}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#145C45] hover:bg-[#0f4534] active:scale-95 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#145C45]/30 transition cursor-pointer"
            >
              <Send className="h-4 w-4" /> Send SMS to Ram
            </button>
            <button
              onClick={() => navigate("/kyc/abc123")}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#145C45]/90 hover:bg-[#0f4534] px-4 py-2.5 text-xs font-semibold text-[#DDF3E7] transition cursor-pointer"
            >
              <Smartphone className="h-3.5 w-3.5" /> Open Ram's KYC (abc123)
            </button>
          </div>
        </div>
      </div>

      {notice && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-center text-xs font-bold text-emerald-800 animate-fade-in">
          {notice}
        </div>
      )}

      {/* CSV Import Card */}
      <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Upload className="h-4 w-4 text-[#145C45]" /> Bulk Member Import (CSV)
        </h3>

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
            dragOver
              ? "border-[#145C45]/40 bg-[#145C45]/5"
              : "border-slate-300 bg-slate-50/70 hover:bg-slate-100/70"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DDF3E7] text-[#145C45]">
            <Upload className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">
            Drag & drop member CSV file here or click to browse
          </p>
          <p className="text-xs text-slate-400">
            Expected columns: Full Name, Phone Number, Membership Code
          </p>
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

        <div className="flex gap-2">
          <a
            href={`${import.meta.env.BASE_URL}sample-members.csv`}
            download="sample-members.csv"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" /> Download sample CSV
          </a>
        </div>

        {/* CSV Preview */}
        {parsed && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-800">
                Preview: {fileName} ({parsed.rows.length} valid members found)
              </p>
              <button
                onClick={() => {
                  addMembers(parsed.rows);
                  setParsed(null);
                  setFileName("");
                  setNotice(`✓ Added ${parsed.rows.length} members successfully!`);
                  setTimeout(() => setNotice(""), 3000);
                }}
                className="flex items-center gap-1 rounded-xl bg-[#145C45] hover:bg-[#0f4534] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Import All
              </button>
            </div>
            <div className="max-h-40 overflow-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 font-bold">#</th>
                    <th className="px-3 py-2 font-bold">Name</th>
                    <th className="px-3 py-2 font-bold">Phone</th>
                    <th className="px-3 py-2 font-bold">Code</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-3 py-1.5">{i + 1}</td>
                      <td className="px-3 py-1.5 font-bold text-slate-800">{r.name}</td>
                      <td className="px-3 py-1.5 font-mono">{r.phone}</td>
                      <td className="px-3 py-1.5 font-semibold text-[#145C45]">
                        {r.membershipCode}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Manual Member Add */}
      <form
        onSubmit={submitManual}
        className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-3"
      >
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
          <UserPlus className="h-4 w-4 text-[#145C45]" /> Add Single Member Manually
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Full Name" required>
            <input
              required
              value={manual.name}
              onChange={(e) => setManual({ ...manual, name: e.target.value })}
              placeholder="e.g. Ramesh Karki"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs sm:text-sm outline-none transition focus:border-[#145C45] focus:ring-2 focus:ring-[#DDF3E7]"
            />
          </Field>
          <Field label="Mobile Number" required>
            <input
              required
              value={manual.phone}
              onChange={(e) => setManual({ ...manual, phone: e.target.value })}
              placeholder="e.g. 9812345678"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs sm:text-sm outline-none transition focus:border-[#145C45] focus:ring-2 focus:ring-[#DDF3E7] font-mono"
            />
          </Field>
          <Field label="Membership Code">
            <input
              value={manual.membershipCode}
              onChange={(e) => setManual({ ...manual, membershipCode: e.target.value })}
              placeholder="Auto-generated if empty"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs sm:text-sm outline-none transition focus:border-[#145C45] focus:ring-2 focus:ring-[#DDF3E7]"
            />
          </Field>
        </div>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#145C45] hover:bg-[#0f4534] py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition sm:w-auto sm:px-6 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Save &amp; Generate SMS Invite
        </button>
      </form>

      {/* Members Directory List */}
      <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <UsersIcon className="h-4 w-4 text-[#145C45]" /> Registered Cooperative Members ({members.length})
          </h3>
          <span className="text-xs text-slate-400">Step 2: Trigger SMS</span>
        </div>

        <div className="space-y-2.5">
          {members.length === 0 && (
            <p className="py-6 text-center text-xs text-slate-400">
              No members found. Upload a CSV or add manually.
            </p>
          )}

          {members.map((m) => {
            const isDemo = m.isDemo || m.id === "mem_ram";
            return (
              <div
                key={m.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl p-3.5 border transition ${
                  isDemo
                    ? "border-[#145C45]/30 bg-[#145C45]/5 ring-1 ring-[#145C45]/30"
                    : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-900 truncate">
                        {m.name}
                      </p>
                      {isDemo && (
                        <span className="rounded-full bg-[#145C45] text-white text-[10px] font-extrabold px-2 py-0.5">
                          Demo Member
                        </span>
                      )}
                      <StatusPill status={m.status} />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Code: <span className="font-bold text-slate-700">{m.membershipCode}</span> · Phone:{" "}
                      <span className="font-mono text-slate-700">+977 {m.phone}</span> · Link:{" "}
                      <span className="font-mono font-bold text-[#145C45]">
                        kyc.coop/{m.inviteCode.toLowerCase()}
                      </span>{" "}
                      · OTP: <span className="font-mono font-bold text-amber-700">{m.otp}</span>
                    </p>
                  </div>
                </div>

                {/* Action Buttons for this member */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  {/* Send / Preview SMS Button */}
                  <button
                    onClick={() => handleSendSms(m.id)}
                    className="flex items-center gap-1 rounded-xl bg-[#145C45] hover:bg-[#0f4534] active:scale-95 text-white px-3 py-2 text-xs font-bold shadow-sm transition cursor-pointer"
                    title="Send SMS and view link & OTP"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send SMS</span>
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={() => void copyInvite(m.inviteCode)}
                    className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 px-2.5 py-2 text-xs font-medium text-slate-700 transition cursor-pointer"
                    title="Copy KYC link to clipboard"
                    aria-label="Copy link"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </button>

                  {/* Open Direct */}
                  <button
                    onClick={() => navigate(`/kyc/${m.inviteCode.toLowerCase()}`)}
                    className="flex items-center gap-1 rounded-xl border border-[#145C45]/30 bg-[#145C45]/5 hover:bg-[#DDF3E7] px-2.5 py-2 text-xs font-bold text-[#145C45] transition cursor-pointer"
                    title="Open form page"
                    aria-label="Open Form"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>

                  {/* Refresh OTP */}
                  <button
                    onClick={() => {
                      resendInvite(m.id);
                      setNotice(`✓ New OTP generated for ${m.name}`);
                      setTimeout(() => setNotice(""), 2000);
                    }}
                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 p-2 text-slate-500 transition"
                    title="Regenerate OTP"
                    aria-label="Resend"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SMS Simulation Modal */}
      <SmsModal
        open={Boolean(activeSms)}
        onClose={() => setActiveSms(null)}
        data={activeSms}
      />
    </div>
  );
}
