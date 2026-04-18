const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();
const MAX_LINES = 250;
const EXCLUDED_DIRS = ['node_modules', '.next', '.git', 'dist', 'coverage'];
const ALLOWLIST = new Set(['package-lock.json']);

function isLikelyBinary(buffer) {
  const scanLength = Math.min(buffer.length, 4096);
  for (let i = 0; i < scanLength; i += 1) {
    if (buffer[i] === 0) return true;
  }
  return false;
}

function shouldSkip(file) {
  const normalized = file.replace(/\\/g, '/');
  if (ALLOWLIST.has(normalized)) return true;
  return EXCLUDED_DIRS.some((dir) => normalized.includes(`/${dir}/`) || normalized.startsWith(`${dir}/`));
}

function getRepoFiles() {
  const output = execSync('git ls-files --cached --others --exclude-standard', {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function lineCount(text) {
  if (!text) return 0;
  return text.split(/\r?\n/).length;
}

function main() {
  const offenders = [];
  const files = getRepoFiles();

  for (const file of files) {
    if (shouldSkip(file)) continue;

    const fullPath = path.join(ROOT, file);
    if (!fs.existsSync(fullPath)) continue;
    if (!fs.statSync(fullPath).isFile()) continue;

    const buffer = fs.readFileSync(fullPath);
    if (isLikelyBinary(buffer)) continue;

    const lines = lineCount(buffer.toString('utf8'));
    if (lines > MAX_LINES) {
      offenders.push({ file: file.replace(/\\/g, '/'), lines });
    }
  }

  if (offenders.length > 0) {
    offenders.sort((a, b) => b.lines - a.lines);
    console.error(`File length check failed (> ${MAX_LINES} lines):`);
    for (const row of offenders) {
      console.error(`- ${row.lines.toString().padStart(4)} ${row.file}`);
    }
    process.exit(1);
  }

  console.log(`File length check passed (max ${MAX_LINES} lines).`);
}

main();
