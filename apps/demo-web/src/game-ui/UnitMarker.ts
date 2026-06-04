import { BattleSide, MockUnit } from '../mock/mock-armies';
import { createUnitSquad } from './UnitSquad';

interface UnitMarkerInput {
  side: BattleSide;
  unit: MockUnit;
  selected: boolean;
  onSelect: (unitId: string, side: BattleSide) => void;
}

interface UnitMarkerHandle {
  root: HTMLElement;
}

export function createUnitMarker(input: UnitMarkerInput): UnitMarkerHandle {
  const marker = document.createElement('div');
  marker.className = `unit-marker unit-marker--${input.side}`;
  marker.setAttribute('role', 'button');
  marker.tabIndex = 0;
  marker.dataset.unitId = input.unit.id;
  marker.dataset.unitLevel = String(input.unit.level);
  marker.dataset.unitSide = input.side;

  marker.addEventListener('click', () => input.onSelect(input.unit.id, input.side));
  marker.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    input.onSelect(input.unit.id, input.side);
  });

  const squad = createUnitSquad({
    side: input.side,
    hpRatio: input.unit.hp / input.unit.maxHp,
    level: input.unit.level,
    archetype: input.unit.archetype
  });
  marker.appendChild(squad.root);

  if (input.selected) {
    marker.classList.add('is-selected');
    squad.root.classList.add('is-selected');
  }

  return { root: marker };
}
