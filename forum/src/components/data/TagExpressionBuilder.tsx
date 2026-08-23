import { Brackets, Plus, Trash2 } from 'lucide-react';
import type { TagDefinition } from '../../data/tags';
import {
  countTagExpressionNodes,
  createTagExpressionGroup,
  createTagExpressionTag,
  formatTagExpression,
  TAG_EXPRESSION_MAX_DEPTH,
  TAG_EXPRESSION_MAX_NODES,
  type TagExpressionGroupNode,
  type TagExpressionNode,
  type TagExpressionTagNode,
} from '../../utils/tagExpression';

type TagExpressionBuilderProps = {
  definitions: TagDefinition[];
  disabled?: boolean;
  expression: TagExpressionGroupNode;
  onChange: (expression: TagExpressionGroupNode) => void;
};

export function TagExpressionBuilder({
  definitions,
  disabled = false,
  expression,
  onChange,
}: TagExpressionBuilderProps) {
  const nodeCount = countTagExpressionNodes(expression);
  const firstTagId = definitions[0]?.id ?? '';

  function updateNode(nodeId: string, update: (node: TagExpressionNode) => TagExpressionNode) {
    onChange(mapExpressionNode(expression, nodeId, update) as TagExpressionGroupNode);
  }

  function removeNode(nodeId: string) {
    onChange(removeExpressionNode(expression, nodeId));
  }

  function addTag(groupId: string) {
    if (!firstTagId || nodeCount >= TAG_EXPRESSION_MAX_NODES) return;
    updateNode(groupId, (node) => node.type === 'group'
      ? { ...node, children: [...node.children, createTagExpressionTag(firstTagId)] }
      : node);
  }

  function addGroup(groupId: string) {
    if (!firstTagId || nodeCount + 1 >= TAG_EXPRESSION_MAX_NODES) return;
    updateNode(groupId, (node) => node.type === 'group'
      ? {
          ...node,
          children: [
            ...node.children,
            createTagExpressionGroup([createTagExpressionTag(firstTagId)]),
          ],
        }
      : node);
  }

  const preview = formatTagExpression(expression, definitions);

  return (
    <div className="tag-expression-builder">
      <ExpressionGroup
        definitions={definitions}
        depth={0}
        disabled={disabled}
        group={expression}
        nodeCount={nodeCount}
        onAddGroup={addGroup}
        onAddTag={addTag}
        onRemove={removeNode}
        onUpdate={updateNode}
        root
      />
      {preview && (
        <div className="tag-expression-preview">
          <span>表达式</span>
          <code>{preview}</code>
        </div>
      )}
    </div>
  );
}

