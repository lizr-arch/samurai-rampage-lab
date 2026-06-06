import { BattleSpeed } from '../mock/mock-battle-events';
import { DEFAULT_SCENARIO_PRESET, MOCK_SCENARIO_PRESETS, type ScenarioPresetKey } from '../mock/mock-scenario-presets';
import { type DeploymentModeViewModel } from '../app/deployment-mode';

export interface DevHarnessActions {
  seed: string;
  speed: BattleSpeed;
  selectedScenarioPreset: ScenarioPresetKey;
  deploymentStatus: DeploymentModeViewModel;
  onSeedChange: (seed: string) => void;
  onSpeedChange: (speed: BattleSpeed) => void;
  onScenarioPresetChange: (preset: ScenarioPresetKey) => void;
  onRun1v1: () => void;
  onRun5v5: () => void;
  onResetBattle: () => void;
  onRandomFormation: () => void;
  onExportReplay: () => void;
  onImportReplay: () => void;
  onValidateContent: () => void;
  onRestoreBanners: () => void;
  onTacticalCommand: (command: string) => void;
  onPlaybackAction: (action: 'pause' | 'play' | 'fastforward') => void;
}

export interface DevHarnessHandle {
  root: HTMLElement;
  setRawEvents(text: string): void;
  setResult(text: string): void;
  setSpeedDisplay(speed: BattleSpeed): void;
  setSelectedSpeed(speed: BattleSpeed): void;
  setSelectedScenarioPreset(preset: ScenarioPresetKey): void;
  setDeploymentStatus(status: DeploymentModeViewModel): void;
  setToolStatus(text: string): void;
  setOrderEvents(text: string): void;
}

