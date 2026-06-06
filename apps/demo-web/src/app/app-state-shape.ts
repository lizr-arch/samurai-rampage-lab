import { type GameFrameData } from './GameFrame';

export interface AppStateShape {
  selectedUnitId: string | null;
  battleFrameData: GameFrameData;
}
