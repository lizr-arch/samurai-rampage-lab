import { type SquadPosition } from '../game-ui/drag-player-squad';
import { type MockBattleEvent, type MockBattleResult, type MockScenarioKey } from './mock-battle-events';
import { type UnitArchetype } from './mock-armies';

export type ScenarioPresetKey =
  | 'mid_clash'
  | 'archer_pressure'
  | 'cavalry_rush'
  | 'flank_ambush';

type ScenarioRunMap<T> = Record<MockScenarioKey, T>;
type ScenarioPositions = Record<UnitArchetype, SquadPosition>;

export interface MockScenarioPreset {
  id: ScenarioPresetKey;
  name: string;
  description: string;
  bluePositions: ScenarioPositions;
  redPositions: ScenarioPositions;
  runs: ScenarioRunMap<{
    battleTime: string;
    events: MockBattleEvent[];
    result: MockBattleResult;
  }>;
}

const midClashBlue: ScenarioPositions = {
  infantry: { slotX: 0.74, slotY: 0.34 },
  spearman: { slotX: 0.63, slotY: 0.48 },
  archer: { slotX: 0.24, slotY: 0.24 },
  gunner: { slotX: 0.30, slotY: 0.58 },
  cavalry: { slotX: 0.82, slotY: 0.54 },
  ninja: { slotX: 0.64, slotY: 0.68 }
};

const midClashRed: ScenarioPositions = {
  infantry: { slotX: 0.72, slotY: 0.66 },
  spearman: { slotX: 0.61, slotY: 0.54 },
  archer: { slotX: 0.22, slotY: 0.82 },
  gunner: { slotX: 0.32, slotY: 0.74 },
  cavalry: { slotX: 0.80, slotY: 0.38 },
  ninja: { slotX: 0.60, slotY: 0.80 }
};

const archerPressureBlue: ScenarioPositions = {
  infantry: { slotX: 0.58, slotY: 0.38 },
  spearman: { slotX: 0.50, slotY: 0.56 },
  archer: { slotX: 0.36, slotY: 0.18 },
  gunner: { slotX: 0.18, slotY: 0.46 },
  cavalry: { slotX: 0.70, slotY: 0.66 },
  ninja: { slotX: 0.46, slotY: 0.62 }
};

const archerPressureRed: ScenarioPositions = {
  infantry: { slotX: 0.58, slotY: 0.72 },
  spearman: { slotX: 0.48, slotY: 0.60 },
  archer: { slotX: 0.34, slotY: 0.88 },
  gunner: { slotX: 0.18, slotY: 0.58 },
  cavalry: { slotX: 0.70, slotY: 0.30 },
  ninja: { slotX: 0.44, slotY: 0.78 }
};

const cavalryRushBlue: ScenarioPositions = {
  infantry: { slotX: 0.54, slotY: 0.42 },
  spearman: { slotX: 0.36, slotY: 0.58 },
  archer: { slotX: 0.18, slotY: 0.22 },
  gunner: { slotX: 0.22, slotY: 0.56 },
  cavalry: { slotX: 0.88, slotY: 0.22 },
  ninja: { slotX: 0.72, slotY: 0.44 }
};

const cavalryRushRed: ScenarioPositions = {
  infantry: { slotX: 0.54, slotY: 0.76 },
  spearman: { slotX: 0.38, slotY: 0.62 },
  archer: { slotX: 0.18, slotY: 0.88 },
  gunner: { slotX: 0.24, slotY: 0.60 },
  cavalry: { slotX: 0.88, slotY: 0.78 },
  ninja: { slotX: 0.72, slotY: 0.56 }
};

const flankAmbushBlue: ScenarioPositions = {
  infantry: { slotX: 0.50, slotY: 0.42 },
  spearman: { slotX: 0.34, slotY: 0.56 },
  archer: { slotX: 0.22, slotY: 0.16 },
  gunner: { slotX: 0.28, slotY: 0.54 },
  cavalry: { slotX: 0.84, slotY: 0.78 },
  ninja: { slotX: 0.78, slotY: 0.12 }
};

const flankAmbushRed: ScenarioPositions = {
  infantry: { slotX: 0.50, slotY: 0.80 },
  spearman: { slotX: 0.34, slotY: 0.66 },
  archer: { slotX: 0.22, slotY: 0.90 },
  gunner: { slotX: 0.30, slotY: 0.60 },
  cavalry: { slotX: 0.82, slotY: 0.18 },
  ninja: { slotX: 0.76, slotY: 0.88 }
};

export const DEFAULT_SCENARIO_PRESET: ScenarioPresetKey = 'mid_clash';

