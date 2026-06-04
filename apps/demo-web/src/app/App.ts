import { MO } from '../layout/layout-constants';
import { BattleSide, type MockArmySide, type MockUnit } from '../mock/mock-armies';
import { createArmyState, arrangeUnitsBySeed } from '../mock/mock-armies';
import { MOCK_SCENARIOS, formatMockEvents, formatMockResult, type MockScenarioKey } from '../mock/mock-battle-events';
import { createGameFrame, type GameFrameData, type GameFrameHandle } from './GameFrame';
import { createDevHarness, type DevHarnessHandle } from './DevHarness';
import { type SelectedUnitChipData } from '../game-ui/SelectedUnitChip';
import { type SquadPosition } from '../game-ui/drag-player-squad';
import { createGameFrameScaler } from '../layout/GameFrameScaler';

type FormationPreset = 'arrow' | 'crane' | 'scale';
type PlayerUnitPositions = Record<string, { slotX: number; slotY: number }>;
type FormationMode = 'preset' | 'manual';

interface AppState {
  seed: string;
  speed: '0.5x' | '1x' | '2x' | '4x';
  scenario: MockScenarioKey | 'idle';
  selectedUnitId: string | null;
  selectedFormation: FormationPreset;
  formationMode: FormationMode;
  playerUnitPositions: PlayerUnitPositions;
  draggingUnitId: string | null;
  dragStartPosition: SquadPosition | null;
  battleFrameData: GameFrameData;
}

const sideLabel: Record<BattleSide, string> = {
  blue: '蓝方',
  red: '红方'
};

const formationOrder: FormationPreset[] = ['arrow', 'crane', 'scale'];

const formationLabel: Record<FormationPreset, string> = {
  arrow: '锋矢阵',
  crane: '鹤翼阵',
  scale: '鱼鳞阵',
};

const formationModeLabel: Record<FormationMode, string> = {
  preset: '预设阵型',
  manual: '手动布阵',
};

const blueFormationPresets: Record<FormationPreset, PlayerUnitPositions> = {
  arrow: {
    'blue-infantry': { slotX: 0.56, slotY: 0.34 },
    'blue-archer': { slotX: 0.22, slotY: 0.26 },
    'blue-cavalry': { slotX: 0.78, slotY: 0.50 },
    'blue-cannon': { slotX: 0.30, slotY: 0.56 },
    'blue-ninja': { slotX: 0.62, slotY: 0.64 },
  },
  crane: {
    'blue-infantry': { slotX: 0.54, slotY: 0.46 },
    'blue-archer': { slotX: 0.16, slotY: 0.20 },
    'blue-cavalry': { slotX: 0.18, slotY: 0.72 },
    'blue-cannon': { slotX: 0.86, slotY: 0.24 },
    'blue-ninja': { slotX: 0.88, slotY: 0.68 },
  },
  scale: {
    'blue-infantry': { slotX: 0.42, slotY: 0.26 },
    'blue-archer': { slotX: 0.26, slotY: 0.44 },
    'blue-cavalry': { slotX: 0.58, slotY: 0.42 },
    'blue-cannon': { slotX: 0.42, slotY: 0.62 },
    'blue-ninja': { slotX: 0.70, slotY: 0.60 },
  },
};

function makeInitialBattleData(): GameFrameData {
  const armies = createArmyState('1v1');
  return {
    blue: {
      ...armies.blue,
      troops: applyUnitPositions(armies.blue.troops, blueFormationPresets.arrow),
    },
    red: armies.red,
    battleTime: MO.defaultBattleTime,
    speed: MO.defaultSpeed
  };
}

function applyUnitPositions(units: MockUnit[], positions: PlayerUnitPositions): MockUnit[] {
  return units.map((unit) => {
    const next = positions[unit.id];
    return next ? { ...unit, slotX: next.slotX, slotY: next.slotY } : { ...unit };
  });
}

