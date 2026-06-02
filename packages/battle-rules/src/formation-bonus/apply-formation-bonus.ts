import type { RuntimeUnitView } from '@samurai-rampage/contracts';

export function applyFormationBonus(units: RuntimeUnitView[]): RuntimeUnitView[] {
  return units.map((unit) => {
    if (unit.pos.y === 0) {
      return {
        ...unit,
        stats: {
          ...unit.stats,
          def: unit.stats.def + 2
        }
      };
    }
    return unit;
  });
}
