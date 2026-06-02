import type { BattleContent } from '@samurai-rampage/contracts';

export type ContentValidationIssue = {
  path: string;
  message: string;
};

export function validateBattleContentShape(content: BattleContent): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];

  for (const [id, unit] of Object.entries(content.units)) {
    if (String(unit.id) !== id) issues.push({ path: `units.${id}.id`, message: 'id mismatch' });
    if (unit.baseStats.hp <= 0) issues.push({ path: `units.${id}.baseStats.hp`, message: 'hp must be positive' });
  }

  for (const [id, weapon] of Object.entries(content.weapons)) {
    if (String(weapon.id) !== id) issues.push({ path: `weapons.${id}.id`, message: 'id mismatch' });
    if (weapon.cooldownMs <= 0) issues.push({ path: `weapons.${id}.cooldownMs`, message: 'cooldown must be positive' });
  }

  return issues;
}
