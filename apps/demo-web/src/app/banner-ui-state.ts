import { type BannerIntent, type BannerOrder, type BannerUiState, type PlacedBanner, type UnitCommandState } from '../game-ui/banner-types';
import { type Commander } from '../game-ui/commander-types';

export interface BannerOrderPlacedEvent {
  type: 'banner_order_placed';
  timeMs: number;
  commanderId: string;
  bannerOrderId: string;
  bannerOrderName: string;
  intent: BannerIntent;
  cost: number;
  x: number;
  y: number;
  radiusPx: number;
  affectedUnitCount: number;
}

export interface CommanderBannersRestoredEvent {
  type: 'commander_banners_restored';
  timeMs: number;
  commanderId: string;
  currentBanners: number;
}

export type CommanderMockEvent = BannerOrderPlacedEvent | CommanderBannersRestoredEvent;
export type ArmBannerOutcome = 'armed' | 'cooldown' | 'insufficient_banners' | 'already_armed';
export type PlaceBannerOutcome = 'placed' | 'not_armed' | 'cooldown' | 'insufficient_banners';

/** 兵团命令状态持续时间 */
const COMMAND_STATE_DURATION_MS = 15_000;

function createPlacedBanner(commander: Commander, bannerOrder: BannerOrder, nowMs: number, x: number, y: number): PlacedBanner {
  return {
    id: `placed-${bannerOrder.id}-${nowMs}`,
    bannerOrderId: bannerOrder.id,
    commanderId: commander.id,
    x,
    y,
    radiusPx: bannerOrder.radiusPx,
    placedAtMs: nowMs,
    expiresAtMs: nowMs + bannerOrder.durationMs,
    label: bannerOrder.shortName
  };
}

function createCommandStates(
  bannerOrder: BannerOrder,
  nowMs: number,
  affectedUnitIds: string[]
): UnitCommandState[] {
  return affectedUnitIds.map((unitId) => ({
    unitId,
    bannerOrderId: bannerOrder.id,
    commandType: bannerOrder.intent,
    label: bannerOrder.shortName,
    expiresAtMs: nowMs + COMMAND_STATE_DURATION_MS
  }));
}

export function createInitialBannerUiState(commanders: Commander[]): BannerUiState {
  const initialCommander = commanders[0];
  if (!initialCommander) {
    throw new Error('Expected at least one commander');
  }
  const commanderBanners: Record<string, number> = {};
  for (const commander of commanders) {
    commanderBanners[commander.id] = commander.initialBanners;
  }
  return {
    selectedCommanderId: initialCommander.id,
    commanderBanners,
    armedBannerOrderId: null,
    hoveredBannerOrderId: null,
    activePlacedBanners: [],
    bannerCooldowns: {},
    recentBannerMessage: '',
    unitCommandStates: []
  };
}

export function selectCommander(state: BannerUiState, commander: Commander): BannerUiState {
  return {
    ...state,
    selectedCommanderId: commander.id,
    armedBannerOrderId: null,
    hoveredBannerOrderId: null,
    activePlacedBanners: [],
    bannerCooldowns: {},
    recentBannerMessage: `已切换主帅：${commander.name}`,
    unitCommandStates: []
  };
}

export function setHoveredBanner(state: BannerUiState, bannerOrderId: string | null): BannerUiState {
  if (state.hoveredBannerOrderId === bannerOrderId) {
    return state;
  }
  return { ...state, hoveredBannerOrderId: bannerOrderId };
}

export function getBannerOwnerCommanderId(commanders: Commander[], bannerOrderId: string): string | null {
  for (const c of commanders) {
    if (c.banners.some((b) => b.id === bannerOrderId)) {
      return c.id;
    }
  }
  return null;
}

export function armBannerOrder(
  state: BannerUiState,
  commanderId: string,
  bannerOrder: BannerOrder,
  nowMs: number
): { outcome: ArmBannerOutcome; state: BannerUiState } {
  const cooldownUntil = state.bannerCooldowns[bannerOrder.id] ?? 0;
  if (cooldownUntil > nowMs) {
    return { outcome: 'cooldown', state: { ...state, recentBannerMessage: '军旗冷却中' } };
  }
  const currentBanners = state.commanderBanners[commanderId] ?? 0;
  if (currentBanners < bannerOrder.cost) {
    return { outcome: 'insufficient_banners', state: { ...state, recentBannerMessage: '令旗不足' } };
  }
  if (state.armedBannerOrderId === bannerOrder.id) {
    return { outcome: 'already_armed', state };
  }
  return {
    outcome: 'armed',
    state: {
      ...state,
      armedBannerOrderId: bannerOrder.id,
      recentBannerMessage: `请选择战场位置投放：${bannerOrder.name}`
    }
  };
}

