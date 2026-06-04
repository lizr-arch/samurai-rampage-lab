export type BattleSide = 'blue' | 'red';
export type UnitArchetype = 'infantry' | 'spearman' | 'archer' | 'gunner' | 'cavalry' | 'ninja';

export interface MockUnit {
  id: string;
  archetype: UnitArchetype;
  name: string;
  count: number;
  maxCount: number;
  hp: number;
  maxHp: number;
  level: number;
  role: string;
  tag: '前排' | '远程' | '突击' | '支援';
  slotX: number;
  slotY: number;
}

export interface MockArmySide {
  side: BattleSide;
  commander: string;
  score: number;
  morale: number;
  moraleMax: number;
  troops: MockUnit[];
}

export interface MockBattleData {
  blue: MockArmySide;
  red: MockArmySide;
}

export interface UnitDefinition {
  archetype: UnitArchetype;
  name: string;
  role: string;
  tag: MockUnit['tag'];
  count: number;
  maxCount: number;
  hp: number;
  maxHp: number;
  level: number;
}

export const UNIT_ARCHETYPE_ORDER: UnitArchetype[] = [
  'infantry',
  'spearman',
  'archer',
  'gunner',
  'cavalry',
  'ninja'
];

export const UNIT_LIBRARY: Record<UnitArchetype, UnitDefinition> = {
  infantry: {
    archetype: 'infantry',
    name: '足轻队',
    role: '肉搏',
    tag: '前排',
    count: 1120,
    maxCount: 1300,
    hp: 88,
    maxHp: 120,
    level: 2
  },
  spearman: {
    archetype: 'spearman',
    name: '枪兵队',
    role: '列枪',
    tag: '前排',
    count: 980,
    maxCount: 1180,
    hp: 92,
    maxHp: 126,
    level: 2
  },
  archer: {
    archetype: 'archer',
    name: '弓兵队',
    role: '远射',
    tag: '远程',
    count: 910,
    maxCount: 1000,
    hp: 72,
    maxHp: 96,
    level: 3
  },
  gunner: {
    archetype: 'gunner',
    name: '铁炮队',
    role: '远击',
    tag: '支援',
    count: 360,
    maxCount: 500,
    hp: 62,
    maxHp: 80,
    level: 1
  },
  cavalry: {
    archetype: 'cavalry',
    name: '骑马队',
    role: '突袭',
    tag: '突击',
    count: 540,
    maxCount: 680,
    hp: 104,
    maxHp: 140,
    level: 3
  },
  ninja: {
    archetype: 'ninja',
    name: '忍者队',
    role: '奇袭',
    tag: '支援',
    count: 250,
    maxCount: 360,
    hp: 48,
    maxHp: 68,
    level: 4
  }
};

const commanderBySide: Record<BattleSide, string> = {
  blue: '武田葵',
  red: '上杉茜'
};

const scoreByScale: Record<'1v1' | '5v5', Record<BattleSide, number>> = {
  '1v1': { blue: 8720, red: 7910 },
  '5v5': { blue: 8680, red: 7800 }
};

const sideUnitCounters: Record<BattleSide, number> = {
  blue: 0,
  red: 0
};

function makeUnitId(side: BattleSide, archetype: UnitArchetype): string {
  sideUnitCounters[side] += 1;
  return `${side}-${archetype}-${String(sideUnitCounters[side]).padStart(2, '0')}`;
}

function makeScaleAdjustedDefinition(scale: '1v1' | '5v5', definition: UnitDefinition): UnitDefinition {
  if (scale === '1v1') {
    return { ...definition };
  }
  const index = UNIT_ARCHETYPE_ORDER.indexOf(definition.archetype);
  return {
    ...definition,
    count: Math.max(28, definition.count - 34 + index * 6),
    maxCount: Math.max(60, definition.maxCount - 26 + index * 4),
    hp: Math.max(24, definition.hp - 6 + index),
    maxHp: Math.max(52, definition.maxHp - 4 + index)
  };
}

export function createMockUnit(
  side: BattleSide,
  archetype: UnitArchetype,
  scale: '1v1' | '5v5',
  position: { slotX: number; slotY: number }
): MockUnit {
  const definition = makeScaleAdjustedDefinition(scale, UNIT_LIBRARY[archetype]);
  return {
    id: makeUnitId(side, archetype),
    archetype,
    name: definition.name,
    count: definition.count,
    maxCount: definition.maxCount,
    hp: definition.hp,
    maxHp: definition.maxHp,
    level: definition.level,
    role: definition.role,
    tag: definition.tag,
    slotX: position.slotX,
    slotY: position.slotY
  };
}

function cloneUnits(units: MockUnit[]): MockUnit[] {
  return units.map((unit) => ({ ...unit }));
}

export function cloneBattleData(data: MockBattleData): MockBattleData {
  return {
    blue: {
      ...data.blue,
      troops: cloneUnits(data.blue.troops)
    },
    red: {
      ...data.red,
      troops: cloneUnits(data.red.troops)
    }
  };
}

function deterministicShift(seed: string): number {
  return [...seed].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 13, 7);
}

function rotateUnits(units: MockUnit[], shift: number): MockUnit[] {
  if (units.length === 0) return units;
  const offset = Math.abs(shift) % units.length;
  return [...units.slice(offset), ...units.slice(0, offset)];
}

export function createArmySide(side: BattleSide, troops: MockUnit[], scale: '1v1' | '5v5'): MockArmySide {
  return {
    side,
    commander: commanderBySide[side],
    troops: cloneUnits(troops),
    score: scoreByScale[scale][side],
    morale: side === 'blue' ? 84 : 78,
    moraleMax: 100
  };
}

export function createBattleDataFromTroops(
  blueTroops: MockUnit[],
  redTroops: MockUnit[],
  scale: '1v1' | '5v5'
): MockBattleData {
  return {
    blue: createArmySide('blue', blueTroops, scale),
    red: createArmySide('red', redTroops, scale)
  };
}

export function createArmyState(key: '1v1' | '5v5'): MockBattleData {
  return createBattleDataFromTroops([], [], key);
}

export function arrangeUnitsBySeed(state: MockBattleData, seed: string): MockBattleData {
  const shift = deterministicShift(seed);
  return {
    blue: {
      ...state.blue,
      troops: rotateUnits(state.blue.troops, shift).map((unit) => ({ ...unit }))
    },
    red: {
      ...state.red,
      troops: rotateUnits(state.red.troops, shift + 2).map((unit) => ({ ...unit }))
    }
  };
}
