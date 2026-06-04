import { BattleSpeed } from '../mock/mock-battle-events';
import { type BattleSide, type MockUnit } from '../mock/mock-armies';
import { createMiniMap } from './MiniMap';

interface BottomCommandInput {
  speed: BattleSpeed;
  blueUnits: MockUnit[];
  redUnits: MockUnit[];
  selectedUnitId: string | null;
  onPause: () => void;
  onPlay: () => void;
  onFastForward: () => void;
  onTactic: (name: string) => void;
}

interface BottomCommandHandle {
  root: HTMLElement;
  setSpeed(speed: BattleSpeed): void;
  setFormationLabel(label: string): void;
  setMiniMapUnits(units: { side: BattleSide; unit: MockUnit }[]): void;
  setMiniMapSelection(selectedUnitId: string | null): void;
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
  const formationLabel = document.createElement('span');
  formationLabel.className = 'battle-formation-label';
  const tactics: Array<[string, string]> = [
    ['阵形', '◈'],
    ['鼓舞', '♫'],
    ['前进', '→'],
    ['退却', '↘'],
    ['奇袭', '✶'],
    ['要请', '✦']
  ];
  for (const [label, icon] of tactics) {
    row2.append(createPixelButton(label, icon, () => input.onTactic(label), 'pixel-btn--tactic'));
  }
  formationLabel.textContent = '锋矢阵';
  row2.appendChild(formationLabel);

  controls.append(row1, row2);
  root.append(miniPanel, controls);

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
    }
  };
}
