import { BattleSide, MockUnit, type UnitArchetype } from '../mock/mock-armies';
import { attachPlayerSquadDrag, resolveBattlefieldDrop, type SquadPosition } from './drag-player-squad';
import { type BannerPlacementPreview, type PlacedBanner, type UnitCommandState } from './banner-types';
import { createBannerPlacementOverlay } from './BannerPlacementOverlay';
import { createClashFx } from './createClashFx';
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
  onPlacementHover: (position: { x: number; y: number } | null) => void;
  onPlacementConfirm: (position: { x: number; y: number }) => void;
  onPlacementCancel: () => void;
}

interface BattleFieldHandle {
  root: HTMLElement;
  update(data: BattleFieldData): void;
  highlightUnit(selectedUnitId: string | null): void;
  setBannerPreviewTargets(unitIds: string[]): void;
  setUnitCommandStates(states: UnitCommandState[]): void;
  setPlacementArmed(active: boolean): void;
  setBannerPlacementPreview(preview: BannerPlacementPreview | null): void;
  setPlacedBanners(banners: PlacedBanner[]): void;
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

export function createBattleField(input: BattleFieldInput): BattleFieldHandle {
  const zoomState = { scale: 1, translateX: 0, translateY: 0 };
  let currentPreviewTargets = new Set<string>();
  let currentCommandStates: UnitCommandState[] = [];
  let placementMode = false;

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
  const placementOverlay = createBannerPlacementOverlay();

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
    if (placementMode) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('.unit-marker')) return;
    zoomState.scale = 1;
    zoomState.translateX = 0;
    zoomState.translateY = 0;
    applyViewportTransform();
  });

  root.addEventListener('mousedown', (event: MouseEvent) => {
    if (placementMode) return;
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

  renderSide('blue', input.data.blueUnits, input.onUnitSelect, blueGroup, root, dragZone, input.deleteZones.blue, input.onUnitDragStart, input.onUnitDragEnd);
  renderSide('red', input.data.redUnits, input.onUnitSelect, redGroup, root, dragZone, input.deleteZones.red, input.onUnitDragStart, input.onUnitDragEnd);
  canvas.append(blueGroup, center, redGroup);
  viewport.appendChild(canvas);
  root.append(viewport, placementOverlay.root, dragZone, selectedUnitChip.root, zoomBadge);
  applyViewportTransform();

  function resolvePlacementPosition(clientX: number, clientY: number): { x: number; y: number } | null {
    const rect = root.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      return null;
    }
    return {
      x: ((clientX - rect.left) / rect.width) * 1920,
      y: ((clientY - rect.top) / rect.height) * 1080
    };
  }

  root.addEventListener('mousemove', (event: MouseEvent) => {
    if (!placementMode) return;
    input.onPlacementHover(resolvePlacementPosition(event.clientX, event.clientY));
  });
  root.addEventListener('mouseleave', () => {
    if (!placementMode) return;
    input.onPlacementHover(null);
  });
  root.addEventListener('click', (event: MouseEvent) => {
    if (!placementMode) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('.unit-marker')) {
      event.preventDefault();
      event.stopPropagation();
    }
    const position = resolvePlacementPosition(event.clientX, event.clientY);
    if (!position) return;
    input.onPlacementConfirm(position);
  });
  root.addEventListener('contextmenu', (event: MouseEvent) => {
    if (!placementMode) return;
    event.preventDefault();
    input.onPlacementCancel();
  });
  root.addEventListener('keydown', (event: KeyboardEvent) => {
    if (!placementMode || event.key !== 'Escape') return;
    event.preventDefault();
    input.onPlacementCancel();
  });

  function syncOrderPresentation(): void {
    const markers = root.querySelectorAll<HTMLElement>('.unit-marker');
    for (const marker of Array.from(markers)) {
      const markerUnitId = marker.dataset.unitId ?? '';
      const rawUnitId = markerUnitId.startsWith('blue-') ? markerUnitId.slice(5) : markerUnitId.startsWith('red-') ? markerUnitId.slice(4) : markerUnitId;
      marker.classList.toggle('is-banner-preview-target', currentPreviewTargets.has(rawUnitId));
      // 移除旧标签，渲染持久命令状态
      marker.querySelector('.order-cmd-state')?.remove();
      const cs = currentCommandStates.find((c) => c.unitId === rawUnitId);
      if (!cs) continue;
      const flagEl = document.createElement('div');
      flagEl.className = `order-cmd-state order-cmd-state--${cs.commandType === 'charge' ? 'advance' : 'rest'}`;
      flagEl.innerHTML = `<span class="order-cmd-state__label">${cs.label}</span>`;
      marker.appendChild(flagEl);
    }
  }
  syncOrderPresentation();

  return {
    root,
    setSelectedUnitChip(data) {
      selectedUnitChip.update(data);
    },
    setInfo(_text: string) {},
    update(next) {
      renderSide('blue', next.blueUnits, input.onUnitSelect, blueGroup, root, dragZone, input.deleteZones.blue, input.onUnitDragStart, input.onUnitDragEnd);
      renderSide('red', next.redUnits, input.onUnitSelect, redGroup, root, dragZone, input.deleteZones.red, input.onUnitDragStart, input.onUnitDragEnd);
      applyViewportTransform();
      syncOrderPresentation();
    },
    highlightUnit(selectedUnitId) {
      const markers = root.querySelectorAll<HTMLElement>('.unit-marker');
      for (const marker of Array.from(markers)) {
        marker.classList.toggle('is-selected', marker.dataset.unitId === selectedUnitId);
      }
      syncOrderPresentation();
    },
    setBannerPreviewTargets(unitIds) {
      currentPreviewTargets = new Set(unitIds);
      syncOrderPresentation();
    },
    setUnitCommandStates(states) {
      currentCommandStates = states;
      syncOrderPresentation();
    },
    setPlacementArmed(active) {
      placementMode = active;
      root.classList.toggle('is-banner-placement-mode', active);
      if (!active) {
        placementOverlay.setPreview(null);
      }
    },
    setBannerPlacementPreview(preview) {
      placementOverlay.setPreview(preview);
    },
    setPlacedBanners(banners) {
      placementOverlay.setPlacedBanners(banners);
    },
    resolveTrayDeploy(side, archetype, clientX, clientY, blueUnits, redUnits) {
      const sameSideUnits = side === 'blue' ? blueUnits : redUnits;
      return resolveBattlefieldDrop(side, `${side}-${archetype}-preview`, clientX, clientY, viewport, sameSideUnits);
    }
  };
}
