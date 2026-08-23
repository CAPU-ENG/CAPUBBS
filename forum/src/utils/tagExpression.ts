import type { TagDefinition } from '../data/tags';

export const TAG_EXPRESSION_MAX_DEPTH = 6;
export const TAG_EXPRESSION_MAX_NODES = 64;

export type TagExpressionOperator = 'and' | 'or';

export type TagExpressionTagNode = {
  id: string;
  not: boolean;
  tagId: string;
  type: 'tag';
};

export type TagExpressionGroupNode = {
  children: TagExpressionNode[];
  id: string;
  not: boolean;
  operator: TagExpressionOperator;
  type: 'group';
};

export type TagExpressionNode = TagExpressionGroupNode | TagExpressionTagNode;

export type TagExpressionOperatorToken = {
  id: string;
  type: 'and' | 'close' | 'not' | 'open' | 'or';
};

export type TagExpressionTagToken = {
  id: string;
  tagId: string;
  type: 'tag';
};

export type TagExpressionToken = TagExpressionOperatorToken | TagExpressionTagToken;

export type TagExpressionInsertionState = {
  canAddBinaryOperator: boolean;
  canAddNot: boolean;
  canAddTag: boolean;
  canCloseGroup: boolean;
  canOpenGroup: boolean;
  isComplete: boolean;
};

export type TagExpressionParseResult = {
  error: string;
  expression: TagExpressionNode | null;
};

export type TagExpressionPayload =
  | {
      not: boolean;
      tag_id: string;
      type: 'tag';
    }
  | {
      children: TagExpressionPayload[];
      not: boolean;
      operator: TagExpressionOperator;
      type: 'group';
    };

let expressionId = 0;

export function createTagExpressionGroup(
  children: TagExpressionNode[] = [],
  operator: TagExpressionOperator = 'and',
): TagExpressionGroupNode {
  return {
    children,
    id: nextExpressionId('group'),
    not: false,
    operator,
    type: 'group',
  };
}

export function createTagExpressionTag(tagId: string, not = false): TagExpressionTagNode {
  return {
    id: nextExpressionId('tag'),
    not,
    tagId,
    type: 'tag',
  };
}

export function createTagExpressionOperatorToken(
  type: TagExpressionOperatorToken['type'],
): TagExpressionOperatorToken {
  return { id: nextExpressionId('token'), type };
}

export function createTagExpressionTagToken(tagId: string): TagExpressionTagToken {
  return { id: nextExpressionId('token'), tagId, type: 'tag' };
}

export function createTagExpressionFromFilters(includeTagIds: string[], excludeTagIds: string[]) {
  return createTagExpressionGroup([
    ...includeTagIds.map((tagId) => createTagExpressionTag(tagId)),
    ...excludeTagIds.map((tagId) => createTagExpressionTag(tagId, true)),
  ]);
}

export function tagExpressionToTokens(expression: TagExpressionNode): TagExpressionToken[] {
  const tokens: TagExpressionToken[] = [];
  appendExpressionTokens(expression, tokens, true);
  return tokens;
}

