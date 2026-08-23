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

export function createTagExpressionFromFilters(includeTagIds: string[], excludeTagIds: string[]) {
  return createTagExpressionGroup([
    ...includeTagIds.map((tagId) => createTagExpressionTag(tagId)),
    ...excludeTagIds.map((tagId) => createTagExpressionTag(tagId, true)),
  ]);
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
