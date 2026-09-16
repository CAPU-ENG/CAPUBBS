import assert from 'node:assert/strict';
import {
  formatNestedReplyText,
  getNestedReplyInputState,
  NESTED_REPLY_MAX_LENGTH,
} from './src/utils/nestedReply.ts';

assert.equal(NESTED_REPLY_MAX_LENGTH, 500);
assert.equal(getNestedReplyInputState('').canSubmit, false);
assert.equal(getNestedReplyInputState(' \n\t ').canSubmit, false);
assert.equal(formatNestedReplyText('正文'), '正文');
assert.equal(formatNestedReplyText('正文', '甲'), '回复 @甲：正文');

for (const character of ['a', '字', '😀']) {
  const atLimit = getNestedReplyInputState(character.repeat(500));
  assert.deepEqual(atLimit, { canSubmit: true, isOverLimit: false, length: 500, limit: 500 });
  const tooLong = getNestedReplyInputState(character.repeat(501));
  assert.deepEqual(tooLong, { canSubmit: false, isOverLimit: true, length: 501, limit: 500 });
}

for (const targetName of ['甲', 'Alice', '车友😀']) {
  const { limit } = getNestedReplyInputState('', targetName);
  const content = '字'.repeat(limit);
  assert.equal(getNestedReplyInputState(content, targetName).canSubmit, true);
  assert.equal(Array.from(formatNestedReplyText(content, targetName)).length, 500);
  assert.equal(getNestedReplyInputState(`${content}字`, targetName).canSubmit, false);
  assert.equal(getNestedReplyInputState('', targetName).canSubmit, false);
}

assert.equal(getNestedReplyInputState('a'.repeat(500) + ' ').canSubmit, false, 'spaces count toward the displayed limit');
assert.equal(getNestedReplyInputState('正文', '甲'.repeat(500)).canSubmit, false, 'oversized reply prefixes leave no input capacity');
assert.equal(getNestedReplyInputState('a\n字😀').length, 4, 'line breaks and Unicode code points match the server count');

console.log('nested reply verification passed (empty content, 500/501 characters, Unicode and reply prefixes)');