export function parseTagExpressionTokens(tokens: TagExpressionToken[]): TagExpressionParseResult {
  if (tokens.length === 0) {
    return { error: '请至少添加一个标签条件', expression: null };
  }

  let index = 0;
  let groupDepth = 0;

  function current() {
    return tokens[index];
  }

  function parseOr(): TagExpressionParseResult {
    const first = parseAnd();
    if (first.error || !first.expression) return first;
    let expression = first.expression;
    while (current()?.type === 'or') {
      index += 1;
      if (!current() || current().type === 'close') {
        return { error: 'OR 右侧必须是标签或括号分组', expression: null };
      }
      const right = parseAnd();
      if (right.error || !right.expression) return right;
      expression = combineExpressionNodes(expression, right.expression, 'or');
    }
    return { error: '', expression };
  }

  function parseAnd(): TagExpressionParseResult {
    const first = parseUnary();
    if (first.error || !first.expression) return first;
    let expression = first.expression;
    while (current()?.type === 'and') {
      index += 1;
      if (!current() || current().type === 'close') {
        return { error: 'AND 右侧必须是标签或括号分组', expression: null };
      }
      const right = parseUnary();
      if (right.error || !right.expression) return right;
      expression = combineExpressionNodes(expression, right.expression, 'and');
    }
    return { error: '', expression };
  }

  function parseUnary(): TagExpressionParseResult {
    if (current()?.type !== 'not') return parsePrimary();
    index += 1;
    const next = current();
    if (!next || (next.type !== 'tag' && next.type !== 'open')) {
      return { error: 'NOT 右侧必须是标签或括号分组', expression: null };
    }
    const operand = parsePrimary();
    if (operand.error || !operand.expression) return operand;
    return {
      error: '',
      expression: { ...operand.expression, not: !operand.expression.not },
    };
  }

  function parsePrimary(): TagExpressionParseResult {
    const token = current();
    if (!token) return { error: '表达式缺少标签或括号分组', expression: null };
    if (token.type === 'tag') {
      index += 1;
      return { error: '', expression: createTagExpressionTag(token.tagId) };
    }
    if (token.type === 'open') {
      index += 1;
      groupDepth += 1;
      if (groupDepth > TAG_EXPRESSION_MAX_DEPTH) {
        return { error: `括号最多嵌套 ${TAG_EXPRESSION_MAX_DEPTH} 层`, expression: null };
      }
      if (current()?.type === 'close') {
        return { error: '括号组不能为空', expression: null };
      }
      const content = parseOr();
      if (content.error || !content.expression) return content;
      if (current()?.type !== 'close') {
        return { error: '缺少右括号', expression: null };
      }
      index += 1;
      groupDepth -= 1;
      return content;
    }
    if (token.type === 'and' || token.type === 'or') {
      return { error: `${token.type.toUpperCase()} 左侧必须是标签或括号分组`, expression: null };
    }
    if (token.type === 'close') {
      return { error: '缺少左括号', expression: null };
    }
    return { error: 'NOT 右侧必须是标签或括号分组', expression: null };
  }

  const parsed = parseOr();
  if (parsed.error || !parsed.expression) return parsed;
  const remaining = current();
  if (remaining) {
    if (remaining.type === 'close') return { error: '缺少左括号', expression: null };
    if (remaining.type === 'tag' || remaining.type === 'open' || remaining.type === 'not') {
      return { error: '标签或括号分组之间需要 AND 或 OR', expression: null };
    }
    return { error: `${remaining.type.toUpperCase()} 左侧必须是标签或括号分组`, expression: null };
  }
  return parsed;
}

export function getTagExpressionInsertionState(
  tokens: TagExpressionToken[],
): TagExpressionInsertionState {
  let expectsOperand = true;
  let openGroups = 0;
  let validPrefix = true;
  let previousType: TagExpressionToken['type'] | undefined;

  for (const token of tokens) {
    if (expectsOperand) {
      if (token.type === 'tag') {
        expectsOperand = false;
      } else if (token.type === 'open') {
        openGroups += 1;
      } else if (token.type === 'not' && previousType !== 'not') {
        // NOT deliberately accepts only a tag or an opening parenthesis next.
      } else {
        validPrefix = false;
        break;
      }
    } else if (token.type === 'and' || token.type === 'or') {
      expectsOperand = true;
    } else if (token.type === 'close' && openGroups > 0) {
      openGroups -= 1;
    } else {
      validPrefix = false;
      break;
    }
    previousType = token.type;
  }

  if (!validPrefix) {
    return {
      canAddBinaryOperator: false,
      canAddNot: false,
      canAddTag: false,
      canCloseGroup: false,
      canOpenGroup: false,
      isComplete: false,
    };
  }

  return {
    canAddBinaryOperator: !expectsOperand,
    canAddNot: expectsOperand && previousType !== 'not',
    canAddTag: expectsOperand,
    canCloseGroup: !expectsOperand && openGroups > 0,
    canOpenGroup: expectsOperand && openGroups < TAG_EXPRESSION_MAX_DEPTH,
    isComplete: tokens.length > 0 && !expectsOperand && openGroups === 0,
  };
}

