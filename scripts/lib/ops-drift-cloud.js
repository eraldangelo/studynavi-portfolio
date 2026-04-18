const { spawnSync } = require('child_process');

const PASS = 'PASS';
const WARN = 'WARN';
const FAIL = 'FAIL';

function row(status, check, detail) {
  return { status, check, detail };
}

function splitList(value, fallback) {
  const raw = String(value || fallback || '').trim();
  if (!raw) return [];
  return raw.split(',').map((item) => item.trim()).filter(Boolean);
}

function getAccessToken() {
  const envToken = String(process.env.GOOGLE_OAUTH_ACCESS_TOKEN || '').trim();
  if (envToken) return envToken;
  const command = process.platform === 'win32' ? 'gcloud.cmd' : 'gcloud';
  const run = spawnSync(command, ['auth', 'print-access-token'], { encoding: 'utf8' });
  if (run.status !== 0) return '';
  return String(run.stdout || '').trim();
}

async function getJson(url, token) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { ok: response.ok, status: response.status, json };
}

async function listSecretNames(projectId, token) {
  const names = new Set();
  let pageToken = '';
  do {
    const tokenQuery = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '';
    const response = await getJson(
      `https://secretmanager.googleapis.com/v1/projects/${projectId}/secrets?pageSize=200${tokenQuery}`,
      token,
    );
    if (!response.ok) {
      return { ok: false, status: response.status, names };
    }
    const items = Array.isArray(response.json?.secrets) ? response.json.secrets : [];
    for (const item of items) {
      const fullName = String(item?.name || '');
      const short = fullName.split('/').pop();
      if (short) names.add(short);
    }
    pageToken = String(response.json?.nextPageToken || '');
  } while (pageToken);
  return { ok: true, status: 200, names };
}

async function hasEnabledSecretVersion(projectId, token, secretName) {
  const response = await getJson(
    `https://secretmanager.googleapis.com/v1/projects/${projectId}/secrets/${secretName}/versions?pageSize=20`,
    token,
  );
  if (!response.ok) return { ok: false, status: response.status, enabled: false };
  const versions = Array.isArray(response.json?.versions) ? response.json.versions : [];
  const enabled = versions.some((item) => String(item?.state || '').toUpperCase() === 'ENABLED');
  return { ok: true, status: 200, enabled };
}

