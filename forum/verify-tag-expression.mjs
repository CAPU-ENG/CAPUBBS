import assert from 'node:assert/strict';
import {
  createTagExpressionFromFilters,
  evaluateTagExpression,
  formatTagExpression,
  getTagExpressionInsertionState,
  parseTagExpressionTokens,
  tagExpressionToTokens,
  toTagExpressionPayload,
  validateTagExpression,
} from './src/utils/tagExpression.ts';

const definitions = [
  { id: '1', name: 'A', color: '#111111' },
  { id: '2', name: 'B', color: '#222222' },
  { id: '3', name: 'C', color: '#333333' },
];

let tokenId = 0;

function tokens(...values) {
  return values.map((value) => {
    tokenId += 1;
    return /^[123]$/.test(value)
      ? { id: `test-${tokenId}`, tagId: value, type: 'tag' }
      : { id: `test-${tokenId}`, type: value };
  });
}

const parsed = parseTagExpressionTokens(tokens('open', '1', 'or', '2', 'close', 'and', 'not', '3'));
assert.equal(parsed.error, '');
assert.ok(parsed.expression);
assert.equal(validateTagExpression(parsed.expression, definitions), '');
assert.equal(formatTagExpression(parsed.expression, definitions), '(A OR B) AND NOT C');
assert.equal(evaluateTagExpression(parsed.expression, new Set(['1'])), true);
assert.equal(evaluateTagExpression(parsed.expression, new Set(['2', '3'])), false);
assert.equal(evaluateTagExpression(parsed.expression, new Set(['3'])), false);

assert.deepEqual(toTagExpressionPayload(parsed.expression), {
  children: [
    {
      children: [
        { not: false, tag_id: '1', type: 'tag' },
        { not: false, tag_id: '2', type: 'tag' },
      ],
      not: false,
      operator: 'or',
      type: 'group',
    },
    { not: true, tag_id: '3', type: 'tag' },
  ],
  not: false,
  operator: 'and',
  type: 'group',
});

const precedence = parseTagExpressionTokens(tokens('1', 'or', '2', 'and', '3'));
assert.equal(precedence.error, '');
assert.ok(precedence.expression);
assert.equal(formatTagExpression(precedence.expression, definitions), 'A OR (B AND C)');
assert.equal(evaluateTagExpression(precedence.expression, new Set(['2', '3'])), true);
assert.equal(evaluateTagExpression(precedence.expression, new Set(['2'])), false);

const migrated = tagExpressionToTokens(createTagExpressionFromFilters(['1', '2'], ['3']));
assert.deepEqual(migrated.map((token) => token.type), ['tag', 'and', 'tag', 'and', 'not', 'tag']);
const migratedParsed = parseTagExpressionTokens(migrated);
assert.equal(migratedParsed.error, '');
assert.ok(migratedParsed.expression);
assert.equal(formatTagExpression(migratedParsed.expression, definitions), 'A AND B AND NOT C');

assert.equal(parseTagExpressionTokens([]).error, '请至少添加一个标签条件');
assert.equal(parseTagExpressionTokens(tokens('and', '1')).error, 'AND 左侧必须是标签或括号分组');
assert.equal(parseTagExpressionTokens(tokens('1', 'and')).error, 'AND 右侧必须是标签或括号分组');
assert.equal(parseTagExpressionTokens(tokens('not')).error, 'NOT 右侧必须是标签或括号分组');
assert.equal(parseTagExpressionTokens(tokens('1', '2')).error, '标签或括号分组之间需要 AND 或 OR');
assert.equal(parseTagExpressionTokens(tokens('open', 'close')).error, '括号组不能为空');
assert.equal(parseTagExpressionTokens(tokens('open', '1')).error, '缺少右括号');
assert.equal(parseTagExpressionTokens(tokens('1', 'close')).error, '缺少左括号');
assert.equal(parseTagExpressionTokens(tokens('not', 'not', '1')).error, 'NOT 右侧必须是标签或括号分组');

const unknownTag = parseTagExpressionTokens([
  { id: 'test-unknown', tagId: '99', type: 'tag' },
]);
assert.equal(unknownTag.error, '');
assert.ok(unknownTag.expression);
assert.equal(validateTagExpression(unknownTag.expression, definitions), '表达式中包含不存在的标签');

const initialState = getTagExpressionInsertionState([]);
assert.equal(initialState.canAddTag, true);
assert.equal(initialState.canOpenGroup, true);
assert.equal(initialState.canAddNot, true);
assert.equal(initialState.canAddBinaryOperator, false);
assert.equal(initialState.canCloseGroup, false);

const tagState = getTagExpressionInsertionState(tokens('1'));
assert.equal(tagState.canAddTag, false);
assert.equal(tagState.canAddBinaryOperator, true);
assert.equal(tagState.isComplete, true);

const notState = getTagExpressionInsertionState(tokens('not'));
assert.equal(notState.canAddTag, true);
assert.equal(notState.canOpenGroup, true);
assert.equal(notState.canAddNot, false);
assert.equal(notState.isComplete, false);

const groupState = getTagExpressionInsertionState(tokens('open', '1'));
assert.equal(groupState.canCloseGroup, true);
assert.equal(groupState.isComplete, false);

console.log('tag expression verification passed');
