import { MO } from '../layout/layout-constants';
import { type SelectedUnitChipData } from '../game-ui/SelectedUnitChip';
import {
  BattleSide,
  UNIT_LIBRARY,
  UNIT_ARCHETYPE_ORDER,
  createBattleDataFromTroops,
  createMockUnit,
  type MockBattleData,
  type MockUnit
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
import { canAddTroop } from './battle-prep';
import {
  completeRun,
  createInitialDeploymentMode,
  createToolStatusText,
  deriveDeploymentModeView,
  markDeploymentInputChanged,
  markScenarioPresetApplied,
  markSeedChanged,
  resetDeploymentMode,
  scaleTroopsForBattle,
  type BattleScale,
  type DeploymentModeState
} from './deployment-mode';
import {
  applyFormation,
  formatFormationDisplay,
  formationLabel,
  nextFormation,
  shuffleTroopPositions,
  type FormationMode,
  type FormationPreset
} from './formation-controls';

interface AppState extends DeploymentModeState {
  seed: string;
  speed: '0.5x' | '1x' | '2x' | '4x';
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

function cloneUnits(units: MockUnit[]): MockUnit[] {
  return units.map((unit) => ({ ...unit }));
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

function updateBattleData(
  state: AppState,
  blueTroops: MockUnit[],
  redTroops: MockUnit[],
  scale: BattleScale,
  battleTime: string
): void {
  state.battleFrameData = {
    ...createBattleDataFromTroops(blueTroops, redTroops, scale),
    battleTime,
    speed: state.speed,
    battleScale: scale
  };
}

function buildPresetTroops(side: BattleSide, presetKey: ScenarioPresetKey, scale: BattleScale): MockUnit[] {
  const preset = MOCK_SCENARIO_PRESETS[presetKey];
  const positions = side === 'blue' ? preset.bluePositions : preset.redPositions;
  return UNIT_ARCHETYPE_ORDER.map((archetype) =>
    createMockUnit(side, archetype, scale, positions[archetype])
  );
}

function makePresetBattleData(
  presetKey: ScenarioPresetKey,
  scale: BattleScale,
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
    speed,
    battleScale: scale
  };
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
    ...createInitialDeploymentMode(),
    seed: MO.defaultSeed,
    speed: MO.defaultSpeed,
    selectedScenarioPreset: DEFAULT_SCENARIO_PRESET,
    selectedUnitId: null,
    selectedFormation: 'arrow',
    formationMode: 'preset',
    battleFrameData: makePresetBattleData(DEFAULT_SCENARIO_PRESET, '1v1', MO.defaultSpeed, MO.defaultBattleTime)
  };

  let harness: DevHarnessHandle | null = null;

  const getDeploymentStatus = () =>
    deriveDeploymentModeView(state, {
      selectedPresetName: MOCK_SCENARIO_PRESETS[state.selectedScenarioPreset].name
    });

  const refreshDeploymentStatus = (): void => {
    harness?.setDeploymentStatus(getDeploymentStatus());
  };

  const markBattleInputEdited = (): void => {
    Object.assign(state, markDeploymentInputChanged(state));
    refreshDeploymentStatus();
  };

  const markBattleInputRandomized = (): void => {
    Object.assign(state, markDeploymentInputChanged(state, 'randomized'));
    refreshDeploymentStatus();
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
        updateBattleData(state, nextBlue, nextRed, state.battleScale, state.battleFrameData.battleTime);
        gameFrame.updateData(state.battleFrameData);
        gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
        syncSelectionFeedback(state, gameFrame);
        markBattleInputEdited();
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
      updateBattleData(state, nextBlue, nextRed, state.battleScale, state.battleFrameData.battleTime);
      gameFrame.updateData(state.battleFrameData);
      gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
      syncSelectionFeedback(state, gameFrame);
      markBattleInputEdited();
      setSelectionHint(`${sideLabel[side]}布阵已更新`, gameFrame);
    },
    onTrayDeploy: ({ side, archetype, position }) => {
      const ownTroops = side === 'blue' ? state.battleFrameData.blue.troops : state.battleFrameData.red.troops;
      const deployAttempt = canAddTroop(ownTroops, archetype, state.battleScale, MAX_UNITS_PER_SIDE);
      if (!deployAttempt.allowed) {
        if (deployAttempt.reason === 'unit_cap') {
          setSelectionHint(`${sideLabel[side]}已达到 ${MAX_UNITS_PER_SIDE} 队上限`, gameFrame);
          return;
        }
        setSelectionHint(`${sideLabel[side]}军备不足，无法继续出阵 ${UNIT_LIBRARY[archetype].name}`, gameFrame);
        return;
      }
      const scale = state.battleScale;
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
      markBattleInputEdited();
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
          state.battleScale,
          state.battleFrameData.battleTime
        );
        gameFrame.updateData(state.battleFrameData);
        gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
        syncSelectionFeedback(state, gameFrame);
        markBattleInputEdited();
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

  const applyRunOutput = (runKey: MockScenarioKey): void => {
    const preset = MOCK_SCENARIO_PRESETS[state.selectedScenarioPreset];
    const run = preset.runs[runKey];
    Object.assign(state, completeRun(state, runKey));
    updateBattleData(
      state,
      scaleTroopsForBattle(state.battleFrameData.blue.troops, state.battleScale),
      scaleTroopsForBattle(state.battleFrameData.red.troops, state.battleScale),
      state.battleScale,
      run.battleTime
    );
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
    refreshDeploymentStatus();
  };

  harness = createDevHarness(harnessHost, {
    seed: state.seed,
    speed: state.speed,
    selectedScenarioPreset: state.selectedScenarioPreset,
    deploymentStatus: getDeploymentStatus(),
    onSeedChange: (seed) => {
      state.seed = seed || MO.defaultSeed;
      Object.assign(state, markSeedChanged(state));
      refreshDeploymentStatus();
      setSelectionHint(`当前随机种子: ${state.seed}`, gameFrame);
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
      Object.assign(state, markScenarioPresetApplied(state, 'preset'));
      const battleTime = state.runResultState === 'not_run' ? MO.defaultBattleTime : state.battleFrameData.battleTime;
      state.battleFrameData = makePresetBattleData(preset, state.battleScale, state.speed, battleTime);
      state.selectedUnitId = null;
      gameFrame.updateData(state.battleFrameData);
      gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
      harness?.setSelectedScenarioPreset(preset);
      syncSelectionFeedback(state, gameFrame);
      refreshDeploymentStatus();
      setSelectionHint(`部署预设已应用: ${MOCK_SCENARIO_PRESETS[preset].name}`, gameFrame);
    },
    onRun1v1: () => {
      applyRunOutput('run1v1');
    },
    onRun5v5: () => {
      applyRunOutput('run5v5');
    },
    onResetBattle: () => {
      Object.assign(state, resetDeploymentMode());
      state.selectedScenarioPreset = DEFAULT_SCENARIO_PRESET;
      state.selectedUnitId = null;
      state.selectedFormation = 'arrow';
      state.formationMode = 'preset';
      state.battleFrameData = makePresetBattleData(DEFAULT_SCENARIO_PRESET, state.battleScale, state.speed, MO.defaultBattleTime);
      gameFrame.updateData(state.battleFrameData);
      gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
      syncSelectionFeedback(state, gameFrame);
      harness?.setSelectedScenarioPreset(state.selectedScenarioPreset);
      refreshDeploymentStatus();
      harness?.setRawEvents('尚未执行 Run 1v1/Run 5v5。');
      harness?.setResult('尚未运行场景。');
      setSelectionHint('战斗已重置', gameFrame);
    },
    onRandomFormation: () => {
      const nextBlue = shuffleTroopPositions(
        state.battleFrameData.blue.troops,
        `${state.seed}|${state.battleScale}|${state.selectedScenarioPreset}|blue`
      );
      const nextRed = shuffleTroopPositions(
        state.battleFrameData.red.troops,
        `${state.seed}|${state.battleScale}|${state.selectedScenarioPreset}|red`
      );
      state.formationMode = 'manual';
      updateBattleData(state, nextBlue, nextRed, state.battleScale, state.battleFrameData.battleTime);
      gameFrame.updateData(state.battleFrameData);
      gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
      syncSelectionFeedback(state, gameFrame);
      markBattleInputRandomized();
      setSelectionHint('当前站位已随机重排', gameFrame);
    },
    onExportReplay: () => {
      const unitSummary = `蓝${state.battleFrameData.blue.troops.length} / 红${state.battleFrameData.red.troops.length}`;
      harness?.setToolStatus(`${createToolStatusText('export_replay')} ${state.battleScale} · ${unitSummary} · seed=${state.seed}`);
      setSelectionHint('Replay 已导出（模拟）', gameFrame);
    },
    onImportReplay: () => {
      harness?.setToolStatus(createToolStatusText('import_replay'));
      setSelectionHint('Replay 已导入（模拟）', gameFrame);
    },
    onValidateContent: () => {
      harness?.setToolStatus(createToolStatusText('validate_content'));
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
  harness.setResult('尚未运行场景。');
  harness.setSelectedScenarioPreset(state.selectedScenarioPreset);
  refreshDeploymentStatus();
  gameFrame.updateData(state.battleFrameData);
  gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
  syncSelectionFeedback(state, gameFrame);
}
