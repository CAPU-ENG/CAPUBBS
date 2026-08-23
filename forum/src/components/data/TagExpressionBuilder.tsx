import { Delete, Trash2 } from 'lucide-react';
import type { TagDefinition } from '../../data/tags';
import {
  createTagExpressionOperatorToken,
  createTagExpressionTagToken,
  getTagExpressionInsertionState,
  type TagExpressionOperatorToken,
  type TagExpressionToken,
} from '../../utils/tagExpression';
import { TagBadge } from '../tags/TagBadge';

type TagExpressionBuilderProps = {
  definitions: TagDefinition[];
  disabled?: boolean;
  onChange: (tokens: TagExpressionToken[]) => void;
  tokens: TagExpressionToken[];
};

const OPERATORS: Array<{
  label: string;
  type: TagExpressionOperatorToken['type'];
}> = [
  { label: '(', type: 'open' },
  { label: ')', type: 'close' },
  { label: 'AND', type: 'and' },
  { label: 'OR', type: 'or' },
  { label: 'NOT', type: 'not' },
];

export function TagExpressionBuilder({
  definitions,
  disabled = false,
  onChange,
  tokens,
}: TagExpressionBuilderProps) {
  const insertion = getTagExpressionInsertionState(tokens);
  const definitionsById = new Map(definitions.map((tag) => [tag.id, tag]));

  function appendTag(tagId: string) {
    if (disabled || !insertion.canAddTag) return;
    onChange([...tokens, createTagExpressionTagToken(tagId)]);
  }

  function appendOperator(type: TagExpressionOperatorToken['type']) {
    if (disabled || !canAddOperator(type, insertion)) return;
    onChange([...tokens, createTagExpressionOperatorToken(type)]);
  }

  return (
    <div className="tag-expression-builder">
      <div className="tag-expression-palette">
        <span className="tag-expression-palette-label">标签</span>
        <div className="tag-expression-tag-palette">
          {definitions.map((tag) => (
            <button
              aria-label={`添加标签 ${tag.name}`}
              disabled={disabled || !insertion.canAddTag}
              key={tag.id}
              onClick={() => appendTag(tag.id)}
              type="button"
            >
              <TagBadge tag={tag} />
            </button>
          ))}
          {definitions.length === 0 && <span className="tag-expression-empty">暂无标签</span>}
        </div>
      </div>

      <div className="tag-expression-palette">
        <div className="tag-expression-palette-header">
          <span className="tag-expression-palette-label">运算符</span>
          <span className="tag-expression-universe-hint">全集=所有有标签的会员</span>
        </div>
        <div aria-label="表达式运算符" className="tag-expression-operator-palette" role="group">
          {OPERATORS.map((operator) => (
            <button
              disabled={disabled || !canAddOperator(operator.type, insertion)}
              key={operator.type}
              onClick={() => appendOperator(operator.type)}
              type="button"
            >
              {operator.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tag-expression-composer">
        <div className="tag-expression-composer-header">
          <span className="tag-expression-palette-label">表达式</span>
          <div className="tag-expression-composer-actions">
            <button
              aria-label="删除最后一项"
              disabled={disabled || tokens.length === 0}
              onClick={() => onChange(tokens.slice(0, -1))}
              title="删除最后一项"
              type="button"
            >
              <Delete size={15} />
            </button>
            <button
              aria-label="清空表达式"
              disabled={disabled || tokens.length === 0}
              onClick={() => onChange([])}
              title="清空表达式"
              type="button"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
        <div aria-label="已构建的表达式" className="tag-expression-token-list">
          {tokens.map((token) => {
            if (token.type !== 'tag') {
              return <span className={`tag-expression-token tag-expression-token-${token.type}`} key={token.id}>{tokenLabel(token.type)}</span>;
            }
            const tag = definitionsById.get(token.tagId);
            return tag
              ? <span className="tag-expression-tag-token" key={token.id}><TagBadge tag={tag} /></span>
              : <span className="tag-expression-token tag-expression-token-missing" key={token.id}>未知标签</span>;
          })}
          {tokens.length === 0 && <span className="tag-expression-empty">尚未添加条件</span>}
        </div>
      </div>
    </div>
  );
}

function canAddOperator(
  type: TagExpressionOperatorToken['type'],
  insertion: ReturnType<typeof getTagExpressionInsertionState>,
) {
  if (type === 'and' || type === 'or') return insertion.canAddBinaryOperator;
  if (type === 'not') return insertion.canAddNot;
  if (type === 'open') return insertion.canOpenGroup;
  return insertion.canCloseGroup;
}

function tokenLabel(type: TagExpressionOperatorToken['type']) {
  if (type === 'open') return '(';
  if (type === 'close') return ')';
  return type.toUpperCase();
}
