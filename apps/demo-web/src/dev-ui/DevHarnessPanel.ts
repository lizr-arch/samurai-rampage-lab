import { BattleSpeed } from '../mock/mock-battle-events';

export interface DevHarnessActions {
  seed: string;
  speed: BattleSpeed;
  onSeedChange: (seed: string) => void;
  onSpeedChange: (speed: BattleSpeed) => void;
  onRun1v1: () => void;
  onRun5v5: () => void;
  onResetBattle: () => void;
  onRandomFormation: () => void;
  onExportReplay: () => void;
  onImportReplay: () => void;
  onValidateContent: () => void;
  onTacticalCommand: (command: string) => void;
  onPlaybackAction: (action: 'pause' | 'play' | 'fastforward') => void;
}

export interface DevHarnessHandle {
  root: HTMLElement;
  setRawEvents(text: string): void;
  setResult(text: string): void;
  setSpeedDisplay(speed: BattleSpeed): void;
  setSelectedSpeed(speed: BattleSpeed): void;
}

export function createDevHarnessPanel(
  actions: DevHarnessActions
): DevHarnessHandle {
  const root = document.createElement('section');
  root.className = 'dev-harness';

  const title = document.createElement('h2');
  title.textContent = 'DevHarness';

  const scenario = document.createElement('div');
  scenario.className = 'harness-block';
  const scenarioTitle = document.createElement('h3');
  scenarioTitle.textContent = 'Scenario 控制';
  const run1 = document.createElement('button');
  run1.type = 'button';
  run1.textContent = 'Run 1v1';
  run1.addEventListener('click', actions.onRun1v1);
  const run5 = document.createElement('button');
  run5.type = 'button';
  run5.textContent = 'Run 5v5';
  run5.addEventListener('click', actions.onRun5v5);
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.textContent = 'Reset Battle';
  reset.addEventListener('click', actions.onResetBattle);
  const random = document.createElement('button');
  random.type = 'button';
  random.textContent = 'Random Formation';
  random.addEventListener('click', actions.onRandomFormation);
  scenario.append(scenarioTitle, run1, run5, reset, random);

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
  const exportBtn = document.createElement('button');
  exportBtn.type = 'button';
  exportBtn.textContent = 'Export Replay';
  exportBtn.addEventListener('click', actions.onExportReplay);
  const importBtn = document.createElement('button');
  importBtn.type = 'button';
  importBtn.textContent = 'Import Replay';
  importBtn.addEventListener('click', actions.onImportReplay);
  const validateBtn = document.createElement('button');
  validateBtn.type = 'button';
  validateBtn.textContent = 'Validate Content';
  validateBtn.addEventListener('click', actions.onValidateContent);
  tools.append(toolsTitle, exportBtn, importBtn, validateBtn);

  const status = document.createElement('div');
  status.className = 'harness-block';
  const statusTitle = document.createElement('h3');
  statusTitle.textContent = 'Raw Events';
  const raw = document.createElement('pre');
  raw.className = 'raw-events';
  raw.dataset.area = 'raw-events';
  raw.textContent = 'Raw Events: 尚未执行 Run 1v1/Run 5v5。';
  status.append(statusTitle, raw);

  const result = document.createElement('div');
  result.className = 'harness-block';
  const resultTitle = document.createElement('h3');
  resultTitle.textContent = 'Test Result';
  const resultArea = document.createElement('pre');
  resultArea.className = 'test-result';
  resultArea.dataset.area = 'test-result';
  resultArea.textContent = 'Test Result: 尚未运行场景。';
  result.append(resultTitle, resultArea);

  const bottomInfo = document.createElement('p');
  bottomInfo.className = 'harness-meta';
  bottomInfo.textContent = '提示：当前仅为 mock 驱动，未接 battle-core。';
  root.append(title, scenario, params, tools, status, result, bottomInfo);

  function setSelectedSpeed(speed: BattleSpeed): void {
    for (const button of speedButtons) {
      button.classList.toggle('is-selected', button.dataset.speed === speed);
    }
  }

  setSelectedSpeed(actions.speed);

  return {
    root,
    setRawEvents: (text) => {
      raw.textContent = `Raw Events:\n${text}`;
    },
    setResult: (text) => {
      resultArea.textContent = `Test Result:\n${text}`;
    },
    setSpeedDisplay: (speed) => {
      speedLabel.textContent = `速度 ${speed}`;
    },
    setSelectedSpeed
  };
}
