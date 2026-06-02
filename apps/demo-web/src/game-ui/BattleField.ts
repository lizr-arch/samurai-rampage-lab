import { BattleSide, MockUnit } from '../mock/mock-armies';
import { createUnitMarker } from './UnitMarker';

interface BattleFieldData {
  blueUnits: MockUnit[];
  redUnits: MockUnit[];
}

interface BattleFieldInput {
  data: BattleFieldData;
  onUnitSelect: (unitId: string, side: BattleSide) => void;
}

interface BattleFieldHandle {
  root: HTMLElement;
  update(data: BattleFieldData): void;
  highlightUnit(unitId: string | null): void;
  setInfo(text: string): void;
}

function renderSide(
  side: BattleSide,
  units: MockUnit[],
  onUnitSelect: (unitId: string, side: BattleSide) => void,
  container: HTMLElement
): void {
  container.replaceChildren();
  units.forEach((unit) => {
    const marker = createUnitMarker({
      side,
      unit,
      selected: false,
      onSelect: onUnitSelect
    });
    marker.root.dataset.unitId = `${side}-${unit.id}`;
    container.appendChild(marker.root);
  });
}

export function createBattleField(input: BattleFieldInput): BattleFieldHandle {
  const root = document.createElement('section');
  root.className = 'battlefield';

  const blueGroup = document.createElement('div');
  blueGroup.className = 'battlefield-side battlefield-side--blue';
  const redGroup = document.createElement('div');
  redGroup.className = 'battlefield-side battlefield-side--red';
  const center = document.createElement('section');
  center.className = 'battle-center';

  const clash = document.createElement('h2');
  clash.className = 'battle-center-title';
  clash.textContent = '激突';

  const damageA = document.createElement('div');
  damageA.className = 'battle-damage battle-damage--blue';
  damageA.textContent = '-187';
  const damageB = document.createElement('div');
  damageB.className = 'battle-damage battle-damage--red';
  damageB.textContent = '-255';
  const tooltip = document.createElement('p');
  tooltip.className = 'battle-tooltip';
  tooltip.textContent = '点击部队可查看信息';

  center.append(clash, damageA, damageB, tooltip);
  root.append(blueGroup, center, redGroup);

  renderSide('blue', input.data.blueUnits, input.onUnitSelect, blueGroup);
  renderSide('red', input.data.redUnits, input.onUnitSelect, redGroup);

  return {
    root,
    setInfo: (text) => {
      tooltip.textContent = text;
    },
    update: (next) => {
      renderSide('blue', next.blueUnits, input.onUnitSelect, blueGroup);
      renderSide('red', next.redUnits, input.onUnitSelect, redGroup);
    },
    highlightUnit: (unitId) => {
      const markers = root.querySelectorAll<HTMLElement>('.unit-marker');
      for (const marker of Array.from(markers)) {
        marker.classList.toggle('is-selected', marker.dataset.unitId === `blue-${unitId}` || marker.dataset.unitId === `red-${unitId}`);
      }
      if (unitId) {
        const selected = root.querySelector<HTMLElement>(`[data-unit-id="blue-${unitId}"], [data-unit-id="red-${unitId}"]`);
        if (selected) {
          const text = selected.textContent ? selected.textContent.replace(/\s+/g, ' ').trim() : '';
          tooltip.textContent = `选中单位: ${text}`;
        }
      } else {
        tooltip.textContent = '点击部队可查看信息';
      }
    }
  };
}

