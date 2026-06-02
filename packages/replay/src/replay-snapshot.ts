import type { BattleReport, BattleStateSnapshot } from '@samurai-rampage/contracts';

export function getInitialSnapshot(report: BattleReport): BattleStateSnapshot {
  return report.initialState;
}

export function getFinalSnapshot(report: BattleReport): BattleStateSnapshot {
  return report.finalState;
}
