import { describe, expect, it } from 'vitest';
import { runBattle } from '@samurai-rampage/battle-core';
import { createSample5v5Command } from '@samurai-rampage/scenarios';

describe('battle determinism', () => {
  it('produces identical reports for the same command', () => {
    const command = createSample5v5Command();
    const a = runBattle(command);
    const b = runBattle(command);

    expect(a.winner).toBe(b.winner);
    expect(a.events).toEqual(b.events);
    expect(a.finalState).toEqual(b.finalState);
  });
});