function ExpressionGroup({
  definitions,
  depth,
  disabled,
  group,
  nodeCount,
  onAddGroup,
  onAddTag,
  onRemove,
  onUpdate,
  root = false,
}: {
  definitions: TagDefinition[];
  depth: number;
  disabled: boolean;
  group: TagExpressionGroupNode;
  nodeCount: number;
  onAddGroup: (groupId: string) => void;
  onAddTag: (groupId: string) => void;
  onRemove: (nodeId: string) => void;
  onUpdate: (nodeId: string, update: (node: TagExpressionNode) => TagExpressionNode) => void;
  root?: boolean;
}) {
  const canAddNode = nodeCount < TAG_EXPRESSION_MAX_NODES;
  const canAddGroup = nodeCount <= TAG_EXPRESSION_MAX_NODES - 2
    && depth < TAG_EXPRESSION_MAX_DEPTH - 1;

  return (
    <div className={`tag-expression-group${root ? ' tag-expression-group-root' : ''}`}>
      <div className="tag-expression-group-header">
        <span className="tag-expression-group-label">{root ? '查询条件' : '括号组'}</span>
        <div aria-label="组内运算符" className="tag-expression-operator" role="group">
          <button
            aria-pressed={group.operator === 'and'}
            className={group.operator === 'and' ? 'is-active' : ''}
            disabled={disabled}
            onClick={() => onUpdate(group.id, (node) => node.type === 'group' ? { ...node, operator: 'and' } : node)}
            type="button"
          >
            AND
          </button>
          <button
            aria-pressed={group.operator === 'or'}
            className={group.operator === 'or' ? 'is-active' : ''}
            disabled={disabled}
            onClick={() => onUpdate(group.id, (node) => node.type === 'group' ? { ...node, operator: 'or' } : node)}
            type="button"
          >
            OR
          </button>
        </div>
        <button
          aria-pressed={group.not}
          className={`tag-expression-not${group.not ? ' is-active' : ''}`}
          disabled={disabled}
          onClick={() => onUpdate(group.id, (node) => ({ ...node, not: !node.not }))}
          type="button"
        >
          NOT
        </button>
        {!root && (
          <button
            aria-label="删除括号组"
            className="tag-expression-remove"
            disabled={disabled}
            onClick={() => onRemove(group.id)}
            title="删除括号组"
            type="button"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <div className="tag-expression-children">
        {group.children.map((child) => child.type === 'tag' ? (
          <ExpressionTag
            definitions={definitions}
            disabled={disabled}
            key={child.id}
            node={child}
            onRemove={onRemove}
            onUpdate={onUpdate}
          />
        ) : (
          <ExpressionGroup
            definitions={definitions}
            depth={depth + 1}
            disabled={disabled}
            group={child}
            key={child.id}
            nodeCount={nodeCount}
            onAddGroup={onAddGroup}
            onAddTag={onAddTag}
            onRemove={onRemove}
            onUpdate={onUpdate}
          />
        ))}
        {group.children.length === 0 && <span className="tag-expression-empty">尚未添加条件</span>}
      </div>
      <div className="tag-expression-actions">
        <button disabled={disabled || !canAddNode || definitions.length === 0} onClick={() => onAddTag(group.id)} type="button">
          <Plus size={14} /> 标签
        </button>
        <button disabled={disabled || !canAddGroup || definitions.length === 0} onClick={() => onAddGroup(group.id)} type="button">
          <Brackets size={14} /> 分组
        </button>
      </div>
    </div>
  );
}

function ExpressionTag({
  definitions,
  disabled,
  node,
  onRemove,
  onUpdate,
}: {
  definitions: TagDefinition[];
  disabled: boolean;
  node: TagExpressionTagNode;
  onRemove: (nodeId: string) => void;
  onUpdate: (nodeId: string, update: (node: TagExpressionNode) => TagExpressionNode) => void;
}) {
  return (
    <div className="tag-expression-tag">
      <select
        aria-label="标签条件"
        disabled={disabled}
        onChange={(event) => onUpdate(node.id, (current) => current.type === 'tag'
          ? { ...current, tagId: event.target.value }
          : current)}
        value={node.tagId}
      >
        {definitions.map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
      </select>
      <button
        aria-pressed={node.not}
        className={`tag-expression-not${node.not ? ' is-active' : ''}`}
        disabled={disabled}
        onClick={() => onUpdate(node.id, (current) => ({ ...current, not: !current.not }))}
        type="button"
      >
        NOT
      </button>
      <button
        aria-label="删除标签条件"
        className="tag-expression-remove"
        disabled={disabled}
        onClick={() => onRemove(node.id)}
        title="删除标签条件"
        type="button"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function mapExpressionNode(
  node: TagExpressionNode,
  nodeId: string,
  update: (node: TagExpressionNode) => TagExpressionNode,
): TagExpressionNode {
  if (node.id === nodeId) return update(node);
  if (node.type === 'tag') return node;
  return {
    ...node,
    children: node.children.map((child) => mapExpressionNode(child, nodeId, update)),
  };
}

function removeExpressionNode(group: TagExpressionGroupNode, nodeId: string): TagExpressionGroupNode {
  return {
    ...group,
    children: group.children
      .filter((child) => child.id !== nodeId)
      .map((child) => child.type === 'group' ? removeExpressionNode(child, nodeId) : child),
  };
}
