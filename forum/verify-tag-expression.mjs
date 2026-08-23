import assert from 'node:assert/strict';
import {
  createTagExpressionGroup,
  createTagExpressionTag,
  evaluateTagExpression,
  formatTagExpression,
  toTagExpressionPayload,
  validateTagExpression,
} from './src/utils/tagExpression.ts';

const definitions = [
  { id: '1', name: 'A', color: '#111111' },
  { id: '2', name: 'B', color: '#222222' },
  { id: '3', name: 'C', color: '#333333' },
];

const expression = createTagExpressionGroup([
  createTagExpressionGroup([
    createTagExpressionTag('1'),
    createTagExpressionTag('2'),
  ], 'or'),
  createTagExpressionTag('3', true),
]);

assert.equal(validateTagExpression(expression, definitions), '');
assert.equal(formatTagExpression(expression, definitions), '(A OR B) AND NOT C');
assert.equal(evaluateTagExpression(expression, new Set(['1'])), true);
assert.equal(evaluateTagExpression(expression, new Set(['2', '3'])), false);
assert.equal(evaluateTagExpression(expression, new Set(['3'])), false);

const negatedGroup = createTagExpressionGroup([
  createTagExpressionTag('1'),
  createTagExpressionTag('2'),
], 'or');
negatedGroup.not = true;
assert.equal(evaluateTagExpression(negatedGroup, new Set()), true);
assert.equal(evaluateTagExpression(negatedGroup, new Set(['1'])), false);

assert.deepEqual(toTagExpressionPayload(expression), {
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

assert.equal(validateTagExpression(createTagExpressionGroup(), definitions), '请至少添加一个标签条件');
assert.equal(
  validateTagExpression(createTagExpressionGroup([createTagExpressionTag('99')]), definitions),
  '表达式中包含不存在的标签',
);

console.log('tag expression verification passed (10 assertions)');
