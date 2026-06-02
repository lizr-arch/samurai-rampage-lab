import type { SkillDefId, UnitDefId, WeaponDefId } from './ids';
import type { UnitStats } from './stats';

export type WeaponType = 'sword' | 'spear' | 'bow' | 'rifle' | 'fan' | 'hammer';

export type UnitDef = {
  id: UnitDefId;
  name: string;
  baseStats: UnitStats;
  allowedWeapons: WeaponType[];
  tags: string[];
};

export type WeaponDef = {
  id: WeaponDefId;
  name: string;
  type: WeaponType;
  rangeBonus: number;
  atkBonus: number;
  cooldownMs: number;
};

export type SkillDef = {
  id: SkillDefId;
  name: string;
  description: string;
  tags: string[];
};

export type BattleContent = {
  units: Record<string, UnitDef>;
  weapons: Record<string, WeaponDef>;
  skills: Record<string, SkillDef>;
};
