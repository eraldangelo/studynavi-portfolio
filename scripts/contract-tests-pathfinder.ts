import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { extractSsoTokenFromLocation } from '../src/lib/security/sso-contract';
import { sanitizeInternalRedirectTarget } from '../src/lib/security/redirect';
import { establishServerSessionFromUserWithSource } from '../src/lib/firebase/server-session';

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

async function main() {
  await runTest('Pathfinder SSO query token is extracted and removed from URL while preserving next/source', () => {
    const extracted = extractSsoTokenFromLocation(
      'https://studio.example/login?next=%2Ffees-updater&source=pathfinder&ssoToken=query-token',
    );
    assert.equal(extracted.ssoToken, 'query-token');
    assert.equal(extracted.cleanRelativeUrl, '/login?next=%2Ffees-updater&source=pathfinder');
  });

  await runTest('Hash ssoToken takes precedence over query token and is stripped safely', () => {
    const extracted = extractSsoTokenFromLocation(
      'https://studio.example/login?next=%2F&source=pathfinder&ssoToken=query-token#mode=redirect&ssoToken=hash-token',
    );
    assert.equal(extracted.ssoToken, 'hash-token');
    assert.equal(extracted.cleanRelativeUrl, '/login?next=%2F&source=pathfinder#mode=redirect');
  });

  await runTest('Pathfinder query contract preserves /login + next + source after token extraction', () => {
    const extraction = extractSsoTokenFromLocation(
      'https://studio.example/login?next=%2Fpartnerschools%3Ftab%3Dall&source=pathfinder&ssoToken=abc123',
    );
    assert.equal(extraction.ssoToken, 'abc123');
    assert.equal(extraction.cleanRelativeUrl, '/login?next=%2Fpartnerschools%3Ftab%3Dall&source=pathfinder');
  });

  await runTest('Invalid external next target is sanitized to internal fallback', () => {
    const next = sanitizeInternalRedirectTarget('https://evil.example/phish', '/');
    assert.equal(next, '/');
  });

  await runTest('Valid internal next target remains unchanged', () => {
    const next = sanitizeInternalRedirectTarget('/partnerschools?tab=all', '/');
    assert.equal(next, '/partnerschools?tab=all');
  });

  await runTest('Server session establishment keeps Pathfinder loginSource contract header', async () => {
    const env = process.env as Record<string, string | undefined>;
    const previousBypass = env.NEXT_PUBLIC_E2E_AUTH_BYPASS;
    env.NEXT_PUBLIC_E2E_AUTH_BYPASS = 'false';
    const originalFetch = globalThis.fetch;
    const calls: Array<{ headers: Record<string, string>; method: string; credentials?: string }> = [];
    (globalThis as { fetch: typeof fetch }).fetch = (async (_input, init) => {
      const headers = (init?.headers || {}) as Record<string, string>;
      calls.push({
        headers,
        method: String(init?.method || 'GET'),
        credentials: String(init?.credentials || ''),
      });
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;

    try {
      const fakeUser = {
        getIdToken: async () => 'header.payload.signature',
      } as unknown as Parameters<typeof establishServerSessionFromUserWithSource>[0];
      const ok = await establishServerSessionFromUserWithSource(fakeUser, 'pathfinder-sso');
      assert.equal(ok, true);
      assert.equal(calls.length, 1);
      assert.equal(calls[0].method, 'POST');
      assert.equal(calls[0].credentials, 'same-origin');
      assert.equal(calls[0].headers['x-studynavi-login-source'], 'pathfinder-sso');
      assert.equal(calls[0].headers.Authorization, 'Bearer header.payload.signature');
    } finally {
      env.NEXT_PUBLIC_E2E_AUTH_BYPASS = previousBypass;
      (globalThis as { fetch: typeof fetch }).fetch = originalFetch;
    }
  });

  await runTest('Login implementation retains Pathfinder custom-token sign-in contract', () => {
    const loginClientSource = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(public)', 'login', 'LoginClient.tsx'),
      'utf8',
    );
    assert.match(loginClientSource, /signInWithCustomToken\(auth,\s*ssoToken\)/);
    assert.match(loginClientSource, /sp\.get\('source'\)/);
    assert.match(loginClientSource, /sp\.get\('next'\)/);
    assert.match(loginClientSource, /pathfinder-sso/);
  });

  if (failures.length > 0) {
    console.error('\nPathfinder contract test failures:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }
  console.log(`\nPathfinder contract tests passed: ${passed}`);
}

void main();
