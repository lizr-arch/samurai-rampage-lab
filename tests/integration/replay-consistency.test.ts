import { describe, expect, it } from 'vitest';
import { runBattle } from '@samurai-rampage/battle-core';
import { buildReplayTimeline } from '@samurai-rampage/replay';
import { createSample1v1Command } from '@samurai-rampage/scenarios';

describe('replay timeline', () => {
  it('keeps events ordered by time', () => {
    const report = runBattle(createSample1v1Command());
    const timeline = buildReplayTimeline(report.events);

    for (let i = 1; i < timeline.length; i++) {
      expect(timeline[i]!.timeMs).toBeGreaterThanOrEqual(timeline[i - 1]!.timeMs);
    }
  });
});
