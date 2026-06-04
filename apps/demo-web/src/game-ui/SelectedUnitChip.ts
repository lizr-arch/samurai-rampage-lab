import { BattleSide } from '../mock/mock-armies';

export interface SelectedUnitChipData {
  side: BattleSide;
  name: string;
  level: number;
  role: string;
  tag: string;
  count: number;
  maxCount: number;
}

interface SelectedUnitChipHandle {
  root: HTMLElement;
  update(data: SelectedUnitChipData | null): void;
}

export function createSelectedUnitChip(): SelectedUnitChipHandle {
  const root = document.createElement('aside');
  root.className = 'selected-unit-chip is-hidden';

  const title = document.createElement('div');
  title.className = 'selected-unit-chip__title';
  const name = document.createElement('strong');
  name.className = 'selected-unit-chip__name';
  const level = document.createElement('span');
  level.className = 'selected-unit-chip__level';
  title.append(name, level);

  const meta = document.createElement('p');
  meta.className = 'selected-unit-chip__meta';

  const count = document.createElement('p');
  count.className = 'selected-unit-chip__count';

  root.append(title, meta, count);

  return {
    root,
    update(data) {
      root.classList.remove('selected-unit-chip--blue', 'selected-unit-chip--red');

      if (!data) {
        root.classList.add('is-hidden');
        name.textContent = '';
        level.textContent = '';
        meta.textContent = '';
        count.textContent = '';
        return;
      }

      root.classList.remove('is-hidden');
      root.classList.add(`selected-unit-chip--${data.side}`);
      name.textContent = data.name;
      level.textContent = `Lv.${data.level}`;
      meta.textContent = `${data.tag} · ${data.role}`;
      count.textContent = `${data.count} / ${data.maxCount}`;
    },
  };
}
