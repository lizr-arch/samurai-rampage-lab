import type { GridPos } from './grid';
import type { Side, UnitId } from './ids';

export type BaseBattleEvent = {
  timeMs: number;
};

export type MoveEvent = BaseBattleEvent & {
  type: 'move';
  unitId: UnitId;
  from: GridPos;
  to: GridPos;
};

export type AttackEvent = BaseBattleEvent & {
  type: 'attack';
  attackerId: UnitId;
  targetId: UnitId;
  damage: number;
};

export type DamageEvent = BaseBattleEvent & {
  type: 'damage';
  unitId: UnitId;
  amount: number;
  hpAfter: number;
};

export type HealEvent = BaseBattleEvent & {
  type: 'heal';
  unitId: UnitId;
  amount: number;
  hpAfter: number;
};

export type BuffAppliedEvent = BaseBattleEvent & {
  type: 'buff_applied';
  unitId: UnitId;
  buffId: string;
};

export type DeathEvent = BaseBattleEvent & {
  type: 'death';
  unitId: UnitId;
  killerId?: UnitId;
};

export type BattleEndEvent = BaseBattleEvent & {
  type: 'battle_end';
  winner: Side | 'draw';
};

export type BattleEvent =
  | MoveEvent
  | AttackEvent
  | DamageEvent
  | HealEvent
  | BuffAppliedEvent
  | DeathEvent
  | BattleEndEvent;
