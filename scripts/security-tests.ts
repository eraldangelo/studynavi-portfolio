import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { POST as chatPost } from '../src/app/api/chat/route';
import { GET as correctionsGet } from '../src/app/api/chat/corrections/route';
import { POST as briefInfoPost } from '../src/app/api/ai/brief-info/route';
import { deriveApiActorFromClaims } from '../src/lib/server/api-auth';
import { sanitizeWebsiteUrl } from '../src/lib/education-providers/school-table';
import { parseUniversityName } from '../src/lib/education-providers/university-name';
import { checkRateLimit } from '../src/lib/server/rate-limit';
import { isTurnstileActionAllowed, isTurnstileHostnameAllowed, parseAllowedHostnames } from '../src/lib/security/turnstile';
import { sanitizeInternalRedirectTarget } from '../src/lib/security/redirect';
import { isLegacyStaffBridgeEnabledServer, isLegacyStaffCompatClaim } from '../src/lib/security/claims-governance';
import { isE2EAuthBypassEnabled, isE2EMockDataEnabled } from '../src/lib/env/runtime-flags';
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
function jsonRequest(url: string, body: unknown, headers?: Record<string, string>) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(headers || {}) },
    body: JSON.stringify(body),
  });
}
async function main() {
  process.env.NEXT_PUBLIC_E2E_AUTH_BYPASS = 'true';
  process.env.NEXT_PUBLIC_E2E_MOCK_DATA = 'true';
  await runTest('chat route rejects missing auth with 401', async () => {
    const response = await chatPost(jsonRequest('http://localhost/api/chat', { message: 'hello' }));
    assert.equal(response.status, 401);
  });
  await runTest('chat route rejects malformed bearer token with 401', async () => {
    const response = await chatPost(
      jsonRequest('http://localhost/api/chat', { message: 'hello' }, { authorization: 'Bearer not-a-jwt' }),
    );
    assert.equal(response.status, 401);
  });
  await runTest('JWT-like token returns explicit 503 when auth infrastructure is unavailable', async () => {
    const env = process.env as Record<string, string | undefined>;
    const previousBypass = env.NEXT_PUBLIC_E2E_AUTH_BYPASS;
    env.NEXT_PUBLIC_E2E_AUTH_BYPASS = 'false';
    const response = await briefInfoPost(
      jsonRequest(
        'http://localhost/api/ai/brief-info',
        { recommendedSchool: 'Sample School', recommendedProgram: 'Sample Program' },
        { authorization: 'Bearer a.b.c' },
      ),
    );
    env.NEXT_PUBLIC_E2E_AUTH_BYPASS = previousBypass;
    assert.equal(response.status, 503);
  });
  await runTest('corrections route forbids non-staff actor with 403', async () => {
    const response = await correctionsGet(
      new Request('http://localhost/api/chat/corrections', {
        headers: {
          'x-e2e-auth-uid': 'user-1',
          'x-e2e-auth-role': 'user',
        },
      }),
    );
    assert.equal(response.status, 403);
  });
  await runTest('corrections route allows staff actor', async () => {
    const response = await correctionsGet(
      new Request('http://localhost/api/chat/corrections', {
        headers: {
          'x-e2e-auth-uid': 'staff-1',
          'x-e2e-auth-role': 'staff',
          'x-e2e-auth-email': 'staff@example.com',
        },
      }),
    );
    assert.equal(response.status, 200);
  });
  await runTest('chat route returns explicit 500 when OPENAI key is missing', async () => {
    const previous = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    const response = await chatPost(
      jsonRequest(
        'http://localhost/api/chat',
        { message: 'hello' },
        {
          'x-e2e-auth-uid': 'staff-2',
          'x-e2e-auth-role': 'staff',
        },
      ),
    );
    if (previous) process.env.OPENAI_API_KEY = previous;
    assert.equal(response.status, 500);
    const payload = await response.json();
    assert.equal(payload.error, 'OPENAI_API_KEY is not configured.');
  });
  await runTest('brief-info route rejects missing auth with 401', async () => {
    const response = await briefInfoPost(
      jsonRequest('http://localhost/api/ai/brief-info', {
        recommendedSchool: 'Sample School',
        recommendedProgram: 'Sample Program',
      }),
    );
    assert.equal(response.status, 401);
  });
  await runTest('shared rate limiter denies after threshold in deterministic in-memory mode', async () => {
    const identity = `test-${Date.now()}`;
    const first = await checkRateLimit({
      scope: 'security-test',
      identity,
      limit: 2,
      windowMs: 60_000,
      useInMemoryOnly: true,
    });
    const second = await checkRateLimit({
      scope: 'security-test',
      identity,
      limit: 2,
      windowMs: 60_000,
      useInMemoryOnly: true,
    });
    const third = await checkRateLimit({
      scope: 'security-test',
      identity,
      limit: 2,
      windowMs: 60_000,
      useInMemoryOnly: true,
    });
    assert.equal(first.allowed, true);
    assert.equal(second.allowed, true);
    assert.equal(third.allowed, false);
    assert.equal(third.remaining, 0);
  });
  await runTest('website sanitizer blocks script protocols and normalizes valid URLs', () => {
    assert.equal(sanitizeWebsiteUrl('javascript:alert(1)', ''), '');
    assert.equal(sanitizeWebsiteUrl('data:text/html;base64,AAA', ''), '');
    assert.equal(sanitizeWebsiteUrl('example.com', ''), 'https://example.com/');
  });
  await runTest('university parser extracts list details safely', () => {
    const parsed = parseUniversityName('Navitas<ul><li>Curtin College</li><li>Deakin College</li></ul>');
    assert.equal(parsed.title, 'Navitas');
    assert.deepEqual(parsed.details, ['Curtin College', 'Deakin College']);
  });
  await runTest('turnstile hostname and action validators are strict', () => {
    const allowedHostnames = parseAllowedHostnames('localhost,studio.example.com');
    assert.equal(
      isTurnstileHostnameAllowed({
        allowedHostnames,
        requestHostname: 'localhost',
        responseHostname: 'localhost',
      }),
      true,
    );
    assert.equal(
      isTurnstileHostnameAllowed({
        allowedHostnames,
        requestHostname: 'localhost',
        responseHostname: 'evil.example.com',
      }),
      false,
    );
    assert.equal(isTurnstileActionAllowed({ expectedAction: 'login', responseAction: 'login' }), true);
    assert.equal(isTurnstileActionAllowed({ expectedAction: 'login', responseAction: 'signup' }), false);
    assert.equal(isTurnstileActionAllowed({ expectedAction: 'login', responseAction: '' }), false);
  });
  await runTest('internal redirect sanitizer blocks open-redirect patterns', () => {
    assert.equal(sanitizeInternalRedirectTarget('/fees-updater', '/'), '/fees-updater');
    assert.equal(sanitizeInternalRedirectTarget('https://evil.example', '/'), '/');
    assert.equal(sanitizeInternalRedirectTarget('//evil.example', '/'), '/');
    assert.equal(sanitizeInternalRedirectTarget('javascript:alert(1)', '/'), '/');
  });
  await runTest('claims cutover strict mode disables legacy bridge fallback', () => {
    const env = process.env as Record<string, string | undefined>;
    const previousMode = env.STUDYNAVI_CLAIMS_CUTOVER_MODE;
    const previousBridge = env.STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE;
    env.STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE = 'true';
    env.STUDYNAVI_CLAIMS_CUTOVER_MODE = 'strict';
    assert.equal(isLegacyStaffBridgeEnabledServer(), false);
    assert.equal(
      deriveApiActorFromClaims({
        uid: 'legacy',
        email: 'legacy@example.com',
        email_verified: true,
        admin: false,
        staff: false,
        support: false,
        legacy_staff_email_fallback: true,
      }).isStaff,
      false,
    );
    env.STUDYNAVI_CLAIMS_CUTOVER_MODE = 'bridge';
    assert.equal(isLegacyStaffBridgeEnabledServer(), true);
    assert.equal(
      deriveApiActorFromClaims({
        uid: 'legacy',
        email: 'staff@example.com',
        email_verified: true,
        admin: false,
        staff: false,
        support: false,
        legacy_staff_email_fallback: true,
      }).isStaffByEmailFallback,
      true,
    );
    assert.equal(isLegacyStaffCompatClaim({
      email: 'legacy@example.test',
      emailVerified: true,
      legacyClaim: true,
    }), false);
    env.STUDYNAVI_CLAIMS_CUTOVER_MODE = previousMode;
    env.STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE = previousBridge;
  });
  await runTest('production runtime hard-blocks E2E bypass flags', () => {
    const env = process.env as Record<string, string | undefined>;
    const oldNodeEnv = process.env.NODE_ENV;
    env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_E2E_AUTH_BYPASS = 'true';
    process.env.NEXT_PUBLIC_E2E_MOCK_DATA = 'true';
    assert.equal(isE2EAuthBypassEnabled(), false);
    assert.equal(isE2EMockDataEnabled(), false);
    env.NODE_ENV = oldNodeEnv;
  });
  await runTest('rules contract includes staff-or-owner report access controls', () => {
    const firestoreRules = fs.readFileSync(path.join(process.cwd(), 'firebase', 'firestore.rules'), 'utf8');
    const storageRules = fs.readFileSync(path.join(process.cwd(), 'firebase', 'storage.rules'), 'utf8');
    assert.ok(/resource\.data\.createdByUid == request\.auth\.uid/.test(firestoreRules));
    assert.ok(/request\.resource\.data\.keys\(\)\.hasOnly/.test(firestoreRules));
    assert.ok(/isStaff\(\)/.test(firestoreRules));
    assert.ok(/request\.auth\.uid == userId/.test(storageRules));
    assert.ok(/isStaff\(\)/.test(storageRules));
  });
  if (failures.length > 0) {
    console.error('\nSecurity hardening test failures:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }
  console.log(`\nSecurity hardening tests passed: ${passed}`);
}
void main();

