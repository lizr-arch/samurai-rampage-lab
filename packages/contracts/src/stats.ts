import type { UnitId } from './ids';

export type UnitStats = {
  hp: number;
  atk: number;
  def: number;
  range: number;
  attackSpeed: number;
  moveSpeed: number;
};

export type BattleStats = {
  damageByUnit: Record<string, number>;
  killsByUnit: Record<string, number>;
};

export function createEmptyBattleStats(): BattleStats {
  return {
    damageByUnit: {},
    killsByUnit: {}
  };
}

export function addDamage(stats: BattleStats, unitId: UnitId, amount: number): void {
  const key = String(unitId);
  stats.damageByUnit[key] = (stats.damageByUnit[key] ?? 0) + amount;
}

export function addKill(stats: BattleStats, unitId: UnitId): void {
  const key = String(unitId);
  stats.killsByUnit[key] = (stats.killsByUnit[key] ?? 0) + 1;
}
