export const STATUS_LABEL: Record<string, string> = {
  invited: "Invitation Sent",
  submitted: "Submitted",
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  printed: "Printed",
};

/** Ordered happy-path states of a KYC. */
export const KYC_FLOW = ["invited", "submitted", "pending", "approved", "printed"] as const;

export type KycStatus =
  | "invited"
  | "submitted"
  | "pending"
  | "approved"
  | "rejected"
  | "printed";

export type SubmissionStatus = Exclude<KycStatus, "invited">;

export interface Member {
  id: string;
  name: string;
  phone: string;
  membershipCode: string;
  inviteCode: string;
  otp: string;
  otpExpiresAt: number;
  invitedAt: number;
  status: KycStatus;
}

export interface KycSubmission {
  id: string;
  memberId: string;

  // ── Step 1: General Details ──────────────────────────────────────────────
  memberName: string;
  phone: string;
  membershipCode: string;
  referredBy?: string;
  clientType?: string;
  submissionType?: "online" | "offline";
  memberBranch?: string;
  panNumber?: string;
  email?: string;

  // ── Step 2: Address Details ───────────────────────────────────────────────
  // Permanent Address
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
  // Legacy / computed address string for display cards
  address?: string;

  // ── Step 3: Documents Upload ──────────────────────────────────────────────
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
  // Legacy doc fields (for backward compat with seed data)
  idDocType?: string;
  idDocDataUrl?: string;
  idDocName?: string;

  // ── Metadata ──────────────────────────────────────────────────────────────
  status: SubmissionStatus;
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  remark?: string;
  printedAt?: number;
}

export interface MemberInput {
  name: string;
  phone: string;
  membershipCode: string;
}
