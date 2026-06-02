import { describe, expect, it } from 'vitest';
import { asUnitDefId, asUnitId, asWeaponDefId, type RuntimeUnitView, type WeaponDef } from '@samurai-rampage/contracts';
import { calculateDamage } from './calculate-damage';

function unit(id: string, atk: number, def: number): RuntimeUnitView {
  return {
    id: asUnitId(id),
    unitDefId: asUnitDefId('ashigaru'),
    weaponDefId: asWeaponDefId('sword_basic'),
    side: 'player',
    pos: { x: 0, y: 0 },
    hp: 100,
    maxHp: 100,
    stats: { hp: 100, atk, def, range: 1, attackSpeed: 1, moveSpeed: 1 },
    alive: true
  };
}

describe('calculateDamage', () => {
  it('never returns less than 1 damage', () => {
    const weapon: WeaponDef = {
      id: asWeaponDefId('sword_basic'),
      name: 'test sword',
      type: 'sword',
      rangeBonus: 0,
      atkBonus: 0,
      cooldownMs: 1000
    };

    expect(calculateDamage(unit('a', 1, 0), unit('b', 1, 999), weapon).amount).toBe(1);
  });
});
