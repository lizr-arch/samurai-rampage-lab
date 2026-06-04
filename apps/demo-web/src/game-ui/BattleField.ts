import { BattleSide, MockUnit } from '../mock/mock-armies';
import { attachPlayerSquadDrag, toBattleX, toBattleY, toRedBattleX, type SquadPosition } from './drag-player-squad';
import { createSelectedUnitChip, type SelectedUnitChipData } from './SelectedUnitChip';
import { createUnitMarker } from './UnitMarker';

const BATTLEFIELD_BACKGROUND = '/assets/backgrounds/battlefield_forest_01.png';

interface BattleFieldData {
  blueUnits: MockUnit[];
  redUnits: MockUnit[];
}

interface BattleFieldInput {
  data: BattleFieldData;
  onUnitSelect: (unitId: string, side: BattleSide) => void;
  onUnitDragStart: (side: BattleSide, unitId: string, position: SquadPosition) => void;
  onUnitDragEnd: (result: { side: BattleSide; unitId: string; position: SquadPosition; committed: boolean }) => void;
}

interface BattleFieldHandle {
  root: HTMLElement;
  update(data: BattleFieldData): void;
  highlightUnit(selectedUnitId: string | null): void;
  setSelectedUnitChip(data: SelectedUnitChipData | null): void;
  setInfo(text: string): void;
}

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  return Math.max(0, Math.min(1, value));
}

function isSkirmish(side: BattleSide, unit: MockUnit): boolean {
  if (unit.role === '远击' || unit.tag === '支援') return false;
  return clamp(unit.slotX) > 0.6;
}

function renderSide(
  side: BattleSide,
  units: MockUnit[],
  onUnitSelect: (unitId: string, side: BattleSide) => void,
  container: HTMLElement,
  battlefield: HTMLElement,
  dragZone: HTMLElement,
  dragStart: (side: BattleSide, unitId: string, position: SquadPosition) => void,
  dragEnd: (result: { side: BattleSide; unitId: string; position: SquadPosition; committed: boolean }) => void
): void {
  container.replaceChildren();
  for (const unit of units) {
    const marker = createUnitMarker({
      side,
      unit,
      selected: false,
      onSelect: onUnitSelect,
    });
    marker.root.dataset.unitId = `${side}-${unit.id}`;
    marker.root.dataset.unitRole = unit.role;
    marker.root.style.setProperty(
      '--battle-x',
      `${side === 'blue' ? toBattleX(unit.slotX, unit.id) : toRedBattleX(unit.slotX, unit.id)}%`
    );
    marker.root.style.setProperty('--battle-y', `${toBattleY(unit.slotY, unit.id)}%`);
    marker.root.classList.toggle('is-frontline', isSkirmish(side, unit));
    attachPlayerSquadDrag({
      side,
      marker: marker.root,
      battlefield,
      unit,
      otherSideUnits: units.filter((candidate) => candidate.id !== unit.id),
      onSelect: (unitId) => onUnitSelect(unitId, side),
      onDragStart: dragStart,
      onDragEnd: dragEnd,
      setDragZoneState: (state) => {
        dragZone.dataset.state = state;
        dragZone.dataset.side = side;
        battlefield.classList.toggle('is-dragging-player', state !== 'idle');
        battlefield.classList.toggle('is-drag-invalid', state === 'invalid');
        battlefield.dataset.dragSide = state === 'idle' ? '' : side;
      },
    });
    container.appendChild(marker.root);
  }
}

