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
  section.dataset.side = side;

  const nameRow = document.createElement('div');
  nameRow.className = 'top-hud-main';
  const cmd = document.createElement('p');
  cmd.className = 'top-hud-commander';
  const score = document.createElement('p');
  score.className = 'top-hud-score';

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

  section.append(nameRow, moraleRow);
  nameRow.append(cmd, score);

  section.setAttribute('data-morale-fill', `${side}-fill`);
  section.setAttribute('data-commander', `${side}-commander`);
  section.setAttribute('data-score', `${side}-score`);
  return section;
}

function syncSideData(section: HTMLElement, input: SideHudData, side: BattleSide): void {
  const commander = section.querySelector<HTMLElement>('.top-hud-commander');
  const score = section.querySelector<HTMLElement>('.top-hud-score');
  const moraleText = section.querySelector<HTMLElement>('.top-hud-morale-text');
  const moraleFill = section.querySelector<HTMLElement>('.top-hud-morale-fill');

  if (!commander || !score || !moraleText || !moraleFill) return;

  commander.textContent = input.commander;
  score.textContent = String(input.score);
  moraleText.textContent = `兵力 ${input.morale}/${input.moraleMax}`;
  const ratio = Math.max(0, Math.min(1, input.morale / input.moraleMax));
  moraleFill.style.width = `${ratio * 100}%`;
  section.className = `top-hud-faction top-hud-faction--${side}`;
  if (side === 'blue') {
    moraleFill.style.setProperty('--mora-color', '#65f1f1');
  } else {
    moraleFill.style.setProperty('--mora-color', '#f36b6b');
  }
}

export function createTopHud(
  data: UpdateHudInput
): TopHudHandle {
  const root = document.createElement('header');
  root.className = 'top-hud';

  const bluePart = createFactionPart('blue');
  const redPart = createFactionPart('red');
  const center = document.createElement('div');
  center.className = 'top-hud-time';
  center.textContent = data.battleTime;

  root.append(bluePart, center, redPart);

  syncSideData(bluePart, {
    commander: data.blue.commander,
    score: data.blue.score,
    morale: data.blue.morale,
    moraleMax: data.blue.moraleMax
  }, 'blue');

  syncSideData(redPart, {
    commander: data.red.commander,
    score: data.red.score,
    morale: data.red.morale,
    moraleMax: data.red.moraleMax
  }, 'red');

  return {
    root,
    update: (next) => {
      center.textContent = next.battleTime;
      syncSideData(bluePart, {
        commander: next.blue.commander,
        score: next.blue.score,
        morale: next.blue.morale,
        moraleMax: next.blue.moraleMax
      }, 'blue');
      syncSideData(redPart, {
        commander: next.red.commander,
        score: next.red.score,
        morale: next.red.morale,
        moraleMax: next.red.moraleMax
      }, 'red');
    }
  };
}

