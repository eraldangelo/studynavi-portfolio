import assert from 'node:assert/strict';
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

async function main() {
  await runTest('excerpt fetch blocks private redirect hops', async () => {
    const originalFetch = globalThis.fetch;
    let calls = 0;
    (globalThis as { fetch: typeof fetch }).fetch = (async () => {
      calls += 1;
      if (calls === 1) {
        return new Response('', { status: 302, headers: { location: 'http://127.0.0.1/admin' } });
      }
      return new Response('<html>unexpected</html>', { status: 200, headers: { 'content-type': 'text/html' } });
    }) as typeof fetch;

    try {
      const excerpt = await fetchPageExcerpt('http://93.184.216.34/example');
      assert.equal(excerpt, '');
      assert.equal(calls, 1);
    } finally {
      (globalThis as { fetch: typeof fetch }).fetch = originalFetch;
    }
  });

  await runTest('excerpt fetch enforces content-type and body-size limits', async () => {
    const originalFetch = globalThis.fetch;
    (globalThis as { fetch: typeof fetch }).fetch = (async () =>
      new Response('x'.repeat(300_000), { status: 200, headers: { 'content-type': 'text/html' } })) as typeof fetch;

    try {
      const excerpt = await fetchPageExcerpt('http://93.184.216.34/example');
      assert.equal(excerpt, '');
    } finally {
      (globalThis as { fetch: typeof fetch }).fetch = originalFetch;
    }
  });

  if (failures.length > 0) {
    console.error('\nHardening network test failures:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log(`\nHardening network tests passed: ${passed}`);
}

void main();