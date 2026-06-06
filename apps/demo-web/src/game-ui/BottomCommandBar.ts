import { BattleSpeed } from '../mock/mock-battle-events';
import { type BattleSide, type MockUnit } from '../mock/mock-armies';
import { createMiniMap } from './MiniMap';
import { type CommanderUiModel } from './commander-types';

interface BottomCommandInput {
  speed: BattleSpeed;
  blueUnits: MockUnit[];
  redUnits: MockUnit[];
  selectedUnitId: string | null;
  commanderUi: CommanderUiModel;
  onPause: () => void;
  onPlay: () => void;
  onFastForward: () => void;
  onTactic: (name: string) => void;
  onBannerHover: (bannerOrderId: string | null) => void;
  onBannerToggle: (bannerOrderId: string) => void;
  onClickOrder: (commandItemId: string) => void;
}

interface BottomCommandHandle {
  root: HTMLElement;
  setSpeed(speed: BattleSpeed): void;
  setFormationLabel(label: string): void;
  setMiniMapUnits(units: { side: BattleSide; unit: MockUnit }[]): void;
  setMiniMapSelection(selectedUnitId: string | null): void;
  setCommanderUi(commanderUi: CommanderUiModel): void;
}

function createPixelButton(
  label: string,
  icon: string,
  onClick: () => void,
  extraClass: string = ''
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `pixel-btn ${extraClass}`;

  const iconEl = document.createElement('span');
  iconEl.className = 'pixel-btn-icon';
  iconEl.textContent = icon;

  const labelEl = document.createElement('span');
  labelEl.className = 'pixel-btn-label';
  labelEl.textContent = label;

  button.append(iconEl, labelEl);
  button.addEventListener('click', onClick);
  return button;
}

