import assert from 'node:assert/strict';
import { POST as chatPost } from '../src/app/api/chat/route';
import { POST as briefInfoPost } from '../src/app/api/ai/brief-info/route';
import { POST as correctionsPost } from '../src/app/api/chat/corrections/route';
import { POST as turnstilePost } from '../src/app/api/turnstile/verify/route';
import { POST as cspReportPost } from '../src/app/api/csp-report/route';
import { POST as runtimeAlertPost } from '../src/app/api/runtime-alert/route';
import { proxy } from '../src/proxy';
import { sanitizeModalLinkUrl } from '../src/components/common/dialogs/info-modal.utils';
import { createTurnstileProofToken, verifyTurnstileProofToken } from '../src/lib/security/turnstile';
import { createSessionToken, SESSION_COOKIE_NAME } from '../src/lib/security/session-token';
import { NextRequest } from 'next/server';
const failures: string[] = [];
let passed = 0;
async function runTest(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS - ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`FAIL - ${name}`);
  }
}
function requestWithBody(url: string, method: string, body: string, headers?: Record<string, string>) {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json', ...(headers || {}) },
    body,
  });
}
async function main() {
  process.env.NEXT_PUBLIC_E2E_AUTH_BYPASS = 'true';
  process.env.NEXT_PUBLIC_E2E_MOCK_DATA = 'true';
  process.env.TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || 'turnstile-test-secret';
  process.env.TURNSTILE_ALLOWED_HOSTNAMES = process.env.TURNSTILE_ALLOWED_HOSTNAMES || 'localhost,127.0.0.1';
  await runTest('proxy emits CSP headers and supports strict enforcement toggle', async () => {
    const env = process.env as Record<string, string | undefined>;
    const previousStrict = env.CSP_ENABLE_STRICT_ENFORCE;
    env.CSP_ENABLE_STRICT_ENFORCE = 'false';
    const baseline = await proxy(new NextRequest('http://localhost/login'));
    assert.match(String(baseline.headers.get('content-security-policy') || ''), /unsafe-inline/);
    env.CSP_ENABLE_STRICT_ENFORCE = 'true';
    const strict = await proxy(new NextRequest('http://localhost/login'));
    assert.doesNotMatch(String(strict.headers.get('content-security-policy') || ''), /unsafe-inline/);
    env.CSP_ENABLE_STRICT_ENFORCE = previousStrict;
  });
  await runTest('proxy blocks unauthenticated protected-page requests before render', async () => {
    const env = process.env as Record<string, string | undefined>;
    const previousBypass = env.NEXT_PUBLIC_E2E_AUTH_BYPASS;
    const previousSessionSecret = env.STUDYNAVI_SESSION_SECRET;
    env.NEXT_PUBLIC_E2E_AUTH_BYPASS = 'false';
    env.STUDYNAVI_SESSION_SECRET = 'proxy-session-test-secret';
    try {
      const response = await proxy(new NextRequest('http://localhost/fees-updater'));
      assert.equal(response.status, 307);
      assert.match(String(response.headers.get('location') || ''), /\/login\?next=%2Ffees-updater/);
    } finally {
      env.NEXT_PUBLIC_E2E_AUTH_BYPASS = previousBypass;
      env.STUDYNAVI_SESSION_SECRET = previousSessionSecret;
    }
  });
  await runTest('proxy allows protected-page request with valid server session cookie', async () => {
    const env = process.env as Record<string, string | undefined>;
    const previousBypass = env.NEXT_PUBLIC_E2E_AUTH_BYPASS;
    const previousSessionSecret = env.STUDYNAVI_SESSION_SECRET;
    env.NEXT_PUBLIC_E2E_AUTH_BYPASS = 'false';
    env.STUDYNAVI_SESSION_SECRET = 'proxy-session-test-secret';
    try {
      const sessionToken = await createSessionToken(env.STUDYNAVI_SESSION_SECRET, {
        uid: 'staff-1',
        roles: ['staff'],
        ttlSeconds: 300,
      });
      const response = await proxy(new NextRequest('http://localhost/fees-updater', {
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionToken)}`,
        },
      }));
      assert.equal(response.status, 200);
    } finally {
      env.NEXT_PUBLIC_E2E_AUTH_BYPASS = previousBypass;
      env.STUDYNAVI_SESSION_SECRET = previousSessionSecret;
    }
  });
  await runTest('proxy redirects authenticated users away from /login to sanitized next target', async () => {
    const env = process.env as Record<string, string | undefined>;
    const previousBypass = env.NEXT_PUBLIC_E2E_AUTH_BYPASS;
    const previousSessionSecret = env.STUDYNAVI_SESSION_SECRET;
    env.NEXT_PUBLIC_E2E_AUTH_BYPASS = 'false';
    env.STUDYNAVI_SESSION_SECRET = 'proxy-session-test-secret';
    try {
      const sessionToken = await createSessionToken(env.STUDYNAVI_SESSION_SECRET, {
        uid: 'staff-1',
        roles: ['staff'],
        ttlSeconds: 300,
      });
      const response = await proxy(new NextRequest('http://localhost/login?next=https://evil.example', {
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionToken)}`,
        },
      }));
      assert.equal(response.status, 307);
      assert.equal(String(response.headers.get('location') || ''), 'http://localhost/');
    } finally {
      env.NEXT_PUBLIC_E2E_AUTH_BYPASS = previousBypass;
      env.STUDYNAVI_SESSION_SECRET = previousSessionSecret;
    }
  });
  await runTest('modal link sanitizer blocks unsafe protocols', () => {
    assert.equal(sanitizeModalLinkUrl('javascript:alert(1)'), '');
    assert.equal(sanitizeModalLinkUrl('data:text/html;base64,AAA'), '');
    assert.equal(sanitizeModalLinkUrl('https://example.com/path'), 'https://example.com/path');
  });
  await runTest('turnstile proof token is host and fingerprint bound', () => {
    const secret = 'turnstile-proof-secret';
    const token = createTurnstileProofToken(secret, {
      fingerprint: 'fp-1',
      hostname: 'localhost',
      ttlSeconds: 300,
      nowMs: 1_700_000_000_000,
    });
    assert.equal(
      verifyTurnstileProofToken(secret, token, {
        fingerprint: 'fp-1',
        hostname: 'localhost',
        nowMs: 1_700_000_100_000,
      }),
      true,
    );
    assert.equal(
      verifyTurnstileProofToken(secret, token, {
        fingerprint: 'fp-2',
        hostname: 'localhost',
        nowMs: 1_700_000_100_000,
      }),
      false,
    );
  });
  await runTest('turnstile route returns 400 for malformed JSON payload', async () => {
    const response = await turnstilePost(
      requestWithBody('http://localhost/api/turnstile/verify', 'POST', '{'),
    );
    assert.equal(response.status, 400);
  });
  await runTest('csp report endpoint accepts report payload safely', async () => {
    const response = await cspReportPost(
      requestWithBody(
        'http://localhost/api/csp-report',
        'POST',
        JSON.stringify({
          'csp-report': {
            'document-uri': 'https://studio.example/login',
            'effective-directive': 'script-src',
            'blocked-uri': 'inline',
          },
        }),
        { 'content-type': 'application/csp-report' },
      ),
    );
    assert.equal(response.status, 204);
  });
  await runTest('brief-info route returns 400 for malformed JSON payload', async () => {
    const response = await briefInfoPost(
      requestWithBody(
        'http://localhost/api/ai/brief-info',
        'POST',
        '{',
        { 'x-e2e-auth-uid': 'staff-1', 'x-e2e-auth-role': 'staff' },
      ),
    );
    assert.equal(response.status, 400);
  });
  await runTest('corrections route returns 400 for malformed JSON payload', async () => {
    const response = await correctionsPost(
      requestWithBody(
        'http://localhost/api/chat/corrections',
        'POST',
        '{',
        { 'x-e2e-auth-uid': 'staff-1', 'x-e2e-auth-role': 'staff' },
      ),
    );
    assert.equal(response.status, 400);
  });
  await runTest('runtime alert success path emits structured audit log', async () => {
    const originalConsoleInfo = console.info;
    const captured: string[] = [];
    console.info = (...args: unknown[]) => {
      captured.push(args.map((item) => String(item)).join(' '));
    };
    try {
      const response = await runtimeAlertPost(
        requestWithBody(
          'http://localhost/api/runtime-alert',
          'POST',
          JSON.stringify({ source: 'pdf.preview', message: 'Preview failed' }),
          { 'x-e2e-auth-uid': 'staff-1', 'x-e2e-auth-role': 'staff' },
        ),
      );
      assert.equal(response.status, 204);
      assert.equal(captured.some((line) => line.includes('runtime-alert.ingest')), true);
    } finally {
      console.info = originalConsoleInfo;
    }
  });
  await runTest('chat route enforces request body size cap', async () => {
    const largeBody = JSON.stringify({ message: 'x'.repeat(40_000) });
    const response = await chatPost(
      requestWithBody(
        'http://localhost/api/chat',
        'POST',
        largeBody,
        { 'x-e2e-auth-uid': 'staff-1', 'x-e2e-auth-role': 'staff' },
      ),
    );
    assert.equal(response.status, 413);
  });
  await runTest('brief-info route enforces request body size cap', async () => {
    const largeBody = JSON.stringify({
      recommendedSchool: 'Example School',
      recommendedProgram: 'Example Program',
      notes: 'x'.repeat(30_000),
    });
    const response = await briefInfoPost(
      requestWithBody(
        'http://localhost/api/ai/brief-info',
        'POST',
        largeBody,
        { 'x-e2e-auth-uid': 'staff-1', 'x-e2e-auth-role': 'staff' },
      ),
    );
    assert.equal(response.status, 413);
  });
  if (failures.length > 0) {
    console.error('\nAdditional hardening test failures:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }
  console.log(`\nAdditional hardening tests passed: ${passed}`);
}
void main();
