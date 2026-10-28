import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { KycSubmission, Member, MemberInput } from "./types";

const STORAGE_KEY = "coop-kyc-state-v4";
const DAY = 24 * 60 * 60 * 1000;

export interface AppState {
  members: Member[];
  submissions: KycSubmission[];
}

export interface SubmitKycInput {
  inviteCode: string;
  otp: string;

  // Step 1 – General Details
  name: string;
  phone: string;
  referredBy?: string;
  clientType?: string;
  submissionType?: "online" | "offline";
  memberBranch?: string;
  panNumber?: string;
  email?: string;

  // Step 2 – Address Details (Permanent)
  country?: string;
  state?: string;
  district?: string;
  municipality?: string;
  wardNo?: string;
  streetTole?: string;
  // Temporary Address
  hasTempAddress?: boolean;
  sameAsPermanent?: boolean;
  tempCountry?: string;
  tempState?: string;
  tempDistrict?: string;
  tempMunicipality?: string;
  tempWardNo?: string;
  tempStreetTole?: string;

  // Step 3 – Documents Upload
  citizenshipFrontDataUrl?: string;
  citizenshipFrontName?: string;
  citizenshipBackDataUrl?: string;
  citizenshipBackName?: string;
  selfieDataUrl?: string;
  selfieName?: string;
  birthCertDataUrl?: string;
  birthCertName?: string;
  panDocDataUrl?: string;
  panDocName?: string;
  kycFormDataUrl?: string;
  kycFormName?: string;
  photoDataUrl?: string;
  photoName?: string;
  agreementDataUrl?: string;
  agreementName?: string;
  nationalIdDataUrl?: string;
  nationalIdName?: string;
  companyRegDataUrl?: string;
  companyRegName?: string;
}

export interface OfflineEntryInput {
  memberName: string;
  phone: string;
  membershipCode: string;
  address: string;
  idDocType?: string;
  idDocDataUrl?: string;
  idDocName?: string;
}

export interface SmsInviteData {
  memberId: string;
  name: string;
  phone: string;
  inviteCode: string;
  otp: string;
  link: string;
}

