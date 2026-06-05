import { describe, expect, it } from 'vitest';
import {
  canAddTroop,
  createBattlePrepState,
  getArmyPrepCost,
  getBattlePrepBudget,
  UNIT_PREP_COST
} from '../../apps/demo-web/src/app/battle-prep';
import { type MockUnit } from '../../apps/demo-web/src/mock/mock-armies';

const makeTroop = (id: string, archetype: MockUnit['archetype']): MockUnit => ({
  id,
  archetype,
  name: id,
  count: 100,
  maxCount: 100,
  hp: 80,
  maxHp: 100,
  level: 1,
  role: '测试',
  tag: archetype === 'gunner' || archetype === 'ninja' ? '支援' : archetype === 'archer' ? '远程' : archetype === 'cavalry' ? '突击' : '前排',
  slotX: 0.2,
  slotY: 0.3
});

describe('battle prep gameplay rules', () => {
  it('tracks spent and remaining prep for the current lineup', () => {
    const troops = [makeTroop('i', 'infantry'), makeTroop('c', 'cavalry'), makeTroop('g', 'gunner')];
    const state = createBattlePrepState(troops, '1v1', 8, ['infantry', 'spearman', 'archer', 'gunner', 'cavalry', 'ninja']);

    expect(getBattlePrepBudget('1v1')).toBe(20);
    expect(getArmyPrepCost(troops)).toBe(
      UNIT_PREP_COST.infantry + UNIT_PREP_COST.cavalry + UNIT_PREP_COST.gunner
    );
    expect(state.spent).toBe(9);
    expect(state.remaining).toBe(11);
    expect(state.affordable.cavalry).toBe(true);
  });

  it('blocks deployment when the side is at unit cap or out of prep budget', () => {
    const capTroops = Array.from({ length: 8 }, (_, index) => makeTroop(`cap-${index}`, 'infantry'));
    expect(canAddTroop(capTroops, 'archer', '1v1', 8)).toEqual({
      allowed: false,
      reason: 'unit_cap'
    });

    const budgetTroops = [
      makeTroop('c1', 'cavalry'),
      makeTroop('c2', 'cavalry'),
      makeTroop('c3', 'cavalry'),
      makeTroop('n1', 'ninja'),
      makeTroop('g1', 'gunner'),
      makeTroop('i1', 'infantry')
    ];
    expect(getArmyPrepCost(budgetTroops)).toBe(20);
    expect(canAddTroop(budgetTroops, 'infantry', '1v1', 8)).toEqual({
      allowed: false,
      reason: 'prep_budget'
    });
  });
});
