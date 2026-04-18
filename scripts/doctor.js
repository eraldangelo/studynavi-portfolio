const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REQUIRED_ENV_KEYS = [
  'OPENAI_API_KEY',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

function parseEnvKeys(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return new Set(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => line.split('=')[0].trim()),
  );
}

function runCommand(command, args) {
  const commandLine = [command, ...args].join(' ');
  const result = spawnSync(commandLine, { stdio: 'pipe', encoding: 'utf8', shell: true });
  const status = typeof result.status === 'number' ? result.status : 1;
  return {
    ok: status === 0 && !result.error,
    status,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  };
}

function checkNodeVersion() {
  const major = Number(process.versions.node.split('.')[0]);
  return { ok: major >= 20, message: `Node ${process.versions.node}` };
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    return { ok: false, message: '.env.local not found' };
  }
  const keys = parseEnvKeys(envPath);
  const missing = REQUIRED_ENV_KEYS.filter((key) => !keys.has(key));
  if (missing.length > 0) {
    return { ok: false, message: `Missing env keys: ${missing.join(', ')}` };
  }
  return { ok: true, message: `.env.local present with ${REQUIRED_ENV_KEYS.length} required keys` };
}

function main() {
  const checks = [];
  checks.push({ name: 'Node version', ...checkNodeVersion() });
  checks.push({ name: 'Environment file', ...checkEnvFile() });

  const secretScan = runCommand('npm', ['run', 'check:secrets']);
  checks.push({
    name: 'Secret scan',
    ok: secretScan.ok,
    message: secretScan.ok ? 'Secret scan passed' : `Secret scan failed (exit ${secretScan.status})`,
  });

  const endpointCheck = runCommand('npm', ['run', 'postdeploy:check']);
  checks.push({
    name: 'Endpoint check',
    ok: endpointCheck.ok,
    message: endpointCheck.ok ? 'Post-deploy endpoint checks passed' : `Endpoint check failed (exit ${endpointCheck.status})`,
  });

  const javaCheck = runCommand('npm', ['run', 'check:java']);
  checks.push({
    name: 'Java preflight',
    ok: javaCheck.ok,
    message: javaCheck.ok ? 'Java runtime is valid for emulator rules tests' : `Java preflight failed (exit ${javaCheck.status})`,
  });

  const claimsCutover = runCommand('npm', ['run', 'check:claims-cutover']);
  checks.push({
    name: 'Claims cutover check',
    ok: claimsCutover.ok,
    message: claimsCutover.ok ? 'Claims cutover repo check passed' : `Claims cutover check failed (exit ${claimsCutover.status})`,
  });

  const recoveryDrill = runCommand('npm', ['run', 'check:recovery-drill']);
  checks.push({
    name: 'Recovery drill check',
    ok: recoveryDrill.ok,
    message: recoveryDrill.ok ? 'Recovery drill validation passed' : `Recovery drill check failed (exit ${recoveryDrill.status})`,
  });

  let failures = 0;
  for (const check of checks) {
    const prefix = check.ok ? 'PASS' : 'FAIL';
    console.log(`${prefix} - ${check.name}: ${check.message}`);
    if (!check.ok) failures += 1;
  }

  if (failures > 0) {
    process.exit(1);
  }
  console.log('Doctor check passed');
}

main();
