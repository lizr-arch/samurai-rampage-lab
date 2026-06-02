import type { BattleContent } from '@samurai-rampage/contracts';
import { validateBattleContentShape } from '../schema/simple-content-schema';

export function assertValidContent(content: BattleContent): void {
  const issues = validateBattleContentShape(content);
  if (issues.length > 0) {
    const detail = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
    throw new Error(`Invalid battle content:\n${detail}`);
  }
}
