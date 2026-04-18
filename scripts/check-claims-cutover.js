const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const PASS = 'PASS';
const WARN = 'WARN';
const FAIL = 'FAIL';

function row(status, check, detail) {
  return { status, check, detail };
}

function parseMode(value) {
  const raw = String(value || '').trim().toLowerCase();
  return raw === 'strict' ? 'strict' : 'bridge';
}

function parseBool(value, fallback = false) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return fallback;
  return raw === 'true';
}

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

function hasEnvKey(relativePath, key) {
  const text = read(relativePath);
  const pattern = new RegExp(`^\\s*${key}=`, 'm');
  return pattern.test(text);
}

function hasAppHostingVariable(appHostingText, variableName) {
  const pattern = new RegExp(`-\\s+variable:\\s+${variableName}\\b`, 'm');
  return pattern.test(appHostingText);
}

function hasAppHostingVariableValue(appHostingText, variableName, expectedValue) {
  const blockPattern = new RegExp(`-\\s+variable:\\s+${variableName}[\\s\\S]{0,180}?value:\\s*\"([^\"]+)\"`, 'm');
  const match = appHostingText.match(blockPattern);
  if (!match) return false;
  return String(match[1] || '').trim() === expectedValue;
}

function shouldRunCloudChecks() {
  const mode = String(process.env.CLAIMS_CHECK_MODE || 'auto').trim().toLowerCase();
  if (mode === 'cloud') return true;
  if (mode === 'repo') return false;
  return parseBool(process.env.CLAIMS_CHECK_REQUIRE_CLOUD, false);
}

function canAttemptCloudChecks() {
  if (String(process.env.FIREBASE_SERVICE_ACCOUNT || '').trim()) return true;
  const credentialsPath = String(process.env.GOOGLE_APPLICATION_CREDENTIALS || '').trim();
  return Boolean(credentialsPath && fs.existsSync(path.resolve(credentialsPath)));
}

function initAdmin() {
  if (admin.apps.length > 0) return;
  const fromEnv = String(process.env.FIREBASE_SERVICE_ACCOUNT || '').trim();
  if (fromEnv) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fromEnv)) });
    return;
  }
  const credentialsPath = String(process.env.GOOGLE_APPLICATION_CREDENTIALS || '').trim();
  if (credentialsPath && fs.existsSync(path.resolve(credentialsPath))) {
    admin.initializeApp();
    return;
  }
  throw new Error('Missing FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS for cloud claims checks.');
}

async function countClaimUsage() {
  initAdmin();
  let total = 0;
  let claimStaff = 0;
  let legacyClaim = 0;
  let legacyOnly = 0;
  let pageToken = undefined;

  do {
    const batch = await admin.auth().listUsers(1000, pageToken);
    for (const user of batch.users) {
      total += 1;
      const claims = user.customClaims || {};
      const hasAuthoritative = claims.admin === true || claims.staff === true || claims.support === true;
      const hasLegacy = claims.legacy_staff_email_fallback === true;
      if (hasAuthoritative) claimStaff += 1;
      if (hasLegacy) legacyClaim += 1;
      if (hasLegacy && !hasAuthoritative) legacyOnly += 1;
    }
    pageToken = batch.pageToken;
  } while (pageToken);

  return { total, claimStaff, legacyClaim, legacyOnly };
}

