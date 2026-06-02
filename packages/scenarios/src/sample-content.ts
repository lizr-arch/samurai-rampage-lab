import {
  asSkillDefId,
  asUnitDefId,
  asWeaponDefId,
  type BattleContent
} from '@samurai-rampage/contracts';
import { loadContentFromObjects } from '@samurai-rampage/content';

export function createSampleContent(): BattleContent {
  return loadContentFromObjects({
    units: {
      ashigaru: {
        id: asUnitDefId('ashigaru'),
        name: '足轻',
        baseStats: { hp: 90, atk: 10, def: 4, range: 1, attackSpeed: 1, moveSpeed: 1 },
        allowedWeapons: ['sword', 'spear'],
        tags: ['frontline']
      },
      archer: {
        id: asUnitDefId('archer'),
        name: '弓兵',
        baseStats: { hp: 60, atk: 9, def: 2, range: 3, attackSpeed: 0.9, moveSpeed: 1 },
        allowedWeapons: ['bow'],
        tags: ['backline']
      },
      samurai: {
        id: asUnitDefId('samurai'),
        name: '侍',
        baseStats: { hp: 120, atk: 15, def: 6, range: 1, attackSpeed: 0.8, moveSpeed: 1 },
        allowedWeapons: ['sword', 'spear', 'hammer'],
        tags: ['elite']
      }
    },
    weapons: {
      sword_basic: {
        id: asWeaponDefId('sword_basic'),
        name: '打刀',
        type: 'sword',
        rangeBonus: 0,
        atkBonus: 2,
        cooldownMs: 1000
      },
      spear_basic: {
        id: asWeaponDefId('spear_basic'),
        name: '长枪',
        type: 'spear',
        rangeBonus: 1,
        atkBonus: 1,
        cooldownMs: 1100
      },
      bow_basic: {
        id: asWeaponDefId('bow_basic'),
        name: '和弓',
        type: 'bow',
        rangeBonus: 2,
        atkBonus: 0,
        cooldownMs: 1200
      }
    },
    skills: {
      placeholder: {
        id: asSkillDefId('placeholder'),
        name: '占位技能',
        description: '为后续技能系统预留。',
        tags: []
      }
    }
  });
}
