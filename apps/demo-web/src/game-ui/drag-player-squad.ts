import { type MockUnit } from '../mock/mock-armies';
import { type BattleSide } from '../mock/mock-armies';

export interface SquadPosition {
  slotX: number;
  slotY: number;
}

export interface PlayerSquadDragCallbacks {
  onDragStart(side: BattleSide, unitId: string, position: SquadPosition): void;
  onDragEnd(result: { side: BattleSide; unitId: string; position: SquadPosition; committed: boolean }): void;
}

interface PlayerSquadDragInput extends PlayerSquadDragCallbacks {
  side: BattleSide;
  marker: HTMLElement;
  battlefield: HTMLElement;
  unit: MockUnit;
  otherSideUnits: MockUnit[];
  onSelect(unitId: string): void;
  setDragZoneState(state: 'idle' | 'valid' | 'invalid'): void;
}

const MIN_DROP_DISTANCE_PX = 76;

function clampUnitValue(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  return Math.max(0, Math.min(1, value));
}

function hashNoise(value: string): number {
  return [...value].reduce((sum, c) => (sum * 31 + c.charCodeAt(0)) % 113, 7);
}

export function toBattleX(slotX: number, id: string): number {
  const jitter = ((hashNoise(id) % 7) - 3) * 0.22;
  return 16 + clampUnitValue(slotX) * 38 + jitter;
}

export function toRedBattleX(slotX: number, id: string): number {
  return 84 - clampUnitValue(slotX) * 38 - ((hashNoise(id) % 7) - 3) * 0.22;
}

export function toBattleY(slotY: number, id: string): number {
  const jitter = ((hashNoise(id) % 9) - 4) * 0.15;
  return 13 + clampUnitValue(slotY) * 72 + jitter;
}

function toSlotPosition(centerX: number, centerY: number, rect: DOMRect): SquadPosition {
  const xPercent = (centerX / rect.width) * 100;
  const yPercent = (centerY / rect.height) * 100;
  return {
    slotX: clampUnitValue((xPercent - 16) / 38),
    slotY: clampUnitValue((yPercent - 13) / 72),
  };
}

function toSideSlotPosition(side: BattleSide, centerX: number, centerY: number, rect: DOMRect): SquadPosition {
  const xPercent = (centerX / rect.width) * 100;
  const yPercent = (centerY / rect.height) * 100;
  const slotX =
    side === 'blue'
      ? (xPercent - 16) / 38
      : (84 - xPercent) / 38;
  return {
    slotX: clampUnitValue(slotX),
    slotY: clampUnitValue((yPercent - 13) / 72),
  };
}

function getLocalScale(element: HTMLElement, rect: DOMRect): { scaleX: number; scaleY: number } {
  const scaleX = rect.width > 0 ? rect.width / element.offsetWidth : 1;
  const scaleY = rect.height > 0 ? rect.height / element.offsetHeight : 1;
  return {
    scaleX: scaleX > 0 ? scaleX : 1,
    scaleY: scaleY > 0 ? scaleY : 1,
  };
}

function isWithinSideHalf(side: BattleSide, centerX: number, centerY: number, rect: DOMRect): boolean {
  const horizontalValid =
    side === 'blue'
      ? centerX >= 0 && centerX <= rect.width * 0.5
      : centerX >= rect.width * 0.5 && centerX <= rect.width;
  return horizontalValid && centerY >= 0 && centerY <= rect.height;
}

function isFarEnough(
  side: BattleSide,
  unitId: string,
  nextPosition: SquadPosition,
  otherSideUnits: MockUnit[],
  rect: DOMRect
): boolean {
  const battleX = side === 'blue' ? toBattleX(nextPosition.slotX, unitId) : toRedBattleX(nextPosition.slotX, unitId);
  const nextX = (battleX / 100) * rect.width;
  const nextY = (toBattleY(nextPosition.slotY, unitId) / 100) * rect.height;
  return otherSideUnits.every((other) => {
    const otherBattleX = side === 'blue' ? toBattleX(other.slotX, other.id) : toRedBattleX(other.slotX, other.id);
    const otherX = (otherBattleX / 100) * rect.width;
    const otherY = (toBattleY(other.slotY, other.id) / 100) * rect.height;
    const distance = Math.hypot(nextX - otherX, nextY - otherY);
    return distance >= MIN_DROP_DISTANCE_PX;
  });
}

export function attachPlayerSquadDrag(input: PlayerSquadDragInput): void {
  const { marker, battlefield, unit, side } = input;

  marker.addEventListener('mousedown', (event: MouseEvent) => {
    if (event.button !== 0) return;

    event.preventDefault();
    input.onSelect(unit.id);
    input.onDragStart(side, unit.id, {
      slotX: unit.slotX,
      slotY: unit.slotY,
    });

    const rect = battlefield.getBoundingClientRect();
    const scale = getLocalScale(battlefield, rect);
    const markerRect = marker.getBoundingClientRect();
    const offsetX = (event.clientX - markerRect.left - markerRect.width / 2) / scale.scaleX;
    const offsetY = (event.clientY - markerRect.top - markerRect.height / 2) / scale.scaleY;
    let released = false;
    marker.classList.add('is-dragging');

    const finish = (committed: boolean, position: SquadPosition): void => {
      if (released) return;
      released = true;
      marker.classList.remove('is-dragging', 'is-drop-invalid');
      marker.style.left = '';
      marker.style.top = '';
      input.setDragZoneState('idle');
      input.onDragEnd({ side, unitId: unit.id, position, committed });
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
    };

    const handleMove = (moveEvent: MouseEvent): void => {
      const centerX = (moveEvent.clientX - rect.left) / scale.scaleX - offsetX;
      const centerY = (moveEvent.clientY - rect.top) / scale.scaleY - offsetY;
      const clampedCenterX = Math.max(0, Math.min(battlefield.offsetWidth, centerX));
      const clampedCenterY = Math.max(0, Math.min(battlefield.offsetHeight, centerY));
      marker.style.left = `${clampedCenterX}px`;
      marker.style.top = `${clampedCenterY}px`;

      const localRect = new DOMRect(0, 0, battlefield.offsetWidth, battlefield.offsetHeight);
      const next = toSideSlotPosition(side, clampedCenterX, clampedCenterY, localRect);
      const valid =
        isWithinSideHalf(side, clampedCenterX, clampedCenterY, localRect) &&
        isFarEnough(side, unit.id, next, input.otherSideUnits, localRect);

      marker.classList.toggle('is-drop-invalid', !valid);
      input.setDragZoneState(valid ? 'valid' : 'invalid');
    };

    const handleEnd = (endEvent: MouseEvent): void => {
      const centerX = (endEvent.clientX - rect.left) / scale.scaleX - offsetX;
      const centerY = (endEvent.clientY - rect.top) / scale.scaleY - offsetY;
      const clampedCenterX = Math.max(0, Math.min(battlefield.offsetWidth, centerX));
      const clampedCenterY = Math.max(0, Math.min(battlefield.offsetHeight, centerY));
      const localRect = new DOMRect(0, 0, battlefield.offsetWidth, battlefield.offsetHeight);
      const next = toSideSlotPosition(side, clampedCenterX, clampedCenterY, localRect);
      const valid =
        isWithinSideHalf(side, clampedCenterX, clampedCenterY, localRect) &&
        isFarEnough(side, unit.id, next, input.otherSideUnits, localRect);

      finish(valid, valid ? next : { slotX: unit.slotX, slotY: unit.slotY });
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd, { once: true });
  });
}
