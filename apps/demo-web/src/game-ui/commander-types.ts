import { type BannerOrder, type BannerUiState } from './banner-types';
import { type CommandItem } from './commander-data';

export interface Commander {
  id: string;
  name: string;
  title: string;
  styleTags: string[];
  maxBanners: number;
  initialBanners: number;
  banners: BannerOrder[];
  commandItems: CommandItem[];
  description: string;
  portraitUrl?: string;
}

export interface CommanderUiModel extends BannerUiState {
  commanders: Commander[];
  nowMs: number;
  commanderSelectOpen: boolean;
  placementModeActive: boolean;
}

export interface BannerWithCommander {
  banner: BannerOrder;
  commander: Commander;
}

export function getAllBanners(commanders: Commander[]): BannerWithCommander[] {
  return commanders.flatMap((commander) =>
    commander.banners.map((banner) => ({ banner, commander }))
  );
}
