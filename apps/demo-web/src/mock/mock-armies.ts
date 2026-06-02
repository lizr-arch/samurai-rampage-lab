export type BattleSide = 'blue' | 'red';

export interface MockUnit {
  id: string;
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

const baseUnits: Record<BattleSide, Omit<MockArmySide, 'score' | 'morale' | 'moraleMax'>> = {
  blue: {
    side: 'blue',
    commander: '武田葵',
    troops: [
      {
        id: 'blue-infantry',
        name: '足轻队',
        count: 1120,
        maxCount: 1300,
        hp: 88,
        maxHp: 120,
        level: 2,
        role: '肉搏',
        tag: '前排',
        slotX: 1,
        slotY: 0
      },
      {
        id: 'blue-archer',
        name: '弓兵队',
        count: 910,
        maxCount: 1000,
        hp: 72,
        maxHp: 96,
        level: 3,
        role: '远射',
        tag: '远程',
        slotX: 1,
        slotY: 1
      },
      {
        id: 'blue-cavalry',
        name: '骑马队',
        count: 540,
        maxCount: 680,
        hp: 104,
        maxHp: 140,
        level: 3,
        role: '突袭',
        tag: '突击',
        slotX: 1,
        slotY: 2
      },
      {
        id: 'blue-cannon',
        name: '铁炮队',
        count: 360,
        maxCount: 500,
        hp: 62,
        maxHp: 80,
        level: 1,
        role: '远击',
        tag: '支援',
        slotX: 1,
        slotY: 3
      },
      {
        id: 'blue-ninja',
        name: '忍者队',
        count: 250,
        maxCount: 360,
        hp: 48,
        maxHp: 68,
        level: 4,
        role: '奇袭',
        tag: '支援',
        slotX: 2,
        slotY: 4
      }
    ]
  },
  red: {
    side: 'red',
    commander: '上杉茜',
    troops: [
      {
        id: 'red-infantry',
        name: '足轻队',
        count: 1060,
        maxCount: 1260,
        hp: 86,
        maxHp: 118,
        level: 2,
        role: '肉搏',
        tag: '前排',
        slotX: 1,
        slotY: 0
      },
      {
        id: 'red-archer',
        name: '弓兵队',
        count: 930,
        maxCount: 1060,
        hp: 76,
        maxHp: 98,
        level: 2,
        role: '远射',
        tag: '远程',
        slotX: 1,
        slotY: 1
      },
      {
        id: 'red-cavalry',
        name: '骑马队',
        count: 520,
        maxCount: 720,
        hp: 98,
        maxHp: 132,
        level: 4,
        role: '突袭',
        tag: '突击',
        slotX: 1,
        slotY: 2
      },
      {
        id: 'red-cannon',
        name: '铁炮队',
        count: 380,
        maxCount: 520,
        hp: 64,
        maxHp: 82,
        level: 3,
        role: '远击',
        tag: '支援',
        slotX: 1,
        slotY: 3
      },
      {
        id: 'red-ninja',
        name: '忍者队',
        count: 286,
        maxCount: 400,
        hp: 58,
        maxHp: 70,
        level: 4,
        role: '奇袭',
        tag: '支援',
        slotX: 2,
        slotY: 4
      }
    ]
  }
};

function cloneUnits(units: MockUnit[]): MockUnit[] {
  return units.map((unit) => ({ ...unit }));
}

function makeArmy(side: BattleSide): MockArmySide {
  const info = baseUnits[side];
  return {
    side: info.side,
    commander: info.commander,
    troops: cloneUnits(info.troops),
    score: side === 'blue' ? 8720 : 7910,
    morale: side === 'blue' ? 84 : 78,
    moraleMax: 100
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

export function createArmyState(key: '1v1' | '5v5'): MockBattleData {
  const blue = makeArmy('blue');
  const red = makeArmy('red');
  if (key === '5v5') {
    blue.troops.forEach((unit, index) => {
      unit.count = Math.max(30, unit.count - 40 + index * 2);
      unit.hp = Math.max(24, unit.hp - 4 + index);
      unit.maxHp = Math.max(52, unit.maxHp - 2);
    });
    red.troops.forEach((unit, index) => {
      unit.count = Math.max(28, unit.count - 34 + index * 3);
      unit.hp = Math.max(22, unit.hp - 6 + index);
      unit.maxHp = Math.max(50, unit.maxHp - 3);
    });
    blue.score = 8680;
    red.score = 7800;
  }

  return { blue, red };
}

export function arrangeUnitsBySeed(state: MockBattleData, seed: string): MockBattleData {
  const shift = deterministicShift(seed);
  return {
    blue: {
      ...state.blue,
      troops: rotateUnits(state.blue.troops, shift)
    },
    red: {
      ...state.red,
      troops: rotateUnits(state.red.troops, shift + 2)
    }
  };
}
