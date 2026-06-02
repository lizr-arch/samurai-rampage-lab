import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function files(dir: string): string[] {
  const result: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) result.push(...files(path));
    else if (path.endsWith('.ts')) result.push(path);
  }
  return result;
}

describe('package boundaries', () => {
  it('contracts does not import implementation packages', () => {
    const forbidden = ['@samurai-rampage/battle-core', '@samurai-rampage/battle-rules', '@samurai-rampage/demo-web'];
    for (const file of files('packages/contracts/src')) {
      const text = readFileSync(file, 'utf8');
      for (const token of forbidden) {
        expect(text.includes(token), `${file} imports ${token}`).toBe(false);
      }
    }
  });
});
