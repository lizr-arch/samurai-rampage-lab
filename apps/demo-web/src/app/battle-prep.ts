import { type BattleScale } from './deployment-mode';
import { type MockUnit, type UnitArchetype } from '../mock/mock-armies';

export type BattlePrepFailureReason = 'unit_cap' | 'prep_budget';

export interface BattlePrepState {
  fieldCount: number;
  maxUnits: number;
  spent: number;
  remaining: number;
  total: number;
  affordable: Record<UnitArchetype, boolean>;
}

const BATTLE_PREP_BUDGET: Record<BattleScale, number> = {
  '1v1': 20,
  '5v5': 24
};

export const UNIT_PREP_COST: Record<UnitArchetype, number> = {
  infantry: 2,
  spearman: 2,
  archer: 2,
  gunner: 3,
  cavalry: 4,
  ninja: 3
};

export const getBattlePrepBudget = (scale: BattleScale): number => BATTLE_PREP_BUDGET[scale];

export const getTroopPrepCost = (troop: MockUnit | UnitArchetype): number => {
  const archetype = typeof troop === 'string' ? troop : troop.archetype;
  return UNIT_PREP_COST[archetype];
};

export const getArmyPrepCost = (troops: MockUnit[]): number =>
  troops.reduce((sum, troop) => sum + getTroopPrepCost(troop), 0);

export const canAddTroop = (
  troops: MockUnit[],
  archetype: UnitArchetype,
  scale: BattleScale,
  maxUnits: number
): { allowed: true } | { allowed: false; reason: BattlePrepFailureReason } => {
  if (troops.length >= maxUnits) {
    return { allowed: false, reason: 'unit_cap' };
  }
  const remaining = getBattlePrepBudget(scale) - getArmyPrepCost(troops);
  if (remaining < getTroopPrepCost(archetype)) {
    return { allowed: false, reason: 'prep_budget' };
  }
  return { allowed: true };
};

export const createBattlePrepState = (
  troops: MockUnit[],
  scale: BattleScale,
  maxUnits: number,
  archetypes: UnitArchetype[]
): BattlePrepState => {
  const spent = getArmyPrepCost(troops);
  const total = getBattlePrepBudget(scale);
  const remaining = total - spent;
  return {
    fieldCount: troops.length,
    maxUnits,
    spent,
    remaining,
    total,
    affordable: Object.fromEntries(
      archetypes.map((archetype) => [archetype, canAddTroop(troops, archetype, scale, maxUnits).allowed])
    ) as Record<UnitArchetype, boolean>
  };
};
