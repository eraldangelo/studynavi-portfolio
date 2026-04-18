const BASE_URL = (process.env.APP_BASE_URL || 'https://your-app.example.com/')
  .replace(/\/+$/, '');

function normalize(urlPath) {
  if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) return urlPath;
  return `${BASE_URL}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
}

async function check({ name, path, method = 'GET', expectStatus, body }) {
  const url = normalize(path);
  const res = await fetch(url, {
    method,
    redirect: 'manual',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const ok = typeof expectStatus === 'function' ? expectStatus(res.status) : res.status === expectStatus;
  return { ok, name, status: res.status, url };
}

async function main() {
  const checks = [
    {
      name: 'Home route responds',
      path: '/',
      expectStatus: (s) => s >= 200 && s < 400,
    },
    {
      name: 'Login route responds',
      path: '/login',
      expectStatus: (s) => s >= 200 && s < 400,
    },
    {
      name: 'GET /api/chat is method-blocked',
      path: '/api/chat',
      expectStatus: 405,
    },
    {
      name: 'Invalid Turnstile payload is rejected',
      path: '/api/turnstile/verify',
      method: 'POST',
      body: { token: 'invalid', action: 'login' },
      expectStatus: 403,
    },
  ];

  const results = [];
  for (const item of checks) {
    try {
      results.push(await check(item));
    } catch (error) {
      results.push({
        ok: false,
        name: item.name,
        status: -1,
        url: normalize(item.path),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  let failed = 0;
  for (const result of results) {
    const prefix = result.ok ? 'PASS' : 'FAIL';
    const details = result.error ? `${result.status} (${result.error})` : `${result.status}`;
    console.log(`${prefix} - ${result.name} -> ${details} [${result.url}]`);
    if (!result.ok) failed += 1;
  }

  if (failed > 0) {
    console.error(`postdeploy check failed: ${failed} issue(s)`);
    process.exit(1);
  }
  console.log('postdeploy check passed');
}

main();

