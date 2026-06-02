import {
  asUnitDefId,
  asWeaponDefId,
  type BattleCommand,
  type Formation
} from '@samurai-rampage/contracts';
import { createSampleContent } from './sample-content';

export function createSample5v5Command(): BattleCommand {
  const grid = { width: 8, height: 4 };
  const playerFormation: Formation = {
    grid,
    slots: [
      { side: 'player', unitDefId: asUnitDefId('samurai'), weaponDefId: asWeaponDefId('sword_basic'), pos: { x: 1, y: 1 } },
      { side: 'player', unitDefId: asUnitDefId('ashigaru'), weaponDefId: asWeaponDefId('spear_basic'), pos: { x: 1, y: 0 } },
      { side: 'player', unitDefId: asUnitDefId('ashigaru'), weaponDefId: asWeaponDefId('spear_basic'), pos: { x: 1, y: 2 } },
      { side: 'player', unitDefId: asUnitDefId('archer'), weaponDefId: asWeaponDefId('bow_basic'), pos: { x: 0, y: 0 } },
      { side: 'player', unitDefId: asUnitDefId('archer'), weaponDefId: asWeaponDefId('bow_basic'), pos: { x: 0, y: 3 } }
    ]
  };

  const enemyFormation: Formation = {
    grid,
    slots: [
      { side: 'enemy', unitDefId: asUnitDefId('samurai'), weaponDefId: asWeaponDefId('sword_basic'), pos: { x: 6, y: 1 } },
      { side: 'enemy', unitDefId: asUnitDefId('ashigaru'), weaponDefId: asWeaponDefId('spear_basic'), pos: { x: 6, y: 0 } },
      { side: 'enemy', unitDefId: asUnitDefId('ashigaru'), weaponDefId: asWeaponDefId('spear_basic'), pos: { x: 6, y: 2 } },
      { side: 'enemy', unitDefId: asUnitDefId('archer'), weaponDefId: asWeaponDefId('bow_basic'), pos: { x: 7, y: 0 } },
      { side: 'enemy', unitDefId: asUnitDefId('archer'), weaponDefId: asWeaponDefId('bow_basic'), pos: { x: 7, y: 3 } }
    ]
  };

  return {
    seed: 'sample-5v5',
    playerFormation,
    enemyFormation,
    content: createSampleContent(),
    tickMs: 200,
    maxDurationMs: 60000
  };
}
