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
  units.forEach((unit, index) => {
    const marker = createUnitMarker({
      side,
      unit,
      selected: false,
      onSelect: onUnitSelect
    });
    marker.root.dataset.unitId = `${side}-${unit.id}`;
    const advance = Math.min(160, 24 + index * 18);
    marker.root.style.setProperty('--adv', side === 'blue' ? `${advance}px` : `-${advance}px`);
    container.appendChild(marker.root);
  });
}

function createClashOverlay(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'battlefield-glow';

  const arcLeft = document.createElement('div');
  arcLeft.className = 'battle-line battle-line--slash battle-line--left';
  const arcRight = document.createElement('div');
  arcRight.className = 'battle-line battle-line--slash battle-line--right';
  const arrow = document.createElement('div');
  arrow.className = 'battle-line battle-line--arrow';
  const line = document.createElement('div');
  line.className = 'battle-midline';
  const clash = document.createElement('div');
  clash.className = 'battle-clash-ring';

  overlay.append(arcLeft, arcRight, arrow, line, clash);
  return overlay;
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

  const clashTitle = document.createElement('h2');
  clashTitle.className = 'battle-center-title';
  clashTitle.textContent = '激  突';

  const phase = document.createElement('p');
  phase.className = 'battle-center-phase';
  phase.textContent = '阵线压制 · 冲锋';

  const damageWrap = document.createElement('div');
  damageWrap.className = 'battle-damage-wrap';

  const damageA = document.createElement('div');
  damageA.className = 'battle-damage battle-damage--blue';
  damageA.textContent = '-187';

  const damageB = document.createElement('div');
  damageB.className = 'battle-damage battle-damage--red';
  damageB.textContent = '-255';

  const tooltip = document.createElement('p');
  tooltip.className = 'battle-tooltip';
  tooltip.textContent = '点击部队可查看信息';

  damageWrap.append(damageA, damageB);
  center.append(createClashOverlay(), clashTitle, phase, damageWrap, tooltip);
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
        marker.classList.toggle(
          'is-selected',
          marker.dataset.unitId === `blue-${unitId}` || marker.dataset.unitId === `red-${unitId}`
        );
      }
      if (unitId) {
        const selected = root.querySelector<HTMLElement>(
          `[data-unit-id="blue-${unitId}"], [data-unit-id="red-${unitId}"]`
        );
        if (selected) {
          const name = selected.querySelector<HTMLElement>('.unit-name')?.textContent ?? '未知部队';
          const hp = selected.querySelector<HTMLElement>('.unit-hp-text')?.textContent ?? '';
          tooltip.textContent = `选中单位: ${name} (${hp})`;
        }
      } else {
        tooltip.textContent = '点击部队可查看信息';
      }
    }
  };
}
