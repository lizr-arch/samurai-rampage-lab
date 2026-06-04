import { MO } from '../layout/layout-constants';
import { type SelectedUnitChipData } from '../game-ui/SelectedUnitChip';
import { type SquadPosition } from '../game-ui/drag-player-squad';
import {
  BattleSide,
  UNIT_ARCHETYPE_ORDER,
  createBattleDataFromTroops,
  createMockUnit,
  type MockBattleData,
  type MockUnit,
  type UnitArchetype
} from '../mock/mock-armies';
import { type MockScenarioKey } from '../mock/mock-battle-events';
import {
  DEFAULT_SCENARIO_PRESET,
  MOCK_SCENARIO_PRESETS,
  formatPresetMockEvents,
  formatPresetMockResult,
  type ScenarioPresetKey
} from '../mock/mock-scenario-presets';
import { createGameFrame, type GameFrameData, type GameFrameHandle } from './GameFrame';
import { createDevHarness, type DevHarnessHandle } from './DevHarness';
import { createGameFrameScaler } from '../layout/GameFrameScaler';

type FormationPreset = 'arrow' | 'crane' | 'scale';
type FormationMode = 'preset' | 'manual';
type ScenarioRunKey = MockScenarioKey | 'idle';

interface AppState {
  seed: string;
  speed: '0.5x' | '1x' | '2x' | '4x';
  scenarioRunKey: ScenarioRunKey;
  selectedScenarioPreset: ScenarioPresetKey;
  selectedUnitId: string | null;
  selectedFormation: FormationPreset;
  formationMode: FormationMode;
  battleFrameData: GameFrameData;
}

const MAX_UNITS_PER_SIDE = 8;

const sideLabel: Record<BattleSide, string> = {
  blue: '蓝方',
  red: '红方'
};

const formationOrder: FormationPreset[] = ['arrow', 'crane', 'scale'];
const formationLabel: Record<FormationPreset, string> = {
  arrow: '锋矢阵',
  crane: '鹤翼阵',
  scale: '鱼鳞阵'
};
const formationModeLabel: Record<FormationMode, string> = {
  preset: '预设阵型',
  manual: '手动布阵'
};

function cloneUnits(units: MockUnit[]): MockUnit[] {
  return units.map((unit) => ({ ...unit }));
}

function formatFormationDisplay(formation: FormationPreset, mode: FormationMode): string {
  return `${formationLabel[formation]} · ${formationModeLabel[mode]}`;
}

function parseSelectedKey(selectedUnitId: string | null): { side: BattleSide; unitId: string } | null {
  if (!selectedUnitId) return null;
  const match = /^(blue|red)-(.+)$/.exec(selectedUnitId);
  if (!match) return null;
  return {
    side: match[1] as BattleSide,
    unitId: match[2] ?? ''
  };
}

function makeSelectedUnitChipData(unitId: string, side: BattleSide, armies: MockBattleData): SelectedUnitChipData | null {
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
    maxCount: unit.maxCount
  };
}

function describeUnitText(unitId: string, side: BattleSide, armies: MockBattleData): string {
  const army = side === 'blue' ? armies.blue : armies.red;
  const unit = army.troops.find((candidate) => candidate.id === unitId);
  if (!unit) return `${sideLabel[side]}未知单位`;
  return `${sideLabel[side]} ${unit.name} Lv.${unit.level} · 人数 ${unit.count}/${unit.maxCount} · 兵力 ${unit.hp}/${unit.maxHp} · ${unit.tag}`;
}

function setSelectionHint(text: string, gameFrame: GameFrameHandle): void {
  gameFrame.showSelectionHint(text);
}

function syncSelectionFeedback(state: AppState, gameFrame: GameFrameHandle): void {
  gameFrame.setSelectedUnit(state.selectedUnitId);
  const selected = parseSelectedKey(state.selectedUnitId);
  if (!selected) {
    gameFrame.setSelectedUnitChip(null);
    return;
  }
  gameFrame.setSelectedUnitChip(
    makeSelectedUnitChipData(selected.unitId, selected.side, {
      blue: state.battleFrameData.blue,
      red: state.battleFrameData.red
    })
  );
}

function nextFormation(current: FormationPreset): FormationPreset {
  const currentIndex = formationOrder.indexOf(current);
  return formationOrder[(currentIndex + 1) % formationOrder.length] ?? 'arrow';
}

function hashSeed(input: string): number {
  return [...input].reduce((sum, char) => (sum * 33 + char.charCodeAt(0)) % 104729, 17);
}

