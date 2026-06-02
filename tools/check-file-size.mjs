import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const INCLUDE_EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.md']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.vite', 'coverage']);

const limits = {
  warning: 350,
  hard: 500
};

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) walk(path, files);
    else if (INCLUDE_EXT.has(extname(path))) files.push(path);
  }
  return files;
}

const violations = [];
for (const file of walk(ROOT)) {
  const rel = file.slice(ROOT.length + 1).replaceAll('\\', '/');
  if (rel.endsWith('pnpm-lock.yaml')) continue;
  const lines = readFileSync(file, 'utf8').split(/\r?\n/).length;
  if (lines > limits.hard) {
    violations.push(`${rel}: ${lines} lines > hard limit ${limits.hard}`);
  } else if (lines > limits.warning) {
    console.warn(`[warn] ${rel}: ${lines} lines > warning ${limits.warning}`);
  }
}

if (violations.length > 0) {
  console.error('File size violations:');
  for (const v of violations) console.error(`- ${v}`);
  process.exit(1);
}

console.log('file-size-ok');
