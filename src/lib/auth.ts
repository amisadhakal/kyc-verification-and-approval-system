// ─────────────────────────────────────────────────────────────────────────────
// DEVELOPMENT-ONLY Manager Demo Authentication
// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: This is a FRONTEND-ONLY demonstration. It is NOT real
// authentication and must not be treated as secure in any way. The credentials
// below are public demo credentials for local evaluation only and must never be
// used in production. A real backend authentication flow can replace these
// checks later without touching the rest of the UI.

const MANAGER_DEMO_EMAIL = "manager@demo.com";
const MANAGER_DEMO_PASSWORD = "Manager@123";
const MANAGER_AUTH_SESSION_KEY = "coop-kyc-manager-demo-auth";

/** Demo credentials — local demonstration only. Never display the password. */
export const DEVELOPMENT_ONLY_MANAGER_CREDENTIALS = {
  email: MANAGER_DEMO_EMAIL,
  password: MANAGER_DEMO_PASSWORD,
} as const;

/** Validate manager credentials against the predefined demo credentials. */
export function isValidManagerCredentials(
  email: string,
  password: string
): boolean {
  const normalizedEmail = (email ?? "").trim().toLowerCase();
  return (
    normalizedEmail.length > 0 &&
    normalizedEmail === DEVELOPMENT_ONLY_MANAGER_CREDENTIALS.email &&
    (password ?? "") === DEVELOPMENT_ONLY_MANAGER_CREDENTIALS.password
  );
}

/**
 * Frontend demo session flag (sessionStorage).
 * Only the flag is stored — never the password or any credential material.
 */
export function hasManagerDemoSession(): boolean {
  try {
    return sessionStorage.getItem(MANAGER_AUTH_SESSION_KEY) === "true";
  } catch {
    // sessionStorage unavailable (private mode etc.) → treat as signed out
    return false;
  }
}

export function startManagerDemoSession(): void {
  try {
    sessionStorage.setItem(MANAGER_AUTH_SESSION_KEY, "true");
  } catch {
    // ignore storage failures
  }
}

export function endManagerDemoSession(): void {
  try {
    sessionStorage.removeItem(MANAGER_AUTH_SESSION_KEY);
  } catch {
    // ignore storage failures
  }
}
