import type { BattleEvent } from '@samurai-rampage/contracts';

export type ReplayFrame = {
  timeMs: number;
  events: BattleEvent[];
};

export function buildReplayTimeline(events: BattleEvent[]): ReplayFrame[] {
  const byTime = new Map<number, BattleEvent[]>();

  for (const event of events) {
    const bucket = byTime.get(event.timeMs) ?? [];
    bucket.push(event);
    byTime.set(event.timeMs, bucket);
  }

  return [...byTime.entries()]
    .sort(([a], [b]) => a - b)
    .map(([timeMs, frameEvents]) => ({ timeMs, events: frameEvents }));
}
