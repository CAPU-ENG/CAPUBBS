import assert from 'node:assert/strict';
import { repairUnclosedLegacyBbcode } from './src/utils/legacyBbcodeRepair.ts';

const literalExample = '每个签名档不超过300字节；支持如[img]或[color]之类的转义';
assert.equal(
  repairUnclosedLegacyBbcode(literalExample),
  literalExample,
  'unclosed image markers must remain literal instead of consuming trailing text',
);
assert.equal(
  repairUnclosedLegacyBbcode('[img]https://example.com/image.png[/img]'),
  '[img]https://example.com/image.png[/img]',
  'complete image BBCode must remain available to the normal translator',
);
assert.equal(
  repairUnclosedLegacyBbcode('[color=white]文字'),
  '[color=white]文字[/color]',
  'repairable legacy formatting tags must still close at the end of the fragment',
);

console.log('legacy BBCode verification passed (3 assertions)');
