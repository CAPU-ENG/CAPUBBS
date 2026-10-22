import { DialogLayer, DialogPresence } from '../layout/DialogPresence';
import { ArrowDownAZ, Check, Clock3, Plus, RefreshCw, Search, Tags, Trash2, UserCog, UserPlus, Users, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
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
  updateTagMember,
  type TagMember,
} from '../../api/tags';
import type { TagDefinition } from '../../data/tags';
import { useListPagination } from '../../hooks/useListPagination';
import { useStaggerEntrance } from '../../hooks/useStaggerEntrance';
import { getForumNavigationHref } from '../../utils/forumNavigation';
import { HexColorPicker, isHexColor } from '../HexColorPicker';
import { TagBadge } from '../tags/TagBadge';
import { Button } from '../Button';
import { ListPagination } from '../layout/ListPagination';

const MEMBER_ID_COLLATOR = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' });
const TAG_NAME_COLLATOR = new Intl.Collator('zh-CN', { sensitivity: 'base' });
const DEFAULT_TAG_COLOR = '#287A52';
const MEMBER_PAGE_SIZE = 40;
const TAG_NAME_MAX_LENGTH = 50;
const MEMBER_SEARCH_LIMIT = 8;

type Notice = { kind: 'error' | 'info' | 'success'; text: string } | null;
type NoticeKind = 'error' | 'info' | 'success';
type PickerSort = 'members' | 'name' | 'newest';
type DeleteTarget =
  | { kind: 'tag'; tag: TagDefinition }
  | { kind: 'member'; username: string };

