import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileText,
  Loader2,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { navigate } from "../../lib/router";
import { formatDateTime } from "../../lib/utils";
import { STATUS_LABEL } from "../../lib/types";
import { StatusPill, StatusStepper } from "../../components/ui";
import type { Member } from "../../lib/types";

type Step = "loading" | "invalid" | "otp" | "form" | "success" | "status";

export default function KycFlow({ code }: { code: string }) {
  const { state, findByInviteCode, submitKyc, resendInvite } = useStore();
  const member = useMemo(() => findByInviteCode(code), [state.members, code]); // eslint-disable-line react-hooks/exhaustive-deps

  const [step, setStep] = useState<Step>("loading");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState<{ dataUrl?: string; name?: string }>({});
  const [idDocType, setIdDocType] = useState("Aadhaar");
  const [idDoc, setIdDoc] = useState<{ dataUrl?: string; name?: string }>({});

  const firstOtpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setPhone(member.phone);
      setStep(member.status === "invited" ? "otp" : "status");
    } else {
      setStep("invalid");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.id]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  useEffect(() => {
    if (step === "otp" && member) {
      const secs = Math.max(0, Math.ceil((member.otpExpiresAt - Date.now()) / 1000));
      setSecondsLeft(secs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, member?.id]);

  if (step === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-emerald-700">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  if (step === "invalid") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-emerald-50 p-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <Smartphone className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Link not found</h1>
        <p className="max-w-xs text-sm text-slate-500">
          This KYC invitation link is invalid or has expired. Please ask your cooperative admin for a new
          link.
        </p>
        <button
          onClick={() => navigate("/admin")}
          className="mt-2 rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white"
        >
          Go to Portal
        </button>
      </div>
    );
  }

  if (step === "status" && member) {
    return (
      <MemberStatus member={member} />
    );
  }

  if (step === "success" && member) {
    return (
      <div className="min-h-dvh bg-emerald-50 pb-10">
        <div className="mx-auto flex max-w-md flex-col items-center px-6 pt-16 text-center">
          <div className="animate-pop flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-14 w-14 text-emerald-600" />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold text-slate-900">KYC Submitted!</h1>
          <p className="mt-2 text-sm text-slate-500">
            Thank you, <span className="font-semibold text-slate-700">{member.name}</span>. Your KYC details
            have been received and are pending manager review.
          </p>
          <div className="mt-6 w-full rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <dl className="space-y-2 text-left text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Member Code</dt>
                <dd className="font-semibold text-slate-800">{member.membershipCode}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Submitted At</dt>
                <dd className="font-semibold text-slate-800">{formatDateTime(Date.now())}</dd>
              </div>
            </dl>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="mt-8 w-full rounded-2xl bg-emerald-600 py-4 font-bold text-white shadow-lg shadow-emerald-200"
          >
            Back to Portal
          </button>
        </div>
      </div>
    );
  }

  // OTP step
  if (step === "otp" && member) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-emerald-700 via-emerald-600 to-emerald-50">
        <div className="mx-auto flex max-w-md flex-col px-6 pt-14">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <ShieldCheck className="h-9 w-9 text-white" />
            </div>
            <h1 className="mt-5 text-2xl font-extrabold text-white">Verify OTP</h1>
            <p className="mt-1 text-sm text-emerald-50/90">
              Hi {member.name}, enter the verification code sent to your phone
            </p>
          </div>

          <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex justify-center gap-2.5">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={i === 0 ? firstOtpRef : undefined}
                  value={d}
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    const next = [...otp];
                    next[i] = v;
                    setOtp(next);
                    if (v && i < 5) firstOtpRef.current?.focus(i + 1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") {
                      e.preventDefault();
                      const next = [...otp];
                      if (i > 0) next[i - 1] = "";
                      setOtp(next);
                      firstOtpRef.current?.focus(i - 1 < 0 ? 0 : i - 1);
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                    if (!text) return;
                    const next = [...otp];
                    for (let k = 0; k < text.length; k++) next[k] = text[k];
                    setOtp(next);
                    firstOtpRef.current?.focus(Math.min(text.length, 5));
                  }}
                  className={`h-13 w-11 rounded-xl border bg-slate-50 text-center text-xl font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${
                    otp[i] ? "border-emerald-500 bg-emerald-50" : "border-slate-200"
                  }`}
                />
              ))}
            </div>
            {otpError && <p className="mt-3 text-center text-sm font-medium text-red-600">{otpError}</p>}

            <button
              onClick={() => {
                const codeStr = otp.join("");
                if (codeStr.length < 6) {
                  setOtpError("Please enter all 6 digits.");
                  return;
                }
                setOtpError("");
                setStep("form");
              }}
              className="mt-5 w-full rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-200"
            >
              Verify & Continue
            </button>

            <div className="mt-5 rounded-2xl bg-emerald-50 p-3 text-center">
              <p className="text-xs text-emerald-800">
                Demo mode — your OTP is <span className="font-extrabold tracking-widest">{member.otp}</span>
              </p>
              {secondsLeft > 0 ? (
                <p className="mt-1 text-xs text-emerald-700">Resend code in {secondsLeft}s</p>
              ) : (
                <button
                  onClick={() => {
                    resendInvite(member.id);
                    setOtp(["", "", "", "", "", ""]);
                    setSecondsLeft(30);
                  }}
                  className="mt-1 text-xs font-bold text-emerald-700 underline underline-offset-2"
                >
                  Resend code
                </button>
              )}
            </div>
          </div>

          <button onClick={() => navigate("/admin")} className="mt-6 text-sm font-semibold text-emerald-900/70">
            ← Back to Portal
          </button>
        </div>
      </div>
    );
  }

  // KYC form step
  if (step === "form" && member) {
    const submit = (e: FormEvent) => {
      e.preventDefault();
      setSubmitError("");
      if (!name.trim()) return setSubmitError("Please enter your full name.");
      if (phone.replace(/\D/g, "").length < 10) return setSubmitError("Please enter a valid 10-digit phone number.");
      if (!address.trim()) return setSubmitError("Please enter your address.");
      if (!photo.dataUrl) return setSubmitError("Please upload a photo.");
      if (!idDoc.dataUrl) return setSubmitError("Please upload your ID document.");
      setSubmitting(true);
      setTimeout(() => {
        const res = submitKyc({
          inviteCode: member.inviteCode,
          otp: otp.join(""),
          name,
          phone,
          address,
          photoDataUrl: photo.dataUrl,
          photoName: photo.name,
          idDocType,
          idDocDataUrl: idDoc.dataUrl,
          idDocName: idDoc.name,
        });
        setSubmitting(false);
        if (res.ok) setStep("success");
        else setSubmitError(res.error ?? "Submission failed");
      }, 700);
    };

    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="sticky top-0 z-10 border-b border-emerald-100 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
            <button onClick={() => setStep("otp")} className="rounded-full bg-slate-100 p-2 text-slate-600">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-base font-bold text-slate-900">KYC Form</h1>
          </div>
        </div>

        <form onSubmit={submit} className="mx-auto max-w-md space-y-5 px-4 pt-5">
          <div className="animate-fade-up rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Personal Information</h2>
            <div className="space-y-4">
              <Field label="Full Name" required>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                  <UserRound className="h-5 w-5 text-slate-400" />
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent outline-none" />
                </div>
              </Field>
              <Field label="Phone Number" required>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                  <Smartphone className="h-5 w-5 text-slate-400" />
                  <input value={phone} readOnly className="w-full bg-transparent outline-none" />
                </div>
                <p className="mt-1 text-xs text-slate-400">Pre-verified via OTP · {member.phone}</p>
              </Field>
              <Field label="Residential Address" required>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder="House no, street, city, district"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </Field>
            </div>
          </div>

          <div className="animate-fade-up rounded-3xl border border-slate-100 bg-white p-5 shadow-sm [animation-delay:60ms]">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Photo</h2>
            <PhotoPicker
              value={photo}
              onChange={setPhoto}
              label="Member Photo"
              hint="Passport-size / recent photo"
            />
          </div>

          <div className="animate-fade-up rounded-3xl border border-slate-100 bg-white p-5 shadow-sm [animation-delay:120ms]">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">ID Document</h2>
            <Field label="Document Type" required>
              <div className="flex flex-wrap gap-2">
                {["Aadhaar", "PAN", "Voter ID", "Passport", "Driving License"].map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setIdDocType(t)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      idDocType === t
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <div className="mt-4">
              <PhotoPicker
                value={idDoc}
                onChange={setIdDoc}
                label={`ID Document (${idDocType})`}
                hint="Front side photo"
              />
            </div>
          </div>

          {submitError && <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">{submitError}</p>}

          <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:static md:mx-auto md:max-w-md md:rounded-3xl md:border md:shadow-lg">
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-200 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
              {submitting ? "Submitting…" : "Submit KYC"}
            </button>
            <p className="mt-2 text-center text-xs text-slate-400">By submitting you confirm the details are correct.</p>
          </div>
        </form>
      </div>
    );
  }

  return null;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

function PhotoPicker({
  value,
  onChange,
  label,
  hint,
}: {
  value: { dataUrl?: string; name?: string };
  onChange: (v: { dataUrl?: string; name?: string }) => void;
  label: string;
  hint?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      {value.dataUrl ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200">
          <img src={value.dataUrl} alt={label} className="h-56 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange({})}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white"
          >
            <ArrowLeft className="h-4 w-4 rotate-45" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 py-8"
        >
          <Camera className="h-8 w-8 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800">Tap to upload {label}</span>
          {hint && <span className="text-xs text-emerald-700/70">{hint}</span>}
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const { fileToDataUrl } = await import("../../lib/image");
          onChange({ dataUrl: await fileToDataUrl(f), name: f.name });
        }}
      />
    </div>
  );
}

function MemberStatus({ member }: { member: Member }) {
  const statusMessages: Record<string, string> = {
    submitted: "Your KYC has been submitted and is waiting for the manager to review it.",
    pending: "The manager is reviewing your KYC submission.",
    approved: "Congratulations! Your KYC was approved. The manager will print your KYC form.",
    rejected: "Your KYC was rejected. Please correct the information and contact the admin to resubmit.",
    printed: "Your KYC was approved and the printed KYC form has been generated.",
  };
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-emerald-50 p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900">{STATUS_LABEL[member.status]}</h1>
      <p className="max-w-xs text-sm text-slate-500">{statusMessages[member.status]}</p>
      <StatusPill status={member.status} />
      <button
        onClick={() => navigate("/admin")}
        className="mt-2 rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white"
      >
        Go to Portal
      </button>
    </div>
  );
}
