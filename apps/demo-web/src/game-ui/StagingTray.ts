import { type BattlePrepState, getTroopPrepCost } from '../app/battle-prep';
import { type BattleSide, type UnitArchetype, UNIT_ARCHETYPE_ORDER, UNIT_LIBRARY } from '../mock/mock-armies';

interface StagingTrayInput {
  side: BattleSide;
  prepState: BattlePrepState;
  onDeployAttempt: (payload: { side: BattleSide; archetype: UnitArchetype; clientX: number; clientY: number }) => void;
}

interface StagingTrayHandle {
  root: HTMLElement;
  updatePrepState(state: BattlePrepState): void;
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
  const prepLabel = document.createElement('span');
  prepLabel.className = 'staging-tray__prep';
  titleRow.append(title, countLabel);
  root.append(titleRow, prepLabel);

  const cards = document.createElement('div');
  cards.className = 'staging-tray__grid';

  function updateHeader(state: BattlePrepState): void {
    countLabel.textContent = `${state.fieldCount}/${state.maxUnits}`;
    prepLabel.textContent = `军备 ${state.spent}/${state.total} · 余 ${state.remaining}`;
    root.classList.toggle('is-full', state.fieldCount >= state.maxUnits);
    root.classList.toggle('is-over-budget', state.remaining <= 0);
  }

  function createGhost(card: HTMLElement, archetype: UnitArchetype): HTMLElement {
    const unit = UNIT_LIBRARY[archetype];
    const ghost = document.createElement('div');
    ghost.className = 'troop-deploy-ghost';
    ghost.style.position = 'fixed';
    ghost.style.pointerEvents = 'none';
    ghost.style.zIndex = '9999';

    const icon = document.createElement('span');
    icon.className = 'troop-deploy-ghost__icon';
    icon.textContent = card.querySelector('.staging-card__icon')?.textContent ?? '◫';

    const name = document.createElement('span');
    name.className = 'troop-deploy-ghost__name';
    name.textContent = unit.name;

    ghost.append(icon, name);
    document.body.appendChild(ghost);
    return ghost;
  }

  const cardsByArchetype = new Map<UnitArchetype, HTMLButtonElement>();

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

    const cost = document.createElement('span');
    cost.className = 'staging-card__cost';
    cost.textContent = `${getTroopPrepCost(archetype)} 点`;

    const affordance = document.createElement('span');
    affordance.className = 'staging-card__affordance';
    affordance.textContent = '拖入战场';

    card.append(icon, name, meta, cost, affordance);
    card.addEventListener('mousedown', (event: MouseEvent) => {
      if (event.button !== 0 || card.disabled) {
        return;
      }
      event.preventDefault();
      const ghost = createGhost(card, archetype);
      ghost.style.left = `${event.clientX}px`;
      ghost.style.top = `${event.clientY}px`;
      root.classList.add('is-dragging-from-tray');

      const handleMove = (moveEvent: MouseEvent): void => {
        ghost.style.left = `${moveEvent.clientX}px`;
        ghost.style.top = `${moveEvent.clientY}px`;
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
    cardsByArchetype.set(archetype, card);
  }

  root.append(cards);

  function updatePrepState(state: BattlePrepState): void {
    input.prepState = state;
    updateHeader(state);
    for (const archetype of UNIT_ARCHETYPE_ORDER) {
      const card = cardsByArchetype.get(archetype);
      if (!card) continue;
      const allowed = state.affordable[archetype];
      card.disabled = !allowed;
      card.classList.toggle('is-disabled', !allowed);
    }
  }

  updatePrepState(input.prepState);

  return {
    root,
    updatePrepState
  };
}
