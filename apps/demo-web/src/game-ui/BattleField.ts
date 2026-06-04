import { BattleSide, MockUnit, type UnitArchetype } from '../mock/mock-armies';
import { attachPlayerSquadDrag, resolveBattlefieldDrop, type SquadPosition } from './drag-player-squad';
import { createSelectedUnitChip, type SelectedUnitChipData } from './SelectedUnitChip';
import { createUnitMarker } from './UnitMarker';
import { projectBattlefieldUnit } from './battlefield-projection';

const BATTLEFIELD_BACKGROUND = '/assets/backgrounds/battlefield_forest_01.png';
const ZOOM_MIN = 1;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.15;

interface BattleFieldData {
  blueUnits: MockUnit[];
  redUnits: MockUnit[];
}

interface BattleFieldInput {
  data: BattleFieldData;
  deleteZones: Record<BattleSide, HTMLElement>;
  onUnitSelect: (unitId: string, side: BattleSide) => void;
  onUnitDragStart: (side: BattleSide, unitId: string, position: SquadPosition) => void;
  onUnitDragEnd: (result: {
    side: BattleSide;
    unitId: string;
    position: SquadPosition;
    committed: boolean;
    removed: boolean;
  }) => void;
}

interface BattleFieldHandle {
  root: HTMLElement;
  update(data: BattleFieldData): void;
  highlightUnit(selectedUnitId: string | null): void;
  setSelectedUnitChip(data: SelectedUnitChipData | null): void;
  setInfo(text: string): void;
  resolveTrayDeploy(
    side: BattleSide,
    archetype: UnitArchetype,
    clientX: number,
    clientY: number,
    blueUnits: MockUnit[],
    redUnits: MockUnit[]
  ): SquadPosition | null;
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
  deleteZone: HTMLElement,
  dragStart: (side: BattleSide, unitId: string, position: SquadPosition) => void,
  dragEnd: (result: { side: BattleSide; unitId: string; position: SquadPosition; committed: boolean; removed: boolean }) => void
): void {
  container.replaceChildren();
  for (const unit of units) {
    const marker = createUnitMarker({
      side,
      unit,
      selected: false,
      onSelect: onUnitSelect
    });
    marker.root.dataset.unitId = `${side}-${unit.id}`;
    marker.root.dataset.unitRole = unit.role;
    const projection = projectBattlefieldUnit(side, unit);
    marker.root.style.setProperty('--battle-x', `${projection.battleX}%`);
    marker.root.style.setProperty('--battle-y', `${projection.battleY}%`);
    marker.root.classList.toggle('is-frontline', isSkirmish(side, unit));
    attachPlayerSquadDrag({
      side,
      marker: marker.root,
      battlefield,
      deleteZone,
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
      }
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
  const zoomState = { scale: 1, translateX: 0, translateY: 0 };

  const root = document.createElement('section');
  root.className = 'battlefield';
  root.style.backgroundImage = `url(${JSON.stringify(BATTLEFIELD_BACKGROUND)})`;
  root.style.backgroundRepeat = 'no-repeat';
  root.style.backgroundPosition = 'center center';
  root.style.backgroundSize = 'cover';
  root.style.imageRendering = 'pixelated';
  root.tabIndex = 0;

  const viewport = document.createElement('div');
  viewport.className = 'battlefield-viewport';
  const canvas = document.createElement('div');
  canvas.className = 'battlefield-canvas';

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
  const zoomBadge = document.createElement('div');
  zoomBadge.className = 'battlefield-zoom-badge';

  function clampTranslate(axis: 'x' | 'y', value: number): number {
    const viewportSize = axis === 'x' ? root.clientWidth : root.clientHeight;
    const scaledSize = viewportSize * zoomState.scale;
    const min = Math.min(0, viewportSize - scaledSize);
    return Math.max(min, Math.min(0, value));
  }

  function applyViewportTransform(): void {
    zoomState.translateX = clampTranslate('x', zoomState.translateX);
    zoomState.translateY = clampTranslate('y', zoomState.translateY);
    canvas.style.transform = `translate(${zoomState.translateX}px, ${zoomState.translateY}px) scale(${zoomState.scale})`;
    zoomBadge.textContent = `x${zoomState.scale.toFixed(1)}`;
    root.classList.toggle('is-zoomed', zoomState.scale > 1);
  }

  function zoomAt(clientX: number, clientY: number, nextScale: number): void {
    const rect = root.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const contentX = (localX - zoomState.translateX) / zoomState.scale;
    const contentY = (localY - zoomState.translateY) / zoomState.scale;
    zoomState.scale = nextScale;
    zoomState.translateX = localX - contentX * nextScale;
    zoomState.translateY = localY - contentY * nextScale;
    applyViewportTransform();
  }

  root.addEventListener('wheel', (event: WheelEvent) => {
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    const nextScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Number((zoomState.scale + direction * ZOOM_STEP).toFixed(2))));
    if (nextScale !== zoomState.scale) {
      zoomAt(event.clientX, event.clientY, nextScale);
    }
  }, { passive: false });

  root.addEventListener('dblclick', (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('.unit-marker')) return;
    zoomState.scale = 1;
    zoomState.translateX = 0;
    zoomState.translateY = 0;
    applyViewportTransform();
  });

  root.addEventListener('mousedown', (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (event.button !== 0 || zoomState.scale <= 1 || target?.closest('.unit-marker')) {
      return;
    }
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startTranslateX = zoomState.translateX;
    const startTranslateY = zoomState.translateY;
    root.classList.add('is-panning');
    const handleMove = (moveEvent: MouseEvent): void => {
      zoomState.translateX = startTranslateX + (moveEvent.clientX - startX);
      zoomState.translateY = startTranslateY + (moveEvent.clientY - startY);
      applyViewportTransform();
    };
    const handleUp = (): void => {
      root.classList.remove('is-panning');
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  });

  renderSide('blue', input.data.blueUnits, input.onUnitSelect, blueGroup, viewport, dragZone, input.deleteZones.blue, input.onUnitDragStart, input.onUnitDragEnd);
  renderSide('red', input.data.redUnits, input.onUnitSelect, redGroup, viewport, dragZone, input.deleteZones.red, input.onUnitDragStart, input.onUnitDragEnd);
  canvas.append(blueGroup, center, redGroup);
  viewport.appendChild(canvas);
  root.append(viewport, dragZone, selectedUnitChip.root, zoomBadge);
  applyViewportTransform();

  return {
    root,
    setSelectedUnitChip(data) {
      selectedUnitChip.update(data);
    },
    setInfo(_text: string) {},
    update(next) {
      renderSide('blue', next.blueUnits, input.onUnitSelect, blueGroup, viewport, dragZone, input.deleteZones.blue, input.onUnitDragStart, input.onUnitDragEnd);
      renderSide('red', next.redUnits, input.onUnitSelect, redGroup, viewport, dragZone, input.deleteZones.red, input.onUnitDragStart, input.onUnitDragEnd);
      applyViewportTransform();
    },
    highlightUnit(selectedUnitId) {
      const markers = root.querySelectorAll<HTMLElement>('.unit-marker');
      for (const marker of Array.from(markers)) {
        marker.classList.toggle('is-selected', marker.dataset.unitId === selectedUnitId);
      }
    },
    resolveTrayDeploy(side, archetype, clientX, clientY, blueUnits, redUnits) {
      const sameSideUnits = side === 'blue' ? blueUnits : redUnits;
      return resolveBattlefieldDrop(side, `${side}-${archetype}-preview`, clientX, clientY, viewport, sameSideUnits);
    }
  };
}
