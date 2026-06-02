import {
  clampToGrid,
  samePos,
  type GridPos,
  type GridSize,
  type RuntimeUnitView
} from '@samurai-rampage/contracts';

export function advanceTowardsTarget(
  actor: RuntimeUnitView,
  target: RuntimeUnitView,
  occupied: GridPos[],
  grid: GridSize
): GridPos {
  const dx = Math.sign(target.pos.x - actor.pos.x);
  const dy = Math.sign(target.pos.y - actor.pos.y);

  const candidates: GridPos[] = [
    { x: actor.pos.x + dx, y: actor.pos.y },
    { x: actor.pos.x, y: actor.pos.y + dy }
  ];

  for (const candidate of candidates) {
    const next = clampToGrid(candidate, grid);
    if (samePos(next, actor.pos)) continue;
    if (occupied.some((pos) => samePos(pos, next))) continue;
    return next;
  }

  return actor.pos;
}
