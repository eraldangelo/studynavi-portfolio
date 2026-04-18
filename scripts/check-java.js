const { spawnSync } = require('child_process');

const MIN_SUPPORTED = 17;
const RECOMMENDED = 21;

function parseMajorVersion(output) {
  const text = String(output || '');
  const match = text.match(/version\s+"(\d+)(?:\.(\d+))?/i);
  if (!match) return 0;
  const major = Number.parseInt(match[1], 10);
  if (!Number.isFinite(major)) return 0;
  if (major === 1 && match[2]) {
    const legacy = Number.parseInt(match[2], 10);
    return Number.isFinite(legacy) ? legacy : 0;
  }
  return major;
}

function main() {
  const command = process.platform === 'win32' ? 'java.exe' : 'java';
  const run = spawnSync(command, ['-version'], { encoding: 'utf8' });
  const output = `${run.stderr || ''}\n${run.stdout || ''}`.trim();

  if (run.error || run.status !== 0) {
    console.error('FAIL - Java runtime not found. Install Temurin 21 for emulator-backed rules tests.');
    process.exit(1);
  }

  const major = parseMajorVersion(output);
  if (!major) {
    console.error('FAIL - Unable to parse Java version output.');
    process.exit(1);
  }
  if (major < MIN_SUPPORTED) {
    console.error(`FAIL - Java ${major} is unsupported. Use Java ${MIN_SUPPORTED}+ (Temurin ${RECOMMENDED} recommended).`);
    process.exit(1);
  }

  const recommendation = major === RECOMMENDED
    ? 'PASS'
    : `PASS (supported; Temurin ${RECOMMENDED} recommended)`;
  console.log(`${recommendation} - Java ${major} detected.`);
}

main();

