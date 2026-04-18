const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const MODAL_DIR = path.join(ROOT, 'src', 'lib', 'modals', 'content');
const MODAL_TYPE_FILE = path.join(ROOT, 'src', 'lib', 'core', 'types', 'modal.ts');
const TS_CONTENT_FILES = [
  path.join(MODAL_DIR, 'common.ts'),
  path.join(MODAL_DIR, 'ireland.ts'),
  path.join(MODAL_DIR, 'other-destinations.ts'),
];

function walkJsonFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsonFiles(target));
      continue;
    }
    if (entry.isFile() && target.endsWith('.json')) {
      files.push(target);
    }
  }
  return files;
}

function relative(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function collectUnionIds() {
  const source = fs.readFileSync(MODAL_TYPE_FILE, 'utf8');
  const ids = new Set();
  const regex = /\|\s*'([A-Z0-9_]+)'/g;
  let match;
  while ((match = regex.exec(source))) {
    ids.add(match[1]);
  }
  return ids;
}

function validateJsonEntry(id, entry, sourceFile, errors) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    errors.push(`${sourceFile} :: ${id} must be an object`);
    return;
  }
  if (entry.id !== id) {
    errors.push(`${sourceFile} :: ${id} has mismatched "id" field (${entry.id})`);
  }
  if (typeof entry.title !== 'string' || !entry.title.trim()) {
    errors.push(`${sourceFile} :: ${id} missing non-empty "title"`);
  }
  if (!Array.isArray(entry.description) || entry.description.length === 0) {
    errors.push(`${sourceFile} :: ${id} missing non-empty "description" array`);
  }
}

function collectContentIds(errors) {
  const idToSource = new Map();

  const jsonFiles = walkJsonFiles(MODAL_DIR);
  for (const file of jsonFiles) {
    const rel = relative(file);
    let content;
    try {
      content = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
      errors.push(`${rel} invalid JSON: ${error.message}`);
      continue;
    }

    if (!content || typeof content !== 'object' || Array.isArray(content)) {
      errors.push(`${rel} must contain a top-level object`);
      continue;
    }

    for (const [id, entry] of Object.entries(content)) {
      validateJsonEntry(id, entry, rel, errors);
      if (idToSource.has(id)) {
        errors.push(`${rel} duplicate modal id "${id}" also found in ${idToSource.get(id)}`);
      } else {
        idToSource.set(id, rel);
      }
    }
  }

  for (const file of TS_CONTENT_FILES) {
    const rel = relative(file);
    if (!fs.existsSync(file)) {
      errors.push(`${rel} missing`);
      continue;
    }
    const source = fs.readFileSync(file, 'utf8');
    const keyRegex = /^\s*([A-Z0-9_]+):\s*{/gm;
    let match;
    while ((match = keyRegex.exec(source))) {
      const id = match[1];
      if (idToSource.has(id)) {
        errors.push(`${rel} duplicate modal id "${id}" also found in ${idToSource.get(id)}`);
      } else {
        idToSource.set(id, rel);
      }
      const idPattern = new RegExp(`id:\\s*'${id}'`);
      if (!idPattern.test(source)) {
        errors.push(`${rel} key "${id}" missing matching id field`);
      }
    }
  }

  return idToSource;
}

function main() {
  const errors = [];
  const unionIds = collectUnionIds();
  const idToSource = collectContentIds(errors);
  const contentIds = new Set(idToSource.keys());

  for (const id of unionIds) {
    if (!contentIds.has(id)) {
      errors.push(`ModalID "${id}" has no content entry`);
    }
  }

  for (const id of contentIds) {
    if (!unionIds.has(id)) {
      errors.push(`Content id "${id}" is not declared in ModalID union (${idToSource.get(id)})`);
    }
  }

  if (errors.length > 0) {
    console.error('Modal validation failed:');
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }

  console.log(
    `Modal validation passed. IDs: ${contentIds.size}, JSON files: ${walkJsonFiles(MODAL_DIR).length}`,
  );
}

main();
