import { type BattleSide, type UnitArchetype, UNIT_ARCHETYPE_ORDER, UNIT_LIBRARY } from '../mock/mock-armies';

interface StagingTrayInput {
  side: BattleSide;
  fieldCount: number;
  maxUnits: number;
  onDeployAttempt: (payload: { side: BattleSide; archetype: UnitArchetype; clientX: number; clientY: number }) => void;
}

interface StagingTrayHandle {
  root: HTMLElement;
  setFieldCount(count: number): void;
}

export function createStagingTray(input: StagingTrayInput): StagingTrayHandle {
  const root = document.createElement('section');
  root.className = `staging-tray staging-tray--${input.side}`;

  const titleRow = document.createElement('div');
  titleRow.className = 'staging-tray__header';
  const title = document.createElement('h3');
  title.className = 'staging-tray__title';
  title.textContent = input.side === 'blue' ? '蓝方出阵兵种' : '红方出阵兵种';
  const countLabel = document.createElement('span');
  countLabel.className = 'staging-tray__hint';
  titleRow.append(title, countLabel);

  const cards = document.createElement('div');
  cards.className = 'staging-tray__grid';

  function updateCountLabel(count: number): void {
    countLabel.textContent = `${count}/${input.maxUnits}`;
  }

  function createGhost(card: HTMLElement): HTMLElement {
    const ghost = card.cloneNode(true) as HTMLElement;
    ghost.classList.add('staging-card--ghost');
    ghost.style.position = 'fixed';
    ghost.style.pointerEvents = 'none';
    ghost.style.margin = '0';
    ghost.style.zIndex = '9999';
    document.body.appendChild(ghost);
    return ghost;
  }

  for (const archetype of UNIT_ARCHETYPE_ORDER) {
    const unit = UNIT_LIBRARY[archetype];
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'staging-card';
    card.dataset.unitId = archetype;
    card.title = '拖入本方战场部署';

    const icon = document.createElement('span');
    icon.className = 'staging-card__icon';
    icon.textContent = unit.tag === '前排' ? '◫' : unit.archetype === 'cavalry' ? '♞' : unit.archetype === 'ninja' ? '✦' : '✹';

    const name = document.createElement('strong');
    name.className = 'staging-card__name';
    name.textContent = unit.name.replace('队', '');

    const meta = document.createElement('span');
    meta.className = 'staging-card__meta';
    meta.textContent = `${unit.role} · ${unit.tag}`;

    const affordance = document.createElement('span');
    affordance.className = 'staging-card__affordance';
    affordance.textContent = '拖入战场';

    card.append(icon, name, meta, affordance);
    card.addEventListener('mousedown', (event: MouseEvent) => {
      if (event.button !== 0 || input.fieldCount >= input.maxUnits) {
        return;
      }
      event.preventDefault();
      const ghost = createGhost(card);
      const offsetX = 18;
      const offsetY = 18;
      ghost.style.left = `${event.clientX + offsetX}px`;
      ghost.style.top = `${event.clientY + offsetY}px`;
      root.classList.add('is-dragging-from-tray');

      const handleMove = (moveEvent: MouseEvent): void => {
        ghost.style.left = `${moveEvent.clientX + offsetX}px`;
        ghost.style.top = `${moveEvent.clientY + offsetY}px`;
      };

      const handleUp = (upEvent: MouseEvent): void => {
        root.classList.remove('is-dragging-from-tray');
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
        ghost.remove();
        input.onDeployAttempt({
          side: input.side,
          archetype,
          clientX: upEvent.clientX,
          clientY: upEvent.clientY
        });
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp, { once: true });
    });

    cards.appendChild(card);
  }

  updateCountLabel(input.fieldCount);
  root.append(titleRow, cards);

  return {
    root,
    setFieldCount(count) {
      input.fieldCount = count;
      updateCountLabel(count);
      root.classList.toggle('is-full', count >= input.maxUnits);
    }
  };
}