export function TagManagementWorkspace() {
  const workspaceRef = useStaggerEntrance<HTMLDivElement>('.management-tag-definition-list > button, .management-member-list > button');
  const [definitions, setDefinitions] = useState<TagDefinition[]>([]);
  const [members, setMembers] = useState<TagMember[]>([]);
  const [memberSelectedTagId, setMemberSelectedTagId] = useState('');
  const [definitionsStatus, setDefinitionsStatus] = useState<'error' | 'loading' | 'ready'>('loading');
  const [membersStatus, setMembersStatus] = useState<'error' | 'loading' | 'ready'>('ready');
  const [definitionsReload, setDefinitionsReload] = useState(0);
  const [membersReload, setMembersReload] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftColor, setDraftColor] = useState(DEFAULT_TAG_COLOR);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editQuery, setEditQuery] = useState('');
  const [editSelected, setEditSelected] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [memberDraft, setMemberDraft] = useState('');
  const [pendingMembers, setPendingMembers] = useState<string[]>([]);
  const [pickerQuery, setPickerQuery] = useState('');
  const [pickerSort, setPickerSort] = useState<PickerSort>('newest');
  const [memberSortOrder, setMemberSortOrder] = useState<'acquiredAt' | 'id'>('acquiredAt');
  const [memberCheckLoading, setMemberCheckLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteTagMembers, setDeleteTagMembers] = useState<TagMember[]>([]);
  const [deleteTagMembersStatus, setDeleteTagMembersStatus] = useState<'error' | 'loading' | 'ready'>('ready');
  const deleteTagMembersRequestId = useRef(0);
  const memberInputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const sortedDefinitions = useMemo(
    () => [...definitions].sort((left, right) => TAG_NAME_COLLATOR.compare(left.name, right.name) || MEMBER_ID_COLLATOR.compare(left.id, right.id)),
    [definitions],
  );
  const pickerTags = useMemo(() => {
    const keyword = pickerQuery.trim().toLocaleLowerCase();
    const matched = keyword
      ? definitions.filter((tag) => tag.name.toLocaleLowerCase().includes(keyword))
      : [...definitions];
    if (pickerSort === 'name') return matched.sort((left, right) => TAG_NAME_COLLATOR.compare(left.name, right.name));
    if (pickerSort === 'members') {
      return matched.sort((left, right) => (right.memberCount ?? -1) - (left.memberCount ?? -1)
        || TAG_NAME_COLLATOR.compare(left.name, right.name));
    }
    return matched.sort((left, right) => (right.addedAt ?? '').localeCompare(left.addedAt ?? '')
      || MEMBER_ID_COLLATOR.compare(right.id, left.id));
  }, [definitions, pickerQuery, pickerSort]);
  const activeTagId = memberSelectedTagId || sortedDefinitions[0]?.id || '';
  const activeTag = definitions.find((tag) => tag.id === activeTagId) ?? null;
  const editingTag = definitions.find((tag) => tag.id === editingId) ?? null;
  const sortedMembers = useMemo(
    () => [...members].sort((left, right) => memberSortOrder === 'id'
      ? MEMBER_ID_COLLATOR.compare(left.username, right.username)
      : right.addedAt - left.addedAt || MEMBER_ID_COLLATOR.compare(left.username, right.username)),
    [memberSortOrder, members],
  );
  const memberPagination = useListPagination(sortedMembers, MEMBER_PAGE_SIZE, `${activeTagId}:${memberSortOrder}`);

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
        setNotice({ kind: 'error', text: errorMessage(error, '标签列表加载失败，请稍后重试') });
      },
    );
    return () => controller.abort();
  }, [definitionsReload]);

  useEffect(() => {
    setMemberSelectedTagId((current) => sortedDefinitions.some((tag) => tag.id === current)
      ? current
      : sortedDefinitions[0]?.id ?? '');
  }, [sortedDefinitions]);

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
        setNotice({ kind: 'error', text: errorMessage(error, '标签会员加载失败，请稍后重试') });
      },
    );
    return () => controller.abort();
  }, [activeTagId, membersReload]);

  useEffect(() => {
    if (membersStatus !== 'ready' || !activeTagId) return;
    setDefinitions((current) => current.some((tag) => tag.id === activeTagId && tag.memberCount !== members.length)
      ? current.map((tag) => tag.id === activeTagId ? { ...tag, memberCount: members.length } : tag)
      : current);
  }, [activeTagId, members, membersStatus]);

  useEffect(() => {
    if (memberDialogOpen && !memberCheckLoading && !pendingAction) {
      memberInputRef.current?.focus();
    }
  }, [memberCheckLoading, memberDialogOpen, pendingAction]);

  function startCreate() {
    setEditingId('new');
    setDraftName('');
    setDraftColor(DEFAULT_TAG_COLOR);
    setNotice(null);
  }

  function startEdit(tag: TagDefinition) {
    if (editingId === tag.id) {
      cancelEdit();
      return;
    }
    setEditingId(tag.id);
    setDraftName(tag.name);
    setDraftColor(tag.color.toUpperCase());
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
    const names = editingId === 'new'
      ? [...new Set(draftName.split(/[,，]/).map((item) => item.trim()).filter(Boolean))]
      : [name];
    if (names.length === 0 || !names[0]) {
      setNotice({ kind: 'error', text: '请输入标签名称' });
      return;
    }
    const tooLong = names.find((item) => item.length > TAG_NAME_MAX_LENGTH);
    if (tooLong) {
      setNotice({ kind: 'error', text: `标签名称不能超过 ${TAG_NAME_MAX_LENGTH} 个字符：${tooLong}` });
      return;
    }
    if (!isHexColor(draftColor)) {
      setNotice({ kind: 'error', text: '请输入六位十六进制颜色' });
      return;
    }
    const duplicates = names.filter((item) => definitions.some((tag) => tag.name === item && tag.id !== editingId));
    if (duplicates.length > 0) {
      setNotice({ kind: 'error', text: `已经存在同名标签：${duplicates.join('、')}` });
      return;
    }

    setPendingAction('tag-save');
    setNotice(null);
    try {
      if (editingId === 'new') {
        for (const [index, item] of names.entries()) {
          let created: TagDefinition;
          try {
            created = await createTagDefinition(item, draftColor);
          } catch (error) {
            if (index > 0) {
              setDraftName(names.slice(index).join(', '));
              throw new TagsApiError(`已创建 ${index} 个标签，“${item}”创建失败：${errorMessage(error, '请稍后重试')}`);
            }
            throw error;
          }
          setDefinitions((current) => [...current, created]);
        }
        setNotice({ kind: 'success', text: names.length > 1 ? `已创建 ${names.length} 个标签` : '标签已创建' });
      } else if (editingTag) {
        const updated = await updateTagDefinition(editingTag.id, { color: draftColor, name });
        setDefinitions((current) => current.map((tag) => tag.id === updated.id ? updated : tag));
        setNotice({ kind: 'success', text: '标签已更新' });
      }
      cancelEdit();
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '标签保存失败，请稍后重试') });
    } finally {
      setPendingAction(null);
    }
  }

  function removeTag(tag: TagDefinition) {
    setDeleteTarget({ kind: 'tag', tag });
    const requestId = ++deleteTagMembersRequestId.current;
    if (tag.id === activeTagId && membersStatus === 'ready') {
      setDeleteTagMembers(members);
      setDeleteTagMembersStatus('ready');
      return;
    }
    setDeleteTagMembers([]);
    setDeleteTagMembersStatus('loading');
    void fetchTagMembers(tag.id).then(
      (items) => {
        if (requestId !== deleteTagMembersRequestId.current) return;
        setDeleteTagMembers(items);
        setDeleteTagMembersStatus('ready');
      },
      (error: unknown) => {
        if (requestId !== deleteTagMembersRequestId.current || isAbortError(error)) return;
        setDeleteTagMembersStatus('error');
      },
    );
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
      setNotice({ kind: 'success', text: '标签已删除' });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '标签删除失败，请稍后重试') });
    } finally {
      setPendingAction(null);
    }
  }

  function selectTag(tagId: string) {
    setMemberSelectedTagId(tagId);
    setMemberSortOrder('acquiredAt');
  }

  function closeDeleteDialog() {
    ++deleteTagMembersRequestId.current;
    setDeleteTarget(null);
  }

  async function appendMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const username = memberDraft.trim();
    if (!username || !activeTagId || memberCheckLoading) return;
    if (pendingMembers.some((item) => item.toLocaleLowerCase() === username.toLocaleLowerCase())) {
      setNotice({ kind: 'error', text: '这个会员已经在待添加列表中' });
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
        setNotice({ kind: 'info', text: `会员 ${result.username || username} 已经拥有该标签` });
      } else {
        setNotice({ kind: 'error', text: `没有找到会员 ${result.username || username}` });
      }
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '会员查询失败，请稍后重试') });
    } finally {
      setMemberCheckLoading(false);
    }
  }

  function closeMemberDialog() {
    setMemberDialogOpen(false);
    setMemberDraft('');
    setPendingMembers([]);
  }

  function openMemberDialog() {
    setNotice(null);
    setMemberDialogOpen(true);
  }

  function openEditDialog() {
    setNotice(null);
    setEditQuery('');
    setEditSelected(null);
    setEditUsername('');
    setEditDialogOpen(true);
  }

  function closeEditDialog() {
    setEditDialogOpen(false);
  }

  function selectEditMember(username: string) {
    setEditSelected(username);
    setEditUsername(username);
    setNotice(null);
  }

  async function confirmEditMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const username = editSelected;
    const newUsername = editUsername.trim();
    if (!activeTagId || !username || !newUsername || newUsername === username || pendingAction) return;
    setPendingAction('member-update');
    setNotice(null);
    try {
      const updated = await updateTagMember(activeTagId, username, newUsername);
      setMembers((current) => current.map((member) => member.username === username ? updated : member));
      closeEditDialog();
      setNotice({ kind: 'success', text: `已将 ${username} 的“${activeTag?.name ?? '标签'}”改为 ${updated.username}` });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '修改会员 ID 失败，请稍后重试') });
    } finally {
      setPendingAction(null);
    }
  }

  async function confirmMembers() {
    if (!activeTagId || pendingMembers.length === 0) {
      setNotice({ kind: 'error', text: '请先输入至少一个会员 ID' });
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
      setNotice({ kind: 'success', text: addedCount > 0 ? `已为 ${addedCount} 位会员添加“${activeTag?.name ?? '标签'}”` : '输入的会员已经拥有该标签' });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '批量添加标签会员失败，请稍后重试') });
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
      setNotice({ kind: 'success', text: `已从“${activeTag?.name ?? '标签'}”移除 ${username}` });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error, '移除标签会员失败，请稍后重试') });
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
    <div className="management-tags-workspace" ref={workspaceRef}>
      <section className="management-card" aria-labelledby="tag-definitions-title">
        <header className="management-card-heading">
          <div><h2 id="tag-definitions-title">已有标签</h2></div>
          <Button variant="primary" disabled={Boolean(pendingAction)} onClick={startCreate} type="button"><Plus size={15} />新建标签</Button>
        </header>
        <div className="management-tag-editor-wrap">
          {editingId && (
            <form className="management-tag-editor" onSubmit={saveTag}>
              <label><span>名称</span><input autoFocus className="forum-input" maxLength={editingId === 'new' ? undefined : TAG_NAME_MAX_LENGTH} onChange={(event) => setDraftName(event.target.value)} value={draftName} /></label>
              <div className="management-tag-color-field">
                <span>颜色</span>
                <HexColorPicker ariaLabel="标签颜色" onChange={setDraftColor} value={draftColor} />
              </div>
              <div className="management-tag-editor-actions"><Button variant="primary" disabled={Boolean(pendingAction)} type="submit">保存</Button><Button disabled={Boolean(pendingAction)} onClick={cancelEdit} type="button">取消</Button>{editingTag && <Button variant="danger" disabled={Boolean(pendingAction)} onClick={() => removeTag(editingTag)} type="button"><Trash2 size={14} />删除</Button>}</div>
            </form>
          )}
          <div className="management-tag-definition-list">
            {sortedDefinitions.map((tag) => (
              <button className={`management-tag-definition-button ${editingId === tag.id ? 'management-tag-definition-button-selected' : ''}`} disabled={Boolean(pendingAction)} key={tag.id} onClick={() => startEdit(tag)} type="button">
                <TagBadge selected={editingId === tag.id} tag={tag} />
              </button>
            ))}
            {definitions.length === 0 && <EmptyState action={definitionsStatus === 'error' ? <RetryButton onClick={() => { setNotice(null); setDefinitionsStatus('loading'); setDefinitionsReload((value) => value + 1); }} /> : undefined} icon={<Tags size={18} />}>{definitionsStatus === 'loading' ? '正在加载标签' : definitionsStatus === 'error' ? '标签加载失败' : '还没有标签'}</EmptyState>}
          </div>
        </div>
      </section>

      <section className="management-card" aria-labelledby="member-tags-title">
        <header className="management-card-heading">
          <div><h2 id="member-tags-title">已有标签会员</h2></div>
          <div className="management-card-actions">
            <Button disabled={!activeTagId || membersStatus !== 'ready' || members.length === 0 || Boolean(pendingAction)} onClick={openEditDialog} type="button"><UserCog size={15} />编辑会员</Button>
            <Button variant="primary" disabled={!activeTagId || Boolean(pendingAction)} onClick={openMemberDialog} type="button"><UserPlus size={15} />添加会员</Button>
          </div>
        </header>
        <div className="management-member-tag-layout">
          <aside className="management-member-picker" aria-label="标签">
            <div className="management-member-picker-tools">
              <label className="management-member-search">
                <Search aria-hidden="true" size={14} />
                <input aria-label="搜索标签" className="forum-input" onChange={(event) => setPickerQuery(event.target.value)} placeholder="搜索标签" type="search" value={pickerQuery} />
              </label>
              <select aria-label="标签排序" className="forum-input" onChange={(event) => setPickerSort(event.target.value as PickerSort)} value={pickerSort}>
                <option value="newest">按时间</option>
                <option value="name">按名称</option>
                <option value="members">按人数</option>
              </select>
            </div>
            <div className="management-member-list">
              {pickerTags.map((tag) => (
                <button className={`management-member-filter-tag ${activeTagId === tag.id ? 'management-member-filter-tag-selected' : ''}`} disabled={Boolean(pendingAction)} key={tag.id} onClick={() => selectTag(tag.id)} type="button"><TagBadge selected={activeTagId === tag.id} tag={tag} /></button>
              ))}
              {definitions.length > 0 && pickerTags.length === 0 && <p className="management-member-search-empty management-member-picker-empty">无匹配标签</p>}
              {definitions.length === 0 && <EmptyState action={definitionsStatus === 'error' ? <RetryButton onClick={() => { setNotice(null); setDefinitionsStatus('loading'); setDefinitionsReload((value) => value + 1); }} /> : undefined} icon={<Tags size={18} />}>{definitionsStatus === 'loading' ? '正在加载标签' : definitionsStatus === 'error' ? '标签加载失败' : '还没有标签'}</EmptyState>}
            </div>
          </aside>
          <div className="management-member-tag-editor" ref={memberPagination.anchorRef}>
            {membersStatus === 'loading' ? <EmptyState icon={<Users size={18} />}>正在加载会员</EmptyState> : membersStatus === 'error' ? <EmptyState action={<RetryButton onClick={() => { setNotice(null); setMembersReload((value) => value + 1); }} />} icon={<Users size={18} />}>会员加载失败</EmptyState> : (
              <>
                <div className="tag-summary-sort-bar management-member-sort-bar">
                  <button aria-pressed={memberSortOrder === 'acquiredAt'} className={memberSortOrder === 'acquiredAt' ? 'tag-summary-sort-active' : ''} onClick={() => setMemberSortOrder('acquiredAt')} type="button"><Clock3 size={14} />获取时间</button>
                  <button aria-pressed={memberSortOrder === 'id'} className={memberSortOrder === 'id' ? 'tag-summary-sort-active' : ''} onClick={() => setMemberSortOrder('id')} type="button"><ArrowDownAZ size={14} />ID</button>
                  <span className="management-member-total">共 {members.length} 人</span>
                </div>
                {sortedMembers.length > 0 ? (
                  <>
                  <div className="management-member-grid">
                    {memberPagination.pageItems.map((member) => (
                      <article className="management-member-card" key={member.username}>
                        <a className="management-member-id" href={getForumNavigationHref(member.href, window.location.href)}>{member.username}</a>
                        <time>{formatTagAddedAt(member.addedAt)}</time>
                        <button aria-label={`从${activeTag?.name ?? '标签'}移除${member.username}`} className="management-member-remove" disabled={Boolean(pendingAction)} onClick={() => removeMember(member.username)} title="移除会员" type="button"><X size={15} /></button>
                      </article>
                    ))}
                  </div>
                  <ListPagination ariaLabel="标签会员分页" className="management-list-pagination" currentPage={memberPagination.currentPage} onPageChange={memberPagination.onPageChange} pageCount={memberPagination.pageCount} />
                  </>
                ) : <EmptyState icon={<Users size={18} />}>没有符合条件的会员</EmptyState>}
              </>
            )}
          </div>
        </div>
      </section>
      {notice && !memberDialogOpen && !editDialogOpen && <ManagementNotice kind={notice.kind}>{notice.text}</ManagementNotice>}
      <DialogPresence>{deleteTarget && (
        <DialogLayer className="management-dialog-backdrop" onDismiss={pendingAction ? undefined : closeDeleteDialog} role="presentation">
          <section aria-labelledby="confirm-tag-delete-title" aria-modal="true" className="management-dialog management-confirm-dialog" role="dialog">
            <header><div><h2 id="confirm-tag-delete-title">{deleteTarget.kind === 'tag' ? '删除标签' : '移除会员'}</h2></div><Button aria-label="关闭" icon disabled={Boolean(pendingAction)} onClick={closeDeleteDialog} type="button"><X size={16} /></Button></header>
            <p className="management-dialog-copy">{deleteTarget.kind === 'tag' ? `确定删除“${deleteTarget.tag.name}”吗？已绑定会员的关系也会一并移除` : `确定从“${activeTag?.name ?? '标签'}”中移除 ${deleteTarget.username} 吗？`}</p>
            {deleteTarget.kind === 'tag' && (
              <div className="management-delete-tag-members">
                <strong>标签会员</strong>
                {deleteTagMembersStatus === 'loading' ? <span>正在加载会员</span> : deleteTagMembersStatus === 'error' ? <span>会员加载失败</span> : deleteTagMembers.length > 0 ? (
                  <div className="management-delete-tag-member-list">
                    {deleteTagMembers.map((member) => <a href={getForumNavigationHref(member.href, window.location.href)} key={member.username}>{member.username}</a>)}
                  </div>
                ) : <span>暂无会员</span>}
              </div>
            )}
            <footer><Button disabled={Boolean(pendingAction)} onClick={closeDeleteDialog} type="button">取消</Button><Button variant="danger" disabled={Boolean(pendingAction)} onClick={confirmDelete} type="button"><Trash2 size={14} />确认删除</Button></footer>
          </section>
        </DialogLayer>
      )}</DialogPresence>
      <DialogPresence>{memberDialogOpen && (
        <DialogLayer className="management-dialog-backdrop" onDismiss={pendingAction || memberCheckLoading ? undefined : closeMemberDialog} role="presentation">
          <section aria-labelledby="add-tag-members-title" aria-modal="true" className="management-dialog" role="dialog">
            <header><div><span>批量绑定</span><h2 id="add-tag-members-title">添加到“{activeTag?.name ?? '标签'}”</h2></div><Button aria-label="关闭" icon disabled={Boolean(pendingAction) || memberCheckLoading} onClick={closeMemberDialog} type="button"><X size={16} /></Button></header>
            <form className="management-dialog-form" onSubmit={appendMember}>
              <label htmlFor="tag-member-input">会员 ID</label>
              <div className="management-input-action"><input autoFocus disabled={memberCheckLoading || Boolean(pendingAction)} id="tag-member-input" onChange={(event) => setMemberDraft(event.target.value)} placeholder="输入后按回车" ref={memberInputRef} value={memberDraft} /><button disabled={memberCheckLoading || Boolean(pendingAction)} type="submit"><Plus size={15} />{memberCheckLoading ? '查询中' : '加入列表'}</button></div>
            </form>
            {notice && <ManagementNotice kind={notice.kind}>{notice.text}</ManagementNotice>}
            <div className="management-pending-members">
              {pendingMembers.map((username) => <div className="management-pending-member" key={username}><span>{username}</span><button aria-label={`移除${username}`} disabled={Boolean(pendingAction)} onClick={() => setPendingMembers((current) => current.filter((item) => item !== username))} type="button"><X size={13} /></button></div>)}
              {pendingMembers.length === 0 && <EmptyState icon={<UserPlus size={18} />}>输入会员 ID 后按回车</EmptyState>}
            </div>
            <footer><Button disabled={Boolean(pendingAction)} onClick={closeMemberDialog} type="button">取消</Button><Button variant="primary" disabled={pendingMembers.length === 0 || Boolean(pendingAction)} onClick={confirmMembers} type="button"><Check size={15} />确认添加</Button></footer>
          </section>
        </DialogLayer>
      )}</DialogPresence>
      <DialogPresence>{editDialogOpen && (
        <DialogLayer className="management-dialog-backdrop" onDismiss={pendingAction ? undefined : closeEditDialog} role="presentation">
          <section aria-labelledby="edit-tag-member-title" aria-modal="true" className="management-dialog" role="dialog">
            <header><div><h2 id="edit-tag-member-title">编辑“{activeTag?.name ?? '标签'}”会员</h2></div><Button aria-label="关闭" icon disabled={Boolean(pendingAction)} onClick={closeEditDialog} type="button"><X size={16} /></Button></header>
            <TagMemberEditBody
              disabled={Boolean(pendingAction)}
              editUsername={editUsername}
              members={members}
              onEditUsernameChange={setEditUsername}
              onQueryChange={setEditQuery}
              onSelect={selectEditMember}
              onSubmit={confirmEditMember}
              query={editQuery}
              selected={editSelected}
            />
            {notice && <ManagementNotice kind={notice.kind}>{notice.text}</ManagementNotice>}
            <footer>
              <Button disabled={Boolean(pendingAction)} onClick={closeEditDialog} type="button">取消</Button>
              <Button variant="primary" disabled={!editSelected || !editUsername.trim() || editUsername.trim() === editSelected || Boolean(pendingAction)} form="edit-tag-member-form" type="submit"><Check size={15} />{pendingAction === 'member-update' ? '保存中' : '保存'}</Button>
            </footer>
          </section>
        </DialogLayer>
      )}</DialogPresence>
    </div>
  );
}

