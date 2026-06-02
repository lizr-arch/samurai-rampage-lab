import type { BattleCommand } from './battle-command';
import type { BattleEvent } from './battle-event';
import type { BattleStateSnapshot } from './battle-state';
import type { Side } from './ids';
import type { BattleStats } from './stats';

export type BattleReport = {
  command: BattleCommand;
  seed: string;
  winner: Side | 'draw';
  durationMs: number;
  initialState: BattleStateSnapshot;
  finalState: BattleStateSnapshot;
  events: BattleEvent[];
  stats: BattleStats;
};
