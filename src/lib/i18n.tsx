import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "ne";

export const I18N_STORAGE_KEY = "coop-kyc-language";

const en = {
  // ── Landing page ──────────────────────────────────────────────────────────
  inviteCode: "Invite Code",
  inviteCodeRequired: "Please enter your SMS invite code.",
  inviteCodeNotFound: "Invitation code not found. Please check your SMS and try again.",
  verifyingCode: "Verifying Code...",
  openKycForm: "Open KYC Form",
  staffAccess: "Staff Access",
  managerPortal: "Manager Portal",
  managerPortalHint: "Review, approve & print KYC records",
  memberPortalTitle: "Member Verification Portal",
  memberPortalHint: "Enter your invitation code received via SMS to complete verification.",
  country: "Country",
  province: "Province",

  // ── Member KYC – OTP screen ───────────────────────────────────────────────
  otpTitle: "OTP Verification",
  otpGreeting: "Hi {name}, we sent a 6-digit code to your phone.",
  smsReceivedFrom: "SMS received from {org}",
  smsBody: "Dear {name}, your KYC link: kyc.coop/{code} — OTP: {otp}",
  otpValid: "Valid for 10 minutes. Do not share this OTP.",
  enterOtp: "Enter Verification Code",
  verifyContinue: "Verify & Continue",
  resendOtp: "Didn't receive code? Resend OTP",

  // ── Member KYC – wizard steps ────────────────────────────────────────────
  stepGeneral: "General Details",
  stepAddress: "Address Details",
  stepDocuments: "Documents Upload",
  stepAgreement: "User Agreement",

  // ── Member KYC – form labels ─────────────────────────────────────────────
  clientType: "Client Type",
  clientTypeSelect: "Select Client Type",
  mobileNumber: "Mobile Number",
  mobileVerifiedViaOtp: "Verified via OTP",
  onlineOffline: "Online / Offline",
  memberBranch: "Member Branch",
  memberBranchSelect: "Select Member Branch",
  panNumber: "PAN Number",
  email: "Email",
  submission: "Submission",
  countryOfResidence: "Country of Residence",
  stateProvince: "State / Province",
  district: "District",
  municipality: "Municipality",
  wardNo: "Ward No",
  streetTole: "Street / Tole",
  permanentAddress: "Permanent Address",
  sameAsPermanent: "Same as Permanent Address",
  temporaryAddress: "Temporary Address",
  addTemporaryAddress: "Add Temporary Address",
  hideTemporaryAddress: "Hide Temporary Address",
  tempCountry: "Country",
  tempProvince: "Temp Province",
  tempDistrict: "Temp District",
  tempWardNo: "Temp Ward No",
  tempStreetTole: "Temp Street / Tole",

  // ── Member KYC – validation errors ────────────────────────────────────────
  errClientType: "Please select a client type.",
  errBranch: "Please select a member branch.",
  errEmail: "Please enter a valid email address.",
  errProvince: "Please select your province / state.",
  errDistrict: "Please select your district.",
  errMunicipality: "Please select your municipality.",
  errWard: "Please enter your ward number.",
  errStreet: "Please enter your street / tole.",
  errTempProvince: "Please select the province for the temporary address.",
  errTempDistrict: "Please select the district for the temporary address.",
  errTempMunicipality: "Please select the municipality for the temporary address.",
  errTempWard: "Please enter the ward number for the temporary address.",
  errTempStreet: "Please enter the street / tole for the temporary address.",
  errCitizenshipFront: "Please upload the Citizenship Certificate (Front).",
  errSelfie: "Please upload the Selfie with Citizenship.",
  errPhoto: "Please upload your Photo.",
  errNationalId: "Please upload your National ID.",
  errAgree: "Please read and accept the agreement before submitting.",

  // ── Member KYC – documents ─────────────────────────────────────────────────
  documents: "Documents Upload",
  documentsDisclaimer: "Please upload documents up to 5 MB each.",
  citizenshipFrontBack: "Citizenship Certificates Front and Back",
  selfieWithCitizenship: "Selfie With Citizenship",
  birthCertificate: "Birth Certificate (Incase of Minor)",
  panCard: "PAN Card",
  kycForm: "KYC Form Upload",
  photoUpload: "Photo Upload",
  onlineAgreement: "Online Agreement Form",
  nationalId: "National ID",
  companyRegistration: "Company Registration Document",
  hintCitizenship: "(.pdf, .jpg format)",
  hintSelfie: "(.jpg format)",
  hintBirthCert: "(.pdf, .jpg format)",
  hintPan: "(.jpg format)",
  hintKycForm: "(.pdf, .jpg format)",
  hintPhoto: "(.jpg format)",
  hintOnlineAgreement: "(.pdf, .jpg format)",
  hintNationalId: "(.pdf, .jpg, .jpeg format)",
  hintCompanyReg: "(.pdf, .jpg format)",

  // ── Member KYC – agreement ─────────────────────────────────────────────────
  agreeCheckbox:
    "I have read and understood all the terms and conditions above. I agree to comply with all cooperative regulations and provide accurate information.",

  // ── Member KYC – success screen ───────────────────────────────────────────
  successTitle: "KYC Submitted!",
  successThankYou: "Thank you, {name}. Your application and documents have been saved. Status is now Pending Review.",
  successMemberCode: "Member Code",
  successEmail: "Email",
  successBranch: "Branch",
  successSubmittedAt: "Submitted At",
  goToManagerPortal: "Go to Manager Portal",
  trackApplication: "Track Application Status",
  backToHome: "Back to Home",

  // ── Member KYC – status screen ────────────────────────────────────────────
  statusMsgSubmitted: "Your KYC has been received and is in the review queue.",
  statusMsgPending: "The manager is currently reviewing your KYC documents.",
  statusMsgApproved: "Your KYC is approved. The official form is being prepared for printing.",
  statusMsgRejected: "Your KYC was rejected. Please contact the cooperative admin to correct and resubmit.",
  statusMsgPrinted: "Your KYC has been approved and printed into the official record.",
  statusMemberName: "Member Name",
  statusMemberCode: "Member Code",
  statusMobile: "Mobile",

  // ── KYC status & stepper labels ───────────────────────────────────────────
  statusInvited: "Invitation Sent",
  statusSubmitted: "Submitted",
  statusPending: "Pending Review",
  statusApproved: "Approved",
  statusRejected: "Rejected",
  statusPrinted: "Printed",
  stepInvited: "Invited",
  stepSubmitted: "Submitted",
  stepReview: "Review",
  stepApproved: "Approved",
  stepPrinted: "Printed",

  // ── Member KYC – misc screens ────────────────────────────────────────────
  invalidTitle: "Invite Link Not Found",
  invalidBody: "The code {code} was not found. Please use the exact link from your SMS.",
  enterCodeManually: "Enter Code Manually",
  back: "Back",
  next: "Next",
  submitKyc: "Submit KYC",
  submitting: "Submitting…",
  cancelApplication: "Cancel Application",
  submitApplication: "Submit Application",
  print: "Print",
  memberDetails: "Member Details",
  phone: "Phone",
  viewDetails: "View Details",
  approve: "Approve",
  reject: "Reject",
  printKycForm: "Print KYC Form",
  backToSubmissions: "Back to Submissions",
  submittedKycInfo: "Submitted KYC Information",
  uploadedDocs: "Uploaded Documents & Proofs (Tap to enlarge)",
  managerAction: "Manager Action",
  livePreview: "Live Preview",
  documentsChecklist: "Documents Checklist",
  applicationSummary: "Application Summary",
  fillFormToSeeData: "Fill in the form to see your data here",

  // ── Manager login ─────────────────────────────────────────────────────────
  dashboardTitle: "Manager Review Dashboard",
  dashboardSubtitle: "Review submitted member KYC documents, approve or reject, and print official KYC forms.",
  noSubmissions: "No submissions found",
  noSubmissionsHint: "KYC submissions will appear here once members submit the online form.",
  allSubmissions: "All Submissions",
  totalMembers: "Total Members",
  pendingQueueAlert: "{count} Submissions Waiting for Review",
  newSubmissionsWaiting: "New member KYC submissions have been received and need your decision.",
  filterPendingQueue: "Filter Pending Queue →",
  managerLogin: "Manager Login",
  managerLoginSubtitle: "Sign in to access the KYC management dashboard.",
  signIn: "Sign In",
  signingIn: "Signing In…",
  password: "Password",
  invalidCredentials: "Invalid email or password. Please try again.",
  returnToHome: "Return to Home",
  logout: "Logout",

  // ── SMS modal ─────────────────────────────────────────────────────────────
  smsDelivered: "SMS Delivered to Member",
  smsRecipient: "Recipient",
  smsFrom: "SMS received from {org}",
  openMemberForm: "Open Member KYC Form (Step 3)",
  copySms: "Copy SMS Text",
  copied: "Copied to clipboard!",
  close: "Close",
};

