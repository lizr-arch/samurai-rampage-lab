import { MO } from '../layout/layout-constants';
import { BattleSide, type MockArmySide } from '../mock/mock-armies';
import { createArmyState, arrangeUnitsBySeed } from '../mock/mock-armies';
import { MOCK_SCENARIOS, formatMockEvents, formatMockResult, type MockScenarioKey } from '../mock/mock-battle-events';
import { createGameFrame, type GameFrameData, type GameFrameHandle } from './GameFrame';
import { createDevHarness, type DevHarnessHandle } from './DevHarness';
import { createGameFrameScaler } from '../layout/GameFrameScaler';

interface AppState {
  seed: string;
  speed: '0.5x' | '1x' | '2x' | '4x';
  scenario: MockScenarioKey | 'idle';
  selectedUnitId: string | null;
  selectedSide: BattleSide | null;
  battleFrameData: GameFrameData;
}

const sideLabel: Record<BattleSide, string> = {
  blue: '蓝方',
  red: '红方'
};

function makeInitialBattleData(): GameFrameData {
  const armies = createArmyState('1v1');
  return {
    blue: armies.blue,
    red: armies.red,
    battleTime: MO.defaultBattleTime,
    speed: MO.defaultSpeed
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
    selectedSide: null,
    battleFrameData: makeInitialBattleData()
  };

  const gameFrame = createGameFrame(frameHost, {
    data: state.battleFrameData,
    onUnitSelect: (unitId, side) => {
      state.selectedUnitId = unitId;
      state.selectedSide = side;
      gameFrame.setSelectedUnit(side, unitId);
      const text = describeUnitText(unitId, side, {
        blue: state.battleFrameData.blue,
        red: state.battleFrameData.red
      });
      setSelectionHint(text, gameFrame);
    },
    onTacticalCommand: (name) => {
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
    const arranged = arrangeUnitsBySeed(createArmyState(key), state.seed);
    state.scenario = key;
    state.battleFrameData = {
      blue: arranged.blue,
      red: arranged.red,
      battleTime: scenario.battleTime,
      speed: state.speed
    };
    gameFrame.updateData(state.battleFrameData);
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
      state.selectedSide = null;
      state.battleFrameData = makeInitialBattleData();
      gameFrame.updateData(state.battleFrameData);
      gameFrame.setSelectedUnit(null, null);
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
        blue: mixed.blue,
        red: mixed.red
      };
      gameFrame.updateData(state.battleFrameData);
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
}
