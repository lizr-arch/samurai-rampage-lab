import { MO } from '../layout/layout-constants';
import { armBannerOrder, cancelArmedBanner, cleanupBannerUiState, createInitialBannerUiState, getBannerOwnerCommanderId, placeBannerOrder, restoreCommanderBanners, selectCommander, setHoveredBanner, type CommanderMockEvent } from './banner-ui-state';
import { createBannerPlacementPreview, findBannerById, formatCommanderEventLog, getAffectedBlueUnitIds, getSelectedCommander } from './banner-placement';
import { type BannerPlacementPreview, type BannerUiState } from '../game-ui/banner-types';
import { COMMANDERS, getCommanderById } from '../game-ui/commander-data';
import { BattleSide, UNIT_LIBRARY, createMockUnit, type MockUnit } from '../mock/mock-armies';
import { type MockScenarioKey } from '../mock/mock-battle-events';
import { DEFAULT_SCENARIO_PRESET, MOCK_SCENARIO_PRESETS, formatPresetMockEvents, formatPresetMockResult, type ScenarioPresetKey } from '../mock/mock-scenario-presets';
import { createGameFrame, type GameFrameData, type GameFrameHandle } from './GameFrame';
import { createDevHarness, type DevHarnessHandle } from './DevHarness';
import { createGameFrameScaler } from '../layout/GameFrameScaler';
import { makePresetBattleData, updateBattleData } from './battleframe-data';
import { cloneUnits, describeUnitText, setSelectionHint, syncSelectionFeedback } from './app-battlefield-selection';
import { canAddTroop } from './battle-prep';
import { completeRun, createInitialDeploymentMode, createToolStatusText, deriveDeploymentModeView, markDeploymentInputChanged, markScenarioPresetApplied, markSeedChanged, resetDeploymentMode, scaleTroopsForBattle, type DeploymentModeState } from './deployment-mode';
import { applyFormation, formatFormationDisplay, formationLabel, nextFormation, shuffleTroopPositions, type FormationMode, type FormationPreset } from './formation-controls';

interface AppState extends DeploymentModeState, BannerUiState {
  seed: string;
  speed: '0.5x' | '1x' | '2x' | '4x';
  selectedScenarioPreset: ScenarioPresetKey;
  selectedUnitId: string | null;
  selectedFormation: FormationPreset;
  formationMode: FormationMode;
  battleFrameData: GameFrameData;
}

const MAX_UNITS_PER_SIDE = 8;
const sideLabel: Record<BattleSide, string> = { blue: '蓝方', red: '红方' };