export const MOCK_SCENARIO_PRESETS: Record<ScenarioPresetKey, MockScenarioPreset> = {
  mid_clash: {
    id: 'mid_clash',
    name: '中路激突',
    description: '双方前排压向中线，后排维持纵深，适合观察正面混战推进。',
    bluePositions: midClashBlue,
    redPositions: midClashRed,
    runs: {
      run1v1: {
        battleTime: '03:10',
        events: [
          { time: '00:04', actor: '蓝方足轻队', target: '红方中军', action: '前压突刺', value: -187, note: '中路抢线' },
          { time: '00:18', actor: '红方骑马队', target: '蓝方左翼', action: '反切入', value: -142, note: '拦截冲线' },
          { time: '00:31', actor: '蓝方铁炮队', target: '红方前排', action: '压制射击', value: -204, note: '护甲崩裂' },
          { time: '00:52', actor: '红方足轻队', target: '蓝方足轻队', action: '正面缠斗', value: -166, note: '中线胶着' }
        ],
        result: {
          winner: '蓝方胜',
          battleTime: '03:10',
          blueRemaining: '4212',
          redRemaining: '2689',
          totalDamage: '1580'
        }
      },
      run5v5: {
        battleTime: '04:42',
        events: [
          { time: '00:03', actor: '蓝方骑马队', target: '红方前排', action: '穿插冲锋', value: -301, note: '中路打穿' },
          { time: '00:14', actor: '红方弓兵队', target: '蓝方骑马队', action: '火力压制', value: -188, note: '箭雨牵制' },
          { time: '00:27', actor: '蓝方忍者队', target: '红方支援线', action: '短促骚扰', value: -146, note: '扰乱补给' },
          { time: '00:59', actor: '红方主将', target: '红方中军', action: '稳住战线', value: 0, note: '士气回升' }
        ],
        result: {
          winner: '红方胜',
          battleTime: '04:42',
          blueRemaining: '3118',
          redRemaining: '3569',
          totalDamage: '2365'
        }
      }
    }
  },
  archer_pressure: {
    id: 'archer_pressure',
    name: '弓阵压制',
    description: '远程火力排成更完整的压制线，前排护卫后场，适合观察射击感。',
    bluePositions: archerPressureBlue,
    redPositions: archerPressureRed,
    runs: {
      run1v1: {
        battleTime: '03:28',
        events: [
          { time: '00:06', actor: '蓝方弓兵队', target: '红方足轻队', action: '齐射压制', value: -214, note: '先手消耗' },
          { time: '00:21', actor: '红方铁炮队', target: '蓝方前排', action: '对射反制', value: -176, note: '弹幕交汇' },
          { time: '00:44', actor: '蓝方枪兵队', target: '蓝方弓兵队', action: '架枪护卫', value: 0, note: '稳住火力线' },
          { time: '01:03', actor: '红方弓兵队', target: '蓝方骑马队', action: '斜角点射', value: -152, note: '削弱侧切' }
        ],
        result: {
          winner: '蓝方胜',
          battleTime: '03:28',
          blueRemaining: '3988',
          redRemaining: '2510',
          totalDamage: '1722'
        }
      },
      run5v5: {
        battleTime: '05:02',
        events: [
          { time: '00:05', actor: '红方弓兵队', target: '蓝方中军', action: '连段火雨', value: -226, note: '持续压制' },
          { time: '00:19', actor: '蓝方铁炮队', target: '红方前排', action: '反压制射击', value: -264, note: '火力回敬' },
          { time: '00:48', actor: '红方枪兵队', target: '红方弓兵队', action: '列阵护卫', value: 0, note: '保住输出线' },
          { time: '01:16', actor: '蓝方忍者队', target: '红方后场', action: '切断补位', value: -208, note: '制造空窗' }
        ],
        result: {
          winner: '蓝方胜',
          battleTime: '05:02',
          blueRemaining: '3346',
          redRemaining: '2874',
          totalDamage: '2488'
        }
      }
    }
  },
  cavalry_rush: {
    id: 'cavalry_rush',
    name: '骑突冲锋',
    description: '骑马与突击单位压在同侧前沿，适合观察单翼高速突破和回卷。',
    bluePositions: cavalryRushBlue,
    redPositions: cavalryRushRed,
    runs: {
      run1v1: {
        battleTime: '02:54',
        events: [
          { time: '00:03', actor: '蓝方骑马队', target: '红方侧卫', action: '右翼突入', value: -262, note: '打穿外线' },
          { time: '00:17', actor: '红方忍者队', target: '蓝方骑马队', action: '贴身迟滞', value: -118, note: '削弱冲势' },
          { time: '00:36', actor: '蓝方忍者队', target: '红方后场', action: '接力切入', value: -194, note: '扩大缺口' },
          { time: '00:58', actor: '红方足轻队', target: '蓝方中军', action: '回防列阵', value: 0, note: '试图止损' }
        ],
        result: {
          winner: '蓝方胜',
          battleTime: '02:54',
          blueRemaining: '4420',
          redRemaining: '2388',
          totalDamage: '1816'
        }
      },
      run5v5: {
        battleTime: '04:18',
        events: [
          { time: '00:04', actor: '红方骑马队', target: '蓝方下翼', action: '对冲反打', value: -241, note: '双骑交错' },
          { time: '00:22', actor: '蓝方骑马队', target: '红方弓兵队', action: '深切后场', value: -312, note: '命中脆弱点' },
          { time: '00:41', actor: '红方铁炮队', target: '蓝方骑马队', action: '近距点杀', value: -186, note: '限制续航' },
          { time: '01:09', actor: '蓝方主将', target: '蓝方右翼', action: '追击号令', value: 0, note: '扩大突破口' }
        ],
        result: {
          winner: '蓝方胜',
          battleTime: '04:18',
          blueRemaining: '3521',
          redRemaining: '2796',
          totalDamage: '2574'
        }
      }
    }
  },
  flank_ambush: {
    id: 'flank_ambush',
    name: '侧翼奇袭',
    description: '忍者与骑队分散到上下翼，中央主力后撤半步，适合观察包夹与绕侧。',
    bluePositions: flankAmbushBlue,
    redPositions: flankAmbushRed,
    runs: {
      run1v1: {
        battleTime: '03:36',
        events: [
          { time: '00:08', actor: '蓝方忍者队', target: '红方后场', action: '上翼潜入', value: -173, note: '切断视野' },
          { time: '00:26', actor: '红方骑马队', target: '蓝方弓兵队', action: '下翼绕切', value: -201, note: '反制包夹' },
          { time: '00:47', actor: '蓝方足轻队', target: '红方中军', action: '拖住正面', value: -121, note: '为侧袭争取时间' },
          { time: '01:11', actor: '红方忍者队', target: '蓝方铁炮队', action: '烟幕突袭', value: -165, note: '后场混乱' }
        ],
        result: {
          winner: '红方胜',
          battleTime: '03:36',
          blueRemaining: '2874',
          redRemaining: '3092',
          totalDamage: '1694'
        }
      },
      run5v5: {
        battleTime: '05:14',
        events: [
          { time: '00:07', actor: '蓝方骑马队', target: '红方上翼', action: '拉开夹角', value: -215, note: '迫使分兵' },
          { time: '00:25', actor: '红方忍者队', target: '蓝方后场', action: '双线渗透', value: -238, note: '连环切入' },
          { time: '00:53', actor: '蓝方铁炮队', target: '红方中军', action: '越肩支援', value: -205, note: '火力补线' },
          { time: '01:20', actor: '红方主将', target: '红方两翼', action: '夹击合围', value: 0, note: '完成收口' }
        ],
        result: {
          winner: '红方胜',
          battleTime: '05:14',
          blueRemaining: '2768',
          redRemaining: '3410',
          totalDamage: '2522'
        }
      }
    }
  }
};

export function formatPresetMockEvents(
  preset: MockScenarioPreset,
  runKey: MockScenarioKey
): string {
  const run = preset.runs[runKey];
  const lines = [`Preset: ${preset.name} (${preset.id})`, `Desc: ${preset.description}`];
  lines.push(...run.events.map((event) => `${event.time} [${event.actor}] ${event.action} -> ${event.target} ${event.value}`));
  return lines.join('\n');
}

export function formatPresetMockResult(
  preset: MockScenarioPreset,
  runKey: MockScenarioKey,
  result: MockBattleResult & { seed: string; blueUnits: number; redUnits: number }
): string {
  return [
    `预设: ${preset.name}`,
    `说明: ${preset.description}`,
    `规模: ${runKey === 'run5v5' ? '5v5' : '1v1'}`,
    `胜负: ${result.winner}`,
    `战斗时间: ${result.battleTime}`,
    `蓝方剩余: ${result.blueRemaining}`,
    `红方剩余: ${result.redRemaining}`,
    `总伤害: ${result.totalDamage}`,
    `蓝方队数: ${result.blueUnits}`,
    `红方队数: ${result.redUnits}`,
    `种子: ${result.seed}`
  ].join('\n');
}
