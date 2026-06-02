import type { GridPos } from './grid';
import type { Side, UnitDefId, UnitId, WeaponDefId } from './ids';
import type { UnitStats } from './stats';

export type RuntimeUnitView = {
  id: UnitId;
  unitDefId: UnitDefId;
  weaponDefId: WeaponDefId;
  side: Side;
  pos: GridPos;
  hp: number;
  maxHp: number;
  stats: UnitStats;
  alive: boolean;
};

export type UnitSnapshot = RuntimeUnitView & {
  damageDealt: number;
};

export type BattleStateSnapshot = {
  timeMs: number;
  units: UnitSnapshot[];
};
