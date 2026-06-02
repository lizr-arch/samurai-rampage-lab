export interface MiniMapHandle {
  root: HTMLElement;
}

export function createMiniMap(): MiniMapHandle {
  const root = document.createElement('div');
  root.className = 'minimap';

  const title = document.createElement('p');
  title.textContent = 'MiniMap';
  const map = document.createElement('div');
  map.className = 'minimap-canvas';
  const markerBlue = document.createElement('span');
  markerBlue.className = 'mini-marker mini-marker--blue';
  markerBlue.style.left = '22%';
  markerBlue.style.top = '46%';
  const markerRed = document.createElement('span');
  markerRed.className = 'mini-marker mini-marker--red';
  markerRed.style.left = '70%';
  markerRed.style.top = '52%';

  map.append(markerBlue, markerRed);
  root.append(title, map);
  return { root };
}

