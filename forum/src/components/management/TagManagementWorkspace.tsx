import { Check, Plus, Tags, Trash2, UserPlus, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  readTagDefinitions,
  readUserTagAssignments,
  writeTagDefinitions,
  writeUserTagAssignments,
  type TagDefinition,
  type UserTagAssignments,
} from '../../data/tags';
import { TagBadge } from '../tags/TagBadge';

const MEMBER_ID_COLLATOR = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' });

type Notice = { kind: 'error' | 'info' | 'success'; text: string } | null;
type NoticeKind = 'error' | 'info' | 'success';
type DeleteTarget =
  | { kind: 'tag'; tag: TagDefinition }
  | { kind: 'member'; username: string };

export function TagManagementWorkspace() {
  const [definitions, setDefinitions] = useState<TagDefinition[]>(readTagDefinitions);
  const [assignments, setAssignments] = useState<UserTagAssignments>(readUserTagAssignments);
  const [memberSelectedTagId, setMemberSelectedTagId] = useState(() => {
    const firstTag = readTagDefinitions()[0];
    return firstTag?.id ?? '';
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftColor, setDraftColor] = useState('#287a52');
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [memberDraft, setMemberDraft] = useState('');
  const [pendingMembers, setPendingMembers] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const memberIds = useMemo(
    () => Object.keys(assignments).sort((left, right) => MEMBER_ID_COLLATOR.compare(left, right)),
    [assignments],
  );
  const activeTagId = memberSelectedTagId || definitions[0]?.id || '';
  const activeTag = definitions.find((tag) => tag.id === activeTagId) ?? null;
  const editingTag = definitions.find((tag) => tag.id === editingId) ?? null;
  const filteredMemberIds = useMemo(
    () => memberIds.filter((username) => Boolean(activeTagId && assignments[username]?.[activeTagId])),
    [activeTagId, assignments, memberIds],
  );

  useEffect(() => {
    setMemberSelectedTagId((current) => definitions.some((tag) => tag.id === current) ? current : definitions[0]?.id ?? '');
  }, [definitions]);

  function startCreate() {
    setEditingId('new');
    setDraftName('');
    setDraftColor('#287a52');
    setNotice(null);
  }

  function startEdit(tag: TagDefinition) {
    if (editingId === tag.id) {
      cancelEdit();
      return;
    }
    setEditingId(tag.id);
    setDraftName(tag.name);
    setDraftColor(tag.color);
    setNotice(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftName('');
  }

  function saveTag(event: FormEvent) {
    event.preventDefault();
    const name = draftName.trim();
    if (!name) {
      setNotice({ kind: 'error', text: '请输入标签名称。' });
      return;
    }
    if (definitions.some((tag) => tag.name === name && tag.id !== editingId)) {
      setNotice({ kind: 'error', text: '已经存在同名标签。' });
      return;
    }

    if (editingId === 'new') {
      const id = createTagId(name, definitions);
      const next = [...definitions, { id, name, color: draftColor }];
      setDefinitions(next);
      writeTagDefinitions(next);
      setNotice({ kind: 'success', text: '标签已创建。' });
    } else if (editingTag) {
      const next = definitions.map((tag) => tag.id === editingTag.id ? { ...tag, name, color: draftColor } : tag);
      setDefinitions(next);
      writeTagDefinitions(next);
      setNotice({ kind: 'success', text: '标签已更新。' });
    }
    cancelEdit();
  }

  function removeTag(tag: TagDefinition) {
    setDeleteTarget({ kind: 'tag', tag });
  }

  function deleteTag(tag: TagDefinition) {
    const nextDefinitions = definitions.filter((item) => item.id !== tag.id);
    const nextAssignments = Object.fromEntries(
      Object.entries(assignments).map(([username, tags]) => {
        const nextTags = { ...tags };
        delete nextTags[tag.id];
        return [username, nextTags];
      }),
    ) as UserTagAssignments;
    setDefinitions(nextDefinitions);
    setAssignments(nextAssignments);
    writeTagDefinitions(nextDefinitions);
    writeUserTagAssignments(nextAssignments);
    if (editingId === tag.id) cancelEdit();
    setNotice({ kind: 'success', text: '标签已删除。' });
  }

  function selectTag(tagId: string) {
    setMemberSelectedTagId(tagId);
  }

  function appendMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const username = memberDraft.trim();
    if (!username) return;
    setPendingMembers((current) => current.includes(username) ? current : [...current, username]);
    setMemberDraft('');
  }

  function closeMemberDialog() {
    setMemberDialogOpen(false);
    setMemberDraft('');
    setPendingMembers([]);
  }

  function confirmMembers() {
    if (!activeTagId || pendingMembers.length === 0) {
      setNotice({ kind: 'error', text: '请先输入至少一个会员 ID。' });
      return;
    }
    const addedAt = new Date().toISOString();
    const next = { ...assignments };
    let addedCount = 0;
    pendingMembers.forEach((username) => {
      const userTags = { ...(next[username] ?? {}) };
      if (!userTags[activeTagId]) {
        userTags[activeTagId] = addedAt;
        addedCount += 1;
      }
      next[username] = userTags;
    });
    setAssignments(next);
    writeUserTagAssignments(next);
    closeMemberDialog();
    setNotice({ kind: 'success', text: addedCount > 0 ? `已为 ${addedCount} 位会员添加“${activeTag?.name ?? '标签'}”。` : '输入的会员已经拥有该标签。' });
  }

  function removeMember(username: string) {
    if (!activeTagId) return;
    setDeleteTarget({ kind: 'member', username });
  }

  function deleteMember(username: string) {
    if (!activeTagId) return;
    const next = { ...assignments, [username]: { ...(assignments[username] ?? {}) } };
    delete next[username][activeTagId];
    setAssignments(next);
    writeUserTagAssignments(next);
    setNotice({ kind: 'success', text: `已从“${activeTag?.name ?? '标签'}”移除 ${username}。` });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'tag') deleteTag(deleteTarget.tag);
    else deleteMember(deleteTarget.username);
    setDeleteTarget(null);
  }

  return (
    <div className="management-tags-workspace">
      <section className="management-card" aria-labelledby="tag-definitions-title">
        <header className="management-card-heading">
          <div><h2 id="tag-definitions-title">已有标签</h2></div>
          <button className="management-primary-button" onClick={startCreate} type="button"><Plus size={15} />新建标签</button>
        </header>
        <div className="management-tag-editor-wrap">
          {editingId && (
            <form className="management-tag-editor" onSubmit={saveTag}>
              <label><span>名称</span><input autoFocus maxLength={20} onChange={(event) => setDraftName(event.target.value)} value={draftName} /></label>
              <label><span>颜色</span><input aria-label="标签颜色" onChange={(event) => setDraftColor(event.target.value)} type="color" value={draftColor} /></label>
              <div><button className="management-primary-button" type="submit">保存</button><button className="management-secondary-button" onClick={cancelEdit} type="button">取消</button>{editingTag && <button className="management-danger-button" onClick={() => removeTag(editingTag)} type="button"><Trash2 size={14} />删除</button>}</div>
            </form>
          )}
          <div className="management-tag-definition-list">
            {definitions.map((tag) => (
              <button className={`management-tag-definition-button ${editingId === tag.id ? 'management-tag-definition-button-selected' : ''}`} key={tag.id} onClick={() => startEdit(tag)} type="button">
                <TagBadge selected={editingId === tag.id} tag={tag} />
              </button>
            ))}
            {definitions.length === 0 && <EmptyState icon={<Tags size={18} />}>还没有标签。</EmptyState>}
          </div>
        </div>
      </section>

      <section className="management-card" aria-labelledby="member-tags-title">
        <header className="management-card-heading">
          <div><h2 id="member-tags-title">已有标签会员</h2></div>
          <button className="management-primary-button" disabled={!activeTagId} onClick={() => setMemberDialogOpen(true)} type="button"><UserPlus size={15} />添加会员</button>
        </header>
        <div className="management-member-tag-layout">
          <aside className="management-member-picker" aria-label="标签">
            <div className="management-member-list">
              {definitions.map((tag) => (
                <button className={`management-member-filter-tag ${memberSelectedTagId === tag.id ? 'management-member-filter-tag-selected' : ''}`} key={tag.id} onClick={() => selectTag(tag.id)} type="button"><TagBadge selected={memberSelectedTagId === tag.id} tag={tag} /></button>
              ))}
              {definitions.length === 0 && <EmptyState icon={<Tags size={18} />}>还没有标签。</EmptyState>}
            </div>
          </aside>
          <div className="management-member-tag-editor">
            {filteredMemberIds.length > 0 ? (
              <div className="management-member-grid">
                {filteredMemberIds.map((username) => (
                  <article className="management-member-card" key={username}>
                    <strong>{username}</strong>
                    <time>{activeTagId ? formatTagAddedAt(assignments[username]?.[activeTagId]) : '未记录日期'}</time>
                    <button aria-label={`从${activeTag?.name ?? '标签'}移除${username}`} className="management-member-remove" onClick={() => removeMember(username)} title="移除会员" type="button"><X size={15} /></button>
                  </article>
                ))}
              </div>
            ) : <EmptyState icon={<Users size={18} />}>没有符合条件的会员。</EmptyState>}
          </div>
        </div>
      </section>
      {notice && <ManagementNotice kind={notice.kind}>{notice.text}</ManagementNotice>}
      {deleteTarget && (
        <div className="management-dialog-backdrop" role="presentation">
          <section aria-labelledby="confirm-tag-delete-title" aria-modal="true" className={`management-dialog management-confirm-dialog ${deleteTarget.kind === 'member' ? 'management-member-confirm-dialog' : ''}`} role="dialog">
            <header><div><h2 id="confirm-tag-delete-title">{deleteTarget.kind === 'tag' ? '删除标签' : '移除会员'}</h2></div><button aria-label="关闭" className="management-icon-button" onClick={() => setDeleteTarget(null)} type="button"><X size={16} /></button></header>
            <p className="management-dialog-copy">{deleteTarget.kind === 'tag' ? `确定删除“${deleteTarget.tag.name}”吗？已绑定会员的关系也会一并移除。` : `确定从“${activeTag?.name ?? '标签'}”中移除 ${deleteTarget.username} 吗？`}</p>
            <footer><button className="management-secondary-button" onClick={() => setDeleteTarget(null)} type="button">取消</button><button className="management-danger-button" onClick={confirmDelete} type="button"><Trash2 size={14} />确认删除</button></footer>
          </section>
        </div>
      )}
      {memberDialogOpen && (
        <div className="management-dialog-backdrop" role="presentation">
          <section aria-labelledby="add-tag-members-title" aria-modal="true" className="management-dialog" role="dialog">
            <header><div><span>批量绑定</span><h2 id="add-tag-members-title">添加到“{activeTag?.name ?? '标签'}”</h2></div><button aria-label="关闭" className="management-icon-button" onClick={closeMemberDialog} type="button"><X size={16} /></button></header>
            <form className="management-dialog-form" onSubmit={appendMember}>
              <label htmlFor="tag-member-input">会员 ID</label>
              <div className="management-input-action"><input autoFocus id="tag-member-input" onChange={(event) => setMemberDraft(event.target.value)} placeholder="输入后按回车" value={memberDraft} /><button type="submit"><Plus size={15} />加入列表</button></div>
            </form>
            <div className="management-pending-members">
              {pendingMembers.map((username) => <div className="management-pending-member" key={username}><span>{username}</span><button aria-label={`移除${username}`} onClick={() => setPendingMembers((current) => current.filter((item) => item !== username))} type="button"><X size={13} /></button></div>)}
              {pendingMembers.length === 0 && <EmptyState icon={<UserPlus size={18} />}>输入会员 ID 后按回车。</EmptyState>}
            </div>
            <footer><button className="management-secondary-button" onClick={closeMemberDialog} type="button">取消</button><button className="management-primary-button" disabled={pendingMembers.length === 0} onClick={confirmMembers} type="button"><Check size={15} />确认添加</button></footer>
          </section>
        </div>
      )}
    </div>
  );
}

function createTagId(name: string, definitions: TagDefinition[]) {
  const base = name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `tag-${Date.now()}`;
  let id = base;
  let index = 2;
  while (definitions.some((tag) => tag.id === id)) id = `${base}-${index++}`;
  return id;
}

function formatTagAddedAt(value: string | undefined) {
  if (!value) return '未记录日期';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function EmptyState({ children, icon }: { children: string; icon: ReactNode }) {
  return <div className="management-empty-state"><span>{icon}</span>{children}</div>;
}

function ManagementNotice({ children, kind }: { children: string; kind: NoticeKind }) {
  return <div className={`management-notice management-notice-${kind}`}>{children}</div>;
}
