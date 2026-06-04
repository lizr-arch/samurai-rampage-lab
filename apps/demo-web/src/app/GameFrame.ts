import { BattleSpeed } from '../mock/mock-battle-events';
import { BattleSide, MockArmySide } from '../mock/mock-armies';
import { SquadPosition } from '../game-ui/drag-player-squad';
import { SelectedUnitChipData } from '../game-ui/SelectedUnitChip';
import { createTopHud } from '../game-ui/TopHud';
import { createArmyPanel } from '../game-ui/ArmyPanel';
import { createBattleField } from '../game-ui/BattleField';
import { createBottomCommandBar } from '../game-ui/BottomCommandBar';

export interface GameFrameData {
  blue: MockArmySide;
  red: MockArmySide;
  battleTime: string;
  speed: BattleSpeed;
}

export interface GameFrameHandle {
  root: HTMLElement;
  shell: HTMLElement;
  updateData(data: GameFrameData): void;
  setSelectedUnit(selectedUnitId: string | null): void;
  setSelectedUnitChip(data: SelectedUnitChipData | null): void;
  showSelectionHint(text: string): void;
  setSpeed(speed: BattleSpeed): void;
  setFormationLabel(label: string): void;
}

interface GameFrameInput {
  data: GameFrameData;
  onUnitSelect: (unitId: string, side: BattleSide) => void;
  onUnitDragStart: (side: BattleSide, unitId: string, position: SquadPosition) => void;
  onUnitDragEnd: (result: { side: BattleSide; unitId: string; position: SquadPosition; committed: boolean }) => void;
  onTacticalCommand: (name: string) => void;
  onPlaybackAction: (name: 'pause' | 'play' | 'fastforward') => void;
}

export function createGameFrame(host: HTMLElement, input: GameFrameInput): GameFrameHandle {
  const root = document.createElement('section');
  root.className = 'game-frame';

  const shell = document.createElement('div');
  shell.className = 'game-frame-scale-shell';
  shell.appendChild(root);
  host.appendChild(shell);

  const hud = createTopHud(input.data);

  const leftPanel = createArmyPanel({
    side: 'blue',
    data: input.data.blue,
    onUnitSelect: input.onUnitSelect
  });

  const rightPanel = createArmyPanel({
    side: 'red',
    data: input.data.red,
    onUnitSelect: input.onUnitSelect
  });

  const battlefield = createBattleField({
    data: {
      blueUnits: input.data.blue.troops,
      redUnits: input.data.red.troops
    },
    onUnitSelect: input.onUnitSelect,
    onUnitDragStart: input.onUnitDragStart,
    onUnitDragEnd: input.onUnitDragEnd
  });

  const commandBar = createBottomCommandBar({
    speed: input.data.speed,
    onPause: () => input.onPlaybackAction('pause'),
    onPlay: () => input.onPlaybackAction('play'),
    onFastForward: () => input.onPlaybackAction('fastforward'),
    onTactic: input.onTacticalCommand
  });

  const content = document.createElement('div');
  content.className = 'game-content';
  content.append(leftPanel.root, battlefield.root, rightPanel.root);

  root.append(hud.root, content, commandBar.root);

  return {
    root,
    shell,
    updateData: (next) => {
      hud.update(next);
      leftPanel.update(next.blue);
      rightPanel.update(next.red);
      battlefield.update({
        blueUnits: next.blue.troops,
        redUnits: next.red.troops
      });
      commandBar.setSpeed(next.speed);
    },
    setSelectedUnit: (selectedUnitId) => {
      leftPanel.highlight(selectedUnitId);
      rightPanel.highlight(selectedUnitId);
      battlefield.highlightUnit(selectedUnitId);
    },
    setSelectedUnitChip: (data) => {
      battlefield.setSelectedUnitChip(data);
    },
    showSelectionHint: (text) => {
      battlefield.setInfo(text);
    },
    setSpeed: (speed) => {
      commandBar.setSpeed(speed);
    },
    setFormationLabel: (label) => {
      commandBar.setFormationLabel(label);
    }
  };
}
