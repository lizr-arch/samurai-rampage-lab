import { BattleSide, MockArmySide } from '../mock/mock-armies';

type UpdateHudInput = {
  blue: MockArmySide;
  red: MockArmySide;
  battleTime: string;
};

interface TopHudHandle {
  root: HTMLElement;
  update(input: UpdateHudInput): void;
}

interface SideHudData {
  commander: string;
  score: number;
  morale: number;
  moraleMax: number;
}

function createFactionPart(side: BattleSide): HTMLElement {
  const section = document.createElement('section');
  section.className = `top-hud-faction top-hud-faction--${side}`;

  const identity = document.createElement('div');
  identity.className = 'top-hud-identity';
  const badge = document.createElement('span');
  badge.className = 'top-hud-badge';
  badge.textContent = side === 'blue' ? '藍' : '赤';

  const commander = document.createElement('p');
  commander.className = 'top-hud-commander';
  const scoreRow = document.createElement('p');
  scoreRow.className = 'top-hud-score';
  const scoreLabel = document.createElement('span');
  scoreLabel.className = 'top-hud-score-label';
  scoreLabel.textContent = 'SCORE';
  const scoreValue = document.createElement('strong');
  scoreValue.className = 'top-hud-score-value';
  scoreRow.append(scoreLabel, scoreValue);

  identity.append(badge, commander);

  const moraleRow = document.createElement('div');
  moraleRow.className = 'top-hud-morale';
  const moraleText = document.createElement('p');
  moraleText.className = 'top-hud-morale-text';
  const moraleBar = document.createElement('div');
  moraleBar.className = 'top-hud-morale-track';
  const moraleFill = document.createElement('div');
  moraleFill.className = 'top-hud-morale-fill';
  moraleBar.appendChild(moraleFill);

  moraleRow.append(moraleText, moraleBar);
  section.append(identity, scoreRow, moraleRow);
  section.setAttribute('data-score-value', `${side}-score-value`);
  section.setAttribute('data-commander', `${side}-commander`);
  return section;
}

function syncSideData(section: HTMLElement, input: SideHudData, side: BattleSide): void {
  const commander = section.querySelector<HTMLElement>('.top-hud-commander');
  const scoreValue = section.querySelector<HTMLElement>('.top-hud-score-value');
  const moraleText = section.querySelector<HTMLElement>('.top-hud-morale-text');
  const moraleFill = section.querySelector<HTMLElement>('.top-hud-morale-fill');
  if (!commander || !scoreValue || !moraleText || !moraleFill) return;

  commander.textContent = input.commander;
  scoreValue.textContent = String(input.score);
  moraleText.textContent = `兵力 ${input.morale}/${input.moraleMax}`;
  const ratio = Math.max(0, Math.min(1, input.morale / input.moraleMax));
  moraleFill.style.width = `${ratio * 100}%`;
  section.className = `top-hud-faction top-hud-faction--${side}`;
  moraleFill.style.setProperty(
    '--morale-color',
    side === 'blue' ? '#4de7ff' : '#ff6f7f'
  );
}

export function createTopHud(data: UpdateHudInput): TopHudHandle {
  const root = document.createElement('header');
  root.className = 'top-hud';

  const bluePart = createFactionPart('blue');
  const redPart = createFactionPart('red');

  const center = document.createElement('div');
  center.className = 'top-hud-time';
  center.textContent = data.battleTime;

  root.append(bluePart, center, redPart);

  syncSideData(
    bluePart,
    {
      commander: data.blue.commander,
      score: data.blue.score,
      morale: data.blue.morale,
      moraleMax: data.blue.moraleMax
    },
    'blue'
  );

  syncSideData(
    redPart,
    {
      commander: data.red.commander,
      score: data.red.score,
      morale: data.red.morale,
      moraleMax: data.red.moraleMax
    },
    'red'
  );

  return {
    root,
    update: (next) => {
      center.textContent = next.battleTime;
      syncSideData(
        bluePart,
        {
          commander: next.blue.commander,
          score: next.blue.score,
          morale: next.blue.morale,
          moraleMax: next.blue.moraleMax
        },
        'blue'
      );
      syncSideData(
        redPart,
        {
          commander: next.red.commander,
          score: next.red.score,
          morale: next.red.morale,
          moraleMax: next.red.moraleMax
        },
        'red'
      );
    }
  };
}
