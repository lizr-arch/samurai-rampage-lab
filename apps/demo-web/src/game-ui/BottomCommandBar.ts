import { BattleSpeed } from '../mock/mock-battle-events';
import { createMiniMap } from './MiniMap';

interface BottomCommandInput {
  speed: BattleSpeed;
  onPause: () => void;
  onPlay: () => void;
  onFastForward: () => void;
  onTactic: (name: string) => void;
}

interface BottomCommandHandle {
  root: HTMLElement;
  setSpeed(speed: BattleSpeed): void;
}

export function createBottomCommandBar(input: BottomCommandInput): BottomCommandHandle {
  const root = document.createElement('footer');
  root.className = 'bottom-command';

  const minimap = createMiniMap();
  const controls = document.createElement('div');
  controls.className = 'battle-controls';
  const miniPanel = document.createElement('section');
  miniPanel.className = 'bottom-mini';
  miniPanel.appendChild(minimap.root);

  const row1 = document.createElement('div');
  row1.className = 'battle-action-row';
  const pause = document.createElement('button');
  pause.textContent = '暂停';
  pause.type = 'button';
  pause.addEventListener('click', input.onPause);

  const play = document.createElement('button');
  play.textContent = '播放';
  play.type = 'button';
  play.addEventListener('click', input.onPlay);

  const ff = document.createElement('button');
  ff.textContent = '快进';
  ff.type = 'button';
  ff.addEventListener('click', input.onFastForward);

  const speed = document.createElement('span');
  speed.className = 'battle-speed';
  speed.textContent = `速率 ${input.speed}`;

  row1.append(pause, play, ff, speed);

  const row2 = document.createElement('div');
  row2.className = 'battle-tactic-row';
  ['阵形', '鼓舞', '前进', '退却', '奇袭', '要请'].forEach((label) => {
    const command = document.createElement('button');
    command.type = 'button';
    command.textContent = label;
    command.addEventListener('click', () => input.onTactic(label));
    row2.appendChild(command);
  });

  controls.append(row1, row2);
  root.append(miniPanel, controls);
  return {
    root,
    setSpeed: (nextSpeed: BattleSpeed) => {
      speed.textContent = `速率 ${nextSpeed}`;
    }
  };
}