function TagMemberEditBody({
  disabled,
  editUsername,
  members,
  onEditUsernameChange,
  onQueryChange,
  onSelect,
  onSubmit,
  query,
  selected,
}: {
  disabled: boolean;
  editUsername: string;
  members: TagMember[];
  onEditUsernameChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onSelect: (username: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  query: string;
  selected: string | null;
}) {
  const keyword = query.trim().toLocaleLowerCase();
  const matches = keyword
    ? members.filter((member) => member.username.toLocaleLowerCase().includes(keyword))
    : [];
  return (
    <div className="management-member-search-dialog">
      <label className="management-member-search">
        <Search aria-hidden="true" size={15} />
        <input aria-label="搜索会员" autoFocus className="forum-input" disabled={disabled} onChange={(event) => onQueryChange(event.target.value)} placeholder="输入会员 ID" type="search" value={query} />
      </label>
      {keyword ? (
        matches.length > 0 ? (
          <div className="management-member-search-results">
            {matches.slice(0, MEMBER_SEARCH_LIMIT).map((member) => (
              <button aria-pressed={member.username === selected} className={member.username === selected ? 'is-selected' : ''} disabled={disabled} key={member.username} onClick={() => onSelect(member.username)} type="button">
                <strong>{member.username}</strong>
                <span>{formatTagAddedAt(member.addedAt)}</span>
              </button>
            ))}
            {matches.length > MEMBER_SEARCH_LIMIT ? <p>另有 {matches.length - MEMBER_SEARCH_LIMIT} 名匹配会员</p> : null}
          </div>
        ) : <p className="management-member-search-empty">无匹配会员</p>
      ) : null}
      {selected ? (
        <form id="edit-tag-member-form" onSubmit={onSubmit}>
          <label><span>会员 ID</span><input className="forum-input" disabled={disabled} maxLength={30} onChange={(event) => onEditUsernameChange(event.target.value)} type="text" value={editUsername} /></label>
        </form>
      ) : null}
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

function EmptyState({ action, children, icon }: { action?: ReactNode; children: string; icon: ReactNode }) {
  return <div className="management-empty-state"><span>{icon}</span>{children}{action}</div>;
}

function RetryButton({ onClick }: { onClick: () => void }) {
  return <Button onClick={onClick}><RefreshCw aria-hidden="true" size={15} />重新加载</Button>;
}

function ManagementNotice({ children, kind }: { children: string; kind: NoticeKind }) {
  return <div className={`management-notice management-notice-${kind}`}>{children}</div>;
}

function errorMessage(error: unknown, fallback: string) {
  const message = error instanceof TagsApiError ? error.message : error instanceof Error ? error.message : fallback;
  return message.replace(/[。.]$/, '');
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}
