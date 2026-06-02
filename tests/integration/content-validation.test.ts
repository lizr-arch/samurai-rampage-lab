import { describe, expect, it } from 'vitest';
import { validateBattleContentShape } from '@samurai-rampage/content';
import { createSampleContent } from '@samurai-rampage/scenarios';

describe('content validation', () => {
  it('accepts sample content', () => {
    expect(validateBattleContentShape(createSampleContent())).toEqual([]);
  });
});
