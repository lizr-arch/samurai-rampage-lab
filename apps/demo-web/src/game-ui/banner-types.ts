export type BannerPlacementType = 'placeArea';
export type BannerIntent = 'charge' | 'gather';

export interface BannerOrder {
  id: string;
  name: string;
  shortName: string;
  placementType: BannerPlacementType;
  intent: BannerIntent;
  cost: number;
  cooldownMs: number;
  durationMs: number;
  radiusPx: number;
  description: string;
  iconUrl?: string;
  worldSpriteUrl?: string;
}

export interface PlacedBanner {
  id: string;
  bannerOrderId: string;
  commanderId: string;
  x: number;
  y: number;
  radiusPx: number;
  placedAtMs: number;
  expiresAtMs: number;
  label: string;
}

/** 持久兵团命令状态 — 落旗后范围内兵团获得，新命令覆盖旧命令 */
export interface UnitCommandState {
  unitId: string;
  bannerOrderId: string;
  commandType: BannerIntent;
  label: string;
  expiresAtMs: number;
}

export interface BannerPlacementPreview {
  x: number;
  y: number;
  radiusPx: number;
  label: string;
  intent: BannerIntent;
  affectedUnitCount: number;
}

export interface BannerUiState {
  selectedCommanderId: string;
  /** 每个主帅的当前剩余令旗数 */
  commanderBanners: Record<string, number>;
  armedBannerOrderId: string | null;
  hoveredBannerOrderId: string | null;
  activePlacedBanners: PlacedBanner[];
  bannerCooldowns: Record<string, number>;
  recentBannerMessage: string;
  /** 持久兵团命令状态 */
  unitCommandStates: UnitCommandState[];
}
