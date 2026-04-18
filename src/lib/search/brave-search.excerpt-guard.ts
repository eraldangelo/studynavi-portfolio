import dns from 'node:dns/promises';
import net from 'node:net';

const hostSafetyCache = new Map<string, { ts: number; safe: boolean }>();
const HOST_SAFETY_TTL_MS = 15 * 60 * 1000;
const MAX_EXCERPT_REDIRECTS = 3;
const ALLOWED_EXCERPT_CONTENT_TYPES = ['text/html', 'application/xhtml+xml', 'text/plain'];
export const MAX_EXCERPT_BYTES = 256 * 1024;

function isRedirectStatus(status: number): boolean {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

export function parsePublicHttpUrl(raw: string): URL | null {
  const value = String(raw || '').trim();
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    if (!parsed.hostname || parsed.username || parsed.password) return null;
    if (parsed.port && parsed.port !== '80' && parsed.port !== '443') return null;
    parsed.hash = '';
    return parsed;
  } catch {
    return null;
  }
}

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map((item) => Number(item));
  if (parts.length !== 4 || parts.some((item) => !Number.isInteger(item))) return true;
  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === '::' || normalized === '::1') return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
  if (normalized.startsWith('::ffff:')) {
    const mapped = normalized.slice('::ffff:'.length);
    if (net.isIP(mapped) === 4) return isPrivateIpv4(mapped);
  }
  return false;
}

function isPrivateAddress(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) return isPrivateIpv4(ip);
  if (version === 6) return isPrivateIpv6(ip);
  return true;
}

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  if (!host) return true;
  if (host === 'localhost' || host.endsWith('.localhost')) return true;
  if (host.endsWith('.local') || host.endsWith('.internal')) return true;
  if (host === 'metadata.google.internal' || host === 'metadata') return true;
  if (host === '169.254.169.254') return true;
  return false;
}

async function isSafePublicTarget(url: URL): Promise<boolean> {
  const host = url.hostname.trim().toLowerCase();
  if (!host || isBlockedHostname(host)) return false;
  const cached = hostSafetyCache.get(host);
  if (cached && Date.now() - cached.ts < HOST_SAFETY_TTL_MS) {
    return cached.safe;
  }

  let safe = false;
  const directIpVersion = net.isIP(host);
  if (directIpVersion > 0) {
    safe = !isPrivateAddress(host);
  } else {
    try {
      const addresses = await dns.lookup(host, { all: true, verbatim: false });
      safe = addresses.length > 0 && addresses.every((item) => !isPrivateAddress(item.address));
    } catch {
      safe = false;
    }
  }

  hostSafetyCache.set(host, { ts: Date.now(), safe });
  return safe;
}

export async function fetchPublicExcerptResponse(initialUrl: URL, signal: AbortSignal): Promise<Response | null> {
  let current = initialUrl;
  const visited = new Set<string>();

  for (let hop = 0; hop <= MAX_EXCERPT_REDIRECTS; hop += 1) {
    const currentHref = current.toString();
    if (visited.has(currentHref)) return null;
    visited.add(currentHref);

    if (!(await isSafePublicTarget(current))) return null;

    const response = await fetch(currentHref, {
      method: 'GET',
      signal,
      redirect: 'manual',
      headers: {
        'User-Agent': 'StudyNavi-BraveSearch-Excerpt/1.0',
        Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1',
      },
    });

    if (isRedirectStatus(response.status)) {
      const location = String(response.headers.get('location') || '').trim();
      if (!location) return null;
      const resolved = parsePublicHttpUrl(new URL(location, current).toString());
      if (!resolved) return null;
      current = resolved;
      continue;
    }

    return response;
  }

  return null;
}

export function isAllowedExcerptContentType(value: string): boolean {
  const normalized = value.toLowerCase().trim();
  return ALLOWED_EXCERPT_CONTENT_TYPES.some((allowed) => normalized.includes(allowed));
}

export function getContentLength(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

export async function readTextWithLimit(response: Response, maxBytes: number): Promise<string | null> {
  const reader = response.body?.getReader();
  if (!reader) {
    const fallback = await response.text();
    return Buffer.byteLength(fallback, 'utf8') <= maxBytes ? fallback : null;
  }

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxBytes) {
      try {
        await reader.cancel();
      } catch {
        // no-op
      }
      return null;
    }
    chunks.push(value);
  }

  const combined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder('utf-8').decode(combined);
}
