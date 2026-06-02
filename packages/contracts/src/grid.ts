import type { Side, UnitDefId, WeaponDefId } from './ids';

export type GridPos = {
  x: number;
  y: number;
};

export type GridSize = {
  width: number;
  height: number;
};

export type FormationSlot = {
  unitDefId: UnitDefId;
  weaponDefId: WeaponDefId;
  side: Side;
  pos: GridPos;
};

export type Formation = {
  grid: GridSize;
  slots: FormationSlot[];
};

export function samePos(a: GridPos, b: GridPos): boolean {
  return a.x === b.x && a.y === b.y;
}

export function manhattan(a: GridPos, b: GridPos): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function clampToGrid(pos: GridPos, grid: GridSize): GridPos {
  return {
    x: Math.max(0, Math.min(grid.width - 1, pos.x)),
    y: Math.max(0, Math.min(grid.height - 1, pos.y))
  };
}
