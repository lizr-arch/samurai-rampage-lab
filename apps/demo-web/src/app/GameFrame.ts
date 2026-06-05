import { BattleSpeed } from '../mock/mock-battle-events';
import { BattleSide, MockArmySide, MockUnit, UNIT_ARCHETYPE_ORDER, type UnitArchetype } from '../mock/mock-armies';
import { SquadPosition } from '../game-ui/drag-player-squad';
import { SelectedUnitChipData } from '../game-ui/SelectedUnitChip';
import { createTopHud } from '../game-ui/TopHud';
import { createArmyPanel } from '../game-ui/ArmyPanel';
import { createBattleField } from '../game-ui/BattleField';
import { createBottomCommandBar } from '../game-ui/BottomCommandBar';
import { createStagingTray } from '../game-ui/StagingTray';
import { createBattlePrepState } from './battle-prep';
import { type BattleScale } from './deployment-mode';

export interface GameFrameData {
  blue: MockArmySide;
  red: MockArmySide;
  battleTime: string;
  speed: BattleSpeed;
  battleScale: BattleScale;
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
  maxUnitsPerSide: number;
  onUnitSelect: (unitId: string, side: BattleSide) => void;
  onUnitDragStart: (side: BattleSide, unitId: string, position: SquadPosition) => void;
  onUnitDragEnd: (result: {
    side: BattleSide;
    unitId: string;
    position: SquadPosition;
    committed: boolean;
    removed: boolean;
  }) => void;
  onTrayDeploy: (result: { side: BattleSide; archetype: UnitArchetype; position: SquadPosition }) => void;
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

  let currentData = input.data;

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

  const leftTray = createStagingTray({
    side: 'blue',
    prepState: createBattlePrepState(input.data.blue.troops, input.data.battleScale, input.maxUnitsPerSide, UNIT_ARCHETYPE_ORDER),
    onDeployAttempt: ({ side, archetype, clientX, clientY }) => {
      const position = battlefield.resolveTrayDeploy(side, archetype, clientX, clientY, currentData.blue.troops, currentData.red.troops);
      if (!position) {
        return;
      }
      input.onTrayDeploy({ side, archetype, position });
    }
  });

  const rightTray = createStagingTray({
    side: 'red',
    prepState: createBattlePrepState(input.data.red.troops, input.data.battleScale, input.maxUnitsPerSide, UNIT_ARCHETYPE_ORDER),
    onDeployAttempt: ({ side, archetype, clientX, clientY }) => {
      const position = battlefield.resolveTrayDeploy(side, archetype, clientX, clientY, currentData.blue.troops, currentData.red.troops);
      if (!position) {
        return;
      }
      input.onTrayDeploy({ side, archetype, position });
    }
  });

  const battlefield = createBattleField({
    data: {
      blueUnits: input.data.blue.troops,
      redUnits: input.data.red.troops
    },
    deleteZones: {
      blue: leftTray.root,
      red: rightTray.root
    },
    onUnitSelect: input.onUnitSelect,
    onUnitDragStart: input.onUnitDragStart,
    onUnitDragEnd: input.onUnitDragEnd
  });

  const commandBar = createBottomCommandBar({
    speed: input.data.speed,
    blueUnits: input.data.blue.troops,
    redUnits: input.data.red.troops,
    selectedUnitId: null,
    onPause: () => input.onPlaybackAction('pause'),
    onPlay: () => input.onPlaybackAction('play'),
    onFastForward: () => input.onPlaybackAction('fastforward'),
    onTactic: input.onTacticalCommand
  });

  const content = document.createElement('div');
  content.className = 'game-content';
  const leftRail = document.createElement('div');
  leftRail.className = 'battle-rail battle-rail--blue';
  leftRail.append(leftPanel.root, leftTray.root);
  const rightRail = document.createElement('div');
  rightRail.className = 'battle-rail battle-rail--red';
  rightRail.append(rightPanel.root, rightTray.root);
  content.append(leftRail, battlefield.root, rightRail);

  root.append(hud.root, content, commandBar.root);

  return {
    root,
    shell,
    updateData: (next) => {
      currentData = next;
      hud.update(next);
      leftPanel.update(next.blue);
      rightPanel.update(next.red);
      leftTray.updatePrepState(createBattlePrepState(next.blue.troops, next.battleScale, input.maxUnitsPerSide, UNIT_ARCHETYPE_ORDER));
      rightTray.updatePrepState(createBattlePrepState(next.red.troops, next.battleScale, input.maxUnitsPerSide, UNIT_ARCHETYPE_ORDER));
      battlefield.update({
        blueUnits: next.blue.troops,
        redUnits: next.red.troops
      });
      commandBar.setSpeed(next.speed);
      commandBar.setMiniMapUnits([
        ...next.blue.troops.map((unit) => ({ side: 'blue' as const, unit })),
        ...next.red.troops.map((unit) => ({ side: 'red' as const, unit }))
      ]);
    },
    setSelectedUnit: (selectedUnitId) => {
      leftPanel.highlight(selectedUnitId);
      rightPanel.highlight(selectedUnitId);
      battlefield.highlightUnit(selectedUnitId);
      commandBar.setMiniMapSelection(selectedUnitId);
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
