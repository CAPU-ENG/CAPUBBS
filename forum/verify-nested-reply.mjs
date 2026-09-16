import assert from 'node:assert/strict';
import {
  formatNestedReplyText,
  getNestedReplyInputState,
  NESTED_REPLY_MAX_LENGTH,
} from './src/utils/nestedReply.ts';

assert.equal(NESTED_REPLY_MAX_LENGTH, 400);
assert.equal(getNestedReplyInputState('').canSubmit, false);
assert.equal(getNestedReplyInputState(' \n\t ').canSubmit, false);
assert.equal(formatNestedReplyText('正文'), '正文');
assert.equal(formatNestedReplyText('正文', '甲'), '回复 @甲：正文');

for (const character of ['a', '字', '😀']) {
  const atLimit = getNestedReplyInputState(character.repeat(400));
  assert.deepEqual(atLimit, { canSubmit: true, isOverLimit: false, length: 400, limit: 400 });
  const tooLong = getNestedReplyInputState(character.repeat(401));
  assert.deepEqual(tooLong, { canSubmit: false, isOverLimit: true, length: 401, limit: 400 });
}

for (const targetName of ['甲', 'Alice', '车友😀']) {
  const content = '字'.repeat(400);
  assert.equal(getNestedReplyInputState(content).canSubmit, true);
  assert.equal(formatNestedReplyText(content, targetName), `回复 @${targetName}：${content}`);
  assert.equal(getNestedReplyInputState(content).limit, 400, 'reply targets do not reduce the input limit');
}

assert.equal(getNestedReplyInputState('a'.repeat(400) + ' ').canSubmit, false, 'spaces count toward the displayed limit');
assert.equal(getNestedReplyInputState('a\n字😀').length, 4, 'line breaks and Unicode code points match the server count');

console.log('nested reply verification passed (empty content, fixed 400-character limit, Unicode and reply text)');
