import {
  advanceTowardsTarget,
  calculateDamage,
  getWeaponRange,
  getWinner,
  selectNearestTarget
} from '@samurai-rampage/battle-rules';
import { manhattan, samePos, type Side } from '@samurai-rampage/contracts';
import type { BattleContext } from './battle-context';
import { recordDamage, recordKill } from './battle-state';
import { attackIntervalMs } from './scheduler';

export function stepBattle(ctx: BattleContext): Side | 'draw' | null {
  const { command, state } = ctx;
  state.timeMs += command.tickMs;

  for (const actor of state.units) {
    if (!actor.alive) continue;
    actor.attackCooldownMs = Math.max(0, actor.attackCooldownMs - command.tickMs);

    const targetId = selectNearestTarget(actor, state.units);
    if (!targetId) continue;

    const target = state.units.find((unit) => unit.id === targetId && unit.alive);
    if (!target) continue;

    const weapon = command.content.weapons[String(actor.weaponDefId)];
    if (!weapon) throw new Error(`Missing weapon def: ${String(actor.weaponDefId)}`);

    const range = getWeaponRange(actor, weapon);
    const distance = manhattan(actor.pos, target.pos);

    if (distance > range) {
      const from = { ...actor.pos };
      const occupied = state.units.filter((unit) => unit.alive).map((unit) => unit.pos);
      const to = advanceTowardsTarget(actor, target, occupied, command.playerFormation.grid);
      actor.pos = to;

      if (!samePos(from, to)) {
        ctx.events.emit({ timeMs: state.timeMs, type: 'move', unitId: actor.id, from, to });
      }
      continue;
    }

    if (actor.attackCooldownMs > 0) continue;

    const damage = calculateDamage(actor, target, weapon).amount;
    actor.attackCooldownMs = attackIntervalMs(actor.stats.attackSpeed, weapon.cooldownMs);

    ctx.events.emit({
      timeMs: state.timeMs,
      type: 'attack',
      attackerId: actor.id,
      targetId: target.id,
      damage
    });

    target.hp = Math.max(0, target.hp - damage);
    recordDamage(state, actor.id, damage);

    ctx.events.emit({
      timeMs: state.timeMs,
      type: 'damage',
      unitId: target.id,
      amount: damage,
      hpAfter: target.hp
    });

    if (target.hp <= 0 && target.alive) {
      target.alive = false;
      recordKill(state, actor.id);
      ctx.events.emit({ timeMs: state.timeMs, type: 'death', unitId: target.id, killerId: actor.id });
    }
  }

  return getWinner(state.units);
}
