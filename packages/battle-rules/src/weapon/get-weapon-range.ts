import type { RuntimeUnitView, WeaponDef } from '@samurai-rampage/contracts';

export function getWeaponRange(unit: RuntimeUnitView, weapon: WeaponDef): number {
  return Math.max(1, unit.stats.range + weapon.rangeBonus);
}