export async function createApp(root: HTMLElement): Promise<void> {
  const appHost = document.createElement('main');
  appHost.className = 'samurai-app-root';
  const frameHost = document.createElement('section');
  frameHost.className = 'game-frame-host';
  const harnessHost = document.createElement('section');
  harnessHost.className = 'dev-harness-host';
  appHost.append(frameHost, harnessHost);
  root.appendChild(appHost);

  const initialCommander = COMMANDERS[0]!;
  const state: AppState = {
    ...createInitialDeploymentMode(),
    ...createInitialBannerUiState(COMMANDERS),
    seed: MO.defaultSeed,
    speed: MO.defaultSpeed,
    selectedScenarioPreset: DEFAULT_SCENARIO_PRESET,
    selectedUnitId: null,
    selectedFormation: 'arrow',
    formationMode: 'preset',
    battleFrameData: makePresetBattleData(DEFAULT_SCENARIO_PRESET, '1v1', MO.defaultSpeed, MO.defaultBattleTime, initialCommander.name)
  };

  let harness: DevHarnessHandle | null = null;
  let commanderSelectOpen = false;
  let commanderEvents: CommanderMockEvent[] = [];
  let bannerPlacementPreview: BannerPlacementPreview | null = null;
  const uiStartMs = Date.now();
  const getUiNow = (): number => Date.now() - uiStartMs;
  const currentCommander = () => getSelectedCommander(COMMANDERS, state.selectedCommanderId);

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

  const refreshCommanderUi = (gameFrame: GameFrameHandle): void => {
    const commander = currentCommander();
    gameFrame.setCommanderUi({
      ...state,
      commanders: COMMANDERS,
      nowMs: getUiNow(),
      commanderSelectOpen,
      placementModeActive: state.armedBannerOrderId !== null
    });
    const isArmed = state.armedBannerOrderId !== null;
    gameFrame.setPlacementArmed(isArmed);
    const hoverOrArmedBanner = findBannerById(commander, state.armedBannerOrderId ?? state.hoveredBannerOrderId);
    gameFrame.setBannerPreviewTargets(
      bannerPlacementPreview && hoverOrArmedBanner
        ? getAffectedBlueUnitIds(hoverOrArmedBanner, state.battleFrameData, bannerPlacementPreview.x, bannerPlacementPreview.y)
        : []
    );
    gameFrame.setUnitCommandStates(state.unitCommandStates);
    gameFrame.setBannerPlacementPreview(bannerPlacementPreview);
    gameFrame.setPlacedBanners(state.activePlacedBanners);
    harness?.setOrderEvents(formatCommanderEventLog(commanderEvents));
  };

  const gameFrame = createGameFrame(frameHost, {
    data: state.battleFrameData,
    maxUnitsPerSide: MAX_UNITS_PER_SIDE,
    commanderUi: {
      ...state,
      commanders: COMMANDERS,
      nowMs: getUiNow(),
      commanderSelectOpen,
      placementModeActive: state.armedBannerOrderId !== null
    },
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
        state.battleFrameData = updateBattleData({
          blueTroops: nextBlue,
          redTroops: nextRed,
          scale: state.battleScale,
          battleTime: state.battleFrameData.battleTime,
          speed: state.speed,
          commanderName: currentCommander().name
        });
        gameFrame.updateData(state.battleFrameData);
        gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
        syncSelectionFeedback(state, gameFrame);
        refreshCommanderUi(gameFrame);
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
      state.battleFrameData = updateBattleData({
        blueTroops: nextBlue,
        redTroops: nextRed,
        scale: state.battleScale,
        battleTime: state.battleFrameData.battleTime,
        speed: state.speed,
        commanderName: currentCommander().name
      });
      gameFrame.updateData(state.battleFrameData);
      gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
      syncSelectionFeedback(state, gameFrame);
      refreshCommanderUi(gameFrame);
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
      state.battleFrameData = updateBattleData({
        blueTroops: nextBlue,
        redTroops: nextRed,
        scale,
        battleTime: state.battleFrameData.battleTime,
        speed: state.speed,
        commanderName: currentCommander().name
      });
      gameFrame.updateData(state.battleFrameData);
      gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
      syncSelectionFeedback(state, gameFrame);
      refreshCommanderUi(gameFrame);
      markBattleInputEdited();
      setSelectionHint(`${sideLabel[side]}新增 ${nextUnit.name}`, gameFrame);
    },
    onTacticalCommand: (name) => {
      if (name === '阵形') {
        state.selectedFormation = nextFormation(state.selectedFormation);
        state.formationMode = 'preset';
        const nextBlue = applyFormation(state.battleFrameData.blue.troops, state.selectedFormation);
        state.battleFrameData = updateBattleData({
          blueTroops: nextBlue,
          redTroops: state.battleFrameData.red.troops,
          scale: state.battleScale,
          battleTime: state.battleFrameData.battleTime,
          speed: state.speed,
          commanderName: currentCommander().name
        });
        gameFrame.updateData(state.battleFrameData);
        gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
        syncSelectionFeedback(state, gameFrame);
        refreshCommanderUi(gameFrame);
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
    },
    onCommanderToggle: () => {
      commanderSelectOpen = !commanderSelectOpen;
      refreshCommanderUi(gameFrame);
    },
    onCommanderSelect: (commanderId) => {
      const commander = getCommanderById(commanderId);
      Object.assign(state, selectCommander(state, commander));
      commanderSelectOpen = false;
      bannerPlacementPreview = null;
      state.battleFrameData = {
        ...state.battleFrameData,
        blue: {
          ...state.battleFrameData.blue,
          commander: commander.name
        }
      };
      gameFrame.updateData(state.battleFrameData);
      syncSelectionFeedback(state, gameFrame);
      refreshCommanderUi(gameFrame);
    },
    onBannerHover: (bannerOrderId) => {
      Object.assign(state, setHoveredBanner(state, bannerOrderId));
      refreshCommanderUi(gameFrame);
    },
    onClickOrder: (commandItemId) => {
      const cmd = currentCommander().commandItems.find((c) => c.id === commandItemId);
      if (cmd) {
        setSelectionHint(`军令: ${cmd.name}`, gameFrame);
      }
    },
    onBannerToggle: (bannerOrderId) => {
      const commanderId = getBannerOwnerCommanderId(COMMANDERS, bannerOrderId);
      const commander = commanderId ? getCommanderById(commanderId) : null;
      if (!commander) return;
      const bannerOrder = commander.banners.find((candidate) => candidate.id === bannerOrderId);
      if (!bannerOrder) return;
      if (state.armedBannerOrderId === bannerOrderId) {
        Object.assign(state, cancelArmedBanner(state));
        bannerPlacementPreview = null;
        refreshCommanderUi(gameFrame);
        return;
      }
      const result = armBannerOrder(state, commander.id, bannerOrder, getUiNow());
      Object.assign(state, result.state);
      bannerPlacementPreview = null;
      refreshCommanderUi(gameFrame);
    },
    onBattlefieldPointerMove: (position) => {
      const commanderId = state.armedBannerOrderId
        ? getBannerOwnerCommanderId(COMMANDERS, state.armedBannerOrderId)
        : null;
      const commander = commanderId ? getCommanderById(commanderId) : null;
      const bannerOrder = findBannerById(commander, state.armedBannerOrderId);
      bannerPlacementPreview = position && bannerOrder
        ? createBannerPlacementPreview(bannerOrder, state.battleFrameData, position.x, position.y)
        : null;
      refreshCommanderUi(gameFrame);
    },
    onBattlefieldPlaceBanner: (position) => {
      const commanderId = state.armedBannerOrderId
        ? getBannerOwnerCommanderId(COMMANDERS, state.armedBannerOrderId)
        : null;
      const commander = commanderId ? getCommanderById(commanderId) : null;
      const bannerOrder = findBannerById(commander, state.armedBannerOrderId);
      if (!bannerOrder || !commander) return;
      const result = placeBannerOrder({
        state,
        commander,
        bannerOrder,
        nowMs: getUiNow(),
        worldX: position.x,
        worldY: position.y,
        affectedUnitIds: getAffectedBlueUnitIds(bannerOrder, state.battleFrameData, position.x, position.y)
      });
      Object.assign(state, result.state);
      if (result.event) commanderEvents = [...commanderEvents, result.event];
      bannerPlacementPreview = null;
      refreshCommanderUi(gameFrame);
    },
    onBattlefieldCancelBanner: () => {
      Object.assign(state, cancelArmedBanner(state));
      bannerPlacementPreview = null;
      refreshCommanderUi(gameFrame);
    }
  });

  const applyRunOutput = (runKey: MockScenarioKey): void => {
    const preset = MOCK_SCENARIO_PRESETS[state.selectedScenarioPreset];
    const run = preset.runs[runKey];
    Object.assign(state, completeRun(state, runKey));
    state.battleFrameData = updateBattleData({
      blueTroops: scaleTroopsForBattle(state.battleFrameData.blue.troops, state.battleScale),
      redTroops: scaleTroopsForBattle(state.battleFrameData.red.troops, state.battleScale),
      scale: state.battleScale,
      battleTime: run.battleTime,
      speed: state.speed,
      commanderName: currentCommander().name
    });
    gameFrame.updateData(state.battleFrameData);
    syncSelectionFeedback(state, gameFrame);
    refreshCommanderUi(gameFrame);
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
      state.battleFrameData = makePresetBattleData(preset, state.battleScale, state.speed, battleTime, currentCommander().name);
      state.selectedUnitId = null;
      gameFrame.updateData(state.battleFrameData);
      gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
      harness?.setSelectedScenarioPreset(preset);
      syncSelectionFeedback(state, gameFrame);
      refreshCommanderUi(gameFrame);
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
      Object.assign(state, createInitialBannerUiState(COMMANDERS));
      state.selectedScenarioPreset = DEFAULT_SCENARIO_PRESET;
      state.selectedUnitId = null;
      state.selectedFormation = 'arrow';
      state.formationMode = 'preset';
      commanderEvents = [];
      commanderSelectOpen = false;
      bannerPlacementPreview = null;
      state.battleFrameData = makePresetBattleData(DEFAULT_SCENARIO_PRESET, state.battleScale, state.speed, MO.defaultBattleTime, currentCommander().name);
      gameFrame.updateData(state.battleFrameData);
      gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
      syncSelectionFeedback(state, gameFrame);
      refreshCommanderUi(gameFrame);
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
      state.battleFrameData = updateBattleData({
        blueTroops: nextBlue,
        redTroops: nextRed,
        scale: state.battleScale,
        battleTime: state.battleFrameData.battleTime,
        speed: state.speed,
        commanderName: currentCommander().name
      });
      gameFrame.updateData(state.battleFrameData);
      gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
      syncSelectionFeedback(state, gameFrame);
      refreshCommanderUi(gameFrame);
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
    onRestoreBanners: () => {
      const restored = restoreCommanderBanners(state, currentCommander(), getUiNow());
      Object.assign(state, restored.state);
      commanderEvents = [...commanderEvents, restored.event];
      refreshCommanderUi(gameFrame);
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
  harness.setOrderEvents('Commander Events: 尚未投放军旗。');
  harness.setSelectedScenarioPreset(state.selectedScenarioPreset);
  refreshDeploymentStatus();
  gameFrame.updateData(state.battleFrameData);
  gameFrame.setFormationLabel(formatFormationDisplay(state.selectedFormation, state.formationMode));
  syncSelectionFeedback(state, gameFrame);
  refreshCommanderUi(gameFrame);

  window.setInterval(() => {
    const nextState = cleanupBannerUiState(state, getUiNow());
    if (nextState !== state) {
      Object.assign(state, nextState);
      refreshCommanderUi(gameFrame);
    }
  }, 200);
}
