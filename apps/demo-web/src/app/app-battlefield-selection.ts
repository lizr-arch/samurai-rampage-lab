import { type SelectedUnitChipData } from '../game-ui/SelectedUnitChip';
import { type MockBattleData, type MockUnit, type BattleSide } from '../mock/mock-armies';
import { type GameFrameHandle } from './GameFrame';
import { type AppStateShape } from './app-state-shape';

const sideLabel: Record<BattleSide, string> = {
  blue: '蓝方',
  red: '红方'
};

export function cloneUnits(units: MockUnit[]): MockUnit[] {
  return units.map((unit) => ({ ...unit }));
}

export function parseSelectedKey(selectedUnitId: string | null): { side: BattleSide; unitId: string } | null {
  if (!selectedUnitId) return null;
  const match = /^(blue|red)-(.+)$/.exec(selectedUnitId);
  if (!match) return null;
  return {
    side: match[1] as BattleSide,
    unitId: match[2] ?? ''
  };
}

export function makeSelectedUnitChipData(unitId: string, side: BattleSide, armies: MockBattleData): SelectedUnitChipData | null {
  const army = side === 'blue' ? armies.blue : armies.red;
  const unit = army.troops.find((candidate) => candidate.id === unitId);
  if (!unit) return null;
  return {
    side,
    name: unit.name,
    level: unit.level,
    role: unit.role,
    tag: unit.tag,
    count: unit.count,
    maxCount: unit.maxCount
  };
}

export function describeUnitText(unitId: string, side: BattleSide, armies: MockBattleData): string {
  const army = side === 'blue' ? armies.blue : armies.red;
  const unit = army.troops.find((candidate) => candidate.id === unitId);
  if (!unit) return `${sideLabel[side]}未知单位`;
  return `${sideLabel[side]} ${unit.name} Lv.${unit.level} · 人数 ${unit.count}/${unit.maxCount} · 兵力 ${unit.hp}/${unit.maxHp} · ${unit.tag}`;
}

export function setSelectionHint(text: string, gameFrame: GameFrameHandle): void {
  gameFrame.showSelectionHint(text);
}

export function syncSelectionFeedback(state: AppStateShape, gameFrame: GameFrameHandle): void {
  gameFrame.setSelectedUnit(state.selectedUnitId);
  const selected = parseSelectedKey(state.selectedUnitId);
  if (!selected) {
    gameFrame.setSelectedUnitChip(null);
    return;
  }
  gameFrame.setSelectedUnitChip(
    makeSelectedUnitChipData(selected.unitId, selected.side, {
      blue: state.battleFrameData.blue,
      red: state.battleFrameData.red
    })
  );
}
