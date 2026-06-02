import { BattleSide, MockArmySide, MockUnit } from '../mock/mock-armies';

interface ArmyPanelInput {
  side: BattleSide;
  data: MockArmySide;
  onUnitSelect: (unitId: string, side: BattleSide) => void;
}

interface ArmyPanelHandle {
  root: HTMLElement;
  update(data: MockArmySide): void;
  highlight(unitId: string | null): void;
}

function createUnitRow(unit: MockUnit, side: BattleSide, onUnitSelect: (unitId: string, side: BattleSide) => void): HTMLElement {
  const row = document.createElement('button');
  row.type = 'button';
  row.className = 'army-unit';
  row.dataset.unitId = unit.id;
  row.dataset.side = side;

  const avatar = document.createElement('span');
  avatar.className = 'army-unit-avatar';
  avatar.textContent = '◈';

  const meta = document.createElement('div');
  meta.className = 'army-unit-meta';

  const name = document.createElement('strong');
  name.className = 'army-unit-name';
  name.textContent = `${unit.name} · Lv.${unit.level}`;

  const count = document.createElement('span');
  count.className = 'army-unit-count';
  count.textContent = `${unit.count} / ${unit.maxCount}`;

  const tag = document.createElement('span');
  tag.className = 'army-unit-tag';
  tag.textContent = unit.tag;

  const hpWrap = document.createElement('div');
  hpWrap.className = 'army-unit-hp-wrap';
  const hp = document.createElement('div');
  hp.className = 'army-unit-hp';
  hp.style.width = `${Math.max(0, Math.min(100, (unit.hp / unit.maxHp) * 100))}%`;
  hpWrap.appendChild(hp);

  meta.append(name, count, tag, hpWrap);
  row.append(avatar, meta);
  row.addEventListener('click', () => onUnitSelect(unit.id, side));

  if (side === 'blue') {
    hp.style.setProperty('--hp-color', '#56e8ff');
  } else {
    hp.style.setProperty('--hp-color', '#ff6f7f');
  }

  return row;
}

export function createArmyPanel(
  input: ArmyPanelInput
): ArmyPanelHandle {
  const panel = document.createElement('aside');
  panel.className = `army-panel army-panel--${input.side}`;
  panel.dataset.side = input.side;

  const header = document.createElement('div');
  header.className = 'army-header';
  const portrait = document.createElement('div');
  portrait.className = 'army-portrait';
  portrait.textContent = input.side === 'blue' ? '将 领' : '将 领';
  const commander = document.createElement('div');
  commander.className = 'army-commander';
  commander.textContent = input.data.commander;

  const title = document.createElement('p');
  title.className = 'army-title';
  title.textContent = `${input.side === 'blue' ? '蓝军' : '红军'}军阵`;

  const list = document.createElement('div');
  list.className = 'army-list';
  panel.append(header, title, list);
  header.append(portrait, commander);

  function render(units: MockUnit[]): void {
    list.replaceChildren();
    for (const unit of units) {
      list.appendChild(createUnitRow(unit, input.side, input.onUnitSelect));
    }
  }

  render(input.data.troops);

  return {
    root: panel,
    update: (next) => {
      commander.textContent = next.commander;
      render(next.troops);
    },
    highlight: (selectedUnitId) => {
      const buttons = list.querySelectorAll<HTMLButtonElement>('.army-unit');
      for (const btn of Array.from(buttons)) {
        btn.classList.toggle('is-selected', btn.dataset.unitId === selectedUnitId);
      }
    }
  };
}

