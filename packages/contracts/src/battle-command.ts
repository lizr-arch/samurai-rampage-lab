import type { BattleContent } from './content-types';
import type { Formation } from './grid';

export type BattleCommand = {
  seed: string;
  playerFormation: Formation;
  enemyFormation: Formation;
  content: BattleContent;
  tickMs: number;
  maxDurationMs: number;
};
