const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const MAX_COMMITS = Number(process.env.CHANGELOG_MAX_COMMITS || 80);
const OUTPUT_FILE = path.join(process.cwd(), 'docs', 'CHANGELOG.md');

function runGitLog() {
  const format = '%H|%h|%ad|%s';
  const args = [
    'log',
    '-n',
    String(MAX_COMMITS),
    '--date=short',
    `--pretty=format:${format}`,
  ];
  const result = spawnSync('git', args, { encoding: 'utf8', shell: false });
  if (result.status !== 0) {
    throw new Error((result.stderr || '').trim() || 'git log failed');
  }
  return (result.stdout || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseRows(rows) {
  return rows.map((row) => {
    const [fullHash, shortHash, date, ...rest] = row.split('|');
    const subject = rest.join('|').trim();
    return { fullHash, shortHash, date, subject };
  });
}

function buildMarkdown(commits) {
  const grouped = new Map();
  for (const commit of commits) {
    if (!grouped.has(commit.date)) grouped.set(commit.date, []);
    grouped.get(commit.date).push(commit);
  }

  const lines = [];
  lines.push('# Changelog');
  lines.push('');
  lines.push('Generated from git commit messages. Most recent entries first.');
  lines.push('');

  for (const [date, entries] of grouped.entries()) {
    lines.push(`## ${date}`);
    for (const entry of entries) {
      const subject = entry.subject || '(no subject)';
      lines.push(`- \`${entry.shortHash}\` ${subject}`);
    }
    lines.push('');
  }
  return `${lines.join('\n').trim()}\n`;
}

function main() {
  try {
    const rows = runGitLog();
    const commits = parseRows(rows);
    const markdown = buildMarkdown(commits);
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, markdown, 'utf8');
    console.log(`Changelog generated: ${OUTPUT_FILE} (${commits.length} commits)`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to generate changelog: ${message}`);
    process.exit(1);
  }
}

main();
