import {
  type BattleCommand,
  type BattleReport,
  type Side
} from '@samurai-rampage/contracts';
import { type BattleContext } from './battle-context';
import { createInitialState, snapshotState } from './battle-state';
import { EventEmitter } from './event-emitter';
import { stepBattle } from './battle-loop';

export function runBattle(command: BattleCommand): BattleReport {
  const state = createInitialState(command);
  const initialState = snapshotState(state);
  const events = new EventEmitter();
  const ctx: BattleContext = { command, state, events };

  let winner: Side | 'draw' | null = null;

  while (state.timeMs < command.maxDurationMs) {
    winner = stepBattle(ctx);
    if (winner) break;
  }

  if (!winner) winner = 'draw';
  events.emit({ timeMs: state.timeMs, type: 'battle_end', winner });

  return {
    command,
    seed: command.seed,
    winner,
    durationMs: state.timeMs,
    initialState,
    finalState: snapshotState(state),
    events: events.all(),
    stats: state.stats
  };
}
