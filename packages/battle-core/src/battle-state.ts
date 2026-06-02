import {
  addDamage,
  addKill,
  asUnitId,
  createEmptyBattleStats,
  type BattleCommand,
  type BattleStateSnapshot,
  type BattleStats,
  type RuntimeUnitView,
  type UnitId
} from '@samurai-rampage/contracts';

export type ActiveUnit = RuntimeUnitView & {
  attackCooldownMs: number;
  damageDealt: number;
};

export type BattleState = {
  timeMs: number;
  units: ActiveUnit[];
  stats: BattleStats;
};

export function createInitialState(command: BattleCommand): BattleState {
  let index = 0;
  const units: ActiveUnit[] = [];

  for (const slot of [...command.playerFormation.slots, ...command.enemyFormation.slots]) {
    const def = command.content.units[String(slot.unitDefId)];
    if (!def) throw new Error(`Missing unit def: ${String(slot.unitDefId)}`);

    units.push({
      id: asUnitId(`${slot.side}_${index++}_${String(slot.unitDefId)}`),
      unitDefId: slot.unitDefId,
      weaponDefId: slot.weaponDefId,
      side: slot.side,
      pos: slot.pos,
      hp: def.baseStats.hp,
      maxHp: def.baseStats.hp,
      stats: { ...def.baseStats },
      alive: true,
      attackCooldownMs: 0,
      damageDealt: 0
    });
  }

  return {
    timeMs: 0,
    units,
    stats: createEmptyBattleStats()
  };
}

export function snapshotState(state: BattleState): BattleStateSnapshot {
  return {
    timeMs: state.timeMs,
    units: state.units.map((unit) => ({
      id: unit.id,
      unitDefId: unit.unitDefId,
      weaponDefId: unit.weaponDefId,
      side: unit.side,
      pos: { ...unit.pos },
      hp: unit.hp,
      maxHp: unit.maxHp,
      stats: { ...unit.stats },
      alive: unit.alive,
      damageDealt: unit.damageDealt
    }))
  };
}

export function recordDamage(state: BattleState, attackerId: UnitId, amount: number): void {
  const attacker = state.units.find((unit) => unit.id === attackerId);
  if (attacker) attacker.damageDealt += amount;
  addDamage(state.stats, attackerId, amount);
}

export function recordKill(state: BattleState, killerId: UnitId): void {
  addKill(state.stats, killerId);
}
