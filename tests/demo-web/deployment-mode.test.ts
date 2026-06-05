import { describe, expect, it } from 'vitest';
import {
  createInitialDeploymentMode,
  completeRun,
  createToolStatusText,
  deriveDeploymentModeView,
  markDeploymentInputChanged,
  markScenarioPresetApplied,
  markSeedChanged,
  resetDeploymentMode,
  scaleTroopsForBattle,
  type DeploymentModeState
} from '../../apps/demo-web/src/app/deployment-mode';
import { type MockUnit } from '../../apps/demo-web/src/mock/mock-armies';

const view = (state: DeploymentModeState) =>
  deriveDeploymentModeView(state, {
    selectedPresetName: '中路激突'
  });

const makeUnit = (): MockUnit => ({
  id: 'blue-infantry-fixed',
  archetype: 'infantry',
  name: '足轻队',
  count: 1120,
  maxCount: 1300,
  hp: 88,
  maxHp: 120,
  level: 2,
  role: '肉搏',
  tag: '前排',
  slotX: 0.33,
  slotY: 0.44
});

describe('deployment mode state', () => {
  it('uses default 1v1 input and not-run result state initially and after reset', () => {
    const initial = createInitialDeploymentMode();
    const reset = resetDeploymentMode();

    expect(initial.runResultState).toBe('not_run');
    expect(initial.battleScale).toBe('1v1');
    expect(view(initial).mainStatus).toBe('当前可运行');
    expect(view(initial).inputStatus).toBe('当前输入：默认模板 · 1v1');
    expect(view(initial).rawEventsTitle).toBe('Raw Events · 未运行');
    expect(reset).toEqual(initial);
  });

  it('marks Run 1v1 and Run 5v5 as current and syncs battle scale', () => {
    const run1 = completeRun(createInitialDeploymentMode(), 'run1v1');
    const run5 = completeRun(run1, 'run5v5');

    expect(run1.runResultState).toBe('current');
    expect(run1.battleScale).toBe('1v1');
    expect(view(run1).mainStatus).toBe('已运行：1v1');
    expect(run5.runResultState).toBe('current');
    expect(run5.battleScale).toBe('5v5');
    expect(view(run5).mainStatus).toBe('已运行：5v5');
  });

  it('marks post-run deployment edits and random formation as stale', () => {
    const run = completeRun(createInitialDeploymentMode(), 'run5v5');
    const edited = markDeploymentInputChanged(run, 'preset_edited');
    const randomized = markDeploymentInputChanged(run, 'randomized');

    expect(edited.runResultState).toBe('stale');
    expect(edited.deploymentOrigin).toBe('preset_edited');
    expect(view(edited).rawEventsTitle).toBe('Raw Events · 已过期，请重新 Run');
    expect(randomized.runResultState).toBe('stale');
    expect(randomized.deploymentOrigin).toBe('randomized');
    expect(view(randomized).inputStatus).toBe('当前输入：随机重排后的当前阵容 · 基于 中路激突 · 5v5');
  });

  it('keeps not-run before the first run when preset or deployment input changes', () => {
    const preset = markScenarioPresetApplied(createInitialDeploymentMode(), 'preset');
    const edited = markDeploymentInputChanged(preset);

    expect(preset.runResultState).toBe('not_run');
    expect(view(preset).inputStatus).toBe('当前输入：中路激突模板 · 1v1');
    expect(edited.runResultState).toBe('not_run');
  });

  it('marks seed changes as stale after a run without changing the last run key', () => {
    const run = completeRun(createInitialDeploymentMode(), 'run1v1');
    const seedChanged = markSeedChanged(run);

    expect(seedChanged.runResultState).toBe('stale');
    expect(seedChanged.lastRunKey).toBe('run1v1');
    expect(seedChanged.battleScale).toBe('1v1');
  });

  it('keeps tool status independent from Run result view model', () => {
    const run = completeRun(createInitialDeploymentMode(), 'run1v1');
    const before = view(run);
    const toolStatus = createToolStatusText('export_replay');
    const after = view(run);

    expect(toolStatus).toContain('工具状态：Export Replay');
    expect(after).toEqual(before);
    expect(run.runResultState).toBe('current');
  });

  it('rescales troops for a run while preserving identity and position', () => {
    const unit = makeUnit();
    const [scaled] = scaleTroopsForBattle([unit], '5v5');

    expect(scaled?.id).toBe(unit.id);
    expect(scaled?.archetype).toBe(unit.archetype);
    expect(scaled?.slotX).toBe(unit.slotX);
    expect(scaled?.slotY).toBe(unit.slotY);
    expect(scaled?.count).not.toBe(unit.count);
    expect(scaled?.maxCount).not.toBe(unit.maxCount);
  });
});
