import {
  asUnitDefId,
  asWeaponDefId,
  type BattleCommand,
  type Formation
} from '@samurai-rampage/contracts';
import { createSampleContent } from './sample-content';

export function createSample1v1Command(): BattleCommand {
  const grid = { width: 8, height: 4 };
  const playerFormation: Formation = {
    grid,
    slots: [
      { side: 'player', unitDefId: asUnitDefId('samurai'), weaponDefId: asWeaponDefId('sword_basic'), pos: { x: 1, y: 1 } }
    ]
  };

  const enemyFormation: Formation = {
    grid,
    slots: [
      { side: 'enemy', unitDefId: asUnitDefId('ashigaru'), weaponDefId: asWeaponDefId('spear_basic'), pos: { x: 6, y: 1 } }
    ]
  };

  return {
    seed: 'sample-1v1',
    playerFormation,
    enemyFormation,
    content: createSampleContent(),
    tickMs: 200,
    maxDurationMs: 60000
  };
}
