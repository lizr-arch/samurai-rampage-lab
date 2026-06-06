import { applyBlueCommanderToFrameData } from './banner-placement';
import { type GameFrameData } from './GameFrame';
import { type BattleScale } from './deployment-mode';
import {
  UNIT_ARCHETYPE_ORDER,
  createBattleDataFromTroops,
  createMockUnit,
  type BattleSide,
  type MockUnit
} from '../mock/mock-armies';
import { MOCK_SCENARIO_PRESETS, type ScenarioPresetKey } from '../mock/mock-scenario-presets';

export function updateBattleData(input: {
  blueTroops: MockUnit[];
  redTroops: MockUnit[];
  scale: BattleScale;
  battleTime: string;
  speed: GameFrameData['speed'];
  commanderName: string;
}): GameFrameData {
  return applyBlueCommanderToFrameData({
    ...createBattleDataFromTroops(input.blueTroops, input.redTroops, input.scale),
    battleTime: input.battleTime,
    speed: input.speed,
    battleScale: input.scale
  }, input.commanderName);
}

function buildPresetTroops(side: BattleSide, presetKey: ScenarioPresetKey, scale: BattleScale): MockUnit[] {
  const preset = MOCK_SCENARIO_PRESETS[presetKey];
  const positions = side === 'blue' ? preset.bluePositions : preset.redPositions;
  return UNIT_ARCHETYPE_ORDER.map((archetype) => createMockUnit(side, archetype, scale, positions[archetype]));
}

export function makePresetBattleData(
  presetKey: ScenarioPresetKey,
  scale: BattleScale,
  speed: GameFrameData['speed'],
  battleTime: string,
  commanderName: string
): GameFrameData {
  return applyBlueCommanderToFrameData({
    ...createBattleDataFromTroops(
      buildPresetTroops('blue', presetKey, scale),
      buildPresetTroops('red', presetKey, scale),
      scale
    ),
    battleTime,
    speed,
    battleScale: scale
  }, commanderName);
}