function applyBlueFormation(data: GameFrameData, formation: FormationPreset): GameFrameData {
  return {
    ...data,
    blue: {
      ...data.blue,
      troops: applyUnitPositions(data.blue.troops, blueFormationPresets[formation]),
    },
  };
}

function applyBluePlayerPositions(data: GameFrameData, positions: PlayerUnitPositions): GameFrameData {
  return {
    ...data,
    blue: {
      ...data.blue,
      troops: applyUnitPositions(data.blue.troops, positions),
    },
  };
}

function nextFormation(current: FormationPreset): FormationPreset {
  const currentIndex = formationOrder.indexOf(current);
  return formationOrder[(currentIndex + 1) % formationOrder.length] ?? 'arrow';
}

function formatFormationDisplay(formation: FormationPreset, mode: FormationMode): string {
  return `${formationLabel[formation]} · ${formationModeLabel[mode]}`;
}

function syncSelectionUi(gameFrame: GameFrameHandle, selectedUnitId: string | null): void {
  gameFrame.setSelectedUnit(selectedUnitId);
}

function makeSelectedUnitChipData(
  unitId: string,
  side: BattleSide,
  armies: { blue: MockArmySide; red: MockArmySide }
): SelectedUnitChipData | null {
  const army = side === 'blue' ? armies.blue : armies.red;
  const unit = army.troops.find((candidate) => candidate.id === unitId);
  if (!unit) return null;
  return {
    side,
    name: unit.name,
    level: unit.level,
    role: unit.role,
    tag: unit.tag,
    count: unit.count,
    maxCount: unit.maxCount,
  };
}

function syncSelectionFeedback(state: AppState, gameFrame: GameFrameHandle): void {
  syncSelectionUi(gameFrame, state.selectedUnitId);
  const selected = parseSelectedKey(state.selectedUnitId);
  if (!selected) {
    gameFrame.setSelectedUnitChip(null);
    return;
  }
  gameFrame.setSelectedUnitChip(
    makeSelectedUnitChipData(selected.unitId, selected.side, {
      blue: state.battleFrameData.blue,
      red: state.battleFrameData.red,
    })
  );
}

function parseSelectedKey(selectedUnitId: string | null): { side: BattleSide; unitId: string } | null {
  if (!selectedUnitId) return null;
  const match = /^(blue|red)-(.+)$/.exec(selectedUnitId);
  if (!match) return null;
  return {
    side: match[1] as BattleSide,
    unitId: match[2] ?? '',
  };
}

function describeUnitText(
  unitId: string,
  side: BattleSide,
  armies: { blue: MockArmySide; red: MockArmySide }
): string {
  const army = side === 'blue' ? armies.blue : armies.red;
  const unit = army.troops.find((candidate) => candidate.id === unitId);
  if (!unit) return `${sideLabel[side]}未知单位`;
  return `${sideLabel[side]} ${unit.name} Lv.${unit.level} · 人数 ${unit.count}/${unit.maxCount} · 兵力 ${unit.hp}/${unit.maxHp} · ${unit.tag}`;
}

function setSelectionHint(text: string, gameFrame: GameFrameHandle): void {
  gameFrame.showSelectionHint(text);
}

