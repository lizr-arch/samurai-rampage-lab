import { type CommanderMockEvent } from './banner-ui-state';
import { type GameFrameData } from './GameFrame';
import { type BannerOrder, type BannerPlacementPreview } from '../game-ui/banner-types';
import { type Commander } from '../game-ui/commander-types';
import { type MockUnit } from '../mock/mock-armies';
import { projectBattlefieldUnit } from '../game-ui/battlefield-projection';

export function applyBlueCommanderToFrameData(data: GameFrameData, commanderName: string): GameFrameData {
  return {
    ...data,
    blue: {
      ...data.blue,
      commander: commanderName
    }
  };
}

export function getSelectedCommander(commanders: Commander[], selectedCommanderId: string): Commander {
  const commander = commanders.find((candidate) => candidate.id === selectedCommanderId);
  if (!commander) {
    throw new Error(`Unknown commander: ${selectedCommanderId}`);
  }
  return commander;
}

function distanceSquared(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export function getAffectedBlueUnitIds(bannerOrder: BannerOrder, data: GameFrameData, worldX: number, worldY: number): string[] {
  const radiusSquared = bannerOrder.radiusPx * bannerOrder.radiusPx;
  return data.blue.troops
    .filter((unit) => {
      const projected = projectBattlefieldUnit('blue', unit);
      return distanceSquared(projected.battleX * 19.2, projected.battleY * 10.8, worldX, worldY) <= radiusSquared;
    })
    .map((unit) => unit.id);
}

export function createBannerPlacementPreview(
  bannerOrder: BannerOrder,
  data: GameFrameData,
  worldX: number,
  worldY: number
): BannerPlacementPreview {
  return {
    x: worldX,
    y: worldY,
    radiusPx: bannerOrder.radiusPx,
    label: bannerOrder.shortName,
    intent: bannerOrder.intent,
    affectedUnitCount: getAffectedBlueUnitIds(bannerOrder, data, worldX, worldY).length
  };
}

export function formatCommanderEventLog(events: CommanderMockEvent[]): string {
  if (events.length === 0) {
    return 'Commander Events: 尚未投放军旗。';
  }
  return events.slice(-8).map((event) => JSON.stringify(event, null, 2)).join('\n\n');
}

export function findBannerById(commander: Commander, bannerOrderId: string | null): BannerOrder | null {
  if (!bannerOrderId) return null;
  return commander.banners.find((candidate) => candidate.id === bannerOrderId) ?? null;
}

export function cloneTroops(units: MockUnit[]): MockUnit[] {
  return units.map((unit) => ({ ...unit }));
}
