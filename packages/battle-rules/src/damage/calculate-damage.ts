import type { RuntimeUnitView, WeaponDef } from '@samurai-rampage/contracts';

export type DamageResult = {
  amount: number;
};

export function calculateDamage(
  attacker: RuntimeUnitView,
  defender: RuntimeUnitView,
  weapon: WeaponDef
): DamageResult {
  const raw = attacker.stats.atk + weapon.atkBonus;
  const mitigation = Math.floor(defender.stats.def * 0.5);
  return { amount: Math.max(1, raw - mitigation) };
}
