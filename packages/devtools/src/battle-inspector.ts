import type { BattleReport } from '@samurai-rampage/contracts';

export function summarizeBattle(report: BattleReport): string {
  return [
    `winner: ${report.winner}`,
    `durationMs: ${report.durationMs}`,
    `events: ${report.events.length}`,
    `damageByUnit: ${JSON.stringify(report.stats.damageByUnit)}`
  ].join('\n');
}