function createClashFx(): HTMLElement {
  const root = document.createElement('div');
  root.className = 'battlefield-combat-fx';

  const slashBlue = document.createElement('div');
  slashBlue.className = 'battle-arc battle-arc--blue';
  const slashRed = document.createElement('div');
  slashRed.className = 'battle-arc battle-arc--red';
  const arrowBlue = document.createElement('div');
  arrowBlue.className = 'battle-arrow battle-arrow--blue';
  const arrowRed = document.createElement('div');
  arrowRed.className = 'battle-arrow battle-arrow--red';
  const clashCore = document.createElement('div');
  clashCore.className = 'battle-clash-core';
  const sparks = document.createElement('div');
  sparks.className = 'battle-sparks';
  const s1 = document.createElement('span');
  s1.className = 'battle-spark battle-spark--a';
  const s2 = document.createElement('span');
  s2.className = 'battle-spark battle-spark--b';
  const s3 = document.createElement('span');
  s3.className = 'battle-spark battle-spark--c';
  const trail1 = document.createElement('div');
  trail1.className = 'battle-trail battle-trail--left';
  const trail2 = document.createElement('div');
  trail2.className = 'battle-trail battle-trail--right';
  const trail3 = document.createElement('div');
  trail3.className = 'battle-trail battle-trail--center';

  const hitA = document.createElement('div');
  hitA.className = 'battle-damage battle-damage--blue';
  hitA.textContent = '-187';
  const hitB = document.createElement('div');
  hitB.className = 'battle-damage battle-damage--red';
  hitB.textContent = '-255';
  const hitC = document.createElement('div');
  hitC.className = 'battle-damage battle-damage--mid';
  hitC.textContent = '-96';
  const title = document.createElement('h2');
  title.className = 'battle-center-title';
  title.textContent = '激突';

  const clashRoad = document.createElement('div');
  clashRoad.className = 'battle-road';
  const cross1 = document.createElement('div');
  cross1.className = 'battle-cross battle-cross--left';
  const cross2 = document.createElement('div');
  cross2.className = 'battle-cross battle-cross--right';

  sparks.append(s1, s2, s3);
  root.append(clashRoad, cross1, cross2, slashBlue, slashRed, arrowBlue, arrowRed, trail1, trail2, trail3, clashCore, sparks, hitA, hitB, hitC, title);
  return root;
}

export function createBattleField(input: BattleFieldInput): BattleFieldHandle {
  const root = document.createElement('section');
  root.className = 'battlefield';
  root.style.backgroundImage = `url(${JSON.stringify(BATTLEFIELD_BACKGROUND)})`;
  root.style.backgroundRepeat = 'no-repeat';
  root.style.backgroundPosition = 'center center';
  root.style.backgroundSize = 'cover';
  root.style.imageRendering = 'pixelated';

  const blueGroup = document.createElement('div');
  blueGroup.className = 'battlefield-side battlefield-side--blue';
  const redGroup = document.createElement('div');
  redGroup.className = 'battlefield-side battlefield-side--red';
  const dragZone = document.createElement('div');
  dragZone.className = 'battlefield-drag-zone';
  dragZone.dataset.state = 'idle';
  dragZone.dataset.side = 'blue';

  const center = document.createElement('section');
  center.className = 'battle-center';
  center.append(createClashFx());

  const selectedUnitChip = createSelectedUnitChip();

  renderSide('blue', input.data.blueUnits, input.onUnitSelect, blueGroup, root, dragZone, input.onUnitDragStart, input.onUnitDragEnd);
  renderSide('red', input.data.redUnits, input.onUnitSelect, redGroup, root, dragZone, input.onUnitDragStart, input.onUnitDragEnd);
  root.append(dragZone, blueGroup, center, redGroup, selectedUnitChip.root);

  return {
    root,
    setSelectedUnitChip(data) {
      selectedUnitChip.update(data);
    },
    setInfo(_text: string) {},
    update(next) {
      renderSide('blue', next.blueUnits, input.onUnitSelect, blueGroup, root, dragZone, input.onUnitDragStart, input.onUnitDragEnd);
      renderSide('red', next.redUnits, input.onUnitSelect, redGroup, root, dragZone, input.onUnitDragStart, input.onUnitDragEnd);
    },
    highlightUnit(selectedUnitId) {
      const markers = root.querySelectorAll<HTMLElement>('.unit-marker');
      for (const marker of Array.from(markers)) {
        marker.classList.toggle('is-selected', marker.dataset.unitId === selectedUnitId);
      }
    },
  };
}