async function main() {
  const checks = [];
  const appHosting = read('apphosting.yaml');
  const claimsMode = parseMode(process.env.STUDYNAVI_CLAIMS_CUTOVER_MODE);
  const requireCloud = shouldRunCloudChecks();

  checks.push(
    hasEnvKey('.env.local.example', 'STUDYNAVI_CLAIMS_CUTOVER_MODE')
      ? row(PASS, 'env contract (local)', 'STUDYNAVI_CLAIMS_CUTOVER_MODE is documented')
      : row(FAIL, 'env contract (local)', 'STUDYNAVI_CLAIMS_CUTOVER_MODE missing from .env.local.example'),
  );
  checks.push(
    hasEnvKey('.env.local.example', 'NEXT_PUBLIC_STUDYNAVI_CLAIMS_CUTOVER_MODE')
      ? row(PASS, 'env contract (local UI)', 'NEXT_PUBLIC_STUDYNAVI_CLAIMS_CUTOVER_MODE is documented')
      : row(FAIL, 'env contract (local UI)', 'NEXT_PUBLIC_STUDYNAVI_CLAIMS_CUTOVER_MODE missing from .env.local.example'),
  );
  checks.push(
    hasEnvKey('.env.staging.example', 'STUDYNAVI_CLAIMS_CUTOVER_MODE')
      ? row(PASS, 'env contract (staging)', 'STUDYNAVI_CLAIMS_CUTOVER_MODE is documented')
      : row(FAIL, 'env contract (staging)', 'STUDYNAVI_CLAIMS_CUTOVER_MODE missing from .env.staging.example'),
  );
  checks.push(
    hasEnvKey('.env.staging.example', 'NEXT_PUBLIC_STUDYNAVI_CLAIMS_CUTOVER_MODE')
      ? row(PASS, 'env contract (staging UI)', 'NEXT_PUBLIC_STUDYNAVI_CLAIMS_CUTOVER_MODE is documented')
      : row(FAIL, 'env contract (staging UI)', 'NEXT_PUBLIC_STUDYNAVI_CLAIMS_CUTOVER_MODE missing from .env.staging.example'),
  );
  checks.push(
    hasAppHostingVariable(appHosting, 'STUDYNAVI_CLAIMS_CUTOVER_MODE')
      ? row(PASS, 'apphosting claims mode', 'STUDYNAVI_CLAIMS_CUTOVER_MODE declared for runtime')
      : row(FAIL, 'apphosting claims mode', 'STUDYNAVI_CLAIMS_CUTOVER_MODE missing in apphosting.yaml'),
  );
  checks.push(
    hasAppHostingVariable(appHosting, 'NEXT_PUBLIC_STUDYNAVI_CLAIMS_CUTOVER_MODE')
      ? row(PASS, 'apphosting claims mode (UI)', 'NEXT_PUBLIC_STUDYNAVI_CLAIMS_CUTOVER_MODE declared for build/runtime')
      : row(FAIL, 'apphosting claims mode (UI)', 'NEXT_PUBLIC_STUDYNAVI_CLAIMS_CUTOVER_MODE missing in apphosting.yaml'),
  );
  checks.push(
    hasAppHostingVariable(appHosting, 'STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE')
      ? row(PASS, 'legacy bridge runtime flag', 'runtime bridge flag is explicitly declared')
      : row(FAIL, 'legacy bridge runtime flag', 'runtime bridge flag missing in apphosting.yaml'),
  );

  if (claimsMode === 'strict') {
    checks.push(
      hasAppHostingVariableValue(appHosting, 'STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE', 'false')
        ? row(PASS, 'strict cutover bridge guard', 'bridge disabled in apphosting strict mode')
        : row(FAIL, 'strict cutover bridge guard', 'strict mode requires STUDYNAVI_ENABLE_LEGACY_STAFF_COMPAT_BRIDGE=false'),
    );
  }

  if (!requireCloud) {
    checks.push(row(PASS, 'cloud claims readiness mode', 'repo-only mode'));
  } else if (!canAttemptCloudChecks()) {
    checks.push(row(FAIL, 'cloud claims readiness mode', 'cloud mode requested but Firebase Admin credentials are missing'));
  } else {
    const usage = await countClaimUsage();
    const details = `total=${usage.total}, claimStaff=${usage.claimStaff}, legacyClaim=${usage.legacyClaim}, legacyOnly=${usage.legacyOnly}`;
    checks.push(row(PASS, 'claims inventory', details));
    if (claimsMode === 'strict') {
      checks.push(
        usage.legacyClaim === 0
          ? row(PASS, 'strict legacy dependency check', 'no users remain with legacy_staff_email_fallback')
          : row(FAIL, 'strict legacy dependency check', `${usage.legacyClaim} users still carry legacy_staff_email_fallback`),
      );
    } else {
      checks.push(
        usage.legacyOnly === 0
          ? row(PASS, 'bridge dependency check', 'no users require legacy-only bridge claims')
          : row(WARN, 'bridge dependency check', `${usage.legacyOnly} users still depend on bridge-only claims`),
      );
    }
  }

  let failed = 0;
  for (const check of checks) {
    if (check.status === FAIL) failed += 1;
    console.log(`${check.status} - ${check.check}: ${check.detail}`);
  }
  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`FAIL - claims cutover check: ${message}`);
  process.exit(1);
});
