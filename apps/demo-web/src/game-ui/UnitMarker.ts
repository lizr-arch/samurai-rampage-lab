import { BattleSide, MockUnit } from '../mock/mock-armies';

interface UnitMarkerInput {
  side: BattleSide;
  unit: MockUnit;
  selected: boolean;
  onSelect: (unitId: string, side: BattleSide) => void;
}

export interface UnitMarkerHandle {
  root: HTMLElement;
  setSelected(selected: boolean): void;
  update(unit: MockUnit): void;
}

export function createUnitMarker(input: UnitMarkerInput): UnitMarkerHandle {
  const marker = document.createElement('button');
  marker.type = 'button';
  marker.className = `unit-marker unit-marker--${input.side}`;
  marker.dataset.unitId = input.unit.id;
  marker.dataset.side = input.side;

  const icon = document.createElement('span');
  icon.className = 'unit-icon';
  icon.textContent = input.side === 'blue' ? '⚔' : '🛡';

  const rank = document.createElement('span');
  rank.className = 'unit-rank';
  rank.textContent = String(input.unit.level);

  const label = document.createElement('span');
  label.className = 'unit-label';
  label.textContent = `${input.unit.name}`;

  const role = document.createElement('span');
  role.className = 'unit-role';
  role.textContent = input.unit.tag;

  const hpWrap = document.createElement('div');
  hpWrap.className = 'unit-hp-wrap';
  const hp = document.createElement('div');
  hp.className = 'unit-hp';
  hp.style.width = `${Math.max(0, Math.min(100, (input.unit.hp / input.unit.maxHp) * 100))}%`;
  hpWrap.appendChild(hp);

  const dmg = document.createElement('span');
  dmg.className = 'unit-dmg';
  dmg.textContent = `-${Math.max(0, (input.unit.maxHp - input.unit.hp) * 3).toFixed(0)}`;
  if (input.selected) marker.classList.add('is-selected');
  marker.append(icon, rank, label, role, hpWrap, dmg);
  marker.addEventListener('click', () => input.onSelect(input.unit.id, input.side));

  return {
    root: marker,
    setSelected: (selected) => {
      marker.classList.toggle('is-selected', selected);
    },
    update: (next) => {
      label.textContent = `${next.name}`;
      role.textContent = next.tag;
      rank.textContent = String(next.level);
      hp.style.width = `${Math.max(0, Math.min(100, (next.hp / next.maxHp) * 100))}%`;
      dmg.textContent = `-${Math.max(0, (next.maxHp - next.hp) * 3).toFixed(0)}`;
    }
  };
}

