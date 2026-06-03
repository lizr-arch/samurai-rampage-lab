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

function unitIcon(side: BattleSide): string {
  return side === 'blue' ? '◢' : '◣';
}

function createUnitRow(
  unit: MockUnit,
  side: BattleSide,
  onUnitSelect: (unitId: string, side: BattleSide) => void
): HTMLElement {
  const row = document.createElement('button');
  row.type = 'button';
  row.className = 'army-unit';
  row.dataset.unitId = unit.id;
  row.dataset.side = side;

  const avatar = document.createElement('span');
  avatar.className = 'army-unit-avatar';
  avatar.textContent = unitIcon(side);

  const meta = document.createElement('div');
  meta.className = 'army-unit-meta';

  const header = document.createElement('div');
  header.className = 'army-unit-header';
  const name = document.createElement('strong');
  name.className = 'army-unit-name';
  name.textContent = unit.name;
  const level = document.createElement('span');
  level.className = 'army-unit-level';
  level.textContent = `Lv.${unit.level}`;
  header.append(name, level);

  const stats = document.createElement('div');
  stats.className = 'army-unit-stats';
  const count = document.createElement('span');
  count.className = 'army-unit-count';
  count.textContent = `${unit.count}/${unit.maxCount}`;
  const tag = document.createElement('span');
  tag.className = 'army-unit-tag';
  tag.textContent = `${unit.role}·${unit.tag}`;

  const hpWrap = document.createElement('div');
  hpWrap.className = 'army-unit-hp-wrap';
  const hp = document.createElement('div');
  hp.className = 'army-unit-hp';
  hp.style.width = `${Math.max(0, Math.min(100, (unit.hp / unit.maxHp) * 100))}%`;
  hpWrap.appendChild(hp);

  stats.append(count, tag);
  meta.append(header, stats, hpWrap);
  row.append(avatar, meta);
  row.addEventListener('click', () => onUnitSelect(unit.id, side));

  if (side === 'blue') {
    hp.style.setProperty('--army-hp-color', '#56e6ff');
  } else {
    hp.style.setProperty('--army-hp-color', '#ff6f7f');
  }

  return row;
}

export function createArmyPanel(input: ArmyPanelInput): ArmyPanelHandle {
  const panel = document.createElement('aside');
  panel.className = `army-panel army-panel--${input.side}`;

  const header = document.createElement('div');
  header.className = 'army-header';
  const portrait = document.createElement('div');
  portrait.className = 'army-portrait';
  portrait.textContent = input.side === 'blue' ? '将' : '将';
  const textWrap = document.createElement('div');
  textWrap.className = 'army-commander-wrap';
  const title = document.createElement('p');
  title.className = 'army-side-title';
  title.textContent = `${input.side === 'blue' ? '蓝方' : '红方'}军阵`;
  const commander = document.createElement('div');
  commander.className = 'army-commander';
  commander.textContent = input.data.commander;
  textWrap.append(title, commander);

  const list = document.createElement('div');
  list.className = 'army-list';
  panel.append(header, list);
  header.append(portrait, textWrap);

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
