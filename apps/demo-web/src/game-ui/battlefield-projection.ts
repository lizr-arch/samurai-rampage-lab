import { type BattleSide, type MockUnit } from '../mock/mock-armies';

export interface BattlefieldProjection {
  battleX: number;
  battleY: number;
}

function clampUnitValue(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  return Math.max(0, Math.min(1, value));
}

function hashNoise(value: string): number {
  return [...value].reduce((sum, c) => (sum * 31 + c.charCodeAt(0)) % 113, 7);
}

export function projectBattlefieldUnit(side: BattleSide, unit: Pick<MockUnit, 'id' | 'slotX' | 'slotY'>): BattlefieldProjection {
  const xJitter = ((hashNoise(unit.id) % 7) - 3) * 0.22;
  const yJitter = ((hashNoise(unit.id) % 9) - 4) * 0.15;
  const normalizedX = clampUnitValue(unit.slotX);
  const normalizedY = clampUnitValue(unit.slotY);

  return {
    battleX: side === 'blue' ? 16 + normalizedX * 38 + xJitter : 84 - normalizedX * 38 - xJitter,
    battleY: 13 + normalizedY * 72 + yJitter
  };
}

export function toSlotPosition(side: BattleSide, xPercent: number, yPercent: number): { slotX: number; slotY: number } {
  const slotX = side === 'blue' ? (xPercent - 16) / 38 : (84 - xPercent) / 38;
  return {
    slotX: clampUnitValue(slotX),
    slotY: clampUnitValue((yPercent - 13) / 72)
  };
}
