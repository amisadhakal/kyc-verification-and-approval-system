/**
 * KycFlow — Member-facing KYC verification & form submission
 *
 * Flow:
 *   SMS link received  →  OTP verification  →  4-step wizard  →  Success
 *
 * 4-step wizard (segments 1, 2, 5, 6 from the reference design):
 *   Step 1  General Details
 *   Step 2  Address Details
 *   Step 3  Documents Upload
 *   Step 4  User Agreement  →  Submit
 */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  KeyRound,
  Loader2,
  MessageSquare,
  Printer,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { navigate } from "../../lib/router";
import { formatDateTime } from "../../lib/utils";
import { STATUS_LABEL } from "../../lib/types";
import { StatusPill } from "../../components/ui";
import { fileToDataUrl } from "../../lib/image";
import {
  CLIENT_TYPES,
  COUNTRIES,
  MEMBER_BRANCHES,
  NEPAL_DISTRICTS,
  NEPAL_MUNICIPALITIES,
  NEPAL_PROVINCES,
} from "../../lib/nepalData";
import type { Member } from "../../lib/types";

// ─── Types ───────────────────────────────────────────────────────────────────
type Screen =
  | "loading"
  | "invalid"
  | "otp"
  | "general"
  | "address"
  | "documents"
  | "agreement"
  | "success"
  | "status";

interface Doc {
  dataUrl: string;
  name: string;
}

const emptyDoc = (): Doc => ({ dataUrl: "", name: "" });

// ─── Wizard step metadata (matches segments 1, 2, 5, 6) ─────────────────────
const WIZARD_STEPS = [
  { id: "general",   label: "General Details",   num: 1 },
  { id: "address",   label: "Address Details",   num: 2 },
  { id: "documents", label: "Documents Upload",  num: 3 },
  { id: "agreement", label: "User Agreement",    num: 4 },
] as const;

type WizardStep = typeof WIZARD_STEPS[number]["id"];

// ─── Agreement text ────────────────────────────────────────────────────────--
const AGREEMENT_ITEMS = [
  "माथि उल्लेखित सम्पूर्ण विवरणहरू सत्य, यथार्थ र शुद्ध छन् भनी म/हामी प्रमाणित गर्दछु/गर्दछौं।",
  "प्रस्तुत कागजातहरू सक्कली र नवीनतम छन् भनी मेरो/हाम्रो जानकारी तथा विश्वासमा छ।",
  "संस्थाले माग गरेको कुनै पनि अतिरिक्त जानकारी वा कागजात उपलब्ध गराउन म/हामी तयार छु/छौं।",
  "संस्थाको नियमावली, विनियम तथा समय-समयमा जारी हुने निर्देशनहरू पालना गर्न म/हामी सहमत छु/छौं।",
  "सहकारी ऐन, २०७४ तथा सम्बन्धित नियमहरूको अधीनमा रहेर कारोबार गर्न म/हामी प्रतिबद्ध छु/छौं।",
  "संस्थामा दिइएको व्यक्तिगत विवरणमा कुनै परिवर्तन भएमा तत्काल संस्थालाई जानकारी गराउन म/हामी बाध्य छु/छौं।",
  "मनी लाउन्डरिङ निवारण सम्बन्धी कानुनी प्रावधानहरूको पूर्ण पालना गर्न म/हामी प्रतिबद्ध छु/छौं।",
  "संस्थाले आवश्यक ठानेमा मेरो/हाम्रो खाता वा सदस्यता निलम्बन गर्न वा बन्द गर्न सक्ने कुरामा म/हामी सहमत छु/छौं।",
  "संस्थाको कुनै पनि निर्णयको विरुद्धमा सम्बन्धित नियामक निकायमा मात्र उजुरी गर्न सक्नेछु/सक्नेछौं।",
  "यस फारममा प्रस्तुत गरिएका सम्पूर्ण तथ्यहरू झुटा वा गलत भएमा कानुनी जवाफदेही वहन गर्न म/हामी तयार छु/छौं।",
  "संस्थाले आफ्नो विवेकमा मेरो/हाम्रो सदस्यता स्वीकार वा अस्वीकार गर्ने अधिकार राख्दछ भन्ने कुरामा म/हामी सहमत छु/छौं।",
  "यो सम्झौताको शर्त उल्लंघन भएमा संस्थाले लिने कानुनी कारवाहीमा म/हामी सहमत छु/छौं।",
  "मेरो/हाम्रो विवरण तथा कागजातहरू संस्थाको सुरक्षित रेकर्डमा राख्न म/हामी अनुमति दिन्छु/दिन्छौं।",
  "संस्थाको नीति तथा कार्यविधिको परिवर्तनबारे समय-समयमा जानकारी प्राप्त गर्ने सहमति दिन्छु/दिन्छौं।",
  "यो केवाईसी फारम भर्दाका सम्पूर्ण जानकारीहरू स्वेच्छाले प्रदान गरेको हुँ/हौं र कुनै दबाब वा भ्रममा परेको छैन/छैनौं।",
];

