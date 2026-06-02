import type { BattleCommand } from '@samurai-rampage/contracts';
import type { BattleState } from './battle-state';
import type { EventEmitter } from './event-emitter';

export type BattleContext = {
  command: BattleCommand;
  state: BattleState;
  events: EventEmitter;
};