export function countTagExpressionNodes(node: TagExpressionNode): number {
  return 1 + (node.type === 'group'
    ? node.children.reduce((total, child) => total + countTagExpressionNodes(child), 0)
    : 0);
}

export function validateTagExpression(
  expression: TagExpressionNode,
  definitions: TagDefinition[],
): string {
  const knownTagIds = new Set(definitions.map((tag) => tag.id));
  const state = { count: 0 };
  return validateNode(expression, knownTagIds, 0, state);
}

export function toTagExpressionPayload(node: TagExpressionNode): TagExpressionPayload {
  if (node.type === 'tag') {
    return {
      not: node.not,
      tag_id: node.tagId,
      type: 'tag',
    };
  }
  return {
    children: node.children.map(toTagExpressionPayload),
    not: node.not,
    operator: node.operator,
    type: 'group',
  };
}

export function formatTagExpression(node: TagExpressionNode, definitions: TagDefinition[]): string {
  const names = new Map(definitions.map((tag) => [tag.id, tag.name]));
  return formatNode(node, names, true);
}

export function evaluateTagExpression(node: TagExpressionNode, tagIds: ReadonlySet<string>): boolean {
  const value = node.type === 'tag'
    ? tagIds.has(node.tagId)
    : node.operator === 'and'
      ? node.children.every((child) => evaluateTagExpression(child, tagIds))
      : node.children.some((child) => evaluateTagExpression(child, tagIds));
  return node.not ? !value : value;
}

function validateNode(
  node: TagExpressionNode,
  knownTagIds: ReadonlySet<string>,
  depth: number,
  state: { count: number },
): string {
  state.count += 1;
  if (state.count > TAG_EXPRESSION_MAX_NODES) return `最多添加 ${TAG_EXPRESSION_MAX_NODES} 个条件`;
  if (depth > TAG_EXPRESSION_MAX_DEPTH) return `括号最多嵌套 ${TAG_EXPRESSION_MAX_DEPTH} 层`;
  if (node.type === 'tag') {
    if (!node.tagId) return '请选择标签';
    return knownTagIds.has(node.tagId) ? '' : '表达式中包含不存在的标签';
  }
  if (node.children.length === 0) return depth === 0 ? '请至少添加一个标签条件' : '括号组不能为空';
  for (const child of node.children) {
    const error = validateNode(child, knownTagIds, depth + 1, state);
    if (error) return error;
  }
  return '';
}

function appendExpressionTokens(
  node: TagExpressionNode,
  tokens: TagExpressionToken[],
  root: boolean,
) {
  if (node.not) tokens.push(createTagExpressionOperatorToken('not'));
  if (node.type === 'tag') {
    tokens.push(createTagExpressionTagToken(node.tagId));
    return;
  }

  const grouped = !root || node.not;
  if (grouped) tokens.push(createTagExpressionOperatorToken('open'));
  node.children.forEach((child, index) => {
    if (index > 0) tokens.push(createTagExpressionOperatorToken(node.operator));
    appendExpressionTokens(child, tokens, false);
  });
  if (grouped) tokens.push(createTagExpressionOperatorToken('close'));
}

function combineExpressionNodes(
  left: TagExpressionNode,
  right: TagExpressionNode,
  operator: TagExpressionOperator,
) {
  if (left.type === 'group' && left.operator === operator && !left.not) {
    return { ...left, children: [...left.children, right] };
  }
  return createTagExpressionGroup([left, right], operator);
}

function formatNode(
  node: TagExpressionNode,
  names: ReadonlyMap<string, string>,
  root: boolean,
): string {
  if (node.type === 'tag') {
    const name = names.get(node.tagId) ?? node.tagId;
    return `${node.not ? 'NOT ' : ''}${name}`;
  }
  if (node.children.length === 0) return '';
  const content = node.children
    .map((child) => formatNode(child, names, false))
    .join(` ${node.operator.toUpperCase()} `);
  const grouped = root && !node.not ? content : `(${content})`;
  return node.not ? `NOT ${grouped}` : grouped;
}

function nextExpressionId(prefix: string) {
  expressionId += 1;
  return `${prefix}-${expressionId}`;
}
