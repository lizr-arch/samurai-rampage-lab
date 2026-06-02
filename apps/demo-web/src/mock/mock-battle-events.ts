export type BattleSpeed = '0.5x' | '1x' | '2x' | '4x';
export type MockScenarioKey = 'run1v1' | 'run5v5';

export interface MockBattleEvent {
  time: string;
  actor: string;
  target: string;
  action: string;
  value: number;
  note: string;
}

export interface MockBattleResult {
  winner: string;
  battleTime: string;
  blueRemaining: string;
  redRemaining: string;
  totalDamage: string;
}

export interface MockScenario {
  id: MockScenarioKey;
  battleTime: string;
  events: MockBattleEvent[];
  result: MockBattleResult;
}

const run1v1Events: MockBattleEvent[] = [
  { time: '00:04', actor: '蓝方足轻队', target: '红方弓兵队', action: '发起突刺', value: -187, note: '命中左翼' },
  { time: '00:18', actor: '红方忍者队', target: '蓝方骑马队', action: '迂回侧击', value: -255, note: '破坏缝隙' },
  { time: '00:29', actor: '蓝方铁炮队', target: '红方前排', action: '压制射击', value: -204, note: '护甲崩裂' },
  { time: '00:40', actor: '红方骑马队', target: '蓝方弓兵队', action: '骑射反击', value: -121, note: '稳扎推进' },
  { time: '01:14', actor: '蓝方武田主力', target: '红方中央', action: '指挥突进', value: 0, note: '鼓舞触发' },
  { time: '01:43', actor: '红方铁炮队', target: '蓝方足轻队', action: '齐射', value: -145, note: '队形松动' }
];

const run5v5Events: MockBattleEvent[] = [
  { time: '00:03', actor: '蓝方骑马队', target: '红方足轻队', action: '左翼绕后', value: -301, note: '牵制成功' },
  { time: '00:14', actor: '红方弓兵队', target: '蓝方骑马队', action: '火力压制', value: -188, note: '箭雨' },
  { time: '00:21', actor: '蓝方忍者队', target: '红方支援线', action: '扰乱', value: -220, note: '缴获军械' },
  { time: '00:34', actor: '红方主将', target: '蓝方中军', action: '鼓舞', value: 0, note: '气势恢复' },
  { time: '00:59', actor: '蓝方铁炮队', target: '红方骑马队', action: '连射', value: -268, note: '战术火力' },
  { time: '01:10', actor: '红方足轻队', target: '蓝方弓兵队', action: '反扑', value: -198, note: '交火延续' }
];

export const MOCK_SCENARIOS: Record<MockScenarioKey, MockScenario> = {
  run1v1: {
    id: 'run1v1',
    battleTime: '03:10',
    events: run1v1Events,
    result: {
      winner: '蓝方胜',
      battleTime: '03:10',
      blueRemaining: '4212',
      redRemaining: '2689',
      totalDamage: '1580'
    }
  },
  run5v5: {
    id: 'run5v5',
    battleTime: '04:42',
    events: run5v5Events,
    result: {
      winner: '红方胜',
      battleTime: '04:42',
      blueRemaining: '3118',
      redRemaining: '3569',
      totalDamage: '2365'
    }
  }
};

export function formatMockEvents(events: MockBattleEvent[]): string {
  return events
    .map((event) => `${event.time} [${event.actor}] ${event.action} -> ${event.target} ${event.value}`)
    .join('\n');
}

export function formatMockResult(result: MockBattleResult & { seed: string }): string {
  return [
    `胜负: ${result.winner}`,
    `战斗时间: ${result.battleTime}`,
    `蓝方剩余: ${result.blueRemaining}`,
    `红方剩余: ${result.redRemaining}`,
    `总伤害: ${result.totalDamage}`,
    `种子: ${result.seed}`
  ].join('\n');
}

