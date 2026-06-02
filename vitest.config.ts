import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const workspaceAliases = {
  '@samurai-rampage/battle-core': fileURLToPath(new URL('./packages/battle-core/src/index.ts', import.meta.url)),
  '@samurai-rampage/battle-rules': fileURLToPath(new URL('./packages/battle-rules/src/index.ts', import.meta.url)),
  '@samurai-rampage/content': fileURLToPath(new URL('./packages/content/src/index.ts', import.meta.url)),
  '@samurai-rampage/contracts': fileURLToPath(new URL('./packages/contracts/src/index.ts', import.meta.url)),
  '@samurai-rampage/devtools': fileURLToPath(new URL('./packages/devtools/src/index.ts', import.meta.url)),
  '@samurai-rampage/replay': fileURLToPath(new URL('./packages/replay/src/index.ts', import.meta.url)),
  '@samurai-rampage/scenarios': fileURLToPath(new URL('./packages/scenarios/src/index.ts', import.meta.url))
};

export default defineConfig({
  resolve: {
    alias: workspaceAliases
  },
  test: {
    include: ['tests/**/*.test.ts', 'packages/**/*.test.ts'],
    environment: 'node'
  }
});
