import { NextResponse } from 'next/server';
import { getClientFingerprint } from '@/lib/chat/api/request';
import { checkRateLimit } from '@/lib/server/rate-limit';

const MAX_CSP_REPORT_BYTES = 24 * 1024;

function contentLengthExceedsLimit(request: Request, maxBytes: number): boolean {
  const raw = String(request.headers.get('content-length') || '').trim();
  if (!raw) return false;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > maxBytes;
}

async function readBodyTextWithLimit(request: Request): Promise<string> {
  if (contentLengthExceedsLimit(request, MAX_CSP_REPORT_BYTES)) return '';
  const text = await request.text().catch(() => '');
  if (Buffer.byteLength(text, 'utf8') > MAX_CSP_REPORT_BYTES) return '';
  return text;
}

function normalizeCspPayload(rawBody: unknown): Record<string, unknown> {
  if (!rawBody || typeof rawBody !== 'object') return {};
  const payload = (rawBody as Record<string, unknown>)['csp-report'];
  const report = payload && typeof payload === 'object'
    ? payload as Record<string, unknown>
    : rawBody as Record<string, unknown>;

  return {
    documentUri: String(report['document-uri'] || report.documentUri || '').slice(0, 512),
    effectiveDirective: String(report['effective-directive'] || report.effectiveDirective || '').slice(0, 256),
    violatedDirective: String(report['violated-directive'] || report.violatedDirective || '').slice(0, 256),
    blockedUri: String(report['blocked-uri'] || report.blockedUri || '').slice(0, 512),
    sourceFile: String(report['source-file'] || report.sourceFile || '').slice(0, 512),
    disposition: String(report.disposition || '').slice(0, 128),
  };
}

export async function POST(request: Request) {
  const fingerprint = getClientFingerprint(request);
  const rate = await checkRateLimit({
    scope: 'api.csp-report',
    identity: fingerprint,
    limit: 120,
    windowMs: 5 * 60 * 1000,
  });
  if (!rate.allowed) {
    return new NextResponse(null, { status: 204 });
  }

  const bodyText = await readBodyTextWithLimit(request);
  if (!bodyText) return new NextResponse(null, { status: 204 });

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    parsed = null;
  }

  const normalized = normalizeCspPayload(parsed);
  if (Object.keys(normalized).length > 0) {
    console.warn('[csp-report]', JSON.stringify({
      tag: 'csp-report',
      ...normalized,
      timestamp: new Date().toISOString(),
    }));
  }

  return new NextResponse(null, { status: 204 });
}
