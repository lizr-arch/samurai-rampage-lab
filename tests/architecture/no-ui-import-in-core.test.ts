import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function collectTsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) files.push(...collectTsFiles(path));
    else if (path.endsWith('.ts')) files.push(path);
  }
  return files;
}

describe('architecture boundary', () => {
  it('battle-core does not import UI libraries', () => {
    const files = collectTsFiles('packages/battle-core/src');
    const forbidden = ['pixi.js', 'react', 'react-dom', 'document', 'window'];

    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const pattern of forbidden) {
        expect(text.includes(pattern), `${file} contains ${pattern}`).toBe(false);
      }
    }
  });
});
