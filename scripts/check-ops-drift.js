const fs = require('fs');
const path = require('path');
const { FAIL, WARN, PASS, row, getAccessToken, runCloudChecks } = require('./lib/ops-drift-cloud');

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(process.cwd(), relativePath));
}

function hasAppHostingVariable(appHostingText, variableName) {
  const pattern = new RegExp(`-\\s+variable:\\s+${variableName}\\b`, 'm');
  return pattern.test(appHostingText);
}

function hasAppHostingAvailability(appHostingText, variableName, required) {
  const pattern = new RegExp(`-\\s+variable:\\s+${variableName}[\\s\\S]{0,220}?availability:\\s*\\[([^\\]]+)\\]`, 'm');
  const match = appHostingText.match(pattern);
  if (!match) return false;
  const actual = match[1].split(',').map((item) => item.trim().toUpperCase()).filter(Boolean);
  return required.every((item) => actual.includes(item));
}

function hasSecretBinding(appHostingText, variableName, secretName) {
  const pattern = new RegExp(`-\\s+variable:\\s+${variableName}[\\s\\S]{0,180}?secret:\\s+${secretName}\\b`, 'm');
  return pattern.test(appHostingText);
}

function parseMode() {
  const raw = String(process.env.OPS_DRIFT_MODE || 'auto').trim().toLowerCase();
  if (raw === 'repo' || raw === 'cloud') return raw;
  return 'auto';
}

function shouldRequireCloud(mode) {
  if (mode === 'cloud') return true;
  return String(process.env.OPS_DRIFT_REQUIRE_CLOUD || '').trim().toLowerCase() === 'true';
}

