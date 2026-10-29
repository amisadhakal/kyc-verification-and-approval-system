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
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  KeyRound,
  Loader2,
  MessageSquare,
  Printer,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  X,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { navigate } from "../../lib/router";
import { formatDateTime } from "../../lib/utils";
import { STATUS_LABEL } from "../../lib/types";
import { StatusPill } from "../../components/ui";
import { fileToDataUrl } from "../../lib/image";
import { CoopLogo } from "../../components/CoopLogo";
import {
  CLIENT_TYPES,
  COUNTRIES,
  MEMBER_BRANCHES,
  NEPAL_DISTRICTS,
  NEPAL_MUNICIPALITIES,
  NEPAL_PROVINCES,
} from "../../lib/nepalData";
import type { Member } from "../../lib/types";

// ─── Brand colours ────────────────────────────────────────────────────────────
// #145C45  dark-green  (header / nav)
// #DDF3E7  mint        (selected tabs / highlights)
// #F8FAFC  off-white   (page background)
// #059669  emerald     (primary buttons / approved)

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
    <div className="border-b border-slate-200 bg-white py-3 px-4 overflow-x-auto no-scrollbar">
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
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : active
                      ? "border-[#145C45] bg-[#145C45] text-white shadow-md"
                      : "border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : step.num}
                </div>
                <span
                  className={`hidden text-center text-[10px] font-semibold sm:block ${
                    active ? "text-[#145C45] font-extrabold" : done ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < WIZARD_STEPS.length - 1 && (
                <div
                  className={`mx-1 h-0.5 w-8 sm:w-12 ${
                    i < currentIdx ? "bg-emerald-500" : "bg-slate-200"
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
      <label className="mb-0.5 block text-[11px] font-bold uppercase tracking-wide text-[#145C45]">
        {label}
        {required && <span className="ml-0.5 text-red-500"> *</span>}
      </label>
      {children}
      {note && <p className="mt-0.5 text-[10px] text-slate-400">{note}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#145C45] focus:ring-2 focus:ring-[#DDF3E7] disabled:bg-slate-50 disabled:cursor-not-allowed";

const selectCls =
  "w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none transition focus:border-[#145C45] focus:ring-2 focus:ring-[#DDF3E7] cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed";

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
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </p>
        {hint && (
          <p className="text-[11px] text-[#145C45] font-medium">{hint}</p>
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
            className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" /> Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="flex items-center gap-1.5 rounded border border-[#145C45] bg-white px-3 py-1.5 text-xs font-bold text-[#145C45] shadow-sm transition hover:bg-[#DDF3E7] active:scale-95 cursor-pointer"
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
              onChange({ dataUrl: "pdf:" + f.name, name: f.name });
            }
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

// ─── Helper: Live data preview card ──────────────────────────────────────────
function PreviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 py-1.5 border-b border-[#DDF3E7] last:border-0">
      <span className="text-[10px] font-bold uppercase tracking-wide text-[#145C45]/70">{label}</span>
      <span className="text-xs font-semibold text-slate-800 break-words">{value}</span>
    </div>
  );
}

function LivePreview({
  title,
  memberName,
  memberPhone,
  rows,
}: {
  title: string;
  memberName: string;
  memberPhone: string;
  rows: { label: string; value: string }[];
}) {
  const hasData = rows.some((r) => r.value);
  return (
    <div className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-4 rounded-xl border border-[#DDF3E7] bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#145C45] px-4 py-3 flex items-center gap-2">
          <Eye className="h-4 w-4 text-[#DDF3E7] shrink-0" />
          <span className="text-xs font-bold text-white">Live Preview</span>
        </div>
        {/* Member identity (always shown) */}
        <div className="px-4 py-3 bg-[#DDF3E7]/40 border-b border-[#DDF3E7]">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#145C45] text-white">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{memberName}</p>
              <p className="text-[10px] text-slate-500">+977 {memberPhone}</p>
            </div>
          </div>
          <p className="text-[10px] text-[#145C45] font-semibold">{title}</p>
        </div>
        {/* Dynamic rows */}
        <div className="px-4 py-2 divide-y divide-transparent">
          {hasData ? (
            rows.map((r) => <PreviewRow key={r.label} label={r.label} value={r.value} />)
          ) : (
            <p className="py-4 text-center text-[11px] text-slate-400">
              Fill in the form to see your data here
            </p>
          )}
        </div>
        {hasData && (
          <div className="px-4 pb-3">
            <p className="text-[10px] text-slate-400 italic">
              Your data is auto-saved as you type.
            </p>
          </div>
        )}
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
          className="rounded bg-[#059669] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Submit application
        </button>
      )}
    </div>
  );
}

// ─── Helper: Shared layout wrapper for wizard steps ─────────────────────────
function WizardShell({
  children,
  memberName,
  currentStep,
  onCancel,
  showSubmitBtn,
  onSubmitBtn,
}: {
  children: ReactNode;
  memberName: string;
  currentStep: WizardStep;
  onCancel: () => void;
  showSubmitBtn?: boolean;
  onSubmitBtn?: () => void;
}) {
  const { state } = useStore();
  const org = state.orgSettings;

  return (
    <div className="min-h-dvh bg-[#F8FAFC] pb-20">
      {/* Header */}
      <div className="bg-[#145C45] shadow-md px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 cursor-pointer shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <CoopLogo settings={org} className="h-9 w-9 shrink-0 shadow-sm" iconClassName="h-5 w-5" />
          <div className="min-w-0">
            <h1 className="text-sm font-extrabold text-white truncate">
              {org.nameNepali}
            </h1>
            <p className="text-[11px] font-medium text-[#DDF3E7] truncate">
              {org.nameEnglish} &middot; <span className="text-white/80">{memberName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Step progress */}
      <StepProgress current={currentStep} />

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 pt-4">{children}</div>

      {/* Persistent bottom bar */}
      <BottomBar
        onCancel={() => navigate("/")}
        onSubmit={showSubmitBtn ? onSubmitBtn : undefined}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function KycFlow({ code }: { code: string }) {
  const { state, findByInviteCode, submitKyc, resendInvite } = useStore();
  const org = state.orgSettings;
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
    const entered = otp.join("");
    if (entered.length < 6) { setOtpError("Please enter all 6 digits."); return; }
    if (!member) return;
    if (entered !== member.otp) { setOtpError("Incorrect OTP. Please check the code sent to your phone."); return; }
    setOtpError("");
    setVerifiedOtp(entered);
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
      <div className="flex min-h-dvh items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-10 w-10 animate-spin text-[#145C45]" />
      </div>
    );
  }

  // ── Render: Invalid ────────────────────────────────────────────────────────
  if (screen === "invalid") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-[#F8FAFC] p-6 text-center">
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
          className="rounded-xl bg-[#145C45] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0f4534]"
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
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-[#F8FAFC] p-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100">
          <CheckCircle2 className="h-14 w-14 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">KYC Submitted!</h1>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Thank you, <span className="font-bold text-slate-800">{memberName}</span>. Your application and documents have been saved. Status is now{" "}
            <span className="font-bold text-amber-700">Pending Review</span>.
          </p>
        </div>
        <div className="w-full max-w-xs rounded-2xl border border-[#DDF3E7] bg-white p-4 text-left text-xs shadow-sm">
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
            className="w-full rounded-xl bg-[#145C45] py-3 text-sm font-bold text-white transition hover:bg-[#0f4534] cursor-pointer"
          >
            Go to Manager Portal
          </button>
          <button
            onClick={() => setScreen("status")}
            className="w-full rounded-xl border border-slate-200 py-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
          >
            Track Application Status
          </button>
        </div>
      </div>
    );
  }

  // ── Render: OTP Screen ─────────────────────────────────────────────────────
  if (screen === "otp" && member) {
    const orgTag = org.shortName || org.nameEnglish || "Coop KYC";

    return (
      <div className="min-h-dvh bg-[#F8FAFC] flex flex-col">
        {/* Top green header strip */}
        <div className="bg-[#145C45] px-4 pt-10 pb-20 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur mb-4 shadow-lg border border-white/20">
            <ShieldCheck className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">OTP Verification</h1>
          <p className="mt-2 text-sm text-[#DDF3E7] max-w-xs mx-auto">
            Hi <span className="font-bold text-white">{member.name}</span>, we sent a 6-digit code to your phone.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-[#DDF3E7]">+977 {member.phone}</span>
          </div>
        </div>

        {/* White floating card */}
        <div className="mx-4 sm:mx-auto -mt-12 w-full max-w-sm rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden flex-1">
          {/* Simulated SMS card */}
          <div className="bg-slate-50 border-b border-slate-200 px-5 pt-5 pb-4">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#145C45] mb-2">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>SMS received from {orgTag}</span>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 p-3.5 shadow-sm">
              <p className="text-xs text-slate-600 leading-relaxed">
                Dear <span className="font-bold text-slate-900">{member.name}</span>, your KYC link:{" "}
                <span className="font-mono font-bold text-slate-800">
                  kyc.coop/{member.inviteCode.toLowerCase()}
                </span>
                {" "}— OTP:{" "}
                <button
                  type="button"
                  onClick={() => setOtp(member.otp.split(""))}
                  title="Click to auto-fill OTP (demo mode)"
                  className="font-mono font-extrabold text-amber-600 underline underline-offset-2 cursor-pointer"
                >
                  {member.otp}
                </button>
              </p>
              <p className="mt-1.5 text-[10px] text-slate-400">Valid for 10 minutes. Do not share this OTP.</p>
            </div>
          </div>

          {/* OTP entry section */}
          <div className="px-5 py-5">
            <label className="mb-3 block text-center text-xs font-bold uppercase tracking-widest text-slate-500">
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
                  className={`h-12 w-10 rounded-lg border-2 text-center text-xl font-extrabold outline-none transition-all ${
                    d
                      ? "border-[#145C45] bg-[#DDF3E7] text-[#145C45]"
                      : "border-slate-200 bg-slate-50 text-slate-800 focus:border-[#145C45] focus:ring-2 focus:ring-[#DDF3E7]"
                  }`}
                />
              ))}
            </div>

            {otpError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                <X className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-xs font-semibold text-red-700">{otpError}</p>
              </div>
            )}

            <button
              onClick={handleVerifyOtp}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#145C45] py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#0f4534] active:scale-[0.98] cursor-pointer"
            >
              <KeyRound className="h-4 w-4" /> Verify &amp; Continue
            </button>

            <div className="mt-4 text-center">
              {secondsLeft > 0 ? (
                <p className="text-xs text-slate-400">Resend OTP in <span className="font-bold text-[#145C45]">{secondsLeft}s</span></p>
              ) : (
                <button
                  onClick={() => {
                    resendInvite(member.id);
                    setOtp(["", "", "", "", "", ""]);
                    setSecondsLeft(30);
                    setOtpError("");
                  }}
                  className="text-xs font-bold text-[#145C45] hover:underline cursor-pointer"
                >
                  Didn't receive code? Resend OTP
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-[#DDF3E7]/30 px-5 py-3 text-center">
            <p className="text-[10px] text-[#145C45] font-semibold">
              {org.nameNepali} &middot; {org.nameEnglish}
            </p>
            <p className="text-[10px] text-slate-400">Secure KYC Verification Portal</p>
          </div>
        </div>

        <div className="h-8" />
      </div>
    );
  }

  // ── Render: Step 1 — General Details ──────────────────────────────────────
  if (screen === "general" && member) {
    return (
      <WizardShell memberName={memberName} currentStep="general" onCancel={() => setScreen("otp")}>
        <div className="flex gap-5">
          {/* Form */}
          <div className="flex-1 min-w-0 rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <h2 className="mb-3 text-base font-extrabold text-[#145C45] border-b border-[#DDF3E7] pb-2">
              General Details
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {/* Client Type */}
              <FormRow label="Client Type" required half>
                <select
                  value={general.clientType}
                  onChange={(e) => setGeneral({ ...general, clientType: e.target.value })}
                  className={selectCls}
                >
                  <option value="">Select Client Type</option>
                  {CLIENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </FormRow>

              {/* Mobile Number (pre-filled, readonly) */}
              <FormRow label="Mobile Number" required note="Verified via OTP" half>
                <input
                  type="text"
                  value={member.phone}
                  readOnly
                  className={inputCls + " bg-slate-50 cursor-not-allowed text-slate-500"}
                />
              </FormRow>

              {/* Online / Offline */}
              <FormRow label="Online / Offline" required half>
                <div className="flex gap-5 pt-1">
                  {(["online", "offline"] as const).map((v) => (
                    <label key={v} className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                      <input
                        type="radio"
                        name="submissionType"
                        value={v}
                        checked={general.submissionType === v}
                        onChange={() => setGeneral({ ...general, submissionType: v })}
                        className="h-4 w-4"
                        style={{ accentColor: "#145C45" }}
                      />
                      {v.toUpperCase()}
                    </label>
                  ))}
                </div>
              </FormRow>

              {/* Member Branch */}
              <FormRow label="Member Branch" required half>
                <select
                  value={general.memberBranch}
                  onChange={(e) => setGeneral({ ...general, memberBranch: e.target.value })}
                  className={selectCls}
                >
                  <option value="">Select Member Branch</option>
                  {MEMBER_BRANCHES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </FormRow>

              {/* PAN Number */}
              <FormRow label="PAN Number" half>
                <input
                  type="text"
                  value={general.panNumber}
                  onChange={(e) => setGeneral({ ...general, panNumber: e.target.value })}
                  placeholder="PAN Number (optional)"
                  className={inputCls}
                />
              </FormRow>

              {/* Email */}
              <FormRow label="Email" required half>
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
              <p className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-center text-xs font-bold text-red-700">
                {generalErr}
              </p>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleNextGeneral}
                className="flex items-center gap-2 rounded-lg bg-[#145C45] px-6 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f4534] active:scale-95 cursor-pointer"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <LivePreview
            title="General Details"
            memberName={memberName}
            memberPhone={memberPhone}
            rows={[
              { label: "Client Type", value: general.clientType },
              { label: "Mobile", value: member.phone },
              { label: "Submission", value: general.submissionType.toUpperCase() },
              { label: "Member Branch", value: general.memberBranch },
              { label: "PAN Number", value: general.panNumber },
              { label: "Email", value: general.email },
            ]}
          />
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
      <WizardShell memberName={memberName} currentStep="address" onCancel={() => setScreen("general")}>
        <div className="flex gap-5">
          {/* Form */}
          <div className="flex-1 min-w-0 rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <h2 className="mb-3 text-base font-extrabold text-[#145C45] border-b border-[#DDF3E7] pb-2">
              Address Details
            </h2>

            {/* ── Permanent Address ───────────────────────── */}
            <p className="mb-2 text-xs font-bold text-[#145C45] uppercase tracking-wide">Permanent Address</p>
            <div className="grid grid-cols-2 gap-3">
              <FormRow label="Country of Residence" required half>
                <select
                  value={addr.country}
                  onChange={(e) => setAddr({ ...addr, country: e.target.value })}
                  className={selectCls}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FormRow>

              <FormRow label="State / Province" required half>
                <select
                  value={addr.state}
                  onChange={(e) => setAddr({ ...addr, state: e.target.value, district: "", municipality: "" })}
                  className={selectCls}
                >
                  <option value="">Select State</option>
                  {NEPAL_PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </FormRow>

              <FormRow label="District" required half>
                <select
                  value={addr.district}
                  onChange={(e) => setAddr({ ...addr, district: e.target.value, municipality: "" })}
                  className={selectCls}
                  disabled={!addr.state}
                >
                  <option value="">Select District</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </FormRow>

              <FormRow label="Municipality" required half>
                <select
                  value={addr.municipality}
                  onChange={(e) => setAddr({ ...addr, municipality: e.target.value })}
                  className={selectCls}
                  disabled={!addr.district}
                >
                  <option value="">Select Municipality</option>
                  {municipalities.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  {addr.district && (
                    <>
                      <option value={`${addr.district} Municipality`}>{addr.district} Municipality</option>
                      <option value={`${addr.district} Rural Municipality`}>{addr.district} Rural Municipality</option>
                    </>
                  )}
                </select>
              </FormRow>

              <FormRow label="Ward No" required half>
                <input
                  type="text"
                  value={addr.wardNo}
                  onChange={(e) => setAddr({ ...addr, wardNo: e.target.value })}
                  placeholder="Ward Number"
                  className={inputCls}
                />
              </FormRow>

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
            <div className="mt-4 border-t border-slate-100 pt-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={addr.sameAsPermanent}
                  onChange={(e) => handleSameAsPermanent(e.target.checked)}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: "#145C45" }}
                />
                Same as Permanent Address
              </label>

              <button
                type="button"
                onClick={() => setAddr({ ...addr, hasTempAddress: !addr.hasTempAddress })}
                className="mt-2 flex items-center gap-1 text-sm font-semibold text-[#145C45] hover:underline cursor-pointer"
              >
                {addr.hasTempAddress ? "− Hide" : "+ Add"} Temporary Address
              </button>

              {addr.hasTempAddress && !addr.sameAsPermanent && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <p className="col-span-2 text-xs font-bold text-[#145C45] uppercase tracking-wide">Temporary Address</p>

                  <FormRow label="Country" required half>
                    <select value={addr.tempCountry} onChange={(e) => setAddr({ ...addr, tempCountry: e.target.value })} className={selectCls}>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </FormRow>

                  <FormRow label="State / Province" required half>
                    <select value={addr.tempState} onChange={(e) => setAddr({ ...addr, tempState: e.target.value, tempDistrict: "", tempMunicipality: "" })} className={selectCls}>
                      <option value="">Select State</option>
                      {NEPAL_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </FormRow>

                  <FormRow label="District" required half>
                    <select value={addr.tempDistrict} onChange={(e) => setAddr({ ...addr, tempDistrict: e.target.value, tempMunicipality: "" })} className={selectCls} disabled={!addr.tempState}>
                      <option value="">Select District</option>
                      {tempDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </FormRow>

                  <FormRow label="Municipality" required half>
                    <select value={addr.tempMunicipality} onChange={(e) => setAddr({ ...addr, tempMunicipality: e.target.value })} className={selectCls} disabled={!addr.tempDistrict}>
                      <option value="">Select Municipality</option>
                      {tempMunicipalities.map((m) => <option key={m} value={m}>{m}</option>)}
                      {addr.tempDistrict && (
                        <>
                          <option value={`${addr.tempDistrict} Municipality`}>{addr.tempDistrict} Municipality</option>
                          <option value={`${addr.tempDistrict} Rural Municipality`}>{addr.tempDistrict} Rural Municipality</option>
                        </>
                      )}
                    </select>
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
              <p className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-center text-xs font-bold text-red-700">
                {addrErr}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <button type="button" onClick={() => setScreen("general")} className="rounded border border-slate-300 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
                Back
              </button>
              <button type="button" onClick={handleNextAddress} className="flex items-center gap-2 rounded-lg bg-[#145C45] px-6 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f4534] active:scale-95 cursor-pointer">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <LivePreview
            title="Address Details"
            memberName={memberName}
            memberPhone={memberPhone}
            rows={[
              { label: "Country", value: addr.country },
              { label: "Province", value: addr.state },
              { label: "District", value: addr.district },
              { label: "Municipality", value: addr.municipality },
              { label: "Ward No", value: addr.wardNo },
              { label: "Street / Tole", value: addr.streetTole },
              ...(addr.hasTempAddress && !addr.sameAsPermanent
                ? [
                    { label: "Temp Province", value: addr.tempState },
                    { label: "Temp District", value: addr.tempDistrict },
                    { label: "Temp Ward No", value: addr.tempWardNo },
                  ]
                : []),
            ]}
          />
        </div>
      </WizardShell>
    );
  }

  // ── Render: Step 3 — Documents Upload ─────────────────────────────────────
  if (screen === "documents") {
    const setDoc = (key: keyof typeof docs) => (d: Doc) =>
      setDocs((prev) => ({ ...prev, [key]: d }));

    const uploadedCount = Object.values(docs).filter((d) => d.dataUrl).length;
    const totalDocs = Object.keys(docs).length;

    return (
      <WizardShell memberName={memberName} currentStep="documents" onCancel={() => setScreen("address")}>
        <div className="flex gap-5">
          {/* Form */}
          <div className="flex-1 min-w-0 rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <div className="mb-3 flex items-center justify-between border-b border-[#DDF3E7] pb-2">
              <h2 className="text-base font-extrabold text-[#145C45]">Documents Upload</h2>
              <span className="text-xs font-bold text-slate-500">
                {uploadedCount}/{totalDocs} uploaded
              </span>
            </div>
            <p className="mb-3 text-xs font-semibold text-red-500">
              ⚠ Disclaimer: Please upload documents upto 5 MB each
            </p>

            <div className="divide-y divide-slate-100">
              <DocRow label="Citizenship Certificates Front and Back" hint="(.pdf, .jpg format)" required value={docs.citizenshipFront} onChange={setDoc("citizenshipFront")} />
              <DocRow label="Selfie With Citizenship" hint="(.jpg format)" required value={docs.selfie} onChange={setDoc("selfie")} />
              <DocRow label="Birth Certificate (Incase of Minor)" hint="(.pdf, .jpg format)" value={docs.birthCert} onChange={setDoc("birthCert")} />
              <DocRow label="PAN Card" hint="(.jpg format)" value={docs.panDoc} onChange={setDoc("panDoc")} />
              <DocRow label="KYC Form Upload" hint="(.pdf, .jpg format)" required value={docs.kycForm} onChange={setDoc("kycForm")} />
              <DocRow label="Photo Upload" hint="(.jpg format)" required value={docs.photo} onChange={setDoc("photo")} />
              <DocRow label="Online Agreement Form" hint="(.pdf, .jpg format)" required value={docs.agreement} onChange={setDoc("agreement")} />
              <DocRow label="National ID" hint="(.pdf, .jpg, .jpeg format)" required value={docs.nationalId} onChange={setDoc("nationalId")} />
              <DocRow label="Company Registration Document" hint="(.pdf, .jpg format)" value={docs.companyReg} onChange={setDoc("companyReg")} />
            </div>

            {docsErr && (
              <p className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-center text-xs font-bold text-red-700">
                {docsErr}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <button type="button" onClick={() => setScreen("address")} className="rounded border border-slate-300 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
                Back
              </button>
              <button type="button" onClick={handleNextDocs} className="flex items-center gap-2 rounded-lg bg-[#145C45] px-6 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f4534] active:scale-95 cursor-pointer">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Live Preview — documents checklist */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-4 rounded-xl border border-[#DDF3E7] bg-white shadow-sm overflow-hidden">
              <div className="bg-[#145C45] px-4 py-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#DDF3E7] shrink-0" />
                <span className="text-xs font-bold text-white">Documents Checklist</span>
              </div>
              <div className="px-4 py-3 bg-[#DDF3E7]/40 border-b border-[#DDF3E7]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 flex-1 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-[#059669] transition-all"
                      style={{ width: `${(uploadedCount / totalDocs) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#145C45]">{uploadedCount}/{totalDocs}</span>
                </div>
                <p className="text-[10px] text-slate-500">{memberName} &middot; +977 {memberPhone}</p>
              </div>
              <div className="px-4 py-2 space-y-1.5">
                {(
                  [
                    { key: "citizenshipFront", label: "Citizenship" },
                    { key: "selfie", label: "Selfie" },
                    { key: "birthCert", label: "Birth Certificate" },
                    { key: "panDoc", label: "PAN Card" },
                    { key: "kycForm", label: "KYC Form" },
                    { key: "photo", label: "Photo" },
                    { key: "agreement", label: "Agreement" },
                    { key: "nationalId", label: "National ID" },
                    { key: "companyReg", label: "Company Reg." },
                  ] as { key: keyof typeof docs; label: string }[]
                ).map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2 py-0.5">
                    {docs[key].dataUrl ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    ) : (
                      <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-slate-300" />
                    )}
                    <span className={`text-xs ${docs[key].dataUrl ? "font-semibold text-slate-800" : "text-slate-400"}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </WizardShell>
    );
  }

  // ── Render: Step 4 — User Agreement ───────────────────────────────────────
  if (screen === "agreement") {
    return (
      <WizardShell
        memberName={memberName}
        currentStep="agreement"
        onCancel={() => setScreen("documents")}
        showSubmitBtn
        onSubmitBtn={handleSubmit}
      >
        <div className="flex gap-5">
          {/* Form */}
          <div className="flex-1 min-w-0 rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            {/* Title + Print button */}
            <div className="mb-3 flex items-center justify-between border-b border-[#DDF3E7] pb-2">
              <h2 className="text-base font-extrabold text-[#145C45]">User Agreement</h2>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
            </div>

            {/* Sub-heading */}
            <div className="mb-3 rounded-lg bg-[#DDF3E7]/50 border border-[#DDF3E7] px-3 py-2 text-center">
              <p className="text-xs font-bold text-[#145C45]">
                सहकारी संस्था ऐन, २०७४ को नियम ९० तथा सम्बन्धित
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">
                सहकारी संस्था सदस्यको सम्झौता
              </p>
            </div>

            {/* Agreement body */}
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 leading-relaxed max-h-60 overflow-y-auto">
              <p className="mb-2">
                संस्थामा भर्ना भएका सदस्यहरूले तल उल्लेखित विषय-वस्तुहरूको पूर्ण अनुपालन गर्नुपर्नेछ। (उक्त शर्त पूरा गर्नुभएन भने सदस्यता रद्द गर्ने अधिकार संस्थालाई हुनेछ)।
              </p>
              <p className="mb-3 font-semibold text-slate-800">
                यस सम्झौताका प्रमुख शर्तहरू निम्नानुसार छन्:
              </p>
              <ol className="space-y-1.5 list-none">
                {AGREEMENT_ITEMS.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 font-bold text-[#145C45]">{i + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Agree checkbox */}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#DDF3E7] bg-[#DDF3E7]/30 p-3">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => { setAgreed(e.target.checked); setSubmitErr(""); }}
                className="mt-0.5 h-4 w-4 rounded"
                style={{ accentColor: "#145C45" }}
              />
              <span className="text-xs font-semibold text-[#145C45] leading-relaxed">
                I have read and understood all the terms and conditions above. I agree to comply with all cooperative regulations and provide accurate information.
              </span>
            </label>

            {submitErr && (
              <p className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-center text-xs font-bold text-red-700">
                {submitErr}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setScreen("documents")}
                className="rounded border border-slate-300 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-[#059669] px-6 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> Submit KYC</>
                )}
              </button>
            </div>
          </div>

          {/* Summary panel */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-4 rounded-xl border border-[#DDF3E7] bg-white shadow-sm overflow-hidden">
              <div className="bg-[#145C45] px-4 py-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#DDF3E7] shrink-0" />
                <span className="text-xs font-bold text-white">Application Summary</span>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center gap-2 py-1 border-b border-[#DDF3E7]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#145C45] text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{memberName}</p>
                    <p className="text-[10px] text-slate-500">+977 {memberPhone}</p>
                  </div>
                </div>
                <PreviewRow label="Client Type" value={general.clientType} />
                <PreviewRow label="Branch" value={general.memberBranch} />
                <PreviewRow label="Email" value={general.email} />
                <PreviewRow label="Province" value={addr.state} />
                <PreviewRow label="District" value={addr.district} />
                <PreviewRow label="Municipality" value={addr.municipality} />
                <PreviewRow label="Ward No" value={addr.wardNo} />
                <div className="pt-1">
                  <p className="text-[10px] font-bold text-[#145C45] uppercase tracking-wide mb-1">Documents</p>
                  <p className="text-xs font-semibold text-slate-700">
                    {Object.values(docs).filter((d) => d.dataUrl).length} of {Object.keys(docs).length} uploaded
                  </p>
                </div>
              </div>
            </div>
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
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#F8FAFC] p-6 text-center">
      <div className={`flex h-20 w-20 items-center justify-center rounded-3xl ${
        member.status === "rejected" ? "bg-red-100" : member.status === "approved" || member.status === "printed" ? "bg-emerald-100" : "bg-amber-100"
      }`}>
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

      <div className="w-full max-w-xs rounded-2xl border border-[#DDF3E7] bg-white p-4 text-left text-xs shadow-sm">
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
            <dd className="font-bold text-slate-800">+977 {member.phone}</dd>
          </div>
        </dl>
      </div>

      {member.status === "approved" || member.status === "printed" ? (
        <button
          onClick={() => navigate("/")}
          className="rounded-xl bg-[#145C45] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0f4534]"
        >
          ← Back to Home
        </button>
      ) : (
        <button
          onClick={() => navigate("/admin")}
          className="rounded-xl bg-[#145C45] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0f4534]"
        >
          Go to Manager Portal
        </button>
      )}
    </div>
  );
}
