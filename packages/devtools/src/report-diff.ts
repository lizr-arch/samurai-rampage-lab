import type { BattleReport } from '@samurai-rampage/contracts';

export function diffBattleWinners(a: BattleReport, b: BattleReport): string | null {
  if (a.winner === b.winner) return null;
  return `winner changed: ${a.winner} -> ${b.winner}`;
}
