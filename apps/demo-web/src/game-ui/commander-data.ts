import { type BannerOrder, type BannerIntent } from './banner-types';
import { type Commander } from './commander-types';

/* ---- Command Items ---- */

export type CommandType = 'clickOrder' | 'placeBanner';

export interface CommandItem {
  id: string;
  name: string;
  type: CommandType;
  shortName: string;
  description: string;
}

/* ---- Banners (投放型) ---- */

const CHARGE_BANNER: BannerOrder = {
  id: 'banner_charge_area',
  name: '冲锋旗',
  shortName: '冲',
  placementType: 'placeArea',
  intent: 'charge' as BannerIntent,
  cost: 1,
  cooldownMs: 12000,
  durationMs: 5000,
  radiusPx: 150,
  description: '投放冲锋旗，范围内兵团进入冲锋倾向'
};

const GATHER_BANNER: BannerOrder = {
  id: 'banner_gather_area',
  name: '集结旗',
  shortName: '集',
  placementType: 'placeArea',
  intent: 'gather' as BannerIntent,
  cost: 1,
  cooldownMs: 12000,
  durationMs: 5000,
  radiusPx: 150,
  description: '投放集结旗，范围内兵团进入集结稳阵倾向'
};

/* ---- Commands (点击型) ---- */

export const CLICK_ORDER_CHARGE: CommandItem = {
  id: 'click_advance_all',
  name: '全军前进',
  type: 'clickOrder',
  shortName: '进',
  description: '下令全军向前推进'
};

export const CLICK_ORDER_STRATEGY: CommandItem = {
  id: 'click_hold_position',
  name: '停下休整',
  type: 'clickOrder',
  shortName: '停',
  description: '下令全军停止前进，原地休整'
};

/* ---- Commanders ---- */

export const COMMANDERS: Commander[] = [
  {
    id: 'charge_commander',
    name: '破阵主帅',
    title: '冲阵型',
    styleTags: ['进攻', '冲锋', '快节奏'],
    maxBanners: 3,
    initialBanners: 3,
    banners: [CHARGE_BANNER],
    commandItems: [CLICK_ORDER_CHARGE],
    description: '擅长推动全军压上，并通过冲锋旗制造局部突破。',
    portraitUrl: '/assets/commanders/commander_charge_01.png'
  },
  {
    id: 'strategy_commander',
    name: '筹策主帅',
    title: '调度型',
    styleTags: ['休整', '集结', '稳阵'],
    maxBanners: 3,
    initialBanners: 3,
    banners: [GATHER_BANNER],
    commandItems: [CLICK_ORDER_STRATEGY],
    description: '擅长稳住阵线，并通过集结旗调度局部部队。',
    portraitUrl: '/assets/commanders/commander_strategy_01.png'
  }
];

export function getCommanderById(commanderId: string): Commander {
  const commander = COMMANDERS.find((candidate) => candidate.id === commanderId);
  if (!commander) {
    throw new Error(`Unknown commander: ${commanderId}`);
  }
  return commander;
}