export function createBottomCommandBar(input: BottomCommandInput): BottomCommandHandle {
  const root = document.createElement('footer');
  root.className = 'bottom-command';
  let currentSelectedUnitId = input.selectedUnitId;
  let currentCommanderUi = input.commanderUi;

  const miniPanel = document.createElement('section');
  miniPanel.className = 'bottom-mini';
  let miniMapUnits = [
    ...input.blueUnits.map((unit) => ({ side: 'blue' as const, unit })),
    ...input.redUnits.map((unit) => ({ side: 'red' as const, unit }))
  ];
  const miniMap = createMiniMap({
    units: miniMapUnits,
    selectedUnitId: currentSelectedUnitId
  });
  miniPanel.appendChild(miniMap.root);

  const controls = document.createElement('div');
  controls.className = 'battle-controls';

  const row1 = document.createElement('div');
  row1.className = 'battle-action-row';
  const pause = createPixelButton('暂停', 'Ⅱ', input.onPause);
  const play = createPixelButton('播放', '▶', input.onPlay, 'pixel-btn--play');
  const ff = createPixelButton('快进', '➤', input.onFastForward);
  const speed = document.createElement('span');
  speed.className = 'battle-speed';
  speed.textContent = input.speed;
  row1.append(pause, play, ff, speed);

  const row2 = document.createElement('div');
  row2.className = 'battle-tactic-row';
  const commanderSummary = document.createElement('div');
  commanderSummary.className = 'order-bar-summary';
  const commanderName = document.createElement('strong');
  commanderName.className = 'order-bar-commander';
  const bannerCount = document.createElement('span');
  bannerCount.className = 'order-bar-banners';
  commanderSummary.append(commanderName, bannerCount);
  const orderActions = document.createElement('div');
  orderActions.className = 'order-bar-actions';
  const bannerTooltip = document.createElement('div');
  bannerTooltip.className = 'banner-tooltip';
  bannerTooltip.style.display = 'none';
  const formationLabel = document.createElement('span');
  formationLabel.className = 'battle-formation-label';
  const tactics: Array<[string, string]> = [['阵形', '◈']];
  for (const [label, icon] of tactics) {
    row2.append(createPixelButton(label, icon, () => input.onTactic(label), 'pixel-btn--tactic'));
  }
  const orderButtons = new Map<string, HTMLButtonElement>();

  function renderCommanderUi(commanderUi: CommanderUiModel): void {
    currentCommanderUi = commanderUi;
    const commander = commanderUi.commanders.find((candidate) => candidate.id === commanderUi.selectedCommanderId);
    commanderName.textContent = commander?.name ?? '—';
    const cmdBanners = commander ? (commanderUi.commanderBanners[commander.id] ?? 0) : 0;
    const maxB = commander?.maxBanners ?? 0;
    bannerCount.textContent = `令旗 ${cmdBanners} / ${maxB}`;
    orderActions.replaceChildren();
    orderButtons.clear();
    const nowMs = commanderUi.nowMs;
    if (!commander) return;

    // 点击型军令
    for (const item of commander.commandItems) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'order-btn order-btn--click';
      btn.dataset.orderId = item.id;

      const icon = document.createElement('span');
      icon.className = 'order-btn-icon order-btn-icon--click';
      icon.textContent = '⚡';
      const name = document.createElement('span');
      name.className = 'order-btn-name';
      name.textContent = item.name;

      btn.append(icon, name);

      const showTip = () => {
        bannerTooltip.innerHTML = `
          <div class="banner-tooltip__title">⚡ ${item.name}</div>
          <div class="banner-tooltip__stats">点击即生效 · ${item.description}</div>
        `;
        bannerTooltip.style.display = 'block';
        requestAnimationFrame(() => {
          const rootRect = root.getBoundingClientRect();
          const btnRect = btn.getBoundingClientRect();
          bannerTooltip.style.left = `${btnRect.left - rootRect.left + btnRect.width / 2}px`;
          bannerTooltip.style.top = `${btnRect.top - rootRect.top - bannerTooltip.offsetHeight - 8}px`;
        });
      };
      const hideTip = () => { bannerTooltip.style.display = 'none'; };
      btn.addEventListener('mouseenter', showTip);
      btn.addEventListener('mouseleave', hideTip);
      btn.addEventListener('click', () => input.onClickOrder(item.id));
      orderActions.appendChild(btn);
    }

    // 投放型军旗
    for (const order of commander.banners) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'order-btn';
      button.dataset.orderId = order.id;

      const cooldownUntil = commanderUi.bannerCooldowns[order.id] ?? 0;
      const remainingMs = Math.max(0, cooldownUntil - nowMs);
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      const notEnough = cmdBanners < order.cost;

      button.classList.toggle('is-active', commanderUi.armedBannerOrderId === order.id);
      button.classList.toggle('is-cooldown', remainingMs > 0);
      button.classList.toggle('is-disabled', notEnough);

      const icon = document.createElement('span');
      icon.className = 'order-btn-icon';
      icon.textContent = '⚑';
      const name = document.createElement('span');
      name.className = 'order-btn-name';
      name.textContent = order.name;

      button.append(icon, name);

      if (remainingMs > 0) {
        const cdBadge = document.createElement('span');
        cdBadge.className = 'order-btn-cd';
        cdBadge.textContent = `${remainingSeconds}s`;
        button.appendChild(cdBadge);
      }

      const showTip = () => {
        bannerTooltip.innerHTML = `
          <div class="banner-tooltip__title">${order.shortName} ${order.name}</div>
          <div class="banner-tooltip__stats">范围 ${order.radiusPx}px · 消耗 ${order.cost} · CD ${Math.round(order.cooldownMs / 1000)}s</div>
          <div class="banner-tooltip__desc">${order.description}</div>
        `;
        bannerTooltip.style.display = 'block';
        requestAnimationFrame(() => {
          const rootRect = root.getBoundingClientRect();
          const btnRect = button.getBoundingClientRect();
          bannerTooltip.style.left = `${btnRect.left - rootRect.left + btnRect.width / 2}px`;
          bannerTooltip.style.top = `${btnRect.top - rootRect.top - bannerTooltip.offsetHeight - 8}px`;
        });
      };
      const hideTip = () => { bannerTooltip.style.display = 'none'; };

      button.addEventListener('mouseenter', showTip);
      button.addEventListener('mouseleave', hideTip);
      button.addEventListener('focus', showTip);
      button.addEventListener('blur', hideTip);
      button.addEventListener('click', () => input.onBannerToggle(order.id));
      orderButtons.set(order.id, button);
      orderActions.appendChild(button);
    }
  }

  formationLabel.textContent = '锋矢阵';
  row2.append(commanderSummary, orderActions, formationLabel);

  controls.append(row1, row2);
  root.append(miniPanel, controls, bannerTooltip);
  renderCommanderUi(currentCommanderUi);

  return {
    root,
    setSpeed: (nextSpeed: BattleSpeed) => {
      speed.textContent = nextSpeed;
    },
    setFormationLabel: (label: string) => {
      formationLabel.textContent = label;
    },
    setMiniMapUnits: (units) => {
      miniMapUnits = units;
      miniMap.update({
        units,
        selectedUnitId: currentSelectedUnitId
      });
    },
    setMiniMapSelection: (selectedUnitId) => {
      currentSelectedUnitId = selectedUnitId;
      miniMap.update({
        units: miniMapUnits,
        selectedUnitId
      });
    },
    setCommanderUi: (commanderUi) => {
      renderCommanderUi(commanderUi);
    }
  };
}
