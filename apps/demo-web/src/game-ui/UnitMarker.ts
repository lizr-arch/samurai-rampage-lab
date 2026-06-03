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

const SQUAD_DOTS = 8;

function makeSquad(unit: MockUnit, side: BattleSide): HTMLElement {
  const squad = document.createElement('div');
  squad.className = `unit-squad unit-squad--${side}`;
  const alive = Math.max(0, Math.round((unit.count / unit.maxCount) * SQUAD_DOTS));
  for (let i = 0; i < SQUAD_DOTS; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'unit-soldier';
    if (i >= alive) {
      dot.classList.add('unit-soldier--wounded');
    }
    squad.appendChild(dot);
  }
  return squad;
}

export function createUnitMarker(input: UnitMarkerInput): UnitMarkerHandle {
  const marker = document.createElement('button');
  marker.type = 'button';
  marker.className = `unit-marker unit-marker--${input.side} unit-marker--squad`;
  marker.dataset.unitId = input.unit.id;
  marker.dataset.side = input.side;

  const top = document.createElement('div');
  top.className = 'unit-top';
  const emblem = document.createElement('span');
  emblem.className = 'unit-emblem';
  emblem.textContent = input.side === 'blue' ? '◈' : '◉';
  const name = document.createElement('span');
  name.className = 'unit-name';
  name.textContent = input.unit.name;
  const level = document.createElement('span');
  level.className = 'unit-level';
  level.textContent = `Lv.${input.unit.level}`;
  top.append(emblem, name, level);

  const role = document.createElement('p');
  role.className = 'unit-role';
  role.textContent = input.unit.tag;

  const count = document.createElement('span');
  count.className = 'unit-count';
  count.textContent = `${input.unit.count}/${input.unit.maxCount}`;

  const hpWrap = document.createElement('div');
  hpWrap.className = 'unit-hp-wrap';
  const hp = document.createElement('div');
  hp.className = 'unit-hp';
  hp.style.width = `${Math.max(0, Math.min(100, (input.unit.hp / input.unit.maxHp) * 100))}%`;
  hpWrap.appendChild(hp);

  const hpText = document.createElement('span');
  hpText.className = 'unit-hp-text';
  hpText.textContent = `${input.unit.hp}/${input.unit.maxHp}`;

  const squad = makeSquad(input.unit, input.side);
  const dmg = document.createElement('span');
  dmg.className = 'unit-dmg';
  dmg.textContent = `-${Math.max(0, (input.unit.maxHp - input.unit.hp) * 3).toFixed(0)}`;

  if (input.selected) marker.classList.add('is-selected');
  marker.append(top, role, count, hpWrap, hpText, squad, dmg);
  marker.addEventListener('click', () => input.onSelect(input.unit.id, input.side));

  const syncSquad = (unit: MockUnit): void => {
    squad.replaceChildren(
      ...Array.from({ length: SQUAD_DOTS }).map((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'unit-soldier';
        if (index >= Math.round((unit.count / unit.maxCount) * SQUAD_DOTS)) {
          dot.classList.add('unit-soldier--wounded');
        }
        return dot;
      })
    );
  };

  return {
    root: marker,
    setSelected: (selected) => {
      marker.classList.toggle('is-selected', selected);
    },
    update: (next) => {
      name.textContent = next.name;
      role.textContent = next.tag;
      level.textContent = `Lv.${next.level}`;
      count.textContent = `${next.count}/${next.maxCount}`;
      hp.style.width = `${Math.max(0, Math.min(100, (next.hp / next.maxHp) * 100))}%`;
      hpText.textContent = `${next.hp}/${next.maxHp}`;
      dmg.textContent = `-${Math.max(0, (next.maxHp - next.hp) * 3).toFixed(0)}`;
      syncSquad(next);
    }
  };
}
