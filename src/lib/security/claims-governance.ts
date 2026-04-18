export type ClaimsCutoverMode = 'bridge' | 'strict';

export const LEGACY_STAFF_EMAIL_COMPAT_CLAIM = 'legacy_staff_email_fallback';
const DEFAULT_STAFF_EMAIL_DOMAIN = 'example.com';

function normalizeBool(value: string | undefined): boolean {
  return String(value || '').trim().toLowerCase() === 'true';
}

function normalizeMode(value: string | undefined): ClaimsCutoverMode {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'strict') return 'strict';
  return 'bridge';
}

export function resolveClaimsCutoverModeForServer(): ClaimsCutoverMode {
  return normalizeMode(process.env.STUDYNAVI_CLAIMS_CUTOVER_MODE);
}

export function resolveClaimsCutoverModeForClient(): ClaimsCutoverMode {
  const raw = process.env.NEXT_PUBLIC_STUDYNAVI_CLAIMS_CUTOVER_MODE
    || process.env.STUDYNAVI_CLAIMS_CUTOVER_MODE;
  return normalizeMode(raw);
}

export function isLegacyStaffBridgeEnabledServer(): boolean {
  if (resolveClaimsCutoverModeForServer() === 'strict') return false;
  return normalizeBool(process.env.STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE);
}

export function isLegacyStaffBridgeEnabledClient(): boolean {
  if (resolveClaimsCutoverModeForClient() === 'strict') return false;
  return normalizeBool(process.env.NEXT_PUBLIC_STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE);
}

export function resolveStaffEmailDomain(): string {
  const configured = process.env.NEXT_PUBLIC_STUDYNAVI_STAFF_EMAIL_DOMAIN
    || process.env.STUDYNAVI_STAFF_EMAIL_DOMAIN
    || DEFAULT_STAFF_EMAIL_DOMAIN;
  return String(configured)
    .trim()
    .toLowerCase();
}

export function isStaffEmailForDomain(email: string, domain: string): boolean {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized.includes('@')) return false;
  return normalized.endsWith(`@${domain}`);
}

export function isLegacyStaffCompatClaim(input: {
  email: string;
  emailVerified: boolean;
  legacyClaim: unknown;
  staffDomain?: string;
}): boolean {
  if (input.legacyClaim !== true) return false;
  if (input.emailVerified !== true) return false;
  const domain = (input.staffDomain || DEFAULT_STAFF_EMAIL_DOMAIN).trim().toLowerCase();
  return isStaffEmailForDomain(input.email, domain);
}
