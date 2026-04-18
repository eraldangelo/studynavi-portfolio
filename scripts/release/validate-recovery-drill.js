const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PASS = 'PASS';
const FAIL = 'FAIL';

function row(status, check, detail) {
  return { status, check, detail };
}

function exists(relativePath) {
  return fs.existsSync(path.join(process.cwd(), relativePath));
}

function run(command, args) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: false,
  });
}

function main() {
  const checks = [];
  const requiredFiles = [
    'scripts/release/restore-fees.js',
    'scripts/release/rollback.ps1',
    'scripts/release/fixtures/fees-backup.sample.json',
    'docs/RELEASE_RUNBOOK.md',
    'docs/RESILIENCE_GOVERNANCE.md',
    'docs/INCIDENT_RUNBOOK.md',
  ];
  const missing = requiredFiles.filter((item) => !exists(item));
  checks.push(
    missing.length === 0
      ? row(PASS, 'recovery assets', 'restore/rollback scripts + drill docs are present')
      : row(FAIL, 'recovery assets', `missing files: ${missing.join(', ')}`),
  );

  const releaseRunbook = fs.readFileSync(path.join(process.cwd(), 'docs/RELEASE_RUNBOOK.md'), 'utf8');
  const resilience = fs.readFileSync(path.join(process.cwd(), 'docs/RESILIENCE_GOVERNANCE.md'), 'utf8');
  checks.push(
    /restore:fees/i.test(releaseRunbook) && /rollback/i.test(releaseRunbook)
      ? row(PASS, 'runbook rollback coverage', 'release runbook references restore + rollback commands')
      : row(FAIL, 'runbook rollback coverage', 'release runbook does not contain restore + rollback references'),
  );
  checks.push(
    /drill/i.test(resilience) && /acceptance criteria/i.test(resilience)
      ? row(PASS, 'drill governance coverage', 'resilience runbook includes drill discipline and acceptance criteria')
      : row(FAIL, 'drill governance coverage', 'resilience runbook missing drill discipline details'),
  );

  const sampleBackup = path.join('scripts', 'release', 'fixtures', 'fees-backup.sample.json');
  const restoreDryRun = run('node', ['scripts/release/restore-fees.js', '--file', sampleBackup]);
  checks.push(
    restoreDryRun.status === 0
      ? row(PASS, 'fees restore dry-run', 'restore script accepts sample backup in dry-run mode')
      : row(
        FAIL,
        'fees restore dry-run',
        `restore dry-run failed: ${(restoreDryRun.stderr || restoreDryRun.stdout || '').trim().slice(0, 240)}`,
      ),
  );

  let failed = 0;
  checks.forEach((check) => {
    if (check.status === FAIL) failed += 1;
    console.log(`${check.status} - ${check.check}: ${check.detail}`);
  });
  if (failed > 0) process.exit(1);
}

main();
