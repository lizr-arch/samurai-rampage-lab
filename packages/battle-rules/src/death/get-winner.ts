import type { RuntimeUnitView, Side } from '@samurai-rampage/contracts';

export function getWinner(units: RuntimeUnitView[]): Side | 'draw' | null {
  const playerAlive = units.some((unit) => unit.side === 'player' && unit.alive);
  const enemyAlive = units.some((unit) => unit.side === 'enemy' && unit.alive);

  if (playerAlive && enemyAlive) return null;
  if (playerAlive) return 'player';
  if (enemyAlive) return 'enemy';
  return 'draw';
}
