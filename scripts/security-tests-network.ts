import assert from 'node:assert/strict';
import { POST as runtimeAlertPost } from '../src/app/api/runtime-alert/route';
import { getClientIp } from '../src/lib/chat/api/request';
import { fetchPageExcerpt } from '../src/lib/search/brave-search.http';

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
  await runTest('client IP parser follows trusted proxy mode and strict parsing', () => {
    const env = process.env as Record<string, string | undefined>;
    const previousMode = env.TRUST_PROXY_MODE;
    env.TRUST_PROXY_MODE = 'none';
    const noneMode = getClientIp(new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.1.1.1' },
    }));
    assert.equal(noneMode, 'unknown');

    env.TRUST_PROXY_MODE = 'managed';
    const managedMode = getClientIp(new Request('http://localhost', {
      headers: { 'x-forwarded-for': '198.51.100.10, 203.0.113.5' },
    }));
    assert.equal(managedMode, '203.0.113.5');

    const envoyMode = getClientIp(new Request('http://localhost', {
      headers: {
        'x-envoy-external-address': '198.51.100.22',
        'x-forwarded-for': '1.1.1.1, 2.2.2.2',
      },
    }));
    assert.equal(envoyMode, '198.51.100.22');

    env.TRUST_PROXY_MODE = previousMode;
  });

  await runTest('runtime alert endpoint requires auth and validates source', async () => {
    const missingAuth = await runtimeAlertPost(jsonRequest('http://localhost/api/runtime-alert', {
      source: 'pdf.preview',
      message: 'Preview failed',
    }));
    assert.equal(missingAuth.status, 401);

    const nonStaff = await runtimeAlertPost(jsonRequest(
      'http://localhost/api/runtime-alert',
      { source: 'pdf.preview', message: 'Preview failed' },
      { 'x-e2e-auth-uid': 'user-2', 'x-e2e-auth-role': 'user' },
    ));
    assert.equal(nonStaff.status, 403);

    const invalidSource = await runtimeAlertPost(jsonRequest(
      'http://localhost/api/runtime-alert',
      { source: 'unexpected.source', message: 'Unexpected event' },
      { 'x-e2e-auth-uid': 'staff-2', 'x-e2e-auth-role': 'staff' },
    ));
    assert.equal(invalidSource.status, 400);

    const okSource = await runtimeAlertPost(jsonRequest(
      'http://localhost/api/runtime-alert',
      { source: 'pdf.preview', message: 'Preview failed' },
      { 'x-e2e-auth-uid': 'staff-2', 'x-e2e-auth-role': 'staff' },
    ));
    assert.equal(okSource.status, 204);
  });

  await runTest('excerpt fetch blocks local/private SSRF targets', async () => {
    const local = await fetchPageExcerpt('http://127.0.0.1/internal');
    const localhost = await fetchPageExcerpt('http://localhost/admin');
    assert.equal(local, '');
    assert.equal(localhost, '');
  });

  if (failures.length > 0) {
    console.error('\nSecurity network test failures:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log(`\nSecurity network tests passed: ${passed}`);
}

void main();