function updateBattleData(
  state: AppState,
  blueTroops: MockUnit[],
  redTroops: MockUnit[],
  scale: '1v1' | '5v5',
  battleTime: string
): void {
  state.battleFrameData = {
    ...createBattleDataFromTroops(blueTroops, redTroops, scale),
    battleTime,
    speed: state.speed
  };
}

function buildPresetTroops(side: BattleSide, presetKey: ScenarioPresetKey, scale: '1v1' | '5v5'): MockUnit[] {
  const preset = MOCK_SCENARIO_PRESETS[presetKey];
  const positions = side === 'blue' ? preset.bluePositions : preset.redPositions;
  return UNIT_ARCHETYPE_ORDER.map((archetype) =>
    createMockUnit(side, archetype, scale, positions[archetype])
  );
}

function makePresetBattleData(
  presetKey: ScenarioPresetKey,
  scale: '1v1' | '5v5',
  speed: AppState['speed'],
  battleTime: string
): GameFrameData {
  return {
    ...createBattleDataFromTroops(
      buildPresetTroops('blue', presetKey, scale),
      buildPresetTroops('red', presetKey, scale),
      scale
    ),
    battleTime,
    speed
  };
}

function formationPositions(formation: FormationPreset, count: number): SquadPosition[] {
  const positions: SquadPosition[] = [];
  for (let index = 0; index < count; index += 1) {
    if (formation === 'arrow') {
      const row = Math.floor(index / 2);
      const column = index % 2 === 0 ? -1 : 1;
      positions.push({
        slotX: Math.max(0.16, Math.min(0.86, 0.72 - row * 0.12 - (row === 0 && index === 0 ? -0.08 : 0))),
        slotY: Math.max(0.14, Math.min(0.86, 0.5 + (index === 0 ? 0 : column * (0.1 + row * 0.06))))
      });
      continue;
    }
    if (formation === 'crane') {
      const wing = index % 2 === 0 ? -1 : 1;
      const row = Math.floor(index / 2);
      positions.push({
        slotX: Math.max(0.14, Math.min(0.84, 0.56 - row * 0.09)),
        slotY: Math.max(0.12, Math.min(0.88, 0.5 + wing * (0.16 + row * 0.1)))
      });
      continue;
    }
    const row = Math.floor(index / 3);
    const col = index % 3;
    positions.push({
      slotX: Math.max(0.16, Math.min(0.84, 0.34 + col * 0.18 + row * 0.04)),
      slotY: Math.max(0.16, Math.min(0.84, 0.28 + row * 0.16 + (col % 2 === 0 ? 0 : 0.05)))
    });
  }
  return positions;
}

function applyFormation(units: MockUnit[], formation: FormationPreset): MockUnit[] {
  const slots = formationPositions(formation, units.length);
  return units.map((unit, index) => ({
    ...unit,
    slotX: slots[index]?.slotX ?? unit.slotX,
    slotY: slots[index]?.slotY ?? unit.slotY
  }));
}

