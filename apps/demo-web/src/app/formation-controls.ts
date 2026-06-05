import { type SquadPosition } from '../game-ui/drag-player-squad';
import { type MockUnit } from '../mock/mock-armies';

export type FormationPreset = 'arrow' | 'crane' | 'scale';
export type FormationMode = 'preset' | 'manual';

export const formationLabel: Record<FormationPreset, string> = {
  arrow: '锋矢阵',
  crane: '鹤翼阵',
  scale: '鱼鳞阵'
};

const formationOrder: FormationPreset[] = ['arrow', 'crane', 'scale'];
const formationModeLabel: Record<FormationMode, string> = {
  preset: '预设阵型',
  manual: '手动布阵'
};

export const formatFormationDisplay = (formation: FormationPreset, mode: FormationMode): string =>
  `${formationLabel[formation]} · ${formationModeLabel[mode]}`;

export const nextFormation = (current: FormationPreset): FormationPreset => {
  const currentIndex = formationOrder.indexOf(current);
  return formationOrder[(currentIndex + 1) % formationOrder.length] ?? 'arrow';
};

export const applyFormation = (units: MockUnit[], formation: FormationPreset): MockUnit[] => {
  const slots = formationPositions(formation, units.length);
  return units.map((unit, index) => ({
    ...unit,
    slotX: slots[index]?.slotX ?? unit.slotX,
    slotY: slots[index]?.slotY ?? unit.slotY
  }));
};

export const shuffleTroopPositions = (units: MockUnit[], seed: string): MockUnit[] => {
  const ordered = [...units].sort((left, right) => hashSeed(`${seed}|${left.id}`) - hashSeed(`${seed}|${right.id}`));
  const positions = ordered.map((unit) => ({ slotX: unit.slotX, slotY: unit.slotY }));
  return units.map((unit, index) => ({ ...unit, ...positions[index % positions.length] }));
};

const hashSeed = (input: string): number =>
  [...input].reduce((sum, char) => (sum * 33 + char.charCodeAt(0)) % 104729, 17);

const formationPositions = (formation: FormationPreset, count: number): SquadPosition[] => {
  const positions: SquadPosition[] = [];
  for (let index = 0; index < count; index += 1) {
    if (formation === 'arrow') {
      const row = Math.floor(index / 2);
      const column = index % 2 === 0 ? -1 : 1;
      positions.push({
        slotX: Math.max(0.16, Math.min(0.86, 0.72 - row * 0.12 - (row === 0 && index === 0 ? -0.08 : 0))),
        slotY: Math.max(0.14, Math.min(0.86, 0.5 + (index === 0 ? 0 : column * (0.1 + row * 0.06))))
      });
      continue;
    }
    if (formation === 'crane') {
      const wing = index % 2 === 0 ? -1 : 1;
      const row = Math.floor(index / 2);
      positions.push({
        slotX: Math.max(0.14, Math.min(0.84, 0.56 - row * 0.09)),
        slotY: Math.max(0.12, Math.min(0.88, 0.5 + wing * (0.16 + row * 0.1)))
      });
      continue;
    }
    const row = Math.floor(index / 3);
    const col = index % 3;
    positions.push({
      slotX: Math.max(0.16, Math.min(0.84, 0.34 + col * 0.18 + row * 0.04)),
      slotY: Math.max(0.16, Math.min(0.84, 0.28 + row * 0.16 + (col % 2 === 0 ? 0 : 0.05)))
    });
  }
  return positions;
};
