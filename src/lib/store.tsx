import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { KycSubmission, Member, MemberInput } from "./types";

const STORAGE_KEY = "coop-kyc-state-v1";
const DAY = 24 * 60 * 60 * 1000;

export interface AppState {
  members: Member[];
  submissions: KycSubmission[];
}

export interface SubmitKycInput {
  inviteCode: string;
  otp: string;
  name: string;
  phone: string;
  address: string;
  photoDataUrl?: string;
  photoName?: string;
  idDocType?: string;
  idDocDataUrl?: string;
  idDocName?: string;
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

interface StoreValue {
  state: AppState;
  getMember: (id: string) => Member | undefined;
  getSubmission: (id: string) => KycSubmission | undefined;
  findByInviteCode: (code: string) => Member | undefined;
  addMembers: (rows: MemberInput[]) => Member[];
  resendInvite: (memberId: string) => void;
  submitKyc: (input: SubmitKycInput) => { ok: boolean; error?: string };
  startReview: (submissionId: string) => void;
  approveSubmission: (submissionId: string) => void;
  rejectSubmission: (submissionId: string, remark: string) => void;
  markPrinted: (submissionId: string) => void;
  offlineAdd: (input: OfflineEntryInput) => KycSubmission;
}

const StoreContext = createContext<StoreValue | null>(null);

function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

function seedState(): AppState {
  const now = Date.now();
  const members: Member[] = [
    {
      id: "mem_ram",
      name: "Ram Sharma",
      phone: "919812345678",
      membershipCode: "MEM001",
      inviteCode: "KYC8F2P",
      otp: "482913",
      otpExpiresAt: now + 26 * 60 * 1000,
      invitedAt: now - 2 * DAY,
      status: "invited",
    },
    {
      id: "mem_sita",
      name: "Sita Devi",
      phone: "919823456789",
      membershipCode: "MEM002",
      inviteCode: "KYC3Q8W",
      otp: "735210",
      otpExpiresAt: now - 40 * 60 * 1000,
      invitedAt: now - 5 * DAY,
      status: "submitted",
    },
    {
      id: "mem_mohan",
      name: "Mohan Lal",
      phone: "919834567890",
      membershipCode: "MEM003",
      inviteCode: "KYC5R2T",
      otp: "194827",
      otpExpiresAt: now + 8 * 60 * 1000,
      invitedAt: now - 9 * DAY,
      status: "pending",
    },
    {
      id: "mem_gita",
      name: "Gita Kumari",
      phone: "919845678901",
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
      phone: "919856789012",
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
      phone: "919834567890",
      membershipCode: "MEM003",
      address: "12, Green Park Lane, Ward 4, Jaipur",
      idDocType: "Aadhaar",
      status: "pending",
      submittedAt: now - 26 * 60 * 1000,
    },
    {
      id: "sub_sita",
      memberId: "mem_sita",
      memberName: "Sita Devi",
      phone: "919823456789",
      membershipCode: "MEM002",
      address: "45, Lake View Road, Jaipur",
      idDocType: "PAN",
      status: "submitted",
      submittedAt: now - 2 * DAY - 5 * 60 * 1000,
    },
    {
      id: "sub_gita",
      memberId: "mem_gita",
      memberName: "Gita Kumari",
      phone: "919845678901",
      membershipCode: "MEM004",
      address: "7, Sunrise Colony, Jaipur",
      idDocType: "Voter ID",
      status: "approved",
      submittedAt: now - 6 * DAY,
      reviewedAt: now - 5 * DAY,
      reviewedBy: "Manager · Suresh",
      remark: "Looks good",
    },
    {
      id: "sub_prakash",
      memberId: "mem_prakash",
      memberName: "Prakash Nair",
      phone: "919856789012",
      membershipCode: "MEM005",
      address: "3, Hill Top Street, Jaipur",
      idDocType: "Aadhaar",
      status: "rejected",
      submittedAt: now - 8 * DAY,
      reviewedAt: now - 7 * DAY,
      reviewedBy: "Manager · Suresh",
      remark: "Address mismatch with address proof",
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
    const findByInviteCode = (code: string) =>
      state.members.find(
        (m) => m.inviteCode.toLowerCase() === code.trim().toLowerCase()
      );

    const addMembers = (rows: MemberInput[]): Member[] => {
      const now = Date.now();
      const created: Member[] = rows
        .filter((r) => r.name.trim().length > 0 && r.phone.trim().length > 0)
        .map((r) => ({
          id: uid("mem"),
          name: r.name.trim(),
          phone: r.phone.trim(),
          membershipCode:
            r.membershipCode.trim().toUpperCase() || `MEM${String(
              state.members.length + 1
            ).padStart(3, "0")}`,
          inviteCode: generateInviteCode(),
          otp: generateOtp(),
          otpExpiresAt: now + 10 * 60 * 1000,
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
                otp: generateOtp(),
                otpExpiresAt: Date.now() + 10 * 60 * 1000,
              }
            : m
        ),
      }));
    };

    const submitKyc: StoreValue["submitKyc"] = (input) => {
      const member = findByInviteCode(input.inviteCode);
      if (!member) return { ok: false, error: "Invitation not found" };
      if (member.status !== "invited") {
        return { ok: false, error: "This invitation has already been used" };
      }
      if (member.otp !== input.otp.trim()) {
        return { ok: false, error: "Incorrect OTP. Please try again." };
      }
      if (member.otpExpiresAt < Date.now()) {
        return { ok: false, error: "OTP has expired. Please request a new one." };
      }
      const submission: KycSubmission = {
        id: uid("sub"),
        memberId: member.id,
        memberName: input.name.trim(),
        phone: input.phone.trim(),
        membershipCode: member.membershipCode,
        address: input.address.trim(),
        photoDataUrl: input.photoDataUrl,
        photoName: input.photoName,
        idDocType: input.idDocType,
        idDocDataUrl: input.idDocDataUrl,
        idDocName: input.idDocName,
        status: "submitted",
        submittedAt: Date.now(),
      };
      setState((s) => ({
        members: s.members.map((m) =>
          m.id === member.id ? { ...m, status: "submitted" } : m
        ),
        submissions: [submission, ...s.submissions],
      }));
      return { ok: true };
    };

    const startReview = (submissionId: string) => {
      const sub = state.submissions.find((s) => s.id === submissionId);
      if (!sub || sub.status !== "submitted") return;
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
      if (!sub || (sub.status !== "submitted" && sub.status !== "pending")) return;
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

    return {
      state,
      getMember,
      getSubmission,
      findByInviteCode,
      addMembers,
      resendInvite,
      submitKyc,
      startReview,
      approveSubmission,
      rejectSubmission,
      markPrinted,
      offlineAdd,
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