async function runCloudChecks(projectId, token) {
  const checks = [];

  const ttlResponse = await getJson(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/collectionGroups/__rateLimits/fields/expiresAt`,
    token,
  );
  if (ttlResponse.ok) {
    const ttlState = String(ttlResponse.json?.ttlConfig?.state || '').toUpperCase();
    checks.push(
      ttlState === 'ACTIVE'
        ? row(PASS, 'rate-limit TTL policy', '__rateLimits.expiresAt TTL is ACTIVE')
        : row(FAIL, 'rate-limit TTL policy', `__rateLimits.expiresAt TTL state is "${ttlState || 'UNKNOWN'}"`),
    );
  } else {
    checks.push(row(FAIL, 'rate-limit TTL policy', `failed to query TTL field (HTTP ${ttlResponse.status})`));
  }

  const appCheckResponse = await getJson(
    `https://firebaseappcheck.googleapis.com/v1beta/projects/${projectId}/services`,
    token,
  );
  if (appCheckResponse.ok && Array.isArray(appCheckResponse.json?.services)) {
    const services = appCheckResponse.json.services;
    const required = splitList(process.env.OPS_REQUIRED_APPCHECK_SERVICES, 'identitytoolkit.googleapis.com,firestore.googleapis.com');
    const weak = [];
    for (const serviceName of required) {
      const service = services.find((item) => String(item?.name || '').endsWith(`/services/${serviceName}`));
      const mode = String(service?.enforcementMode || '').toUpperCase();
      if (!service || mode !== 'ENFORCED') weak.push(`${serviceName}:${mode || 'MISSING'}`);
    }
    checks.push(
      weak.length === 0
        ? row(PASS, 'app check enforcement', 'required App Check services are ENFORCED')
        : row(FAIL, 'app check enforcement', `services not ENFORCED: ${weak.join(', ')}`),
    );
  } else {
    checks.push(row(FAIL, 'app check enforcement', `unable to query App Check services (HTTP ${appCheckResponse.status})`));
  }

  const alertsResponse = await getJson(
    `https://monitoring.googleapis.com/v3/projects/${projectId}/alertPolicies?pageSize=200`,
    token,
  );
  if (alertsResponse.ok && Array.isArray(alertsResponse.json?.alertPolicies)) {
    const names = new Set(alertsResponse.json.alertPolicies.map((item) => String(item?.displayName || '').trim()));
    const required = splitList(process.env.OPS_REQUIRED_ALERT_POLICY_NAMES, 'StudyNavi PDF failures spike,StudyNavi API failures spike');
    const missing = required.filter((name) => !names.has(name));
    checks.push(
      missing.length === 0
        ? row(PASS, 'monitoring alert policies', 'required StudyNavi alert policies are present')
        : row(FAIL, 'monitoring alert policies', `missing policies: ${missing.join(', ')}`),
    );
  } else {
    checks.push(row(WARN, 'monitoring alert policies', `unable to query alert policies (HTTP ${alertsResponse.status})`));
  }

  const uptimeResponse = await getJson(
    `https://monitoring.googleapis.com/v3/projects/${projectId}/uptimeCheckConfigs?pageSize=200`,
    token,
  );
  if (uptimeResponse.ok && Array.isArray(uptimeResponse.json?.uptimeCheckConfigs)) {
    const names = new Set(uptimeResponse.json.uptimeCheckConfigs.map((item) => String(item?.displayName || '').trim()));
    const required = splitList(process.env.OPS_REQUIRED_UPTIME_CHECK_NAMES, 'StudyNavi Homepage Uptime');
    const missing = required.filter((name) => !names.has(name));
    checks.push(
      missing.length === 0
        ? row(PASS, 'monitoring uptime checks', 'required uptime checks are present')
        : row(FAIL, 'monitoring uptime checks', `missing uptime checks: ${missing.join(', ')}`),
    );
  } else {
    checks.push(row(WARN, 'monitoring uptime checks', `unable to query uptime checks (HTTP ${uptimeResponse.status})`));
  }

  const requiredSecrets = splitList(
    process.env.OPS_REQUIRED_SECRET_NAMES,
    'OPENAI_API_KEY,FIREBASE_SERVICE_ACCOUNT,BRAVE_SEARCH_API_KEY,TURNSTILE_SECRET_KEY,STUDYNAVI_SESSION_SECRET',
  );
  const listedSecrets = await listSecretNames(projectId, token);
  if (!listedSecrets.ok) {
    checks.push(row(FAIL, 'secret manager contract', `unable to list secrets (HTTP ${listedSecrets.status})`));
  } else {
    const missing = requiredSecrets.filter((name) => !listedSecrets.names.has(name));
    if (missing.length > 0) {
      checks.push(row(FAIL, 'secret manager contract', `missing required secrets: ${missing.join(', ')}`));
    } else {
      let versionFailures = 0;
      for (const secretName of requiredSecrets) {
        const versionState = await hasEnabledSecretVersion(projectId, token, secretName);
        if (!versionState.ok || !versionState.enabled) {
          versionFailures += 1;
        }
      }
      checks.push(
        versionFailures === 0
          ? row(PASS, 'secret manager enabled versions', 'required secrets have at least one ENABLED version')
          : row(FAIL, 'secret manager enabled versions', `${versionFailures} required secret(s) missing enabled versions`),
      );
    }
  }

  return checks;
}

module.exports = {
  PASS,
  WARN,
  FAIL,
  row,
  getAccessToken,
  runCloudChecks,
};