// ─── Helper: Progress Stepper ────────────────────────────────────────────────
function StepProgress({ current }: { current: WizardStep }) {
  const currentIdx = WIZARD_STEPS.findIndex((s) => s.id === current);
  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 overflow-x-auto no-scrollbar">
      <ol className="mx-auto flex max-w-2xl items-center justify-center gap-0">
        {WIZARD_STEPS.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <li key={step.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px]">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-extrabold transition-all ${
                    done
                      ? "border-blue-600 bg-blue-600 text-white"
                      : active
                      ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : step.num}
                </div>
                <span
                  className={`hidden text-center text-[10px] font-semibold sm:block ${
                    active ? "text-blue-700 font-extrabold" : done ? "text-blue-600" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < WIZARD_STEPS.length - 1 && (
                <div
                  className={`mx-1 h-0.5 w-8 sm:w-12 ${
                    i < currentIdx ? "bg-blue-600" : "bg-slate-200"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─── Helper: Form Field Row ───────────────────────────────────────────────────
function FormRow({
  label,
  required,
  note,
  children,
  half,
}: {
  label: string;
  required?: boolean;
  note?: string;
  children: ReactNode;
  half?: boolean;
}) {
  return (
    <div className={half ? "" : "col-span-2 sm:col-span-2"}>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-blue-700">
        {label}
        {required && <span className="ml-0.5 text-red-500"> *</span>}
      </label>
      {children}
      {note && <p className="mt-0.5 text-[11px] text-slate-400">{note}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:cursor-not-allowed";

const selectCls =
  "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none";

// ─── Helper: Document Upload Row ─────────────────────────────────────────────
function DocRow({
  label,
  hint,
  required,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  value: Doc;
  onChange: (d: Doc) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </p>
        {hint && (
          <p className="text-[11px] text-blue-600">{hint}</p>
        )}
        {value.dataUrl && (
          <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3 w-3 shrink-0" /> {value.name || "Attached"}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {value.dataUrl ? (
          <button
            type="button"
            onClick={() => onChange(emptyDoc())}
            className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <X className="h-3.5 w-3.5" /> Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="flex items-center gap-1.5 rounded border border-blue-500 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 active:scale-95"
          >
            <Upload className="h-3.5 w-3.5" /> UPLOAD
          </button>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={async (e: ChangeEvent<HTMLInputElement>) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.type.startsWith("image/")) {
              const url = await fileToDataUrl(f);
              onChange({ dataUrl: url, name: f.name });
            } else {
              // PDF – store as a flag
              onChange({ dataUrl: "pdf:" + f.name, name: f.name });
            }
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

// ─── Helper: Persistent bottom bar ───────────────────────────────────────────
function BottomBar({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit?: () => void;
}) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-20 flex items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur no-print">
      <button
        type="button"
        onClick={onCancel}
        className="rounded border border-red-400 bg-white px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
      >
        Cancel application
      </button>
      {onSubmit && (
        <button
          type="button"
          onClick={onSubmit}
          className="rounded bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Submit application
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function KycFlow({ code }: { code: string }) {
  const { state, findByInviteCode, submitKyc, resendInvite } = useStore();
  const member = useMemo(() => findByInviteCode(code), [state.members, code]);

  const [screen, setScreen] = useState<Screen>("loading");

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [verifiedOtp, setVerifiedOtp] = useState(""); // stored after verification

  // Step 1 — General Details
  const [general, setGeneral] = useState({
    referredBy: "",
    clientType: "",
    submissionType: "online" as "online" | "offline",
    memberBranch: "",
    panNumber: "",
    email: "",
  });
  const [generalErr, setGeneralErr] = useState("");

  // Step 2 — Address
  const [addr, setAddr] = useState({
    country: "Nepal",
    state: "",
    district: "",
    municipality: "",
    wardNo: "",
    streetTole: "",
    hasTempAddress: false,
    sameAsPermanent: false,
    tempCountry: "Nepal",
    tempState: "",
    tempDistrict: "",
    tempMunicipality: "",
    tempWardNo: "",
    tempStreetTole: "",
  });
  const [addrErr, setAddrErr] = useState("");

  // Step 3 — Documents
  const [docs, setDocs] = useState({
    citizenshipFront: emptyDoc(),
    citizenshipBack: emptyDoc(),
    selfie: emptyDoc(),
    birthCert: emptyDoc(),
    panDoc: emptyDoc(),
    kycForm: emptyDoc(),
    photo: emptyDoc(),
    agreement: emptyDoc(),
    nationalId: emptyDoc(),
    companyReg: emptyDoc(),
  });
  const [docsErr, setDocsErr] = useState("");

  // Step 4 — Agreement
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  // Name / phone (pre-filled from member record)
  const [memberName, setMemberName] = useState("");
  const memberPhone = member?.phone ?? "";

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (member) {
      setMemberName(member.name);
      setScreen(member.status === "invited" ? "otp" : "status");
    } else {
      setScreen("invalid");
    }
  }, [member?.id, member?.status]);

  // OTP countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  useEffect(() => {
    if (screen === "otp" && member) {
      setSecondsLeft(Math.max(0, Math.ceil((member.otpExpiresAt - Date.now()) / 1000)));
    }
  }, [screen, member?.id]);

  // ── Derived: available districts & municipalities ──────────────────────────
  const districts = addr.state ? (NEPAL_DISTRICTS[addr.state] ?? []) : [];
  const municipalities = addr.district ? (NEPAL_MUNICIPALITIES[addr.district] ?? []) : [];
  const tempDistricts = addr.tempState ? (NEPAL_DISTRICTS[addr.tempState] ?? []) : [];
  const tempMunicipalities = addr.tempDistrict ? (NEPAL_MUNICIPALITIES[addr.tempDistrict] ?? []) : [];

  // ── Validation helpers ─────────────────────────────────────────────────────
  const validateGeneral = () => {
    if (!general.clientType) return "Please select a Client Type.";
    if (!general.memberBranch) return "Please select a Member Branch.";
    if (!general.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(general.email))
      return "Please enter a valid Email address.";
    return "";
  };

  const validateAddress = () => {
    if (!addr.state) return "Please select your Province / State.";
    if (!addr.district) return "Please select your District.";
    if (!addr.municipality) return "Please select your Municipality.";
    if (!addr.wardNo.trim()) return "Please enter your Ward Number.";
    if (!addr.streetTole.trim()) return "Please enter your Street / Tole.";
    if (addr.hasTempAddress && !addr.sameAsPermanent) {
      if (!addr.tempState) return "Please select Province for Temporary Address.";
      if (!addr.tempDistrict) return "Please select District for Temporary Address.";
      if (!addr.tempMunicipality) return "Please select Municipality for Temporary Address.";
      if (!addr.tempWardNo.trim()) return "Please enter Ward No for Temporary Address.";
      if (!addr.tempStreetTole.trim()) return "Please enter Street/Tole for Temporary Address.";
    }
    return "";
  };

  const validateDocs = () => {
    if (!docs.citizenshipFront.dataUrl) return "Please upload Citizenship Certificate (Front).";
    if (!docs.selfie.dataUrl) return "Please upload Selfie with Citizenship.";
    if (!docs.photo.dataUrl) return "Please upload your Photo.";
    if (!docs.nationalId.dataUrl) return "Please upload your National ID.";
    return "";
  };

  // ── Screen handlers ────────────────────────────────────────────────────────
  const handleVerifyOtp = () => {
    const code = otp.join("");
    if (code.length < 6) { setOtpError("Please enter all 6 digits."); return; }
    if (!member) return;
    if (code !== member.otp) { setOtpError("Incorrect OTP. Please check the code sent to your phone."); return; }
    setOtpError("");
    setVerifiedOtp(code);
    setScreen("general");
  };

  const handleNextGeneral = () => {
    const err = validateGeneral();
    if (err) { setGeneralErr(err); return; }
    setGeneralErr("");
    setScreen("address");
  };

  const handleNextAddress = () => {
    const err = validateAddress();
    if (err) { setAddrErr(err); return; }
    setAddrErr("");
    setScreen("documents");
  };

  const handleNextDocs = () => {
    const err = validateDocs();
    if (err) { setDocsErr(err); return; }
    setDocsErr("");
    setScreen("agreement");
  };

  const handleSubmit = () => {
    if (!agreed) { setSubmitErr("Please read and accept the agreement before submitting."); return; }
    if (!member) return;
    setSubmitErr("");
    setSubmitting(true);

    setTimeout(() => {
      const result = submitKyc({
        inviteCode: member.inviteCode,
        otp: verifiedOtp || member.otp,
        name: memberName,
        phone: memberPhone,
        // General
        referredBy: general.referredBy || undefined,
        clientType: general.clientType,
        submissionType: general.submissionType,
        memberBranch: general.memberBranch,
        panNumber: general.panNumber || undefined,
        email: general.email,
        // Permanent address
        country: addr.country,
        state: addr.state,
        district: addr.district,
        municipality: addr.municipality,
        wardNo: addr.wardNo,
        streetTole: addr.streetTole,
        // Temporary address
        hasTempAddress: addr.hasTempAddress,
        sameAsPermanent: addr.sameAsPermanent,
        tempCountry: addr.hasTempAddress && !addr.sameAsPermanent ? addr.tempCountry : undefined,
        tempState: addr.hasTempAddress && !addr.sameAsPermanent ? addr.tempState : undefined,
        tempDistrict: addr.hasTempAddress && !addr.sameAsPermanent ? addr.tempDistrict : undefined,
        tempMunicipality: addr.hasTempAddress && !addr.sameAsPermanent ? addr.tempMunicipality : undefined,
        tempWardNo: addr.hasTempAddress && !addr.sameAsPermanent ? addr.tempWardNo : undefined,
        tempStreetTole: addr.hasTempAddress && !addr.sameAsPermanent ? addr.tempStreetTole : undefined,
        // Documents
        citizenshipFrontDataUrl: docs.citizenshipFront.dataUrl || undefined,
        citizenshipFrontName: docs.citizenshipFront.name || undefined,
        citizenshipBackDataUrl: docs.citizenshipBack.dataUrl || undefined,
        citizenshipBackName: docs.citizenshipBack.name || undefined,
        selfieDataUrl: docs.selfie.dataUrl || undefined,
        selfieName: docs.selfie.name || undefined,
        birthCertDataUrl: docs.birthCert.dataUrl || undefined,
        birthCertName: docs.birthCert.name || undefined,
        panDocDataUrl: docs.panDoc.dataUrl || undefined,
        panDocName: docs.panDoc.name || undefined,
        kycFormDataUrl: docs.kycForm.dataUrl || undefined,
        kycFormName: docs.kycForm.name || undefined,
        photoDataUrl: docs.photo.dataUrl || undefined,
        photoName: docs.photo.name || undefined,
        agreementDataUrl: docs.agreement.dataUrl || undefined,
        agreementName: docs.agreement.name || undefined,
        nationalIdDataUrl: docs.nationalId.dataUrl || undefined,
        nationalIdName: docs.nationalId.name || undefined,
        companyRegDataUrl: docs.companyReg.dataUrl || undefined,
        companyRegName: docs.companyReg.name || undefined,
      });
      setSubmitting(false);
      if (result.ok) {
        setScreen("success");
      } else {
        setSubmitErr(result.error ?? "Submission failed. Please try again.");
      }
    }, 800);
  };

  // ── Render: Loading ────────────────────────────────────────────────────────
  if (screen === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // ── Render: Invalid ────────────────────────────────────────────────────────
  if (screen === "invalid") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-slate-50 p-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100">
          <X className="h-10 w-10 text-red-600" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900">Invite Link Not Found</h1>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            The code <span className="font-mono font-bold text-slate-800">"{code}"</span> was not found. Please use the exact link from your SMS.
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
        >
          ← Enter Code Manually
        </button>
      </div>
    );
  }

  // ── Render: Status (already submitted) ────────────────────────────────────
  if (screen === "status" && member) {
    return <MemberStatusScreen member={member} />;
  }

  // ── Render: Success ────────────────────────────────────────────────────────
  if (screen === "success" && member) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-slate-50 p-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100 animate-pop">
          <CheckCircle2 className="h-14 w-14 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">KYC Submitted!</h1>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Thank you, <span className="font-bold text-slate-800">{memberName}</span>. Your application and documents have been saved. Status is now{" "}
            <span className="font-bold text-amber-700">Pending Review</span>.
          </p>
        </div>
        <div className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white p-4 text-left text-xs shadow-sm">
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-slate-400">Member Code</dt>
              <dd className="font-bold text-slate-800">{member.membershipCode}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Email</dt>
              <dd className="font-bold text-slate-800">{general.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Branch</dt>
              <dd className="font-bold text-slate-800">{general.memberBranch}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Submitted At</dt>
              <dd className="font-bold text-slate-800">{formatDateTime(Date.now())}</dd>
            </div>
          </dl>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <button
            onClick={() => navigate("/admin")}
            className="w-full rounded-xl bg-blue-700 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
          >
            Go to Manager Portal
          </button>
          <button
            onClick={() => setScreen("status")}
            className="w-full rounded-xl border border-slate-200 py-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Track Application Status
          </button>
        </div>
      </div>
    );
  }

  // ── Shared layout wrapper for wizard steps ─────────────────────────────────
  const WizardShell = ({
    children,
    onCancel = () => navigate("/"),
    showSubmitBtn,
    onSubmitBtn,
  }: {
    children: ReactNode;
    onCancel?: () => void;
    showSubmitBtn?: boolean;
    onSubmitBtn?: () => void;
  }) => (
    <div className="min-h-dvh bg-slate-100 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900">
              Sangam Cooperative — Member KYC Form
            </h1>
            <p className="text-[11px] text-slate-500">
              {memberName} &middot; {member?.membershipCode}
            </p>
          </div>
        </div>
      </div>

      {/* Step progress */}
      {["general", "address", "documents", "agreement"].includes(screen) && (
        <StepProgress current={screen as WizardStep} />
      )}

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>

      {/* Persistent bottom bar */}
      <BottomBar
        onCancel={() => navigate("/")}
        onSubmit={showSubmitBtn ? onSubmitBtn : undefined}
      />
    </div>
  );

  // ── Render: OTP Screen ─────────────────────────────────────────────────────
  if (screen === "otp" && member) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-blue-800 via-blue-700 to-blue-50">
        {/* Top brand strip */}
        <div className="px-4 pt-10 pb-16 text-center text-white">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur mb-4">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black">Verify OTP</h1>
          <p className="mt-1 text-sm text-blue-100">
            Hi <span className="font-bold text-white">{member.name}</span>, enter the 6-digit code sent via SMS.
          </p>
        </div>

        {/* White card */}
        <div className="mx-auto -mt-8 max-w-sm rounded-3xl bg-white px-6 py-7 shadow-2xl mx-4 sm:mx-auto">
          {/* Simulated SMS snippet */}
          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 mb-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> SMS received on +91 {member.phone}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sangam Coop: Open{" "}
              <span className="font-mono font-bold text-slate-900">
                kyc.coop/{member.inviteCode.toLowerCase()}
              </span>{" "}
              — OTP:{" "}
              <button
                type="button"
                onClick={() => setOtp(member.otp.split(""))}
                className="font-mono font-extrabold text-amber-600 underline underline-offset-2"
              >
                {member.otp}
              </button>
            </p>
          </div>

          {/* OTP boxes */}
          <label className="mb-2 block text-center text-xs font-bold uppercase tracking-wide text-slate-500">
            Enter Verification Code
          </label>
          <div className="flex justify-center gap-2">
            {otp.map((d, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                autoComplete={i === 0 ? "one-time-code" : "off"}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  const next = [...otp];
                  next[i] = v;
                  setOtp(next);
                  if (v && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace") {
                    e.preventDefault();
                    const next = [...otp];
                    if (otp[i]) { next[i] = ""; setOtp(next); }
                    else if (i > 0) {
                      next[i - 1] = ""; setOtp(next);
                      document.getElementById(`otp-${i - 1}`)?.focus();
                    }
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                  if (!txt) return;
                  const next = [...otp];
                  for (let k = 0; k < txt.length; k++) next[k] = txt[k];
                  setOtp(next);
                  document.getElementById(`otp-${Math.min(txt.length, 5)}`)?.focus();
                }}
                className={`h-12 w-10 rounded-lg border-2 text-center text-lg font-extrabold outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 ${
                  d ? "border-blue-600 bg-blue-50 text-blue-900" : "border-slate-300 bg-slate-50"
                }`}
              />
            ))}
          </div>

          {otpError && (
            <p className="mt-3 text-center text-xs font-bold text-red-600">{otpError}</p>
          )}

          <button
            onClick={handleVerifyOtp}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-extrabold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <KeyRound className="h-4 w-4" /> Verify &amp; Continue
          </button>

          <div className="mt-4 text-center">
            {secondsLeft > 0 ? (
              <p className="text-xs text-slate-400">Resend OTP in {secondsLeft}s</p>
            ) : (
              <button
                onClick={() => {
                  resendInvite(member.id);
                  setOtp(["", "", "", "", "", ""]);
                  setSecondsLeft(30);
                }}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Didn't receive code? Resend OTP
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-blue-200">
          Sangam Cooperative Society Ltd &middot; Secure Verification
        </p>
      </div>
    );
  }

  // ── Render: Step 1 — General Details ──────────────────────────────────────
  if (screen === "general" && member) {
    return (
      <WizardShell onCancel={() => setScreen("otp")}>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="mb-5 text-center text-xl font-extrabold text-blue-700">
            General Details
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Referred By */}
            <FormRow label="Referred By" note="Enter referral client code if any">
              <input
                type="text"
                value={general.referredBy}
                onChange={(e) => setGeneral({ ...general, referredBy: e.target.value })}
                placeholder="Client Code"
                className={inputCls}
              />
            </FormRow>

            {/* Client Type */}
            <FormRow label="Client Type" required>
              <div className="relative">
                <select
                  value={general.clientType}
                  onChange={(e) => setGeneral({ ...general, clientType: e.target.value })}
                  className={selectCls}
                >
                  <option value="">Select Client Type</option>
                  {CLIENT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <ChevronRight className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 rotate-90 text-slate-400" />
              </div>
            </FormRow>

            {/* Mobile Number (pre-filled, readonly) */}
            <FormRow label="Mobile Number" required note="Verified via OTP">
              <input
                type="text"
                value={member.phone}
                readOnly
                className={inputCls + " bg-slate-50 cursor-not-allowed text-slate-600"}
              />
            </FormRow>

            {/* Online / Offline */}
            <FormRow label="Online / Offline" required>
              <div className="flex gap-5 pt-1.5">
                {(["online", "offline"] as const).map((v) => (
                  <label key={v} className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                    <input
                      type="radio"
                      name="submissionType"
                      value={v}
                      checked={general.submissionType === v}
                      onChange={() => setGeneral({ ...general, submissionType: v })}
                      className="accent-blue-600 h-4 w-4"
                    />
                    {v.toUpperCase()}
                  </label>
                ))}
              </div>
            </FormRow>

            {/* Member Branch */}
            <FormRow label="Member Branch" required>
              <div className="relative">
                <select
                  value={general.memberBranch}
                  onChange={(e) => setGeneral({ ...general, memberBranch: e.target.value })}
                  className={selectCls}
                >
                  <option value="">Select Member Branch</option>
                  {MEMBER_BRANCHES.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
                <ChevronRight className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 rotate-90 text-slate-400" />
              </div>
            </FormRow>

            {/* PAN Number */}
            <FormRow label="PAN Number">
              <input
                type="text"
                value={general.panNumber}
                onChange={(e) => setGeneral({ ...general, panNumber: e.target.value })}
                placeholder="PAN Number"
                className={inputCls}
              />
            </FormRow>

            {/* Email */}
            <FormRow label="Email" required>
              <input
                type="email"
                value={general.email}
                onChange={(e) => setGeneral({ ...general, email: e.target.value })}
                placeholder="Email address"
                className={inputCls}
              />
            </FormRow>
          </div>

          {generalErr && (
            <p className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-center text-xs font-bold text-red-700">
              {generalErr}
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleNextGeneral}
              className="rounded bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
            >
              Next
            </button>
          </div>
        </div>
      </WizardShell>
    );
  }

  // ── Render: Step 2 — Address Details ──────────────────────────────────────
  if (screen === "address") {
    const handleSameAsPermanent = (checked: boolean) => {
      setAddr({
        ...addr,
        sameAsPermanent: checked,
        ...(checked
          ? {
              tempCountry: addr.country,
              tempState: addr.state,
              tempDistrict: addr.district,
              tempMunicipality: addr.municipality,
              tempWardNo: addr.wardNo,
              tempStreetTole: addr.streetTole,
            }
          : {}),
      });
    };

    return (
      <WizardShell onCancel={() => setScreen("general")}>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="mb-5 text-center text-xl font-extrabold text-blue-700">
            Address Details
          </h2>

          {/* ── Permanent Address ───────────────────────── */}
          <p className="mb-3 text-sm font-bold text-blue-600">Permanent Address</p>
          <div className="grid grid-cols-2 gap-4">
            {/* Country */}
            <FormRow label="Country of Residence" required half>
              <div className="relative">
                <select
                  value={addr.country}
                  onChange={(e) => setAddr({ ...addr, country: e.target.value })}
                  className={selectCls}
                >
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronRight className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 rotate-90 text-slate-400" />
              </div>
            </FormRow>

            {/* State */}
            <FormRow label="State / Province" required half>
              <div className="relative">
                <select
                  value={addr.state}
                  onChange={(e) => setAddr({ ...addr, state: e.target.value, district: "", municipality: "" })}
                  className={selectCls}
                >
                  <option value="">Select State</option>
                  {NEPAL_PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>
                <ChevronRight className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 rotate-90 text-slate-400" />
              </div>
            </FormRow>

            {/* District */}
            <FormRow label="District" required half>
              <div className="relative">
                <select
                  value={addr.district}
                  onChange={(e) => setAddr({ ...addr, district: e.target.value, municipality: "" })}
                  className={selectCls}
                  disabled={!addr.state}
                >
                  <option value="">Select District</option>
                  {districts.map((d) => <option key={d}>{d}</option>)}
                </select>
                <ChevronRight className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 rotate-90 text-slate-400" />
              </div>
            </FormRow>

            {/* Municipality */}
            <FormRow label="Municipality" required half>
              <div className="relative">
                <select
                  value={addr.municipality}
                  onChange={(e) => setAddr({ ...addr, municipality: e.target.value })}
                  className={selectCls}
                  disabled={!addr.district}
                >
                  <option value="">Select Municipality</option>
                  {municipalities.map((m) => <option key={m}>{m}</option>)}
                  {municipalities.length === 0 && addr.district && (
                    <option value={`${addr.district} Municipality`}>{addr.district} Municipality</option>
                  )}
                </select>
                <ChevronRight className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 rotate-90 text-slate-400" />
              </div>
            </FormRow>

            {/* Ward No */}
            <FormRow label="Ward No" required half>
              <input
                type="text"
                value={addr.wardNo}
                onChange={(e) => setAddr({ ...addr, wardNo: e.target.value })}
                placeholder="Ward Number"
                className={inputCls}
              />
            </FormRow>

            {/* Street / Tole */}
            <FormRow label="Street / Tole" required half>
              <input
                type="text"
                value={addr.streetTole}
                onChange={(e) => setAddr({ ...addr, streetTole: e.target.value })}
                placeholder="Street/Tole"
                className={inputCls}
              />
            </FormRow>
          </div>

          {/* ── Temporary Address toggle ────────────────── */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={addr.sameAsPermanent}
                onChange={(e) => handleSameAsPermanent(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-600"
              />
              Same as Permanent Address
            </label>

            <button
              type="button"
              onClick={() => setAddr({ ...addr, hasTempAddress: !addr.hasTempAddress })}
              className="mt-3 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
            >
              {addr.hasTempAddress ? "− Hide" : "+ Add"} Temporary Address
            </button>

            {addr.hasTempAddress && !addr.sameAsPermanent && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <p className="col-span-2 text-sm font-bold text-blue-600">Temporary Address</p>

                <FormRow label="Country" required half>
                  <div className="relative">
                    <select value={addr.tempCountry} onChange={(e) => setAddr({ ...addr, tempCountry: e.target.value })} className={selectCls}>
                      {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronRight className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 rotate-90 text-slate-400" />
                  </div>
                </FormRow>

                <FormRow label="State / Province" required half>
                  <div className="relative">
                    <select value={addr.tempState} onChange={(e) => setAddr({ ...addr, tempState: e.target.value, tempDistrict: "", tempMunicipality: "" })} className={selectCls}>
                      <option value="">Select State</option>
                      {NEPAL_PROVINCES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                    <ChevronRight className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 rotate-90 text-slate-400" />
                  </div>
                </FormRow>

                <FormRow label="District" required half>
                  <div className="relative">
                    <select value={addr.tempDistrict} onChange={(e) => setAddr({ ...addr, tempDistrict: e.target.value, tempMunicipality: "" })} className={selectCls} disabled={!addr.tempState}>
                      <option value="">Select District</option>
                      {tempDistricts.map((d) => <option key={d}>{d}</option>)}
                    </select>
                    <ChevronRight className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 rotate-90 text-slate-400" />
                  </div>
                </FormRow>

                <FormRow label="Municipality" required half>
                  <div className="relative">
                    <select value={addr.tempMunicipality} onChange={(e) => setAddr({ ...addr, tempMunicipality: e.target.value })} className={selectCls} disabled={!addr.tempDistrict}>
                      <option value="">Select Municipality</option>
                      {tempMunicipalities.map((m) => <option key={m}>{m}</option>)}
                      {tempMunicipalities.length === 0 && addr.tempDistrict && (
                        <option value={`${addr.tempDistrict} Municipality`}>{addr.tempDistrict} Municipality</option>
                      )}
                    </select>
                    <ChevronRight className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 rotate-90 text-slate-400" />
                  </div>
                </FormRow>

                <FormRow label="Ward No" required half>
                  <input type="text" value={addr.tempWardNo} onChange={(e) => setAddr({ ...addr, tempWardNo: e.target.value })} placeholder="Ward Number" className={inputCls} />
                </FormRow>

                <FormRow label="Street / Tole" required half>
                  <input type="text" value={addr.tempStreetTole} onChange={(e) => setAddr({ ...addr, tempStreetTole: e.target.value })} placeholder="Street/Tole" className={inputCls} />
                </FormRow>
              </div>
            )}
          </div>

          {addrErr && (
            <p className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-center text-xs font-bold text-red-700">
              {addrErr}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button type="button" onClick={() => setScreen("general")} className="rounded border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
              Back
            </button>
            <button type="button" onClick={handleNextAddress} className="rounded bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95">
              Next
            </button>
          </div>
        </div>
      </WizardShell>
    );
  }

  // ── Render: Step 3 — Documents Upload ─────────────────────────────────────
  if (screen === "documents") {
    const setDoc = (key: keyof typeof docs) => (d: Doc) =>
      setDocs((prev) => ({ ...prev, [key]: d }));

    return (
      <WizardShell onCancel={() => setScreen("address")}>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="mb-1 text-center text-xl font-extrabold text-blue-700">
            Documents Upload
          </h2>
          <p className="mb-5 text-center text-xs font-semibold text-red-500">
            Disclaimer: Please upload documents upto 5 MB
          </p>

          <div className="divide-y divide-slate-100">
            <DocRow
              label="Citizenship Certificates Front and Back"
              hint="(Should be in .pdf, .jpg format)"
              required
              value={docs.citizenshipFront}
              onChange={setDoc("citizenshipFront")}
            />
            <DocRow
              label="Selfie With Citizenship"
              hint="(Should be in .jpg format)"
              required
              value={docs.selfie}
              onChange={setDoc("selfie")}
            />
            <DocRow
              label="Birth Certificate Incase of Minor"
              hint="(Should be in .pdf, .jpg format)"
              value={docs.birthCert}
              onChange={setDoc("birthCert")}
            />
            <DocRow
              label="PAN"
              hint="(Should be in .jpg format)"
              value={docs.panDoc}
              onChange={setDoc("panDoc")}
            />
            <DocRow
              label="Kyc form upload"
              hint="(Should be in .pdf, .jpg format)"
              required
              value={docs.kycForm}
              onChange={setDoc("kycForm")}
            />
            <DocRow
              label="Photo Upload"
              hint="(Should be in .jpg format)"
              required
              value={docs.photo}
              onChange={setDoc("photo")}
            />
            <DocRow
              label="Online Agreement Form"
              hint="(Should be in .pdf, .jpg format)"
              required
              value={docs.agreement}
              onChange={setDoc("agreement")}
            />
            <DocRow
              label="National ID"
              hint="(Should be in .pdf, .jpg, .jpeg format)"
              required
              value={docs.nationalId}
              onChange={setDoc("nationalId")}
            />
            <DocRow
              label="Company Registration Document"
              hint="(Should be in .pdf, .jpg format)"
              value={docs.companyReg}
              onChange={setDoc("companyReg")}
            />
          </div>

          {docsErr && (
            <p className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-center text-xs font-bold text-red-700">
              {docsErr}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button type="button" onClick={() => setScreen("address")} className="rounded border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
              Back
            </button>
            <button type="button" onClick={handleNextDocs} className="rounded bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95">
              Next
            </button>
          </div>
        </div>
      </WizardShell>
    );
  }

  // ── Render: Step 4 — User Agreement ───────────────────────────────────────
  if (screen === "agreement") {
    return (
      <WizardShell
        onCancel={() => setScreen("documents")}
        showSubmitBtn
        onSubmitBtn={handleSubmit}
      >
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          {/* Title + Print button */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-blue-700">User Agreement</h2>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
          </div>

          {/* Sub-heading */}
          <div className="mb-4 text-center">
            <p className="text-sm font-bold text-slate-700">
              सहकारी संस्था ऐन, २०७४ को नियम ९० तथा सम्बन्धित
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              संगम सहकारी संस्था सदस्यको सम्झौता
            </p>
          </div>

          {/* Agreement body */}
          <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 leading-relaxed">
            <p className="mb-3">
              संगम सहकारी संस्था लिमिटेडमा भर्ना भएका जिल्ला भर्नाको प्रदेश/जि./न.पा./ग.पा.का
              सदस्यहरूले तल उल्लेखित विषय-वस्तुहरूको पूर्ण अनुपालन गर्नुपर्नेछ। (उक्त शर्त पूरा
              गर्नुभएन भने सदस्यता रद्द गर्ने अधिकार संस्थालाई हुनेछ)।
            </p>
            <p className="mb-4">
              संस्थाको कार्यबिधिमा भर्ना भई आफ्नो जिल्ला, प्रदेश अनुसारको सम्बन्धित कानुनी
              प्रावधानहरूको पूर्ण पालना गर्न म/हामी सहमत छु/छौं।
            </p>
            <p className="mb-3 font-semibold text-slate-800">
              यस सम्झौताका प्रमुख शर्तहरू निम्नानुसार छन्:
            </p>
            <ol className="space-y-2 list-none">
              {AGREEMENT_ITEMS.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 font-bold text-slate-600">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Agree checkbox */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => { setAgreed(e.target.checked); setSubmitErr(""); }}
              className="mt-0.5 h-4 w-4 rounded accent-blue-600"
            />
            <span className="text-xs font-semibold text-blue-900 leading-relaxed">
              I have read and understood all the terms and conditions above. I agree to comply with all
              cooperative regulations and provide accurate information.
            </span>
          </label>

          {submitErr && (
            <p className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-center text-xs font-bold text-red-700">
              {submitErr}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setScreen("documents")}
              className="rounded border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded bg-emerald-600 px-6 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-60"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
              ) : (
                <><CheckCircle2 className="h-4 w-4" /> Submit KYC</>
              )}
            </button>
          </div>
        </div>
      </WizardShell>
    );
  }

  return null;
}

// ─── Member Status Screen (already submitted) ─────────────────────────────────
function MemberStatusScreen({ member }: { member: Member }) {
  const msgs: Record<string, string> = {
    submitted: "Your KYC has been received and is in the review queue.",
    pending: "The manager is currently reviewing your KYC documents.",
    approved: "Your KYC is approved. The official form is being prepared for printing.",
    rejected: "Your KYC was rejected. Please contact the cooperative admin to correct and resubmit.",
    printed: "Your KYC has been approved and printed into the official record.",
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-slate-50 p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100">
        {member.status === "rejected" ? (
          <X className="h-10 w-10 text-red-600" />
        ) : member.status === "approved" || member.status === "printed" ? (
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        ) : (
          <Clock className="h-10 w-10 text-amber-600 animate-pulse" />
        )}
      </div>

      <div>
        <h1 className="text-2xl font-black text-slate-900">
          {STATUS_LABEL[member.status]}
        </h1>
        <p className="mt-1 max-w-xs text-sm text-slate-500">{msgs[member.status]}</p>
        <div className="mt-3 flex justify-center">
          <StatusPill status={member.status} />
        </div>
      </div>

      <div className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white p-4 text-left text-xs shadow-sm">
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-slate-400">Member Name</dt>
            <dd className="font-bold text-slate-800">{member.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Member Code</dt>
            <dd className="font-bold text-slate-800">{member.membershipCode}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Mobile</dt>
            <dd className="font-bold text-slate-800">+91 {member.phone}</dd>
          </div>
        </dl>
      </div>

      <button
        onClick={() => navigate("/admin")}
        className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
      >
        Go to Manager Portal
      </button>
    </div>
  );
}
