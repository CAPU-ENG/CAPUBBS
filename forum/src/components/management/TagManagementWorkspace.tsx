import { Check, Plus, Tags, Trash2, UserPlus, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  addTagMembers,
  checkTagMember,
  createTagDefinition,
  deleteTagDefinition,
  fetchTagDefinitions,
  fetchTagMembers,
  removeTagMember,
  TagsApiError,
  updateTagDefinition,
  type TagMember,
} from '../../api/tags';
import type { TagDefinition } from '../../data/tags';
import { TagBadge } from '../tags/TagBadge';

const MEMBER_ID_COLLATOR = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' });

type Notice = { kind: 'error' | 'info' | 'success'; text: string } | null;
type NoticeKind = 'error' | 'info' | 'success';
type DeleteTarget =
  | { kind: 'tag'; tag: TagDefinition }
  | { kind: 'member'; username: string };

export function TagManagementWorkspace() {
  const [definitions, setDefinitions] = useState<TagDefinition[]>([]);
  const [members, setMembers] = useState<TagMember[]>([]);
  const [memberSelectedTagId, setMemberSelectedTagId] = useState('');
  const [definitionsStatus, setDefinitionsStatus] = useState<'error' | 'loading' | 'ready'>('loading');
  const [membersStatus, setMembersStatus] = useState<'error' | 'loading' | 'ready'>('ready');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftColor, setDraftColor] = useState('#287a52');
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [memberDraft, setMemberDraft] = useState('');
  const [pendingMembers, setPendingMembers] = useState<string[]>([]);
  const [memberCheckLoading, setMemberCheckLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const activeTagId = memberSelectedTagId || definitions[0]?.id || '';
  const activeTag = definitions.find((tag) => tag.id === activeTagId) ?? null;
  const editingTag = definitions.find((tag) => tag.id === editingId) ?? null;
  const sortedMembers = useMemo(
    () => [...members].sort((left, right) => MEMBER_ID_COLLATOR.compare(left.username, right.username)),
    [members],
  );

  useEffect(() => {
    const controller = new AbortController();
    setDefinitionsStatus('loading');
    void fetchTagDefinitions(controller.signal).then(
      (items) => {
        setDefinitions(items);
        setDefinitionsStatus('ready');
      },
      (error: unknown) => {
        if (isAbortError(error)) return;
        setDefinitionsStatus('error');
        setNotice({ kind: 'error', text: errorMessage(error, '标签列表加载失败，请稍后重试。') });
      },
    );
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setMemberSelectedTagId((current) => definitions.some((tag) => tag.id === current)
      ? current
      : definitions[0]?.id ?? '');
  }, [definitions]);

  useEffect(() => {
    if (!activeTagId) {
      setMembers([]);
      setMembersStatus('ready');
      return;
    }
    const controller = new AbortController();
    setMembersStatus('loading');
    void fetchTagMembers(activeTagId, controller.signal).then(
      (items) => {
        setMembers(items);
        setMembersStatus('ready');
      },
      (error: unknown) => {
        if (isAbortError(error)) return;
        setMembersStatus('error');
        setNotice({ kind: 'error', text: errorMessage(error, '标签会员加载失败，请稍后重试。') });
      },
    );
    return () => controller.abort();
  }, [activeTagId]);

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

  async function saveTag(event: FormEvent) {
    event.preventDefault();
    if (pendingAction) return;
    const name = draftName.trim();
    if (!name) {
      setNotice({ kind: 'error', text: '请输入标签名称。' });
      return;
    }
    if (definitions.some((tag) => tag.name === name && tag.id !== editingId)) {
      setNotice({ kind: 'error', text: '已经存在同名标签。' });
      return;
    }

    setPendingAction('tag-save');
    setNotice(null);
    try {
      if (editingId === 'new') {
        const created = await createTagDefinition(name, draftColor);
        setDefinitions((current) => [...current, created]);
        setNotice({ kind: 'success', text: '标签已创建。' });
      } else if (editingTag) {
        const updated = await updateTagDefinition(editingTag.id, { color: draftColor, name });
        setDefinitions((current) => current.map((tag) => tag.id === updated.id ? updated : tag));
        setNotice({ kind: 'success', text: '标签已更新。' });
      }
      cancelEdit();
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '标签保存失败，请稍后重试。') });
    } finally {
      setPendingAction(null);
    }
  }

  function removeTag(tag: TagDefinition) {
    setDeleteTarget({ kind: 'tag', tag });
  }

  async function deleteTag(tag: TagDefinition) {
    if (pendingAction) return;
    setPendingAction(`tag-delete-${tag.id}`);
    setNotice(null);
    try {
      await deleteTagDefinition(tag.id);
      setDefinitions((current) => current.filter((item) => item.id !== tag.id));
      if (memberSelectedTagId === tag.id) setMemberSelectedTagId('');
      if (editingId === tag.id) cancelEdit();
      setNotice({ kind: 'success', text: '标签已删除。' });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '标签删除失败，请稍后重试。') });
    } finally {
      setPendingAction(null);
    }
  }

  function selectTag(tagId: string) {
    setMemberSelectedTagId(tagId);
  }

  async function appendMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const username = memberDraft.trim();
    if (!username || !activeTagId || memberCheckLoading) return;
    if (pendingMembers.some((item) => item.toLocaleLowerCase() === username.toLocaleLowerCase())) {
      setNotice({ kind: 'error', text: '这个会员已经在待添加列表中。' });
      setMemberDraft('');
      return;
    }

    setMemberCheckLoading(true);
    setNotice(null);
    try {
      const result = await checkTagMember(activeTagId, username);
      if (result.state === 'available' && result.member) {
        setPendingMembers((current) => [...current, result.member?.username ?? username]);
        setMemberDraft('');
      } else if (result.state === 'already_added') {
        setNotice({ kind: 'info', text: `会员 ${result.username || username} 已经拥有该标签。` });
      } else {
        setNotice({ kind: 'error', text: `没有找到会员 ${result.username || username}。` });
      }
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '会员查询失败，请稍后重试。') });
    } finally {
      setMemberCheckLoading(false);
    }
  }

  function closeMemberDialog() {
    setMemberDialogOpen(false);
    setMemberDraft('');
    setPendingMembers([]);
  }

  async function confirmMembers() {
    if (!activeTagId || pendingMembers.length === 0) {
      setNotice({ kind: 'error', text: '请先输入至少一个会员 ID。' });
      return;
    }
    if (pendingAction) return;
    setPendingAction('members-add');
    setNotice(null);
    try {
      const results = await addTagMembers(activeTagId, pendingMembers);
      const addedCount = results.filter((result) => result.status === 'added').length;
      setMembers(await fetchTagMembers(activeTagId));
      closeMemberDialog();
      setNotice({ kind: 'success', text: addedCount > 0 ? `已为 ${addedCount} 位会员添加“${activeTag?.name ?? '标签'}”。` : '输入的会员已经拥有该标签。' });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '批量添加标签会员失败，请稍后重试。') });
    } finally {
      setPendingAction(null);
    }
  }

  function removeMember(username: string) {
    if (!activeTagId) return;
    setDeleteTarget({ kind: 'member', username });
  }

  async function deleteMember(username: string) {
    if (!activeTagId || pendingAction) return;
    setPendingAction(`member-remove-${username}`);
    setNotice(null);
    try {
      await removeTagMember(activeTagId, username);
      setMembers((current) => current.filter((member) => member.username !== username));
      setNotice({ kind: 'success', text: `已从“${activeTag?.name ?? '标签'}”移除 ${username}。` });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '移除标签会员失败，请稍后重试。') });
    } finally {
      setPendingAction(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || pendingAction) return;
    if (deleteTarget.kind === 'tag') await deleteTag(deleteTarget.tag);
    else await deleteMember(deleteTarget.username);
    setDeleteTarget(null);
  }

  return (
    <div className="management-tags-workspace">
      <section className="management-card" aria-labelledby="tag-definitions-title">
        <header className="management-card-heading">
          <div><h2 id="tag-definitions-title">已有标签</h2></div>
          <button className="management-primary-button" disabled={Boolean(pendingAction)} onClick={startCreate} type="button"><Plus size={15} />新建标签</button>
        </header>
        <div className="management-tag-editor-wrap">
          {editingId && (
            <form className="management-tag-editor" onSubmit={saveTag}>
              <label><span>名称</span><input autoFocus maxLength={50} onChange={(event) => setDraftName(event.target.value)} value={draftName} /></label>
              <label><span>颜色</span><input aria-label="标签颜色" onChange={(event) => setDraftColor(event.target.value)} type="color" value={draftColor} /></label>
              <div><button className="management-primary-button" disabled={Boolean(pendingAction)} type="submit">保存</button><button className="management-secondary-button" disabled={Boolean(pendingAction)} onClick={cancelEdit} type="button">取消</button>{editingTag && <button className="management-danger-button" disabled={Boolean(pendingAction)} onClick={() => removeTag(editingTag)} type="button"><Trash2 size={14} />删除</button>}</div>
            </form>
          )}
          <div className="management-tag-definition-list">
            {definitions.map((tag) => (
              <button className={`management-tag-definition-button ${editingId === tag.id ? 'management-tag-definition-button-selected' : ''}`} disabled={Boolean(pendingAction)} key={tag.id} onClick={() => startEdit(tag)} type="button">
                <TagBadge selected={editingId === tag.id} tag={tag} />
              </button>
            ))}
            {definitions.length === 0 && <EmptyState icon={<Tags size={18} />}>{definitionsStatus === 'loading' ? '正在加载标签。' : '还没有标签。'}</EmptyState>}
          </div>
        </div>
      </section>

      <section className="management-card" aria-labelledby="member-tags-title">
        <header className="management-card-heading">
          <div><h2 id="member-tags-title">已有标签会员</h2></div>
          <button className="management-primary-button" disabled={!activeTagId || Boolean(pendingAction)} onClick={() => setMemberDialogOpen(true)} type="button"><UserPlus size={15} />添加会员</button>
        </header>
        <div className="management-member-tag-layout">
          <aside className="management-member-picker" aria-label="标签">
            <div className="management-member-list">
              {definitions.map((tag) => (
                <button className={`management-member-filter-tag ${memberSelectedTagId === tag.id ? 'management-member-filter-tag-selected' : ''}`} disabled={Boolean(pendingAction)} key={tag.id} onClick={() => selectTag(tag.id)} type="button"><TagBadge selected={memberSelectedTagId === tag.id} tag={tag} /></button>
              ))}
              {definitions.length === 0 && <EmptyState icon={<Tags size={18} />}>{definitionsStatus === 'loading' ? '正在加载标签。' : '还没有标签。'}</EmptyState>}
            </div>
          </aside>
          <div className="management-member-tag-editor">
            {membersStatus === 'loading' ? <EmptyState icon={<Users size={18} />}>正在加载会员。</EmptyState> : membersStatus === 'error' ? <EmptyState icon={<Users size={18} />}>会员加载失败。</EmptyState> : sortedMembers.length > 0 ? (
              <div className="management-member-grid">
                {sortedMembers.map((member) => (
                  <article className="management-member-card" key={member.username}>
                    <strong>{member.username}</strong>
                    <time>{formatTagAddedAt(member.addedAt)}</time>
                    <button aria-label={`从${activeTag?.name ?? '标签'}移除${member.username}`} className="management-member-remove" disabled={Boolean(pendingAction)} onClick={() => removeMember(member.username)} title="移除会员" type="button"><X size={15} /></button>
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
          <section aria-labelledby="confirm-tag-delete-title" aria-modal="true" className="management-dialog management-confirm-dialog" role="dialog">
            <header><div><h2 id="confirm-tag-delete-title">{deleteTarget.kind === 'tag' ? '删除标签' : '移除会员'}</h2></div><button aria-label="关闭" className="management-icon-button" disabled={Boolean(pendingAction)} onClick={() => setDeleteTarget(null)} type="button"><X size={16} /></button></header>
            <p className="management-dialog-copy">{deleteTarget.kind === 'tag' ? `确定删除“${deleteTarget.tag.name}”吗？已绑定会员的关系也会一并移除。` : `确定从“${activeTag?.name ?? '标签'}”中移除 ${deleteTarget.username} 吗？`}</p>
            <footer><button className="management-secondary-button" disabled={Boolean(pendingAction)} onClick={() => setDeleteTarget(null)} type="button">取消</button><button className="management-danger-button" disabled={Boolean(pendingAction)} onClick={confirmDelete} type="button"><Trash2 size={14} />确认删除</button></footer>
          </section>
        </div>
      )}
      {memberDialogOpen && (
        <div className="management-dialog-backdrop" role="presentation">
          <section aria-labelledby="add-tag-members-title" aria-modal="true" className="management-dialog" role="dialog">
            <header><div><span>批量绑定</span><h2 id="add-tag-members-title">添加到“{activeTag?.name ?? '标签'}”</h2></div><button aria-label="关闭" className="management-icon-button" disabled={Boolean(pendingAction) || memberCheckLoading} onClick={closeMemberDialog} type="button"><X size={16} /></button></header>
            <form className="management-dialog-form" onSubmit={appendMember}>
              <label htmlFor="tag-member-input">会员 ID</label>
              <div className="management-input-action"><input autoFocus disabled={memberCheckLoading || Boolean(pendingAction)} id="tag-member-input" onChange={(event) => setMemberDraft(event.target.value)} placeholder="输入后按回车" value={memberDraft} /><button disabled={memberCheckLoading || Boolean(pendingAction)} type="submit"><Plus size={15} />{memberCheckLoading ? '查询中' : '加入列表'}</button></div>
            </form>
            <div className="management-pending-members">
              {pendingMembers.map((username) => <div className="management-pending-member" key={username}><span>{username}</span><button aria-label={`移除${username}`} disabled={Boolean(pendingAction)} onClick={() => setPendingMembers((current) => current.filter((item) => item !== username))} type="button"><X size={13} /></button></div>)}
              {pendingMembers.length === 0 && <EmptyState icon={<UserPlus size={18} />}>输入会员 ID 后按回车。</EmptyState>}
            </div>
            <footer><button className="management-secondary-button" disabled={Boolean(pendingAction)} onClick={closeMemberDialog} type="button">取消</button><button className="management-primary-button" disabled={pendingMembers.length === 0 || Boolean(pendingAction)} onClick={confirmMembers} type="button"><Check size={15} />确认添加</button></footer>
          </section>
        </div>
      )}
    </div>
  );
}

function formatTagAddedAt(value: number) {
  if (!value) return '未记录日期';
  const date = new Date(value * 1000);
  if (Number.isNaN(date.getTime())) return '未记录日期';
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

function errorMessage(error: unknown, fallback: string) {
  return error instanceof TagsApiError ? error.message : error instanceof Error ? error.message : fallback;
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}