interface StoreValue {
  state: AppState;
  getMember: (id: string) => Member | undefined;
  getSubmission: (id: string) => KycSubmission | undefined;
  findByInviteCode: (code: string) => Member | undefined;
  addMembers: (rows: MemberInput[]) => Member[];
  resendInvite: (memberId: string) => void;
  sendMemberSms: (memberId: string) => SmsInviteData | null;
  submitKyc: (input: SubmitKycInput) => { ok: boolean; error?: string };
  startReview: (submissionId: string) => void;
  approveSubmission: (submissionId: string) => void;
  rejectSubmission: (submissionId: string, remark: string) => void;
  markPrinted: (submissionId: string) => void;
  offlineAdd: (input: OfflineEntryInput) => KycSubmission;
  resetState: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

function buildAddress(
  wardNo?: string,
  streetTole?: string,
  municipality?: string,
  district?: string,
  state?: string,
  country?: string
): string {
  return [wardNo && `Ward ${wardNo}`, streetTole, municipality, district, state, country]
    .filter(Boolean)
    .join(", ");
}

export function seedState(): AppState {
  const now = Date.now();
  const members: Member[] = [
    {
      id: "mem_ram",
      name: "Ram Sharma",
      phone: "9812345678",
      membershipCode: "MEM001",
      inviteCode: "ABC123",
      otp: "123456",
      otpExpiresAt: now + 60 * 60 * 1000,
      invitedAt: now - 2 * DAY,
      status: "invited",
    },
    {
      id: "mem_sita",
      name: "Sita Devi",
      phone: "9823456789",
      membershipCode: "MEM002",
      inviteCode: "KYC3Q8W",
      otp: "735210",
      otpExpiresAt: now + 30 * 60 * 1000,
      invitedAt: now - 3 * DAY,
      status: "pending",
    },
    {
      id: "mem_mohan",
      name: "Mohan Lal",
      phone: "9834567890",
      membershipCode: "MEM003",
      inviteCode: "KYC5R2T",
      otp: "194827",
      otpExpiresAt: now + 15 * 60 * 1000,
      invitedAt: now - 5 * DAY,
      status: "pending",
    },
    {
      id: "mem_gita",
      name: "Gita Kumari",
      phone: "9845678901",
      membershipCode: "MEM004",
      inviteCode: "KYC7T4Y",
      otp: "628194",
      otpExpiresAt: now + 50 * 60 * 1000,
      invitedAt: now - 12 * DAY,
      status: "approved",
    },
    {
      id: "mem_prakash",
      name: "Prakash Nair",
      phone: "9856789012",
      membershipCode: "MEM005",
      inviteCode: "KYC9W3U",
      otp: "357281",
      otpExpiresAt: now - 3 * DAY,
      invitedAt: now - 15 * DAY,
      status: "rejected",
    },
  ];

  const submissions: KycSubmission[] = [
    {
      id: "sub_mohan",
      memberId: "mem_mohan",
      memberName: "Mohan Lal",
      phone: "9834567890",
      membershipCode: "MEM003",
      email: "mohan@email.com",
      clientType: "Individual",
      memberBranch: "Pokhara Branch",
      country: "Nepal",
      state: "Gandaki Province",
      district: "Kaski",
      municipality: "Pokhara Metropolitan City",
      wardNo: "12",
      streetTole: "Green Park Lane",
      address: "Ward 12, Green Park Lane, Pokhara Metropolitan City, Kaski, Gandaki Province, Nepal",
      idDocType: "Citizenship",
      status: "pending",
      submittedAt: now - 26 * 60 * 1000,
    },
    {
      id: "sub_sita",
      memberId: "mem_sita",
      memberName: "Sita Devi",
      phone: "9823456789",
      membershipCode: "MEM002",
      email: "sita@email.com",
      clientType: "Individual",
      memberBranch: "Head Office - Kathmandu",
      country: "Nepal",
      state: "Bagmati Province",
      district: "Kathmandu",
      municipality: "Kathmandu Metropolitan City",
      wardNo: "45",
      streetTole: "Lake View Road",
      address: "Ward 45, Lake View Road, Kathmandu Metropolitan City, Kathmandu, Bagmati Province, Nepal",
      idDocType: "PAN Card",
      status: "pending",
      submittedAt: now - 2 * DAY - 5 * 60 * 1000,
    },
    {
      id: "sub_gita",
      memberId: "mem_gita",
      memberName: "Gita Kumari",
      phone: "9845678901",
      membershipCode: "MEM004",
      email: "gita@email.com",
      clientType: "Individual",
      memberBranch: "Biratnagar Branch",
      country: "Nepal",
      state: "Koshi Province",
      district: "Morang",
      municipality: "Biratnagar Metropolitan City",
      wardNo: "7",
      streetTole: "Sunrise Colony",
      address: "Ward 7, Sunrise Colony, Biratnagar Metropolitan City, Morang, Koshi Province, Nepal",
      idDocType: "Citizenship",
      status: "approved",
      submittedAt: now - 6 * DAY,
      reviewedAt: now - 5 * DAY,
      reviewedBy: "Manager · Suresh",
      remark: "All credentials and documents verified successfully",
    },
    {
      id: "sub_prakash",
      memberId: "mem_prakash",
      memberName: "Prakash Nair",
      phone: "9856789012",
      membershipCode: "MEM005",
      email: "prakash@email.com",
      clientType: "Individual",
      memberBranch: "Birgunj Branch",
      country: "Nepal",
      state: "Madhesh Province",
      district: "Parsa",
      municipality: "Birgunj Metropolitan City",
      wardNo: "3",
      streetTole: "Hill Top Street",
      address: "Ward 3, Hill Top Street, Birgunj Metropolitan City, Parsa, Madhesh Province, Nepal",
      idDocType: "Citizenship",
      status: "rejected",
      submittedAt: now - 8 * DAY,
      reviewedAt: now - 7 * DAY,
      reviewedBy: "Manager · Suresh",
      remark: "Address on citizenship proof does not match permanent address provided",
    },
  ];

  return { members, submissions };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (Array.isArray(parsed.members) && Array.isArray(parsed.submissions)) {
        return parsed;
      }
    }
  } catch {
    // ignore corrupted storage
  }
  return seedState();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full (large images) — ignore
    }
  }, [state]);

  const value = useMemo<StoreValue>(() => {
    const getMember = (id: string) => state.members.find((m) => m.id === id);
    const getSubmission = (id: string) =>
      state.submissions.find((s) => s.id === id);

    const findByInviteCode = (code: string) => {
      const cleaned = (code ?? "").trim().toLowerCase();
      if (!cleaned) return undefined;
      return state.members.find(
        (m) => m.inviteCode.toLowerCase() === cleaned
      );
    };

    const addMembers = (rows: MemberInput[]): Member[] => {
      const now = Date.now();
      const created: Member[] = rows
        .filter((r) => r.name.trim().length > 0 && r.phone.trim().length > 0)
        .map((r) => ({
          id: uid("mem"),
          name: r.name.trim(),
          phone: r.phone.trim(),
          membershipCode:
            r.membershipCode.trim().toUpperCase() ||
            `MEM${String(state.members.length + 1).padStart(3, "0")}`,
          inviteCode: generateInviteCode(),
          otp: generateOtp(),
          otpExpiresAt: now + 30 * 60 * 1000,
          invitedAt: now,
          status: "invited",
        }));
      if (created.length > 0) {
        setState((s) => ({ ...s, members: [...created, ...s.members] }));
      }
      return created;
    };

    const resendInvite = (memberId: string) => {
      setState((s) => ({
        ...s,
        members: s.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                otp: m.id === "mem_ram" ? "123456" : generateOtp(),
                otpExpiresAt: Date.now() + 30 * 60 * 1000,
              }
            : m
        ),
      }));
    };

    const sendMemberSms = (memberId: string): SmsInviteData | null => {
      const member = state.members.find((m) => m.id === memberId);
      if (!member) return null;
      const otp = member.id === "mem_ram" ? "123456" : member.otp || generateOtp();
      const inviteCode = member.inviteCode;

      setState((s) => ({
        ...s,
        members: s.members.map((m) =>
          m.id === memberId
            ? { ...m, otp, otpExpiresAt: Date.now() + 30 * 60 * 1000 }
            : m
        ),
      }));

      return {
        memberId: member.id,
        name: member.name,
        phone: member.phone,
        inviteCode,
        otp,
        link: `${window.location.origin}${window.location.pathname}#/kyc/${inviteCode.toLowerCase()}`,
      };
    };

    const submitKyc: StoreValue["submitKyc"] = (input) => {
      const member = findByInviteCode(input.inviteCode);
      if (!member) return { ok: false, error: "Invitation not found. Please check your invite link." };
      if (member.status !== "invited" && member.status !== "rejected") {
        return { ok: false, error: "This invitation has already been submitted. Please contact your cooperative admin." };
      }
      if (member.otp !== input.otp.trim()) {
        return { ok: false, error: "Invalid OTP session. Please restart the verification." };
      }

      // Build a human-readable address string for display in list views
      const addressStr = buildAddress(
        input.wardNo,
        input.streetTole,
        input.municipality,
        input.district,
        input.state,
        input.country
      );

      // Step 4: Data is saved → Status becomes Pending Review
      const submission: KycSubmission = {
        id: uid("sub"),
        memberId: member.id,
        memberName: input.name.trim(),
        phone: input.phone.trim(),
        membershipCode: member.membershipCode,
        referredBy: input.referredBy,
        clientType: input.clientType,
        submissionType: input.submissionType,
        memberBranch: input.memberBranch,
        panNumber: input.panNumber,
        email: input.email,
        // Permanent address
        country: input.country,
        state: input.state,
        district: input.district,
        municipality: input.municipality,
        wardNo: input.wardNo,
        streetTole: input.streetTole,
        address: addressStr || undefined,
        // Temporary address
        hasTempAddress: input.hasTempAddress,
        sameAsPermanent: input.sameAsPermanent,
        tempCountry: input.tempCountry,
        tempState: input.tempState,
        tempDistrict: input.tempDistrict,
        tempMunicipality: input.tempMunicipality,
        tempWardNo: input.tempWardNo,
        tempStreetTole: input.tempStreetTole,
        // Documents
        citizenshipFrontDataUrl: input.citizenshipFrontDataUrl,
        citizenshipFrontName: input.citizenshipFrontName,
        citizenshipBackDataUrl: input.citizenshipBackDataUrl,
        citizenshipBackName: input.citizenshipBackName,
        selfieDataUrl: input.selfieDataUrl,
        selfieName: input.selfieName,
        birthCertDataUrl: input.birthCertDataUrl,
        birthCertName: input.birthCertName,
        panDocDataUrl: input.panDocDataUrl,
        panDocName: input.panDocName,
        kycFormDataUrl: input.kycFormDataUrl,
        kycFormName: input.kycFormName,
        photoDataUrl: input.photoDataUrl,
        photoName: input.photoName,
        agreementDataUrl: input.agreementDataUrl,
        agreementName: input.agreementName,
        nationalIdDataUrl: input.nationalIdDataUrl,
        nationalIdName: input.nationalIdName,
        companyRegDataUrl: input.companyRegDataUrl,
        companyRegName: input.companyRegName,
        status: "pending",
        submittedAt: Date.now(),
      };

      setState((s) => ({
        members: s.members.map((m) =>
          m.id === member.id ? { ...m, status: "pending" } : m
        ),
        submissions: [
          submission,
          ...s.submissions.filter((x) => x.memberId !== member.id),
        ],
      }));
      return { ok: true };
    };

    const startReview = (submissionId: string) => {
      const sub = state.submissions.find((s) => s.id === submissionId);
      if (!sub) return;
      setState((s) => ({
        submissions: s.submissions.map((x) =>
          x.id === submissionId ? { ...x, status: "pending" } : x
        ),
        members: s.members.map((m) =>
          m.id === sub.memberId ? { ...m, status: "pending" } : m
        ),
      }));
    };

    const approveSubmission = (submissionId: string) => {
      const sub = state.submissions.find((s) => s.id === submissionId);
      if (!sub) return;
      setState((s) => ({
        submissions: s.submissions.map((x) =>
          x.id === submissionId
            ? { ...x, status: "approved", reviewedAt: Date.now(), reviewedBy: "Manager · Suresh" }
            : x
        ),
        members: s.members.map((m) =>
          m.id === sub.memberId ? { ...m, status: "approved" } : m
        ),
      }));
    };

    const rejectSubmission = (submissionId: string, remark: string) => {
      const sub = state.submissions.find((s) => s.id === submissionId);
      if (!sub) return;
      setState((s) => ({
        submissions: s.submissions.map((x) =>
          x.id === submissionId
            ? { ...x, status: "rejected", reviewedAt: Date.now(), reviewedBy: "Manager · Suresh", remark }
            : x
        ),
        members: s.members.map((m) =>
          m.id === sub.memberId ? { ...m, status: "rejected" } : m
        ),
      }));
    };

    const markPrinted = (submissionId: string) => {
      const sub = state.submissions.find((s) => s.id === submissionId);
      if (!sub || sub.status !== "approved") return;
      setState((s) => ({
        submissions: s.submissions.map((x) =>
          x.id === submissionId ? { ...x, status: "printed", printedAt: Date.now() } : x
        ),
        members: s.members.map((m) =>
          m.id === sub.memberId ? { ...m, status: "printed" } : m
        ),
      }));
    };

    const offlineAdd = (input: OfflineEntryInput): KycSubmission => {
      const sub: KycSubmission = {
        id: uid("sub"),
        memberId: "offline_manual",
        memberName: input.memberName.trim(),
        phone: input.phone.trim(),
        membershipCode: input.membershipCode.trim().toUpperCase() || "OFFLINE",
        address: input.address.trim(),
        idDocType: input.idDocType,
        idDocDataUrl: input.idDocDataUrl,
        idDocName: input.idDocName,
        status: "pending",
        submittedAt: Date.now(),
      };
      setState((s) => ({ submissions: [sub, ...s.submissions] }));
      return sub;
    };

    const resetState = () => {
      const fresh = seedState();
      setState(fresh);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      } catch {
        // ignore
      }
    };

    return {
      state,
      getMember,
      getSubmission,
      findByInviteCode,
      addMembers,
      resendInvite,
      sendMemberSms,
      submitKyc,
      startReview,
      approveSubmission,
      rejectSubmission,
      markPrinted,
      offlineAdd,
      resetState,
    };
  }, [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `KYC${out}`;
}