export async function createApp(root: HTMLElement): Promise<void> {
  const appHost = document.createElement('main');
  appHost.className = 'samurai-app-root';
  const frameHost = document.createElement('section');
  frameHost.className = 'game-frame-host';
  const harnessHost = document.createElement('section');
  harnessHost.className = 'dev-harness-host';

  appHost.append(frameHost, harnessHost);
  root.appendChild(appHost);

  const state: AppState = {
    seed: MO.defaultSeed,
    speed: MO.defaultSpeed,
    scenario: 'idle',
    selectedUnitId: null,
    selectedFormation: 'arrow',
    formationMode: 'preset',
    playerUnitPositions: { ...blueFormationPresets.arrow },
    draggingUnitId: null,
    dragStartPosition: null,
    battleFrameData: makeInitialBattleData()
  };

  const gameFrame = createGameFrame(frameHost, {
    data: state.battleFrameData,
    onUnitSelect: (unitId, side) => {
      state.selectedUnitId = `${side}-${unitId}`;
      syncSelectionFeedback(state, gameFrame);
      const text = describeUnitText(unitId, side, {
        blue: state.battleFrameData.blue,
        red: state.battleFrameData.red
      });
      setSelectionHint(text, gameFrame);
    },
    onUnitDragStart: (side, unitId, position) => {
      state.draggingUnitId = `${side}-${unitId}`;
      state.dragStartPosition = position;
      state.selectedUnitId = `${side}-${unitId}`;
      syncSelectionFeedback(state, gameFrame);
    },
    onUnitDragEnd: ({ side, unitId, position, committed }) => {
      if (committed && side === 'blue') {
        state.playerUnitPositions = { ...state.playerUnitPositions, [unitId]: position };
        state.formationMode = 'manual';
        state.battleFrameData = applyBluePlayerPositions(state.battleFrameData, state.playerUnitPositions);
        gameFrame.updateData(state.battleFrameData);
        gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
        setSelectionHint('蓝方布阵已更新', gameFrame);
      } else if (committed && side === 'red') {
        state.formationMode = 'manual';
        state.battleFrameData = {
          ...state.battleFrameData,
          red: {
            ...state.battleFrameData.red,
            troops: state.battleFrameData.red.troops.map((troop) =>
              troop.id === unitId ? { ...troop, slotX: position.slotX, slotY: position.slotY } : troop
            ),
          },
        };
        gameFrame.updateData(state.battleFrameData);
        gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
        setSelectionHint('红方布阵已更新', gameFrame);
      } else {
        setSelectionHint('该位置不可布阵，已回退', gameFrame);
      }
      state.draggingUnitId = null;
      state.dragStartPosition = null;
      state.selectedUnitId = `${side}-${unitId}`;
      syncSelectionFeedback(state, gameFrame);
    },
    onTacticalCommand: (name) => {
      if (name === '阵形') {
        state.selectedFormation = nextFormation(state.selectedFormation);
        state.formationMode = 'preset';
        state.playerUnitPositions = { ...blueFormationPresets[state.selectedFormation] };
        state.battleFrameData = applyBlueFormation(state.battleFrameData, state.selectedFormation);
        gameFrame.updateData(state.battleFrameData);
        gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
        syncSelectionFeedback(state, gameFrame);
        setSelectionHint(`蓝方阵型切换为 ${formationLabel[state.selectedFormation]}`, gameFrame);
        return;
      }
      setSelectionHint(`战术指令: ${name}`, gameFrame);
    },
    onPlaybackAction: (action) => {
      const actionText: Record<string, string> = {
        pause: '暂停',
        play: '播放',
        fastforward: '快进'
      };
      setSelectionHint(`播放指令: ${actionText[action]}`, gameFrame);
    }
  });

  let harness: DevHarnessHandle | null = null;

  const applyScenario = (key: MockScenarioKey): void => {
    const scenario = MOCK_SCENARIOS[key];
    const arranged = arrangeUnitsBySeed(createArmyState(key === 'run5v5' ? '5v5' : '1v1'), state.seed);
    state.scenario = key;
    state.battleFrameData = {
      blue: {
        ...arranged.blue,
        troops: applyUnitPositions(arranged.blue.troops, state.playerUnitPositions),
      },
      red: arranged.red,
      battleTime: scenario.battleTime,
      speed: state.speed
    };
    gameFrame.updateData(state.battleFrameData);
    syncSelectionFeedback(state, gameFrame);
    harness?.setRawEvents(formatMockEvents(scenario.events));
    harness?.setResult(formatMockResult({
      seed: state.seed,
      ...scenario.result
    }));
  };

  harness = createDevHarness(harnessHost, {
    seed: state.seed,
    speed: state.speed,
    onSeedChange: (seed) => {
      state.seed = seed || MO.defaultSeed;
      setSelectionHint(`当前随机种子: ${state.seed}`, gameFrame);
      if (state.scenario !== 'idle') {
        applyScenario(state.scenario);
      }
    },
    onSpeedChange: (speed) => {
      state.speed = speed;
      state.battleFrameData = {
        ...state.battleFrameData,
        speed
      };
      gameFrame.setSpeed(speed);
      harness?.setSpeedDisplay(speed);
      harness?.setSelectedSpeed(speed);
    },
    onRun1v1: () => {
      applyScenario('run1v1');
    },
    onRun5v5: () => {
      applyScenario('run5v5');
    },
    onResetBattle: () => {
      state.scenario = 'idle';
      state.selectedUnitId = null;
      state.selectedFormation = 'arrow';
      state.formationMode = 'preset';
      state.playerUnitPositions = { ...blueFormationPresets.arrow };
      state.draggingUnitId = null;
      state.dragStartPosition = null;
      state.battleFrameData = makeInitialBattleData();
      gameFrame.updateData(state.battleFrameData);
      gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
      syncSelectionFeedback(state, gameFrame);
      harness?.setRawEvents('尚未执行 Run 1v1/Run 5v5。');
      harness?.setResult('Test Result: 尚未运行场景。');
      setSelectionHint('战斗已重置', gameFrame);
    },
    onRandomFormation: () => {
      const mixed = arrangeUnitsBySeed(
        { blue: state.battleFrameData.blue, red: state.battleFrameData.red },
        `${state.seed}|${state.scenario}`
      );
      state.battleFrameData = {
        ...state.battleFrameData,
        blue: {
          ...mixed.blue,
          troops: applyUnitPositions(mixed.blue.troops, state.playerUnitPositions),
        },
        red: mixed.red
      };
      state.draggingUnitId = null;
      state.dragStartPosition = null;
      gameFrame.updateData(state.battleFrameData);
      syncSelectionFeedback(state, gameFrame);
      setSelectionHint('部队阵型已重排', gameFrame);
    },
    onExportReplay: () => {
      const payload = {
        seed: state.seed,
        speed: state.speed,
        scenario: state.scenario,
        units: {
          blue: state.battleFrameData.blue.troops.length,
          red: state.battleFrameData.red.troops.length
        }
      };
      const encoded = JSON.stringify(payload, null, 2);
      harness?.setRawEvents(`Export Replay\n${encoded}`);
      harness?.setResult('Test Result: 已导出 mock replay。');
    },
    onImportReplay: () => {
      harness?.setRawEvents('Import Replay\n[模拟导入完成] 已加载 mock 数据。');
      setSelectionHint('Replay 已导入（模拟）', gameFrame);
    },
    onValidateContent: () => {
      harness?.setResult('Test Result: validate content success (mock).');
      setSelectionHint('内容校验通过（模拟）', gameFrame);
    },
    onTacticalCommand: (command) => {
      setSelectionHint(`战术指令: ${command}`, gameFrame);
    },
    onPlaybackAction: (action) => {
      const actionLabel = action === 'pause' ? '暂停' : action === 'play' ? '播放' : '快进';
      setSelectionHint(`播放指令: ${actionLabel}`, gameFrame);
    }
  });

  createGameFrameScaler({
    gameFrameElement: gameFrame.shell,
    shellElement: frameHost
  });

  harness?.setRawEvents('尚未执行 Run 1v1/Run 5v5。');
  harness?.setResult('Test Result: 尚未运行场景。');
  gameFrame.updateData(state.battleFrameData);
  gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
  syncSelectionFeedback(state, gameFrame);

  if (state.selectedUnitId) {
    const selected = parseSelectedKey(state.selectedUnitId);
    if (selected) {
      setSelectionHint(
        describeUnitText(selected.unitId, selected.side, {
          blue: state.battleFrameData.blue,
          red: state.battleFrameData.red,
        }),
        gameFrame
      );
    }
  }
}
