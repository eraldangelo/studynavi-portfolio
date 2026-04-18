const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

/**
 * Allow only internal relative navigation targets.
 * Keeps existing `next` contract while preventing open-redirect abuse.
 */
export function sanitizeInternalRedirectTarget(value: string | null | undefined, fallback = '/'): string {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  if (!raw.startsWith('/')) return fallback;
  if (raw.startsWith('//')) return fallback;
  if (raw.includes('\\')) return fallback;
  if (CONTROL_CHARS.test(raw)) return fallback;
  return raw;
}
