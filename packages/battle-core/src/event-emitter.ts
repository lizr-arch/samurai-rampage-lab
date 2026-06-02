import type { BattleEvent } from '@samurai-rampage/contracts';

export class EventEmitter {
  private readonly events: BattleEvent[] = [];

  emit(event: BattleEvent): void {
    this.events.push(event);
  }

  all(): BattleEvent[] {
    return [...this.events];
  }
}
