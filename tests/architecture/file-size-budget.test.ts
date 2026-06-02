import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const skippedDirs = new Set(['node_modules', 'dist', '.git', '.vite', 'coverage']);
const checkedExts = new Set(['.ts', '.tsx', '.js', '.mjs']);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (skippedDirs.has(name)) continue;
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) walk(path, out);
    else if (checkedExts.has(extname(path))) out.push(path);
  }
  return out;
}

describe('file size budget', () => {
  it('keeps source files under the hard limit', () => {
    const oversized = walk('.').filter((file) => {
      const lines = readFileSync(file, 'utf8').split(/\r?\n/).length;
      return lines > 500;
    });

    expect(oversized).toEqual([]);
  });
});
