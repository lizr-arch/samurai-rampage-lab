import { type MockScenarioKey } from '../mock/mock-battle-events';
import {
  UNIT_LIBRARY,
  makeScaleAdjustedDefinition,
  type MockUnit
} from '../mock/mock-armies';

export type BattleScale = '1v1' | '5v5';
export type RunResultState = 'not_run' | 'current' | 'stale';
export type DeploymentOrigin = 'default_preset' | 'preset' | 'preset_edited' | 'randomized';
export type DevToolAction = 'export_replay' | 'import_replay' | 'validate_content';

export interface DeploymentModeState {
  battleScale: BattleScale;
  lastRunKey: MockScenarioKey | null;
  runResultState: RunResultState;
  deploymentOrigin: DeploymentOrigin;
}

export interface DeploymentModeTextContext {
  selectedPresetName: string;
}

export interface DeploymentModeViewModel {
  mainStatus: string;
  inputStatus: string;
  resultStatus: string;
  rawEventsTitle: string;
  testResultTitle: string;
}

export const INITIAL_TOOL_STATUS = '工具状态：未执行';

const runScaleByKey: Record<MockScenarioKey, BattleScale> = {
  run1v1: '1v1',
  run5v5: '5v5'
};

const expireRunResult = (state: RunResultState): RunResultState => (state === 'not_run' ? 'not_run' : 'stale');

export const createInitialDeploymentMode = (): DeploymentModeState => ({
  battleScale: '1v1',
  lastRunKey: null,
  runResultState: 'not_run',
  deploymentOrigin: 'default_preset'
});

export const resetDeploymentMode = (): DeploymentModeState => createInitialDeploymentMode();

export const getBattleScaleForRun = (runKey: MockScenarioKey): BattleScale => runScaleByKey[runKey];

export const markScenarioPresetApplied = (
  state: DeploymentModeState,
  origin: Extract<DeploymentOrigin, 'default_preset' | 'preset'> = 'preset'
): DeploymentModeState => ({
  ...state,
  deploymentOrigin: origin,
  runResultState: expireRunResult(state.runResultState)
});

export const markDeploymentInputChanged = (
  state: DeploymentModeState,
  origin: Extract<DeploymentOrigin, 'preset_edited' | 'randomized'> = 'preset_edited'
): DeploymentModeState => ({
  ...state,
  deploymentOrigin: origin,
  runResultState: expireRunResult(state.runResultState)
});

export const markSeedChanged = (state: DeploymentModeState): DeploymentModeState => ({
  ...state,
  runResultState: expireRunResult(state.runResultState)
});

export const completeRun = (state: DeploymentModeState, runKey: MockScenarioKey): DeploymentModeState => ({
  ...state,
  battleScale: getBattleScaleForRun(runKey),
  lastRunKey: runKey,
  runResultState: 'current'
});

export const deriveDeploymentModeView = (
  state: DeploymentModeState,
  context: DeploymentModeTextContext
): DeploymentModeViewModel => {
  const resultLabel =
    state.runResultState === 'not_run'
      ? '未运行'
      : state.runResultState === 'current'
        ? '对应当前战场'
        : '已过期';
  const titleLabel = state.runResultState === 'stale' ? '已过期，请重新 Run' : resultLabel;
  return {
    mainStatus: formatMainStatus(state),
    inputStatus: formatInputStatus(state, context.selectedPresetName),
    resultStatus: `Run 结果：${resultLabel}`,
    rawEventsTitle: `Raw Events · ${titleLabel}`,
    testResultTitle: `Test Result · ${titleLabel}`
  };
};

export const createToolStatusText = (action: DevToolAction): string => {
  if (action === 'export_replay') return '工具状态：Export Replay 已生成 mock replay 元数据。';
  if (action === 'import_replay') return '工具状态：Import Replay 模拟导入完成。';
  return '工具状态：Validate Content 通过（mock）。';
};

export const scaleTroopsForBattle = (troops: MockUnit[], scale: BattleScale): MockUnit[] =>
  troops.map((unit) => {
    const definition = makeScaleAdjustedDefinition(scale, UNIT_LIBRARY[unit.archetype]);
    return {
      ...unit,
      name: definition.name,
      count: definition.count,
      maxCount: definition.maxCount,
      hp: definition.hp,
      maxHp: definition.maxHp,
      level: definition.level,
      role: definition.role,
      tag: definition.tag
    };
  });

const formatMainStatus = (state: DeploymentModeState): string => {
  if (state.runResultState === 'stale') return '结果已过期，请重新 Run';
  if (state.runResultState === 'current' && state.lastRunKey) {
    return `已运行：${runScaleByKey[state.lastRunKey]}`;
  }
  return '当前可运行';
};

const formatInputStatus = (state: DeploymentModeState, presetName: string): string => {
  if (state.deploymentOrigin === 'default_preset') return `当前输入：默认模板 · ${state.battleScale}`;
  if (state.deploymentOrigin === 'preset') return `当前输入：${presetName}模板 · ${state.battleScale}`;
  if (state.deploymentOrigin === 'randomized') {
    return `当前输入：随机重排后的当前阵容 · 基于 ${presetName} · ${state.battleScale}`;
  }
  return `当前输入：${presetName}模板后已手调 · ${state.battleScale}`;
};
