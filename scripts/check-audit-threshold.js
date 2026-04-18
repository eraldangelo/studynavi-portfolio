const fs = require('fs');

const filePath = process.argv[2] || 'audit.json';
const maxHigh = Number(process.env.AUDIT_MAX_HIGH || '0');
const maxCritical = Number(process.env.AUDIT_MAX_CRITICAL || '0');

function main() {
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);
  const vulnerabilities = (json.metadata && json.metadata.vulnerabilities) || {};
  const high = Number(vulnerabilities.high || 0);
  const critical = Number(vulnerabilities.critical || 0);

  console.log(`Audit threshold check: high=${high}, critical=${critical}`);
  if (high > maxHigh || critical > maxCritical) {
    console.error(
      `Audit threshold exceeded (allowed high<=${maxHigh}, critical<=${maxCritical}).`,
    );
    process.exit(1);
  }
}

main();