function shuffleTroopPositions(units: MockUnit[], seed: string): MockUnit[] {
  const ordered = [...units].sort((left, right) => hashSeed(`${seed}|${left.id}`) - hashSeed(`${seed}|${right.id}`));
  const positions = ordered.map((unit) => ({ slotX: unit.slotX, slotY: unit.slotY }));
  return units.map((unit, index) => ({ ...unit, ...positions[index % positions.length] }));
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
    scenarioRunKey: 'idle',
    selectedScenarioPreset: DEFAULT_SCENARIO_PRESET,
    selectedUnitId: null,
    selectedFormation: 'arrow',
    formationMode: 'preset',
    battleFrameData: makePresetBattleData(DEFAULT_SCENARIO_PRESET, '1v1', MO.defaultSpeed, MO.defaultBattleTime)
  };

  const gameFrame = createGameFrame(frameHost, {
    data: state.battleFrameData,
    maxUnitsPerSide: MAX_UNITS_PER_SIDE,
    onUnitSelect: (unitId, side) => {
      state.selectedUnitId = `${side}-${unitId}`;
      syncSelectionFeedback(state, gameFrame);
      setSelectionHint(describeUnitText(unitId, side, state.battleFrameData), gameFrame);
    },
    onUnitDragStart: (side, unitId) => {
      state.selectedUnitId = `${side}-${unitId}`;
      syncSelectionFeedback(state, gameFrame);
    },
    onUnitDragEnd: ({ side, unitId, position, committed, removed }) => {
      if (removed) {
        const nextBlue =
          side === 'blue'
            ? state.battleFrameData.blue.troops.filter((unit) => unit.id !== unitId)
            : cloneUnits(state.battleFrameData.blue.troops);
        const nextRed =
          side === 'red'
            ? state.battleFrameData.red.troops.filter((unit) => unit.id !== unitId)
            : cloneUnits(state.battleFrameData.red.troops);
        state.selectedUnitId = null;
        state.formationMode = 'manual';
        updateBattleData(state, nextBlue, nextRed, state.scenarioRunKey === 'run5v5' ? '5v5' : '1v1', state.battleFrameData.battleTime);
        gameFrame.updateData(state.battleFrameData);
        gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
        syncSelectionFeedback(state, gameFrame);
        setSelectionHint(`${sideLabel[side]}单位已撤回托盘`, gameFrame);
        return;
      }
      if (!committed) {
        state.selectedUnitId = `${side}-${unitId}`;
        syncSelectionFeedback(state, gameFrame);
        setSelectionHint('该位置不可布阵，已回退', gameFrame);
        return;
      }
      const nextBlue =
        side === 'blue'
          ? state.battleFrameData.blue.troops.map((unit) => (unit.id === unitId ? { ...unit, ...position } : { ...unit }))
          : cloneUnits(state.battleFrameData.blue.troops);
      const nextRed =
        side === 'red'
          ? state.battleFrameData.red.troops.map((unit) => (unit.id === unitId ? { ...unit, ...position } : { ...unit }))
          : cloneUnits(state.battleFrameData.red.troops);
      state.selectedUnitId = `${side}-${unitId}`;
      state.formationMode = 'manual';
      updateBattleData(state, nextBlue, nextRed, state.scenarioRunKey === 'run5v5' ? '5v5' : '1v1', state.battleFrameData.battleTime);
      gameFrame.updateData(state.battleFrameData);
      gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
      syncSelectionFeedback(state, gameFrame);
      setSelectionHint(`${sideLabel[side]}布阵已更新`, gameFrame);
    },
    onTrayDeploy: ({ side, archetype, position }) => {
      const ownTroops = side === 'blue' ? state.battleFrameData.blue.troops : state.battleFrameData.red.troops;
      if (ownTroops.length >= MAX_UNITS_PER_SIDE) {
        setSelectionHint(`${sideLabel[side]}已达到 ${MAX_UNITS_PER_SIDE} 队上限`, gameFrame);
        return;
      }
      const scale = state.scenarioRunKey === 'run5v5' ? '5v5' : '1v1';
      const nextUnit = createMockUnit(side, archetype, scale, position);
      const nextBlue =
        side === 'blue' ? [...state.battleFrameData.blue.troops.map((unit) => ({ ...unit })), nextUnit] : cloneUnits(state.battleFrameData.blue.troops);
      const nextRed =
        side === 'red' ? [...state.battleFrameData.red.troops.map((unit) => ({ ...unit })), nextUnit] : cloneUnits(state.battleFrameData.red.troops);
      state.selectedUnitId = `${side}-${nextUnit.id}`;
      state.formationMode = 'manual';
      updateBattleData(state, nextBlue, nextRed, scale, state.battleFrameData.battleTime);
      gameFrame.updateData(state.battleFrameData);
      gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
      syncSelectionFeedback(state, gameFrame);
      setSelectionHint(`${sideLabel[side]}新增 ${nextUnit.name}`, gameFrame);
    },
    onTacticalCommand: (name) => {
      if (name === '阵形') {
        state.selectedFormation = nextFormation(state.selectedFormation);
        state.formationMode = 'preset';
        const nextBlue = applyFormation(state.battleFrameData.blue.troops, state.selectedFormation);
        updateBattleData(
          state,
          nextBlue,
          state.battleFrameData.red.troops,
          state.scenarioRunKey === 'run5v5' ? '5v5' : '1v1',
          state.battleFrameData.battleTime
        );
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

  const applyRunOutput = (runKey: MockScenarioKey): void => {
    const preset = MOCK_SCENARIO_PRESETS[state.selectedScenarioPreset];
    const run = preset.runs[runKey];
    state.scenarioRunKey = runKey;
    state.battleFrameData = {
      ...state.battleFrameData,
      battleTime: run.battleTime,
      speed: state.speed
    };
    gameFrame.updateData(state.battleFrameData);
    syncSelectionFeedback(state, gameFrame);
    harness?.setRawEvents(formatPresetMockEvents(preset, runKey));
    harness?.setResult(
      formatPresetMockResult(preset, runKey, {
        seed: state.seed,
        blueUnits: state.battleFrameData.blue.troops.length,
        redUnits: state.battleFrameData.red.troops.length,
        ...run.result
      })
    );
  };

  harness = createDevHarness(harnessHost, {
    seed: state.seed,
    speed: state.speed,
    selectedScenarioPreset: state.selectedScenarioPreset,
    onSeedChange: (seed) => {
      state.seed = seed || MO.defaultSeed;
      setSelectionHint(`当前随机种子: ${state.seed}`, gameFrame);
      if (state.scenarioRunKey !== 'idle') {
        applyRunOutput(state.scenarioRunKey);
      }
    },
    onSpeedChange: (speed) => {
      state.speed = speed;
      state.battleFrameData = { ...state.battleFrameData, speed };
      gameFrame.setSpeed(speed);
      harness?.setSpeedDisplay(speed);
      harness?.setSelectedSpeed(speed);
    },
    onScenarioPresetChange: (preset) => {
      state.selectedScenarioPreset = preset;
      state.selectedFormation = 'arrow';
      state.formationMode = 'preset';
      const scale = state.scenarioRunKey === 'run5v5' ? '5v5' : '1v1';
      const battleTime = state.scenarioRunKey === 'idle' ? MO.defaultBattleTime : MOCK_SCENARIO_PRESETS[preset].runs[state.scenarioRunKey].battleTime;
      state.battleFrameData = makePresetBattleData(preset, scale, state.speed, battleTime);
      state.selectedUnitId = null;
      gameFrame.updateData(state.battleFrameData);
      gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
      harness?.setSelectedScenarioPreset(preset);
      syncSelectionFeedback(state, gameFrame);
      setSelectionHint(`部署预设已应用: ${MOCK_SCENARIO_PRESETS[preset].name}`, gameFrame);
      if (state.scenarioRunKey !== 'idle') {
        applyRunOutput(state.scenarioRunKey);
      }
    },
    onRun1v1: () => {
      applyRunOutput('run1v1');
    },
    onRun5v5: () => {
      applyRunOutput('run5v5');
    },
    onResetBattle: () => {
      state.scenarioRunKey = 'idle';
      state.selectedScenarioPreset = DEFAULT_SCENARIO_PRESET;
      state.selectedUnitId = null;
      state.selectedFormation = 'arrow';
      state.formationMode = 'preset';
      state.battleFrameData = makePresetBattleData(DEFAULT_SCENARIO_PRESET, '1v1', state.speed, MO.defaultBattleTime);
      gameFrame.updateData(state.battleFrameData);
      gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
      syncSelectionFeedback(state, gameFrame);
      harness?.setSelectedScenarioPreset(state.selectedScenarioPreset);
      harness?.setRawEvents('尚未执行 Run 1v1/Run 5v5。');
      harness?.setResult('Test Result: 尚未运行场景。');
      setSelectionHint('战斗已重置', gameFrame);
    },
    onRandomFormation: () => {
      const nextBlue = shuffleTroopPositions(
        state.battleFrameData.blue.troops,
        `${state.seed}|${state.scenarioRunKey}|${state.selectedScenarioPreset}|blue`
      );
      const nextRed = shuffleTroopPositions(
        state.battleFrameData.red.troops,
        `${state.seed}|${state.scenarioRunKey}|${state.selectedScenarioPreset}|red`
      );
      state.formationMode = 'manual';
      updateBattleData(state, nextBlue, nextRed, state.scenarioRunKey === 'run5v5' ? '5v5' : '1v1', state.battleFrameData.battleTime);
      gameFrame.updateData(state.battleFrameData);
      gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
      syncSelectionFeedback(state, gameFrame);
      setSelectionHint('当前站位已随机重排', gameFrame);
    },
    onExportReplay: () => {
      const payload = {
        seed: state.seed,
        speed: state.speed,
        scenarioRunKey: state.scenarioRunKey,
        selectedScenarioPreset: state.selectedScenarioPreset,
        units: {
          blue: state.battleFrameData.blue.troops.length,
          red: state.battleFrameData.red.troops.length
        }
      };
      harness?.setRawEvents(`Export Replay\n${JSON.stringify(payload, null, 2)}`);
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

  harness.setRawEvents('尚未执行 Run 1v1/Run 5v5。');
  harness.setResult('Test Result: 尚未运行场景。');
  harness.setSelectedScenarioPreset(state.selectedScenarioPreset);
  gameFrame.updateData(state.battleFrameData);
  gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
  syncSelectionFeedback(state, gameFrame);
}
