export type Brand<T, TBrand extends string> = T & { readonly __brand: TBrand };

export type UnitId = Brand<string, 'UnitId'>;
export type UnitDefId = Brand<string, 'UnitDefId'>;
export type WeaponDefId = Brand<string, 'WeaponDefId'>;
export type SkillDefId = Brand<string, 'SkillDefId'>;

export type Side = 'player' | 'enemy';

export function asUnitId(value: string): UnitId {
  return value as UnitId;
}

export function asUnitDefId(value: string): UnitDefId {
  return value as UnitDefId;
}

export function asWeaponDefId(value: string): WeaponDefId {
  return value as WeaponDefId;
}

export function asSkillDefId(value: string): SkillDefId {
  return value as SkillDefId;
}
