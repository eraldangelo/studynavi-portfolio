import type { ChatPayload } from '@/lib/chat/types';
import crypto from 'crypto';
import net from 'node:net';

export class RequestBodyTooLargeError extends Error {
  constructor(message = 'Request payload is too large.') {
    super(message);
    this.name = 'RequestBodyTooLargeError';
  }
}

async function readRequestBodyWithLimit(request: Request, maxBytes: number): Promise<string> {
  const contentLength = Number.parseInt(String(request.headers.get('content-length') || '').trim(), 10);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new RequestBodyTooLargeError();
  }

  if (request.bodyUsed) return '';
  const reader = request.body?.getReader();
  if (!reader) {
    const fallback = await request.text();
    if (Buffer.byteLength(fallback, 'utf8') > maxBytes) {
      throw new RequestBodyTooLargeError();
    }
    return fallback;
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
      throw new RequestBodyTooLargeError();
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder('utf-8').decode(merged);
}

/**
 * Parse the incoming request body with fallback handling
 */
export async function parseRequestBody(request: Request, maxBytes = 32 * 1024): Promise<ChatPayload> {
  try {
    const raw = await readRequestBodyWithLimit(request, maxBytes);
    if (!raw.trim()) return {};
    return JSON.parse(raw) as ChatPayload;
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) throw error;
    return {};
  }
}

export function createRequestId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  return uuid || `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function isValidIp(value: string): boolean {
  return net.isIP(normalizeIpCandidate(value)) !== 0;
}

function normalizeIpCandidate(value: string): string {
  let token = String(value || '').trim();
  if (!token) return '';

  if (token.toLowerCase().startsWith('for=')) {
    token = token.slice(4).trim();
  }
  token = token.replace(/^"|"$/g, '').trim();

  if (token.startsWith('[')) {
    const closeBracket = token.indexOf(']');
    if (closeBracket > 1) {
      token = token.slice(1, closeBracket);
    }
  } else {
    // Strip `ip:port` for IPv4 values.
    const lastColon = token.lastIndexOf(':');
    if (lastColon > 0) {
      const maybeIpv4 = token.slice(0, lastColon);
      const maybePort = token.slice(lastColon + 1);
      if (net.isIP(maybeIpv4) === 4 && /^\d+$/.test(maybePort)) {
        token = maybeIpv4;
      }
    }
  }

  // Remove IPv6 zone index when present (`fe80::1%eth0`).
  const percentIndex = token.indexOf('%');
  if (percentIndex > 0) {
    token = token.slice(0, percentIndex);
  }
  return token.trim();
}

function parseForwardedForChain(value: string): string[] {
  return String(value || '')
    .split(',')
    .map((item) => normalizeIpCandidate(item))
    .filter((item) => net.isIP(item) !== 0);
}

function parseForwardedHeader(value: string): string[] {
  const matches = String(value || '').match(/for=([^;,\s]+)/gi) || [];
  return matches
    .map((item) => item.replace(/^for=/i, ''))
    .map((item) => normalizeIpCandidate(item))
    .filter((item) => net.isIP(item) !== 0);
}

function detectProxyTrustMode(request: Request): 'none' | 'managed' | 'cloudflare' {
  const explicit = String(process.env.TRUST_PROXY_MODE || '').trim().toLowerCase();
  if (explicit === 'none' || explicit === 'managed' || explicit === 'cloudflare') {
    return explicit;
  }

  if (request.headers.has('cf-ray')) return 'cloudflare';
  if (process.env.K_SERVICE || process.env.VERCEL || request.headers.has('x-cloud-trace-context')) {
    return 'managed';
  }
  return process.env.NODE_ENV === 'production' ? 'managed' : 'none';
}

function fromForwardedFor(value: string): string {
  const list = parseForwardedForChain(value);
  // Managed proxies append the trusted client IP to the right-most end.
  return list.length > 0 ? list[list.length - 1] : '';
}

export function getClientIp(request: Request): string {
  const mode = detectProxyTrustMode(request);
  if (mode === 'cloudflare') {
    const cfIp = normalizeIpCandidate(String(request.headers.get('cf-connecting-ip') || ''));
    if (net.isIP(cfIp) !== 0) return cfIp;
  }

  if (mode === 'managed' || mode === 'cloudflare') {
    const envoyExternalAddress = normalizeIpCandidate(String(request.headers.get('x-envoy-external-address') || ''));
    if (net.isIP(envoyExternalAddress) !== 0) return envoyExternalAddress;

    const fromProxyChain = fromForwardedFor(String(request.headers.get('x-forwarded-for') || ''));
    if (fromProxyChain) return fromProxyChain;

    const forwardedList = parseForwardedHeader(String(request.headers.get('forwarded') || ''));
    if (forwardedList.length > 0) {
      return forwardedList[forwardedList.length - 1];
    }

    const realIp = normalizeIpCandidate(String(request.headers.get('x-real-ip') || ''));
    if (net.isIP(realIp) !== 0) return realIp;
  }

  return 'unknown';
}

export function getClientFingerprint(request: Request): string {
  const ip = getClientIp(request);
  const ua = String(request.headers.get('user-agent') || '').slice(0, 240);
  return crypto.createHash('sha256').update(`${ip}|${ua}`).digest('hex');
}

export function logRequestSummary(payload: {
  requestId: string;
  messageLength: number;
  searchPerformed: boolean;
  verificationPerformed: boolean;
  numPartnerMatches: number;
  numBraveResults: number;
}) {
  console.log('[Chat API] Request summary', payload);
}