function createButton(label: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

export function createDevHarnessPanel(
  actions: DevHarnessActions
): DevHarnessHandle {
  const root = document.createElement('section');
  root.className = 'dev-harness';

  const title = document.createElement('h2');
  title.textContent = 'DevHarness';

  const deployment = document.createElement('div');
  deployment.className = 'harness-block harness-deployment-status';
  const deploymentTitle = document.createElement('h3');
  deploymentTitle.textContent = '部署状态';
  const mainStatus = document.createElement('p');
  mainStatus.className = 'harness-status-line harness-status-line--primary';
  const inputStatus = document.createElement('p');
  inputStatus.className = 'harness-status-line';
  const resultStatus = document.createElement('p');
  resultStatus.className = 'harness-status-line';
  deployment.append(deploymentTitle, mainStatus, inputStatus, resultStatus);

  const scenario = document.createElement('div');
  scenario.className = 'harness-block';
  const scenarioTitle = document.createElement('h3');
  scenarioTitle.textContent = 'Scenario 控制';
  const run1 = createButton('Run 1v1', actions.onRun1v1);
  const run5 = createButton('Run 5v5', actions.onRun5v5);
  const reset = createButton('Reset Battle', actions.onResetBattle);
  const random = createButton('Random Formation', actions.onRandomFormation);
  const presetWrap = document.createElement('div');
  presetWrap.className = 'harness-preset-wrap';
  const presetLabel = document.createElement('p');
  presetLabel.className = 'harness-preset-label';
  presetLabel.textContent = '部署预设';
  const presetButtons = (Object.keys(MOCK_SCENARIO_PRESETS) as ScenarioPresetKey[]).map((presetKey) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = MOCK_SCENARIO_PRESETS[presetKey].name;
    button.dataset.preset = presetKey;
    button.addEventListener('click', () => actions.onScenarioPresetChange(presetKey));
    return button;
  });
  const presetDescription = document.createElement('p');
  presetDescription.className = 'harness-preset-description';
  scenario.append(scenarioTitle, presetLabel, presetWrap, presetDescription, run1, run5, reset, random);
  presetWrap.append(...presetButtons);

  const params = document.createElement('div');
  params.className = 'harness-block';
  const paramsTitle = document.createElement('h3');
  paramsTitle.textContent = '参数控制';
  const seedLabel = document.createElement('label');
  seedLabel.textContent = 'Seed';
  const seed = document.createElement('input');
  seed.type = 'text';
  seed.value = actions.seed;
  seed.addEventListener('change', () => actions.onSeedChange(seed.value.trim() || 'SAMURAI-001'));
  const speedWrap = document.createElement('div');
  speedWrap.className = 'harness-speed-wrap';
  const speedLabel = document.createElement('span');
  speedLabel.textContent = '速度';
  speedWrap.appendChild(speedLabel);
  const speedButtons = ['0.5x', '1x', '2x', '4x'].map((value) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = value;
    button.dataset.speed = value;
    button.addEventListener('click', () => actions.onSpeedChange(value as BattleSpeed));
    return button;
  });
  params.append(paramsTitle, seedLabel, seed, speedWrap, ...speedButtons);

  const tools = document.createElement('div');
  tools.className = 'harness-block';
  const toolsTitle = document.createElement('h3');
  toolsTitle.textContent = '数据工具';
  const exportBtn = createButton('Export Replay', actions.onExportReplay);
  const importBtn = createButton('Import Replay', actions.onImportReplay);
  const validateBtn = createButton('Validate Content', actions.onValidateContent);
  const restoreBannersBtn = createButton('恢复令旗', actions.onRestoreBanners);
  const toolStatus = document.createElement('p');
  toolStatus.className = 'harness-tool-status';
  toolStatus.textContent = '工具状态：未执行';
  tools.append(toolsTitle, exportBtn, importBtn, validateBtn, restoreBannersBtn, toolStatus);

  const status = document.createElement('div');
  status.className = 'harness-block';
  const statusTitle = document.createElement('h3');
  statusTitle.textContent = actions.deploymentStatus.rawEventsTitle;
  const raw = document.createElement('pre');
  raw.className = 'raw-events';
  raw.dataset.area = 'raw-events';
  raw.textContent = 'Raw Events: 尚未执行 Run 1v1/Run 5v5。';
  status.append(statusTitle, raw);

  const result = document.createElement('div');
  result.className = 'harness-block';
  const resultTitle = document.createElement('h3');
  resultTitle.textContent = actions.deploymentStatus.testResultTitle;
  const resultArea = document.createElement('pre');
  resultArea.className = 'test-result';
  resultArea.dataset.area = 'test-result';
  resultArea.textContent = 'Test Result: 尚未运行场景。';
  result.append(resultTitle, resultArea);

  const orderEvents = document.createElement('div');
  orderEvents.className = 'harness-block';
  const orderEventsTitle = document.createElement('h3');
  orderEventsTitle.textContent = 'Order Events';
  const orderEventsArea = document.createElement('pre');
  orderEventsArea.className = 'raw-events';
  orderEventsArea.dataset.area = 'order-events';
  orderEventsArea.textContent = 'Commander Events: 尚未发布军令。';
  orderEvents.append(orderEventsTitle, orderEventsArea);

  const bottomInfo = document.createElement('p');
  bottomInfo.className = 'harness-meta';
  bottomInfo.textContent = '提示：当前仅为 mock 驱动，未接 battle-core。';
  root.append(title, deployment, scenario, params, tools, status, result, orderEvents, bottomInfo);

  function setSelectedSpeed(speed: BattleSpeed): void {
    for (const button of speedButtons) {
      button.classList.toggle('is-selected', button.dataset.speed === speed);
    }
  }

  function setSelectedScenarioPreset(preset: ScenarioPresetKey): void {
    const selectedPreset = MOCK_SCENARIO_PRESETS[preset] ?? MOCK_SCENARIO_PRESETS[DEFAULT_SCENARIO_PRESET];
    for (const button of presetButtons) {
      button.classList.toggle('is-selected', button.dataset.preset === preset);
    }
    presetDescription.textContent = `${selectedPreset.name}: ${selectedPreset.description}`;
  }

  function setDeploymentStatus(status: DeploymentModeViewModel): void {
    mainStatus.textContent = status.mainStatus;
    inputStatus.textContent = status.inputStatus;
    resultStatus.textContent = status.resultStatus;
    statusTitle.textContent = status.rawEventsTitle;
    resultTitle.textContent = status.testResultTitle;
  }

  setSelectedSpeed(actions.speed);
  setSelectedScenarioPreset(actions.selectedScenarioPreset);
  setDeploymentStatus(actions.deploymentStatus);

  return {
    root,
    setRawEvents: (text) => {
      raw.textContent = text;
    },
    setResult: (text) => {
      resultArea.textContent = text;
    },
    setSpeedDisplay: (speed) => {
      speedLabel.textContent = `速度 ${speed}`;
    },
    setSelectedSpeed,
    setSelectedScenarioPreset,
    setDeploymentStatus,
    setToolStatus: (text) => {
      toolStatus.textContent = text;
    },
    setOrderEvents: (text) => {
      orderEventsArea.textContent = text;
    }
  };
}
