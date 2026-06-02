import type { BattleEvent } from '@samurai-rampage/contracts';

export function formatBattleEvent(event: BattleEvent): string {
  switch (event.type) {
    case 'move':
      return `[${event.timeMs}] ${event.unitId} move (${event.from.x},${event.from.y}) -> (${event.to.x},${event.to.y})`;
    case 'attack':
      return `[${event.timeMs}] ${event.attackerId} attack ${event.targetId} damage=${event.damage}`;
    case 'damage':
      return `[${event.timeMs}] ${event.unitId} damage=${event.amount} hp=${event.hpAfter}`;
    case 'death':
      return `[${event.timeMs}] ${event.unitId} death`;
    case 'battle_end':
      return `[${event.timeMs}] battle_end winner=${event.winner}`;
    default:
      return `[${event.timeMs}] ${event.type}`;
  }
}