export type TranslationKey = keyof typeof en;

const ne: Record<TranslationKey, string> = {
  // ── Landing page ──────────────────────────────────────────────────────────
  inviteCode: "निमन्त्रणा कोड",
  inviteCodeRequired: "कृपया आफ्नो SMS मा पठाइएको निमन्त्रणा कोड प्रविष्ट गर्नुहोस्।",
  inviteCodeNotFound: "निमन्त्रणा कोड फेला परेन। कृपया आफ्नो सहकारी SMS मा प्राप्त कोड पुनः जाँच गर्नुहोस्।",
  verifyingCode: "कोड जाँच गरिँदैछ...",
  openKycForm: "KYC फारम खोल्नुहोस्",
  staffAccess: "सहकारी व्यवस्थापन",
  managerPortal: "व्यवस्थापक डेस्क",
  managerPortalHint: "KYC रेकर्डहरू समीक्षा, स्वीकृति र छाप्नुहोस्",
  memberPortalTitle: "सदस्य पहिचान (KYC) पोर्टल",
  memberPortalHint: "सत्यापन पूरा गर्न आफ्नो SMS मा पठाइएको निमन्त्रणा कोड प्रविष्ट गर्नुहोस्।",
  country: "देश",
  province: "प्रदेश",

  // ── Member KYC – OTP screen ───────────────────────────────────────────────
  otpTitle: "OTP प्रमाणीकरण",
  otpGreeting: "नमस्ते {name}, हामीले तपाईंको फोनमा ६-अंकको कोड पठाएका छौं।",
  smsReceivedFrom: "{org} बाट SMS प्राप्त भयो",
  smsBody: "प्रिय {name}, तपाईंको KYC लिंक: kyc.coop/{code} — OTP: {otp}",
  otpValid: "यो कोड १० मिनेटसम्म मान्य छ। यसलाई अरूसँग साझा नगर्नुहोस्।",
  enterOtp: "प्रमाणीकरण कोड प्रविष्ट गर्नुहोस्",
  verifyContinue: "प्रमाणीकरण गर्नुहोस् र अगाडि बढ्नुहोस्",
  resendOtp: "कोड प्राप्त भएन? OTP पुनः पठाउनुहोस्",

  // ── Member KYC – wizard steps ────────────────────────────────────────────
  stepGeneral: "सामान्य विवरण",
  stepAddress: "ठेगाना विवरण",
  stepDocuments: "कागजात अपलोड",
  stepAgreement: "प्रयोगकर्ता सम्झौता",

  // ── Member KYC – form labels ─────────────────────────────────────────────
  clientType: "ग्राहक प्रकार",
  clientTypeSelect: "ग्राहक प्रकार छान्नुहोस्",
  mobileNumber: "मोबाइल नम्बर",
  mobileVerifiedViaOtp: "OTP मार्फत प्रमाणित",
  onlineOffline: "अनलाइन / ऑफलाइन",
  memberBranch: "सदस्य कार्यालय",
  memberBranchSelect: "सदस्य कार्यालय छान्नुहोस्",
  panNumber: "प्यान नम्बर",
  email: "इमेल",
  submission: "पेश",
  countryOfResidence: "बसोबासको देश",
  stateProvince: "प्रदेश / राज्य",
  district: "जिल्ला",
  municipality: "नगरपालिका",
  wardNo: "वडा नं",
  streetTole: "सडक / टोल",
  permanentAddress: "स्थायी ठेगाना",
  sameAsPermanent: "स्थायी ठेगानासँग उही",
  temporaryAddress: "अस्थायी ठेगाना",
  addTemporaryAddress: "अस्थायी ठेगाना थप्नुहोस्",
  hideTemporaryAddress: "अस्थायी ठेगाना लुकाउनुहोस्",
  tempCountry: "देश",
  tempProvince: "अस्थायी प्रदेश",
  tempDistrict: "अस्थायी जिल्ला",
  tempWardNo: "अस्थायी वडा नं",
  tempStreetTole: "अस्थायी सडक / टोल",

  // ── Member KYC – validation errors ────────────────────────────────────────
  errClientType: "कृपया ग्राहक प्रकार छान्नुहोस्।",
  errBranch: "कृपया सदस्य कार्यालय छान्नुहोस्।",
  errEmail: "कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्।",
  errProvince: "कृपया आफ्नो प्रदेश छान्नुहोस्।",
  errDistrict: "कृपया आफ्नो जिल्ला छान्नुहोस्।",
  errMunicipality: "कृपया आफ्नो नगरपालिका छान्नुहोस्।",
  errWard: "कृपया आफ्नो वडा नं प्रविष्ट गर्नुहोस्।",
  errStreet: "कृपया आफ्नो सडक / टोल प्रविष्ट गर्नुहोस्।",
  errTempProvince: "अस्थायी ठेगानाको लागि कृपया प्रदेश छान्नुहोस्।",
  errTempDistrict: "अस्थायी ठेगानाको लागि कृपया जिल्ला छान्नुहोस्।",
  errTempMunicipality: "अस्थायी ठेगानाको लागि कृपया नगरपालिका छान्नुहोस्।",
  errTempWard: "अस्थायी ठेगानाको लागि कृपया वडा नं प्रविष्ट गर्नुहोस्।",
  errTempStreet: "अस्थायी ठेगानाको लागि कृपया सडक / टोल प्रविष्ट गर्नुहोस्।",
  errCitizenshipFront: "कृपया नागरिकता प्रमाणपत्र (अगाडि) अपलोड गर्नुहोस्।",
  errSelfie: "कृपया नागरिकता सँग आफ्नो सेल्फी अपलोड गर्नुहोस्।",
  errPhoto: "कृपया आफ्नो फोटो अपलोड गर्नुहोस्।",
  errNationalId: "कृपया आफ्नो राष्ट्रिय परिचय पत्र अपलोड गर्नुहोस्।",
  errAgree: "पेश गर्नुअघि कृपया सम्झौता पढेर स्वीकार गर्नुहोस्।",

  // ── Member KYC – documents ─────────────────────────────────────────────────
  documents: "कागजात अपलोड",
  documentsDisclaimer: "कृपया प्रत्येक कागजात ५ MB सम्म अपलोड गर्नुहोस्।",
  citizenshipFrontBack: "नागरिकता प्रमाणपत्र अगाडि र पछाडि",
  selfieWithCitizenship: "नागरिकता सँगको सेल्फी",
  birthCertificate: "जन्म प्रमाणपत्र (अन्तिम समयमा सन्तानको लागि)",
  panCard: "प्यान कार्ड",
  kycForm: "KYC फारम",
  photoUpload: "फोटो",
  onlineAgreement: "अनलाइन सम्झौता फारम",
  nationalId: "राष्ट्रिय परिचय पत्र",
  companyRegistration: "कम्पनी दर्ता कागजात",
  hintCitizenship: "(.pdf, .jpg बाटो)",
  hintSelfie: "(.jpg बाटो)",
  hintBirthCert: "(.pdf, .jpg बाटो)",
  hintPan: "(.jpg बाटो)",
  hintKycForm: "(.pdf, .jpg बाटो)",
  hintPhoto: "(.jpg बाटो)",
  hintOnlineAgreement: "(.pdf, .jpg बाटो)",
  hintNationalId: "(.pdf, .jpg, .jpeg बाटो)",
  hintCompanyReg: "(.pdf, .jpg बाटो)",

  // ── Member KYC – agreement ─────────────────────────────────────────────────
  agreeCheckbox:
    "म माथि उल्लेख गरिएका सबै सर्त र नियम बुझेको छु। कृपया सबै सहकारी नियम पालना गर्न र सही जानकारी दिन म सहमत छु।",

  // ── Member KYC – success screen ───────────────────────────────────────────
  successTitle: "KYC सफलतापूर्वक पेश भयो!",
  successThankYou: "धन्यवाद {name}, तपाईंको आवेदन र कागजातहरू सफलतापूर्वक सही गरियो। अब यसको अवस्था समीक्षाका लागि पर्छ।",
  successMemberCode: "सदस्य कोड",
  successEmail: "इमेल",
  successBranch: "कार्यालय",
  successSubmittedAt: "पेश भएको समय",
  goToManagerPortal: "व्यवस्थापक पोर्टलमा जाऊनुहोस्",
  trackApplication: "आवेदन अवस्था छुनुहोस्",
  backToHome: "घर परेर जानुहोस्",

  // ── Member KYC – status screen ────────────────────────────────────────────
  statusMsgSubmitted: "तपाईंको KYC प्राप्त भयो र समीक्षाको प्रतीक्षामा छ।",
  statusMsgPending: "व्यवस्थापकले तपाईंको KYC कागजात अहिले समीक्षा गरिरहेका छन्।",
  statusMsgApproved: "तपाईंको KYC स्वीकृत भयो। आधिकारिक फारम बनाइँदैछ।",
  statusMsgRejected: "तपाईंको KYC अस्वीकृत भयो। सुधार गरी पुनः पेश गर्न व्यवस्थापकसँग सम्पर्क गर्नुहोस्।",
  statusMsgPrinted: "तपाईंको KYC स्वीकृत भई आधिकारिक रेकर्डमा छापिएको छ।",
  statusMemberName: "सदस्यको नाम",
  statusMemberCode: "सदस्य कोड",
  statusMobile: "मोबाइल",

  // ── KYC status & stepper labels ───────────────────────────────────────────
  statusInvited: "निमन्त्रणा पठाइयो",
  statusSubmitted: "पेश भयो",
  statusPending: "समीक्षाका लागि पर्दछ",
  statusApproved: "स्वीकृत",
  statusRejected: "अस्वीकृत",
  statusPrinted: "छापिएको",
  stepInvited: "निमन्त्रणा",
  stepSubmitted: "पेश",
  stepReview: "समीक्षा",
  stepApproved: "स्वीकृति",
  stepPrinted: "छापाइ",

  // ── Member KYC – misc screens ────────────────────────────────────────────
  invalidTitle: "निमन्त्रणा लिंक फेला परेन",
  invalidBody: "\"{code}\" फेला परेन। कृपया आफ्नो SMS बाट मिलेको लिंक प्रयोग गर्नुहोस्।",
  enterCodeManually: "कोड म्यानुअल रूपमा प्रविष्ट गर्नुहोस्",
  back: "पछि",
  next: "अर्को",
  submitKyc: "KYC पेश गर्नुहोस्",
  submitting: "पेश गरिँदैछ…",
  cancelApplication: "आवेदन रद्द गर्नुहोस्",
  submitApplication: "आवेदन पेश गर्नुहोस्",
  print: "छाप्नुहोस्",
  memberDetails: "सदस्य विवरण",
  phone: "फोन",
  viewDetails: "विवरण हेर्नुहोस्",
  approve: "स्वीकृति",
  reject: "अस्वीकृति",
  printKycForm: "KYC फारम छाप्नुहोस्",
  backToSubmissions: "पेशहरूमा फर्कनुहोस्",
  submittedKycInfo: "पेश गरिएको KYC जानकारी",
  uploadedDocs: "अपलोड गरिएका कागजात र प्रमाण (विस्तार गर्न ट्याप गर्नुहोस्)",
  managerAction: "व्यवस्थापक कार्य",
  livePreview: "लाइभ प्रिव्यू",
  documentsChecklist: "कागजात जाँच",
  applicationSummary: "आवेदन सारांश",
  fillFormToSeeData: "आफ्नो डाटा हेर्न यहाँ फारम भर्नुहोस्",

  // ── Manager login ─────────────────────────────────────────────────────────
  dashboardTitle: "व्यवस्थापक समीक्षा ड्यासबोर्ड",
  dashboardSubtitle: "सदस्य KYC कागजातहरू समीक्षा, स्वीकृति वा अस्वीकृति गर्नुहोस् र आधिकारिक फारम छाप्नुहोस्।",
  noSubmissions: "कुनै पेश भएको थिएन",
  noSubmissionsHint: "सदस्यहरूले अनलाइन फारम पेश गरेपपछि KYC पेशहरू यहाँ देखिनेछन्।",
  allSubmissions: "सबै पेश",
  totalMembers: "कुल सदस्य",
  pendingQueueAlert: "{count} वटा पेश समीक्षाका लागि पर्दछ",
  newSubmissionsWaiting: "नयाँ सदस्य KYC पेशहरू प्राप्त भएका छन् र तपाईंको निर्णयका लागि हो।",
  filterPendingQueue: "समीक्षाका लागि छुनुहोस् →",
  managerLogin: "व्यवस्थापक लगइन",
  managerLoginSubtitle: "KYC व्यवस्थापन ड्यासबोर्डमा पहुँच गर्न साइन इन गर्नुहोस्।",
  signIn: "साइन इन गर्नुहोस्",
  signingIn: "साइन इन गरिँदैछ…",
  password: "पासवर्ड",
  invalidCredentials: "इमेल वा पासवर्ड गलत छ। कृपया पुनः प्रयास गर्नुहोस्।",
  returnToHome: "घर परेर जानुहोस्",
  logout: "लगआउट",

  // ── SMS modal ─────────────────────────────────────────────────────────────
  smsDelivered: "SMS सदस्यलाई पठाइयो",
  smsRecipient: "प्राप्तकर्ता",
  smsFrom: "{org} बाट SMS प्राप्त भयो",
  openMemberForm: "सदस्य KYC फारम खोल्नुहोस् (चरण ३)",
  copySms: "SMS पाठ प्रतिलिपि गर्नुहोस्",
  copied: "कपी भयो!",
  close: "बन्द गर्नुहोस्",
};

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(I18N_STORAGE_KEY);
    if (saved === "en" || saved === "ne") return saved;
  } catch {
    // ignore
  }
  if (typeof navigator !== "undefined" && (navigator.language ?? "").toLowerCase().startsWith("ne")) {
    return "ne";
  }
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(detectInitialLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(I18N_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    document.documentElement.lang = lang === "ne" ? "ne" : "en";
  }, [lang]);

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => {
        const template = lang === "ne" ? ne[key] ?? en[key] : en[key] ?? ne[key] ?? key;
        let out = template;
        if (vars) {
          for (const [k, v] of Object.entries(vars)) {
            out = out.replaceAll(`{${k}}`, String(v));
          }
        }
        return out;
      },
    }),
    [lang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
