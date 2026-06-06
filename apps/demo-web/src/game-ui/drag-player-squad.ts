import { type MockUnit } from '../mock/mock-armies';
import { type BattleSide } from '../mock/mock-armies';
import { projectBattlefieldUnit, toSlotPosition } from './battlefield-projection';

export interface SquadPosition {
  slotX: number;
  slotY: number;
}

export interface PlayerSquadDragCallbacks {
  onDragStart(side: BattleSide, unitId: string, position: SquadPosition): void;
  onDragEnd(result: {
    side: BattleSide;
    unitId: string;
    position: SquadPosition;
    committed: boolean;
    removed: boolean;
  }): void;
}

interface PlayerSquadDragInput extends PlayerSquadDragCallbacks {
  side: BattleSide;
  marker: HTMLElement;
  battlefield: HTMLElement;
  deleteZone?: HTMLElement | null;
  unit: MockUnit;
  otherSideUnits: MockUnit[];
  onSelect(unitId: string): void;
  setDragZoneState(state: 'idle' | 'valid' | 'invalid'): void;
}

const MIN_DROP_DISTANCE_PX = 76;

export function toBattleX(slotX: number, id: string): number {
  return projectBattlefieldUnit('blue', { id, slotX, slotY: 0.5 }).battleX;
}

export function toRedBattleX(slotX: number, id: string): number {
  return projectBattlefieldUnit('red', { id, slotX, slotY: 0.5 }).battleX;
}

export function toBattleY(slotY: number, id: string): number {
  return projectBattlefieldUnit('blue', { id, slotX: 0.5, slotY }).battleY;
}

function toSideSlotPosition(side: BattleSide, centerX: number, centerY: number, rect: DOMRect): SquadPosition {
  const xPercent = (centerX / rect.width) * 100;
  const yPercent = (centerY / rect.height) * 100;
  return toSlotPosition(side, xPercent, yPercent);
}

function getLocalScale(element: HTMLElement, rect: DOMRect): { scaleX: number; scaleY: number } {
  const scaleX = rect.width > 0 ? rect.width / element.offsetWidth : 1;
  const scaleY = rect.height > 0 ? rect.height / element.offsetHeight : 1;
  return {
    scaleX: scaleX > 0 ? scaleX : 1,
    scaleY: scaleY > 0 ? scaleY : 1
  };
}

export function isWithinSideHalf(side: BattleSide, centerX: number, centerY: number, rect: DOMRect): boolean {
  const horizontalValid =
    side === 'blue' ? centerX >= 0 && centerX <= rect.width * 0.5 : centerX >= rect.width * 0.5 && centerX <= rect.width;
  return horizontalValid && centerY >= 0 && centerY <= rect.height;
}

export function isFarEnough(
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

export function resolveBattlefieldDrop(
  side: BattleSide,
  unitId: string,
  clientX: number,
  clientY: number,
  battlefield: HTMLElement,
  otherSideUnits: MockUnit[]
): SquadPosition | null {
  const rect = battlefield.getBoundingClientRect();
  const scaleX = rect.width > 0 ? battlefield.offsetWidth / rect.width : 1;
  const scaleY = rect.height > 0 ? battlefield.offsetHeight / rect.height : 1;
  const centerX = (clientX - rect.left) * scaleX;
  const centerY = (clientY - rect.top) * scaleY;
  const localRect = new DOMRect(0, 0, battlefield.offsetWidth, battlefield.offsetHeight);
  const next = toSideSlotPosition(side, centerX, centerY, localRect);
  const valid = isWithinSideHalf(side, centerX, centerY, localRect) && isFarEnough(side, unitId, next, otherSideUnits, localRect);
  return valid ? next : null;
}

export function attachPlayerSquadDrag(input: PlayerSquadDragInput): void {
  const { marker, battlefield, unit, side } = input;

  marker.addEventListener('contextmenu', (event: MouseEvent) => {
    event.preventDefault();
    input.onSelect(unit.id);
    input.onDragEnd({
      side,
      unitId: unit.id,
      position: { slotX: unit.slotX, slotY: unit.slotY },
      committed: false,
      removed: true
    });
  });

  marker.addEventListener('mousedown', (event: MouseEvent) => {
    if (event.button !== 0) return;

    event.preventDefault();
    input.onSelect(unit.id);
    input.onDragStart(side, unit.id, {
      slotX: unit.slotX,
      slotY: unit.slotY
    });

    const rect = battlefield.getBoundingClientRect();
    const scale = getLocalScale(battlefield, rect);
    const markerRect = marker.getBoundingClientRect();
    const offsetX = (event.clientX - markerRect.left - markerRect.width / 2) / scale.scaleX;
    const offsetY = (event.clientY - markerRect.top - markerRect.height / 2) / scale.scaleY;
    let released = false;
    marker.classList.add('is-dragging');

    const finish = (committed: boolean, position: SquadPosition, removed: boolean): void => {
      if (released) return;
      released = true;
      marker.classList.remove('is-dragging', 'is-drop-invalid');
      marker.style.left = '';
      marker.style.top = '';
      input.setDragZoneState('idle');
      input.onDragEnd({ side, unitId: unit.id, position, committed, removed });
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
      const deleteRect = input.deleteZone?.getBoundingClientRect();
      if (
        deleteRect &&
        endEvent.clientX >= deleteRect.left &&
        endEvent.clientX <= deleteRect.right &&
        endEvent.clientY >= deleteRect.top &&
        endEvent.clientY <= deleteRect.bottom
      ) {
        finish(false, { slotX: unit.slotX, slotY: unit.slotY }, true);
        return;
      }

      const centerX = (endEvent.clientX - rect.left) / scale.scaleX - offsetX;
      const centerY = (endEvent.clientY - rect.top) / scale.scaleY - offsetY;
      const clampedCenterX = Math.max(0, Math.min(battlefield.offsetWidth, centerX));
      const clampedCenterY = Math.max(0, Math.min(battlefield.offsetHeight, centerY));
      const localRect = new DOMRect(0, 0, battlefield.offsetWidth, battlefield.offsetHeight);
      const next = toSideSlotPosition(side, clampedCenterX, clampedCenterY, localRect);
      const valid =
        isWithinSideHalf(side, clampedCenterX, clampedCenterY, localRect) &&
        isFarEnough(side, unit.id, next, input.otherSideUnits, localRect);

      finish(valid, valid ? next : { slotX: unit.slotX, slotY: unit.slotY }, false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd, { once: true });
  });
}