function evaluateRepoChecks() {
  const checks = [];
  const appHosting = read('apphosting.yaml');
  const firebaseJson = JSON.parse(read('firebase.json'));

  checks.push(
    firebaseJson?.firestore?.rules === 'firebase/firestore.rules'
    && firebaseJson?.storage?.rules === 'firebase/storage.rules'
      ? row(PASS, 'repo/firebase rules binding', 'firebase.json points to firestore + storage rules files')
      : row(FAIL, 'repo/firebase rules binding', 'firebase.json rule bindings are missing or changed'),
  );
  checks.push(
    hasAppHostingAvailability(appHosting, 'NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY', ['BUILD', 'RUNTIME'])
      ? row(PASS, 'repo/app check site key availability', 'NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY available at BUILD+RUNTIME')
      : row(FAIL, 'repo/app check site key availability', 'NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY BUILD+RUNTIME availability missing'),
  );
  checks.push(
    hasAppHostingAvailability(appHosting, 'STUDYNAVI_SESSION_SECRET', ['RUNTIME'])
      ? row(PASS, 'repo/session secret runtime contract', 'STUDYNAVI_SESSION_SECRET runtime contract is declared')
      : row(FAIL, 'repo/session secret runtime contract', 'STUDYNAVI_SESSION_SECRET runtime contract missing'),
  );
  checks.push(
    hasAppHostingVariable(appHosting, 'STUDYNAVI_CLAIMS_CUTOVER_MODE')
      ? row(PASS, 'repo/claims cutover mode', 'STUDYNAVI_CLAIMS_CUTOVER_MODE is declared in apphosting')
      : row(FAIL, 'repo/claims cutover mode', 'STUDYNAVI_CLAIMS_CUTOVER_MODE missing in apphosting'),
  );
  checks.push(
    hasAppHostingVariable(appHosting, 'STUDYNAVI_SESSION_TTL_SECONDS')
    && hasAppHostingVariable(appHosting, 'STUDYNAVI_SESSION_REQUIRE_TURNSTILE_PROOF')
      ? row(PASS, 'repo/session runtime controls', 'session TTL + turnstile-proof controls declared')
      : row(FAIL, 'repo/session runtime controls', 'session TTL or turnstile-proof controls missing'),
  );
  checks.push(
    hasAppHostingVariable(appHosting, 'CSP_ENABLE_STRICT_ENFORCE')
    && hasAppHostingVariable(appHosting, 'CSP_ENABLE_STRICT_REPORT_ONLY')
      ? row(PASS, 'repo/csp rollout controls', 'strict enforce + report-only controls declared')
      : row(FAIL, 'repo/csp rollout controls', 'CSP_ENABLE_STRICT_ENFORCE or CSP_ENABLE_STRICT_REPORT_ONLY missing'),
  );

  const requiredSecrets = [
    ['OPENAI_API_KEY', 'OPENAI_API_KEY'],
    ['FIREBASE_SERVICE_ACCOUNT', 'FIREBASE_SERVICE_ACCOUNT'],
    ['BRAVE_SEARCH_API_KEY', 'BRAVE_SEARCH_API_KEY'],
    ['TURNSTILE_SECRET_KEY', 'TURNSTILE_SECRET_KEY'],
    ['STUDYNAVI_SESSION_SECRET', 'STUDYNAVI_SESSION_SECRET'],
  ];
  const missingSecretBindings = requiredSecrets.filter(([variable, secret]) => !hasSecretBinding(appHosting, variable, secret));
  checks.push(
    missingSecretBindings.length === 0
      ? row(PASS, 'repo/apphosting secret bindings', 'required runtime secret bindings are declared')
      : row(FAIL, 'repo/apphosting secret bindings', `missing bindings: ${missingSecretBindings.map(([v]) => v).join(', ')}`),
  );

  const requiredFiles = [
    '.github/workflows/firebase-app-hosting-staging-rollout.yml',
    '.github/workflows/promote-to-production.yml',
    '.github/workflows/ops-drift-check.yml',
    '.github/workflows/rules-semantic.yml',
    'firebase/monitoring/alert-policies/pdf-failures-spike.json',
    'firebase/monitoring/alert-policies/api-failures-spike.json',
    'src/app/api/csp-report/route.ts',
    'scripts/check-claims-cutover.js',
    'scripts/contract-tests-pathfinder.ts',
    'scripts/release/restore-fees.js',
    'scripts/release/validate-recovery-drill.js',
    'scripts/release/rollback.ps1',
  ];
  const missingFiles = requiredFiles.filter((file) => !exists(file));
  checks.push(
    missingFiles.length === 0
      ? row(PASS, 'repo/workflow and drill assets', 'staging/promotion/ops/rules/workflow + drill assets are present')
      : row(FAIL, 'repo/workflow and drill assets', `missing files: ${missingFiles.join(', ')}`),
  );
  return checks;
}

async function main() {
  const checks = [...evaluateRepoChecks()];
  const mode = parseMode();
  const requireCloud = shouldRequireCloud(mode);
  const projectId = String(
    process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  ).trim();

  if (mode === 'repo') {
    checks.push(row(PASS, 'cloud/mode', 'repo-only mode selected'));
  } else {
    const token = getAccessToken();
    if (!projectId || !token) {
      checks.push(
        row(
          requireCloud ? FAIL : WARN,
          'cloud/mode',
          requireCloud
            ? 'cloud-state checks required but GOOGLE_CLOUD_PROJECT/FIREBASE_PROJECT or access token is missing'
            : 'cloud-state checks skipped (missing project id or access token)',
        ),
      );
    } else {
      checks.push(row(PASS, 'cloud/mode', `cloud checks enabled for project ${projectId}`));
      const cloudChecks = await runCloudChecks(projectId, token);
      for (const item of cloudChecks) {
        checks.push({ ...item, check: `cloud/${item.check}` });
      }
    }
  }

  let failCount = 0;
  checks.forEach((item) => {
    if (item.status === FAIL) failCount += 1;
    console.log(`${item.status} - ${item.check}: ${item.detail}`);
  });
  if (failCount > 0) process.exit(1);
}

main().catch((error) => {
  console.error(`FAIL - ops drift check: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
