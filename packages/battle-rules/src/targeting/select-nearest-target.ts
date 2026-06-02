import { manhattan, type RuntimeUnitView, type UnitId } from '@samurai-rampage/contracts';

export function selectNearestTarget(
  actor: RuntimeUnitView,
  units: RuntimeUnitView[]
): UnitId | null {
  let best: RuntimeUnitView | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const unit of units) {
    if (!unit.alive || unit.side === actor.side) continue;
    const distance = manhattan(actor.pos, unit.pos);
    if (distance < bestDistance) {
      best = unit;
      bestDistance = distance;
    }
  }

  return best?.id ?? null;
}
