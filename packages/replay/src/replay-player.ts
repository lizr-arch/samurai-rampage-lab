import type { BattleEvent } from '@samurai-rampage/contracts';
import { buildReplayTimeline, type ReplayFrame } from './replay-timeline';

export type ReplayPlayerOptions = {
  speed: number;
  onFrame: (frame: ReplayFrame) => void;
  onDone?: () => void;
};

export function playReplay(events: BattleEvent[], options: ReplayPlayerOptions): () => void {
  const timeline = buildReplayTimeline(events);
  const timers: ReturnType<typeof setTimeout>[] = [];
  const speed = Math.max(0.1, options.speed);

  for (const frame of timeline) {
    const timer = setTimeout(() => options.onFrame(frame), frame.timeMs / speed);
    timers.push(timer);
  }

  const lastTime = timeline.at(-1)?.timeMs ?? 0;
  timers.push(setTimeout(() => options.onDone?.(), lastTime / speed + 50));

  return () => {
    for (const timer of timers) clearTimeout(timer);
  };
}