export function cancelArmedBanner(state: BannerUiState): BannerUiState {
  if (!state.armedBannerOrderId) return state;
  return {
    ...state,
    armedBannerOrderId: null,
    recentBannerMessage: '已取消投放'
  };
}

export function placeBannerOrder(input: {
  state: BannerUiState;
  commander: Commander;
  bannerOrder: BannerOrder;
  nowMs: number;
  worldX: number;
  worldY: number;
  affectedUnitIds: string[];
}): { outcome: PlaceBannerOutcome; state: BannerUiState; event?: BannerOrderPlacedEvent } {
  if (input.state.armedBannerOrderId !== input.bannerOrder.id) {
    return { outcome: 'not_armed', state: input.state };
  }
  const cooldownUntil = input.state.bannerCooldowns[input.bannerOrder.id] ?? 0;
  if (cooldownUntil > input.nowMs) {
    return { outcome: 'cooldown', state: { ...input.state, recentBannerMessage: '军旗冷却中', armedBannerOrderId: null } };
  }
  const currentBanners = input.state.commanderBanners[input.commander.id] ?? 0;
  if (currentBanners < input.bannerOrder.cost) {
    return { outcome: 'insufficient_banners', state: { ...input.state, recentBannerMessage: '令旗不足', armedBannerOrderId: null } };
  }

  // 新命令覆盖同 unitId 的旧命令
  const newStates = createCommandStates(input.bannerOrder, input.nowMs, input.affectedUnitIds);
  const newUnitIds = new Set(newStates.map((cs) => cs.unitId));
  const merged = [
    ...input.state.unitCommandStates.filter((cs) => !newUnitIds.has(cs.unitId)),
    ...newStates
  ];

  return {
    outcome: 'placed',
    state: {
      ...input.state,
      commanderBanners: {
        ...input.state.commanderBanners,
        [input.commander.id]: currentBanners - input.bannerOrder.cost
      },
      armedBannerOrderId: null,
      activePlacedBanners: [
        ...input.state.activePlacedBanners,
        createPlacedBanner(input.commander, input.bannerOrder, input.nowMs, input.worldX, input.worldY)
      ],
      bannerCooldowns: {
        ...input.state.bannerCooldowns,
        [input.bannerOrder.id]: input.nowMs + input.bannerOrder.cooldownMs
      },
      recentBannerMessage: `已投放：${input.bannerOrder.name}`,
      unitCommandStates: merged
    },
    event: {
      type: 'banner_order_placed',
      timeMs: input.nowMs,
      commanderId: input.commander.id,
      bannerOrderId: input.bannerOrder.id,
      bannerOrderName: input.bannerOrder.name,
      intent: input.bannerOrder.intent,
      cost: input.bannerOrder.cost,
      x: input.worldX,
      y: input.worldY,
      radiusPx: input.bannerOrder.radiusPx,
      affectedUnitCount: input.affectedUnitIds.length
    }
  };
}

export function cleanupBannerUiState(state: BannerUiState, nowMs: number): BannerUiState {
  const activePlacedBanners = state.activePlacedBanners.filter((banner) => banner.expiresAtMs > nowMs);
  const unitCommandStates = state.unitCommandStates.filter((cs) => cs.expiresAtMs > nowMs);
  const bannerCooldowns = Object.fromEntries(
    Object.entries(state.bannerCooldowns).filter(([, expiresAtMs]) => expiresAtMs > nowMs)
  );
  if (
    activePlacedBanners.length === state.activePlacedBanners.length &&
    unitCommandStates.length === state.unitCommandStates.length &&
    Object.keys(bannerCooldowns).length === Object.keys(state.bannerCooldowns).length
  ) {
    return state;
  }
  return {
    ...state,
    activePlacedBanners,
    unitCommandStates,
    bannerCooldowns
  };
}

export function restoreCommanderBanners(
  state: BannerUiState,
  commander: Commander,
  nowMs: number
): { state: BannerUiState; event: CommanderBannersRestoredEvent } {
  return {
    state: {
      ...state,
      commanderBanners: {
        ...state.commanderBanners,
        [commander.id]: commander.maxBanners
      },
      recentBannerMessage: `${commander.name} 令旗已恢复：${commander.maxBanners}/${commander.maxBanners}`
    },
    event: {
      type: 'commander_banners_restored',
      timeMs: nowMs,
      commanderId: commander.id,
      currentBanners: commander.maxBanners
    }
  };
}

export function formatCommanderEvent(event: CommanderMockEvent): string {
  if (event.type === 'commander_banners_restored') {
    return `${event.timeMs}ms [${event.commanderId}] commander_banners_restored banners=${event.currentBanners}`;
  }
  return `${event.timeMs}ms [${event.commanderId}] banner_order_placed ${event.bannerOrderName} x=${event.x} y=${event.y} affected=${event.affectedUnitCount}`;
}
