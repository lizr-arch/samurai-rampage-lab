import { type BattleSide, type MockUnit } from '../mock/mock-armies';
import { projectBattlefieldUnit } from './battlefield-projection';

interface MiniMapUnit {
  side: BattleSide;
  unit: MockUnit;
}

export interface MiniMapInput {
  units: MiniMapUnit[];
  selectedUnitId: string | null;
}

export interface MiniMapHandle {
  root: HTMLElement;
  update(input: MiniMapInput): void;
}

function toMiniMapPosition(percent: number, axis: 'x' | 'y'): number {
  return axis === 'x' ? 6 + percent * 0.88 : 10 + percent * 0.80;
}

export function createMiniMap(initial: MiniMapInput): MiniMapHandle {
  const root = document.createElement('div');
  root.className = 'minimap';

  const title = document.createElement('p');
  title.className = 'minimap-title';
  title.textContent = 'MiniMap';

  const map = document.createElement('div');
  map.className = 'minimap-canvas';

  const conflictBand = document.createElement('div');
  conflictBand.className = 'minimap-conflict-band';
  const centerLine = document.createElement('div');
  centerLine.className = 'minimap-center-line';
  const markersLayer = document.createElement('div');
  markersLayer.className = 'minimap-markers';

  map.append(conflictBand, centerLine, markersLayer);
  root.append(title, map);

  const update = (input: MiniMapInput): void => {
    markersLayer.replaceChildren();
    for (const entry of input.units) {
      const marker = document.createElement('span');
      const markerId = `${entry.side}-${entry.unit.id}`;
      const projection = projectBattlefieldUnit(entry.side, entry.unit);
      marker.className = `mini-marker mini-marker--${entry.side}`;
      marker.classList.toggle('is-selected', markerId === input.selectedUnitId);
      marker.style.left = `${toMiniMapPosition(projection.battleX, 'x')}%`;
      marker.style.top = `${toMiniMapPosition(projection.battleY, 'y')}%`;
      marker.title = `${entry.side === 'blue' ? '蓝方' : '红方'} ${entry.unit.name}`;
      markersLayer.appendChild(marker);
    }
  };

  update(initial);

  return {
    root,
    update
  };
}
