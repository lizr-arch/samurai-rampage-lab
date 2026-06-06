import { type Commander } from './commander-types';

interface CommanderSelectInput {
  commanders: Commander[];
  selectedCommanderId: string;
  isOpen: boolean;
  onSelect: (commanderId: string) => void;
  /** 触发元素的 DOM 引用，用于计算浮层位置 */
  triggerEl?: HTMLElement | null;
}

interface CommanderSelectHandle {
  root: HTMLElement;
  portalHost: HTMLElement;
  update(input: CommanderSelectInput): void;
}

export function createCommanderSelect(
  portalHost: HTMLElement,
  input: CommanderSelectInput
): CommanderSelectHandle {
  const root = document.createElement('div');
  root.className = 'commander-select';

  const cards = document.createElement('div');
  cards.className = 'commander-select-cards';
  root.appendChild(cards);
  portalHost.appendChild(root);

  let current = input;

  function positionPanel(): void {
    if (!current.triggerEl || !current.isOpen) return;
    const gameFrame = portalHost.closest('.game-frame') as HTMLElement;
    if (!gameFrame) return;
    const gfRect = gameFrame.getBoundingClientRect();
    const scale = gameFrame.offsetWidth / (gfRect.width || 1);

    let left = 0;
    let top = 0;
    let el: HTMLElement | null = current.triggerEl;
    while (el && el !== gameFrame) {
      left += el.offsetLeft;
      top += el.offsetTop;
      el = el.offsetParent as HTMLElement | null;
    }
    root.style.left = `${left}px`;
    root.style.top = `${top + current.triggerEl.offsetHeight}px`;
  }

  function renderCards(): void {
    cards.replaceChildren();
    for (const candidate of current.commanders) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'commander-card';
      card.dataset.commanderId = candidate.id;
      card.classList.toggle('is-selected', candidate.id === current.selectedCommanderId);

      if (candidate.portraitUrl) {
        const avatar = document.createElement('img');
        avatar.className = 'commander-card-avatar';
        avatar.src = candidate.portraitUrl;
        avatar.alt = candidate.name;
        avatar.width = 48;
        avatar.height = 48;
        card.appendChild(avatar);
      }

      const body = document.createElement('div');
      body.className = 'commander-card-body';

      const name = document.createElement('strong');
      name.className = 'commander-card-name';
      name.textContent = candidate.name;

      const title = document.createElement('span');
      title.className = 'commander-card-title';
      title.textContent = candidate.title;

      const tags = document.createElement('div');
      tags.className = 'commander-card-tags';
      tags.textContent = candidate.styleTags.join(' · ');

      const items = document.createElement('div');
      items.className = 'commander-card-items';
      items.textContent = [
        ...candidate.commandItems.map((ci) => ci.name),
        ...candidate.banners.map((b) => b.name)
      ].join(' / ');

      const desc = document.createElement('p');
      desc.className = 'commander-card-desc';
      desc.textContent = candidate.description;

      body.append(name, title, tags, items, desc);
      card.appendChild(body);

      card.addEventListener('click', () => current.onSelect(candidate.id));
      cards.appendChild(card);
    }
  }

  function applyOpen(open: boolean): void {
    root.classList.toggle('is-open', open);
    if (open) {
      renderCards();
      positionPanel();
    }
  }

  applyOpen(input.isOpen);

  return {
    root,
    portalHost,
    update: (next) => {
      current = next;
      applyOpen(next.isOpen);
    }
  };
}
