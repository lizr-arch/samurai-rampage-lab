import type { BattleContent } from '@samurai-rampage/contracts';
import { assertValidContent } from '../validation/validate-content';

export function loadContentFromObjects(content: BattleContent): BattleContent {
  assertValidContent(content);
  return content;
}
