import { BattleSide, type UnitArchetype } from '../mock/mock-armies';

interface UnitSquadInput {
  side: BattleSide;
  hpRatio: number;
  level: number;
  archetype: UnitArchetype;
}

interface UnitSquadHandle {
  root: HTMLElement;
}

function normalizeRatio(hpRatio: number): number {
  if (!Number.isFinite(hpRatio)) {
    return 0.6;
  }
  return Math.max(0, Math.min(1, hpRatio));
}

export function createUnitSquad(input: UnitSquadInput): UnitSquadHandle {
  const squad = document.createElement('div');
  squad.className = `unit-squad unit-squad--${input.side} unit-squad--${input.archetype}`;

  const flag = document.createElement('div');
  flag.className = 'unit-squad__flag';
  flag.setAttribute('aria-hidden', 'true');

  const hp = document.createElement('div');
  hp.className = 'unit-squad__hp';
  const hpFill = document.createElement('span');
  hpFill.className = 'unit-squad__hp-fill';
  hpFill.style.width = `${normalizeRatio(input.hpRatio) * 100}%`;
  hp.appendChild(hpFill);

  const level = document.createElement('span');
  level.className = 'unit-squad__level';
  level.textContent = String(input.level);

  const body = document.createElement('div');
  body.className = 'unit-squad__body';
  const sprite = document.createElement('div');
  sprite.className = 'unit-squad__sprite';
  sprite.setAttribute('aria-hidden', 'true');
  body.appendChild(sprite);

  squad.append(flag, hp, level, body);

  return { root: squad };
}
