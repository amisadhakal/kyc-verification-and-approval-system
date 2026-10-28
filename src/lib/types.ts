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
  memberName: string;
  phone: string;
  membershipCode: string;
  address: string;
  photoDataUrl?: string;
  photoName?: string;
  idDocType?: string;
  idDocDataUrl?: string;
  idDocName?: string;
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
