import {
  AlertTriangle, Archive, ArrowDownAZ, ChevronRight, Download, ExternalLink, FileArchive, FileAudio2, FileImage, FileText,
  FileUp, FileVideo2, Folder, FolderInput, FolderPlus, FolderUp, Grid2X2, List, LogIn, MessageSquarePlus,
  Link2, Pencil, Search, ShieldCheck, Trash2, UserPlus, UserRound, X,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppBackground } from '../components/layout/AppBackground';
import { LoadingSpinner as LoaderCircle } from '../components/layout/LoadingSpinner';
import { TopBar } from '../components/layout/TopBar';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuth } from '../context/AuthContext';
import { getLoginPathWithReturnTo, getRegisterPathWithReturnTo } from '../utils/authRoutes';
import {
  archiveDownloadUrl, createArchiveFolder, createArchivePost, fetchArchiveListing, maskArchiveEntry, moveArchiveEntry,
  renameArchiveEntry, uploadArchiveFile, type ArchiveBreadcrumb, type ArchiveEntry,
} from '../api/archiveRoom';
import { fetchManagementThread } from '../api/management';

type ArchiveKind = 'archive' | 'audio' | 'document' | 'folder' | 'image' | 'post' | 'video';
type DialogState = { type: 'upload' | 'upload-folder' | 'create-post' | 'mkdir' | 'rename' | 'move'; entry?: ArchiveEntry } | null;
type FolderOption = { entryKey: string | null; label: string };

const KIND_META: Record<ArchiveKind, { icon: LucideIcon; tone: string }> = {
  archive: { icon: FileArchive, tone: 'archive-room-file-archive' }, audio: { icon: FileAudio2, tone: 'archive-room-file-audio' },
  document: { icon: FileText, tone: 'archive-room-file-document' }, folder: { icon: Folder, tone: 'archive-room-file-folder' },
  image: { icon: FileImage, tone: 'archive-room-file-image' }, post: { icon: MessageSquarePlus, tone: 'archive-room-file-post' },
  video: { icon: FileVideo2, tone: 'archive-room-file-video' },
};

export function ArchiveRoomPage() {
  useDocumentTitle('档案室');
  const { status: authStatus } = useAuth();
  const isAuthenticated = authStatus === 'authenticated' || authStatus === 'restoring';
  const [serverCanManage, setServerCanManage] = useState(false);
  const canManage = isAuthenticated && serverCanManage;
  const [parentKey, setParentKey] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<ArchiveBreadcrumb[]>([{ entryKey: null, name: 'pan' }]);
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => window.matchMedia('(max-width: 720px)').matches ? 'grid' : 'list');
  const [sortBy, setSortBy] = useState<'name' | 'updatedAt'>('name');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogName, setDialogName] = useState('');
  const [dialogFile, setDialogFile] = useState<File | null>(null);
  const [dialogFiles, setDialogFiles] = useState<File[]>([]);
  const [dialogSkippedFiles, setDialogSkippedFiles] = useState(0);
  const [dialogUrl, setDialogUrl] = useState('');
  const [dialogBusy, setDialogBusy] = useState(false);
  const [dialogNameEdited, setDialogNameEdited] = useState(false);
  const [dialogTitleLoading, setDialogTitleLoading] = useState(false);
  const [maskTarget, setMaskTarget] = useState<ArchiveEntry | null>(null);
  const [maskBusy, setMaskBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const uploadStartedAt = useRef<number | null>(null);
  const titleLookupController = useRef<AbortController | null>(null);
  const [folderOptions, setFolderOptions] = useState<FolderOption[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(false);
  const requestedFolderName = new URLSearchParams(window.location.search).get('folder')?.trim() ?? '';
  const [resolvedRequestedFolder, setResolvedRequestedFolder] = useState(false);

  const loadListing = useCallback(async (nextParentKey: string | null, signal?: AbortSignal) => {
    setLoading(true); setError('');
    try {
      const listing = await fetchArchiveListing(nextParentKey, signal);
      if (!nextParentKey && requestedFolderName && !resolvedRequestedFolder) {
        const requestedFolder = listing.entries.find((entry) => entry.entryType === 'folder' && entry.name === requestedFolderName);
        if (requestedFolder) {
          setResolvedRequestedFolder(true);
          setParentKey(requestedFolder.entryKey);
          return;
        }
        setResolvedRequestedFolder(true);
      }
      setEntries(listing.entries); setBreadcrumbs(listing.breadcrumbs); setServerCanManage(listing.canManage);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
      setError(getErrorMessage(requestError)); setEntries([]);
    } finally { if (!signal?.aborted) setLoading(false); }
  }, [requestedFolderName, resolvedRequestedFolder]);

  useEffect(() => {
    if (!isAuthenticated) { setEntries([]); setServerCanManage(false); setLoading(false); return; }
    const controller = new AbortController(); void loadListing(parentKey, controller.signal);
    return () => controller.abort();
  }, [isAuthenticated, loadListing, parentKey]);

  useEffect(() => {
    setDialogTitleLoading(false);
    if (dialog?.type !== 'create-post' || dialogNameEdited || !dialogUrl.trim()) return;

    const controller = new AbortController();
    titleLookupController.current = controller;
    const timeout = window.setTimeout(() => {
      setDialogTitleLoading(true);
      void fetchManagementThread(dialogUrl, controller.signal).then(
        (thread) => { if (!controller.signal.aborted) setDialogName(thread.title); },
        () => undefined,
      ).finally(() => { if (!controller.signal.aborted) setDialogTitleLoading(false); });
    }, 400);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
      if (titleLookupController.current === controller) titleLookupController.current = null;
    };
  }, [dialog?.type, dialogNameEdited, dialogUrl]);

  const visibleEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return entries.filter((entry) => !normalizedQuery || entry.name.toLocaleLowerCase().includes(normalizedQuery)).sort((left, right) => {
      if (left.entryType !== right.entryType) {
        const folderOrder = Number(left.entryType !== 'folder') - Number(right.entryType !== 'folder');
        if (folderOrder !== 0) return folderOrder;
      }
      return sortBy === 'updatedAt' ? right.updatedAt - left.updatedAt : left.name.localeCompare(right.name, 'zh-CN');
    });
  }, [entries, query, sortBy]);

  function enterFolder(entry: ArchiveEntry) { if (entry.entryType === 'folder') { setQuery(''); setParentKey(entry.entryKey); } }
  function goToBreadcrumb(item: ArchiveBreadcrumb) { setQuery(''); setParentKey(item.entryKey); }
  async function reload() { await loadListing(parentKey); }
  function openDialog(nextDialog: DialogState) { setDialog(nextDialog); setDialogName(nextDialog?.entry?.name ?? ''); setDialogNameEdited(false); setDialogFile(null); setDialogFiles([]); setDialogSkippedFiles(0); setDialogUrl(''); setDialogTitleLoading(false); setUploadProgress(null); setUploadSpeed(null); uploadStartedAt.current = null; setError(''); }

  function changeDialogName(name: string) {
    setDialogName(name);
    if (dialog?.type === 'create-post') {
      titleLookupController.current?.abort();
      setDialogNameEdited(true);
      setDialogTitleLoading(false);
    }
  }

  function changeDialogUrl(url: string) {
    titleLookupController.current?.abort();
    setDialogTitleLoading(false);
    setDialogUrl(url);
    if (!dialogNameEdited) setDialogName('');
  }

  function openEntry(entry: ArchiveEntry) {
    if (entry.entryType === 'folder') { enterFolder(entry); return; }
    if (entry.entryType === 'post') {
      if (!entry.targetUrl) { setError('帖子链接不可用。'); return; }
      window.open(entry.targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    window.location.href = archiveDownloadUrl(entry.entryKey);
  }

  function selectFile(file: File | null) {
    if (file && isDsStoreFile(file)) {
      setDialogFile(null);
      setError('不能上传 .DS_Store 文件。');
      return;
    }
    setDialogFile(file);
    setError('');
    if (file && !dialogName) setDialogName(file.name);
  }

  function selectFolderFiles(files: File[]) {
    const uploadableFiles = files.filter((file) => !isDsStoreFile(file));
    setDialogFiles(uploadableFiles);
    setDialogSkippedFiles(files.length - uploadableFiles.length);
    setError(uploadableFiles.length === 0 ? '所选文件夹中没有可上传的文件。' : '');
  }

  async function submitDialog() {
    if (!dialog || dialogBusy) return;
    const name = dialogName.trim();
    if (dialog.type === 'upload' && (!name || !dialogFile)) { setError('请选择文件并填写文件名。'); return; }
    if (dialog.type === 'upload-folder' && dialogFiles.length === 0) { setError('请选择要上传的文件夹。'); return; }
    if (dialog.type === 'create-post' && !dialogUrl.trim()) { setError('请输入帖子链接。'); return; }
    if (dialog.type !== 'move' && dialog.type !== 'upload-folder' && dialog.type !== 'create-post' && !name) { setError('请输入名称。'); return; }
    const isUpload = dialog.type === 'upload' || dialog.type === 'upload-folder';
    titleLookupController.current?.abort();
    setDialogTitleLoading(false);
    setDialogBusy(true); setUploadProgress(isUpload ? 0 : null); setUploadSpeed(null); uploadStartedAt.current = isUpload ? performance.now() : null; setError('');
    try {
      if (dialog.type === 'upload' && dialogFile) {
        await uploadArchiveFile({ file: dialogFile, name, parentKey, onProgress: (progress, loaded) => {
          setUploadProgress(progress);
          const startedAt = uploadStartedAt.current;
          if (startedAt !== null) {
            const elapsedSeconds = (performance.now() - startedAt) / 1000;
            if (elapsedSeconds > 0) setUploadSpeed(loaded / elapsedSeconds);
          }
        } });
        setNotice(`已上传“${name}”。`);
      }
      else if (dialog.type === 'upload-folder') {
        const result = await uploadArchiveFolder(dialogFiles, parentKey, (progress, loaded) => {
          setUploadProgress(progress);
          const startedAt = uploadStartedAt.current;
          if (startedAt !== null) {
            const elapsedSeconds = (performance.now() - startedAt) / 1000;
            if (elapsedSeconds > 0) setUploadSpeed(loaded / elapsedSeconds);
          }
        });
        setNotice(`已上传文件夹“${result.rootName}”（${result.fileCount} 个文件）。`);
      }
      else if (dialog.type === 'create-post') {
        let postName = name;
        if (!postName) {
          try {
            postName = (await fetchManagementThread(dialogUrl)).title.trim();
          } catch {
            throw new Error('未能从链接提取帖子标题，请检查链接或填写帖子名称。');
          }
        }
        await createArchivePost(postName, dialogUrl.trim(), parentKey);
        setNotice(`已添加帖子“${postName}”。`);
      }
      else if (dialog.type === 'mkdir') { await createArchiveFolder(name, parentKey); setNotice(`已新建文件夹“${name}”。`); }
      else if (dialog.type === 'rename' && dialog.entry) { await renameArchiveEntry(dialog.entry.entryKey, name); setNotice(`已重命名为“${name}”。`); }
      else if (dialog.type === 'move' && dialog.entry) { const target = folderOptions.find((item) => item.label === name)?.entryKey ?? null; await moveArchiveEntry(dialog.entry.entryKey, target); setNotice(`已迁移“${dialog.entry.name}”。`); }
      setDialog(null); await reload();
    } catch (requestError) { setError(getErrorMessage(requestError)); } finally { setDialogBusy(false); setUploadProgress(null); setUploadSpeed(null); uploadStartedAt.current = null; }
  }

  async function loadFolderOptions(excludedKey?: string) {
    if (foldersLoading || folderOptions.length > 0) return;
    setFoldersLoading(true);
    try {
      const options: FolderOption[] = [{ entryKey: null, label: 'pan' }]; const visited = new Set<string>();
      async function walk(parent: string | null, prefix: string, excludedKey?: string): Promise<void> {
        const listing = await fetchArchiveListing(parent);
        for (const entry of listing.entries) {
          if (entry.entryType !== 'folder' || entry.entryKey === excludedKey || visited.has(entry.entryKey)) continue;
          visited.add(entry.entryKey); const label = prefix ? `${prefix} / ${entry.name}` : entry.name;
          options.push({ entryKey: entry.entryKey, label }); await walk(entry.entryKey, label, excludedKey);
        }
      }
      await walk(null, '', excludedKey); setFolderOptions(options);
    } catch (requestError) { setError(getErrorMessage(requestError)); } finally { setFoldersLoading(false); }
  }
  function openMoveDialog(entry: ArchiveEntry) { setFolderOptions([]); openDialog({ type: 'move', entry }); setDialogName('pan'); void loadFolderOptions(entry.entryType === 'folder' ? entry.entryKey : undefined); }
  function maskEntry(entry: ArchiveEntry) {
    if (!canManage) return;
    setError('');
    setMaskTarget(entry);
  }

  async function confirmMask() {
    if (!maskTarget || maskBusy) return;
    setMaskBusy(true);
    setError('');
    try {
      await maskArchiveEntry(maskTarget.entryKey);
      setNotice(`已删除“${maskTarget.name}”。`);
      setMaskTarget(null);
      await reload();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setMaskBusy(false);
    }
  }

  const shouldRenderGuestView = Boolean(authStatus === 'guest');
  if (shouldRenderGuestView) {
    return <div className="archive-room-page relative min-h-screen text-[var(--text)] transition-colors duration-200"><AppBackground /><TopBar contextHref="#archive-room-title" contextTitle="档案室" /><main className="archive-room-shell" id="archive-room-title"><section className="archive-room-panel" aria-labelledby="archive-room-heading"><header className="archive-room-heading"><div className="archive-room-title-wrap"><span className="archive-room-title-icon"><Archive size={20} /></span><h1 id="archive-room-heading">档案室</h1></div></header><ArchiveAuthPrompt /></section></main></div>;
  }

  return <div className="archive-room-page relative min-h-screen text-[var(--text)] transition-colors duration-200"><AppBackground /><TopBar contextHref="#archive-room-title" contextTitle="档案室" /><main className="archive-room-shell" id="archive-room-title"><section className="archive-room-panel" aria-labelledby="archive-room-heading"><header className="archive-room-heading"><div className="archive-room-title-wrap"><span className="archive-room-title-icon"><Archive size={20} /></span><h1 id="archive-room-heading">档案室</h1></div></header><div className="archive-room-toolbar"><nav className="archive-room-breadcrumb" aria-label="档案室路径">{breadcrumbs.map((item, index) => <span className="archive-room-breadcrumb-segment" key={`${item.entryKey ?? 'root'}-${index}`}>{index > 0 && <ChevronRight size={14} />}<button className={index === breadcrumbs.length - 1 ? 'is-current' : ''} onClick={() => goToBreadcrumb(item)} type="button">{index === 0 && <Archive size={15} />}{item.name}</button></span>)}</nav><div className={`archive-room-actions ${canManage ? 'archive-room-actions-manage' : ''}`}><label className="archive-room-search"><Search size={15} /><span className="sr-only">搜索档案</span><input onChange={(event) => setQuery(event.target.value)} placeholder="搜索当前目录" value={query} />{query && <button aria-label="清空搜索" onClick={() => setQuery('')} type="button"><X size={14} /></button>}</label>{canManage && <><button aria-label="上传文件" className="archive-room-action-button" onClick={() => openDialog({ type: 'upload' })} title="上传文件" type="button"><FileUp size={15} /><span>上传文件</span></button><button aria-label="上传文件夹" className="archive-room-action-button" onClick={() => openDialog({ type: 'upload-folder' })} title="上传文件夹" type="button"><FolderUp size={15} /><span>上传文件夹</span></button><button aria-label="添加帖子" className="archive-room-action-button" onClick={() => openDialog({ type: 'create-post' })} title="添加帖子" type="button"><MessageSquarePlus size={15} /><span>添加帖子</span></button><button aria-label="新建文件夹" className="archive-room-action-button" onClick={() => openDialog({ type: 'mkdir' })} title="新建文件夹" type="button"><FolderPlus size={15} /><span>新建文件夹</span></button></>}</div></div><div className="archive-room-subtoolbar"><span className="archive-room-count">{visibleEntries.length} 个项目</span><div className="archive-room-subtools"><label className="archive-room-sort"><ArrowDownAZ size={14} /><span className="sr-only">排序方式</span><select onChange={(event) => setSortBy(event.target.value as 'name' | 'updatedAt')} value={sortBy}><option value="name">按名称</option><option value="updatedAt">按更新时间</option></select></label><div className="archive-room-view-switch" aria-label="视图模式" role="group"><button aria-label="列表视图" aria-pressed={viewMode === 'list'} className={viewMode === 'list' ? 'is-active' : ''} onClick={() => setViewMode('list')} type="button"><List size={16} /></button><button aria-label="网格视图" aria-pressed={viewMode === 'grid'} className={viewMode === 'grid' ? 'is-active' : ''} onClick={() => setViewMode('grid')} type="button"><Grid2X2 size={16} /></button></div></div></div>{notice && <div className="archive-room-notice" role="status">{notice}</div>}{error && <div className="archive-room-error" role="alert">{error}</div>}{authStatus === 'guest' ? <ArchiveAuthPrompt /> : !isAuthenticated || loading ? <div className="archive-room-state"><LoaderCircle className="animate-spin" size={20} />正在读取</div> : viewMode === 'list' ? <ArchiveList entries={visibleEntries} canManage={canManage} onMask={maskEntry} onMove={openMoveDialog} onOpen={openEntry} onRename={(entry) => openDialog({ type: 'rename', entry })} /> : <ArchiveGrid entries={visibleEntries} canManage={canManage} onMask={maskEntry} onMove={openMoveDialog} onOpen={openEntry} onRename={(entry) => openDialog({ type: 'rename', entry })} />}</section></main>{dialog && <ArchiveDialog busy={dialogBusy} dialog={dialog} file={dialogFile} files={dialogFiles} folderOptions={folderOptions} foldersLoading={foldersLoading} name={dialogName} skippedFiles={dialogSkippedFiles} titleLoading={dialogTitleLoading} url={dialogUrl} uploadProgress={uploadProgress} uploadSpeed={uploadSpeed} onChangeFile={selectFile} onChangeFiles={selectFolderFiles} onChangeName={changeDialogName} onChangeUrl={changeDialogUrl} onClose={() => setDialog(null)} onSubmit={() => void submitDialog()} />}{maskTarget && <ArchiveDeleteDialog busy={maskBusy} entry={maskTarget} onCancel={() => setMaskTarget(null)} onConfirm={() => void confirmMask()} />}</div>;
}

function ArchiveAuthPrompt() {
  return <div className="archive-room-auth-prompt" role="status"><ShieldCheck size={24} /><p>登录以访问档案室</p><div className="archive-room-auth-actions"><a className="topbar-login-link" href={getLoginPathWithReturnTo()}><LogIn size={15} />登录</a><a className="topbar-register-link" href={getRegisterPathWithReturnTo()}><UserPlus size={15} />注册</a></div></div>;
}

type EntryActions = { canManage: boolean; onMask: (entry: ArchiveEntry) => void; onMove: (entry: ArchiveEntry) => void; onOpen: (entry: ArchiveEntry) => void; onRename: (entry: ArchiveEntry) => void };
type RowProps = EntryActions & { entry: ArchiveEntry };
function ArchiveList({ entries, ...actions }: EntryActions & { entries: ArchiveEntry[] }) { return <div className="archive-room-list-wrap"><table className="archive-room-list"><thead><tr><th>名称</th><th>创建者</th><th>大小</th><th>下载</th><th>更新时间</th><th><span className="sr-only">操作</span></th></tr></thead><tbody>{entries.map((entry) => <ArchiveListRow {...actions} entry={entry} key={entry.entryKey} />)}{entries.length === 0 && <tr><td className="archive-room-empty" colSpan={6}>当前目录没有项目</td></tr>}</tbody></table></div>; }
function ArchiveListRow({ canManage, entry, onMask, onMove, onOpen, onRename }: RowProps) { const { icon: Icon, tone } = KIND_META[getArchiveKind(entry)]; return <tr className={entry.entryType === 'folder' ? 'is-folder' : ''}><td><button className="archive-room-entry-name" onClick={() => onOpen(entry)} type="button"><span className={`archive-room-file-icon ${tone}`}><Icon size={17} /></span><span>{entry.name}</span>{entry.items !== undefined && <small>{entry.items}</small>}</button></td><td><span className="archive-room-owner"><UserRound size={13} />{entry.uploader || '—'}</span></td><td>{entry.entryType === 'file' ? formatBytes(entry.byteSize) : '—'}</td><td>{entry.entryType === 'file' ? entry.downloadCount : '—'}</td><td>{formatDate(entry.updatedAt)}</td><td><div className="archive-room-row-actions"><ArchiveOpenButton entry={entry} onOpen={onOpen} />{canManage && <><button aria-label={`重命名 ${entry.name}`} className="archive-room-icon-action" onClick={() => onRename(entry)} title="重命名" type="button"><Pencil size={15} /></button><button aria-label={`迁移 ${entry.name}`} className="archive-room-icon-action" onClick={() => onMove(entry)} title="迁移" type="button"><FolderInput size={15} /></button><button aria-label={`删除 ${entry.name}`} className="archive-room-icon-action" onClick={() => onMask(entry)} title="删除" type="button"><Trash2 size={15} /></button></>}</div></td></tr>; }
function ArchiveOpenButton({ entry, onOpen }: { entry: ArchiveEntry; onOpen: (entry: ArchiveEntry) => void }) { const isFolder = entry.entryType === 'folder'; const isPost = entry.entryType === 'post'; const label = isFolder ? `打开 ${entry.name}` : isPost ? `打开帖子 ${entry.name}` : `下载 ${entry.name}`; const title = isFolder ? '打开文件夹' : isPost ? '打开帖子' : '下载'; const Icon = isFolder ? ChevronRight : isPost ? ExternalLink : Download; return <button aria-label={label} className="archive-room-icon-action" onClick={() => onOpen(entry)} title={title} type="button"><Icon size={isFolder ? 16 : 15} /></button>; }
function ArchiveGrid({ entries, ...actions }: EntryActions & { entries: ArchiveEntry[] }) { return <div className="archive-room-grid">{entries.map((entry) => { const { icon: Icon, tone } = KIND_META[getArchiveKind(entry)]; return <article className={`archive-room-grid-item ${entry.entryType === 'folder' ? 'is-folder' : ''}`} key={entry.entryKey}><button className="archive-room-grid-main" onClick={() => actions.onOpen(entry)} type="button"><span className={`archive-room-grid-icon ${tone}`}><Icon size={28} /></span><strong>{entry.name}</strong><span>{formatEntryDetail(entry)}</span></button><div className="archive-room-grid-meta"><span>{entry.uploader || '—'}</span>{entry.entryType === 'file' && <span className="archive-room-grid-downloads">下载 {entry.downloadCount}</span>}{actions.canManage && <span className="archive-room-grid-actions"><button aria-label={`重命名 ${entry.name}`} className="archive-room-icon-action" onClick={() => actions.onRename(entry)} title="重命名" type="button"><Pencil size={14} /></button><button aria-label={`迁移 ${entry.name}`} className="archive-room-icon-action" onClick={() => actions.onMove(entry)} title="迁移" type="button"><FolderInput size={14} /></button><button aria-label={`删除 ${entry.name}`} className="archive-room-icon-action" onClick={() => actions.onMask(entry)} title="删除" type="button"><Trash2 size={14} /></button></span>}</div></article>; })}{entries.length === 0 && <div className="archive-room-empty archive-room-empty-grid">当前目录没有项目</div>}</div>; }

type ArchiveDialogProps = {
  busy: boolean;
  dialog: Exclude<DialogState, null>;
  file: File | null;
  files: File[];
  folderOptions: FolderOption[];
  foldersLoading: boolean;
  name: string;
  skippedFiles: number;
  titleLoading: boolean;
  uploadProgress: number | null;
  uploadSpeed: number | null;
  url: string;
  onChangeFile: (file: File | null) => void;
  onChangeFiles: (files: File[]) => void;
  onChangeName: (name: string) => void;
  onChangeUrl: (url: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

function ArchiveDialog({ busy, dialog, file, files, folderOptions, foldersLoading, name, onChangeFile, onChangeFiles, onChangeName, onChangeUrl, onClose, onSubmit, skippedFiles, titleLoading, uploadProgress, uploadSpeed, url }: ArchiveDialogProps) {
  const title = dialog.type === 'upload' ? '上传文件' : dialog.type === 'upload-folder' ? '上传文件夹' : dialog.type === 'create-post' ? '添加帖子' : dialog.type === 'mkdir' ? '新建文件夹' : dialog.type === 'rename' ? '重命名' : '迁移';
  const isUploading = (dialog.type === 'upload' || dialog.type === 'upload-folder') && busy;
  const folderName = files[0]?.webkitRelativePath.split('/').filter(Boolean)[0] ?? '';
  const folderBytes = files.reduce((total, selectedFile) => total + selectedFile.size, 0);
  const needsName = dialog.type !== 'move' && dialog.type !== 'upload-folder' && dialog.type !== 'create-post';
  const confirmDisabled = busy || titleLoading || (needsName && !name.trim()) || (dialog.type === 'upload' && !file) || (dialog.type === 'upload-folder' && files.length === 0) || (dialog.type === 'create-post' && !url.trim());
  const uploadName = dialog.type === 'upload-folder' ? folderName : file?.name ?? '';

  return <div className="archive-room-dialog-backdrop" onMouseDown={busy ? undefined : onClose} role="presentation">
    <section aria-labelledby="archive-room-dialog-title" aria-modal="true" className="archive-room-dialog" onMouseDown={(event) => event.stopPropagation()} role="dialog">
      <header><h2 id="archive-room-dialog-title">{title}</h2><button aria-label="关闭" className="archive-room-dialog-close" disabled={busy} onClick={onClose} type="button"><X size={17} /></button></header>
      <div className="archive-room-dialog-body">
        {dialog.type === 'upload' && <label className="archive-room-upload-picker">
          <input disabled={busy} onChange={(event) => onChangeFile(event.target.files?.[0] ?? null)} type="file" />
          <span className="archive-room-upload-picker-icon"><FileUp size={20} /></span>
          <span className="archive-room-upload-picker-main"><strong>{file?.name ?? '选择文件'}</strong>{file && <small>{formatBytes(file.size)}</small>}</span>
          <span className="archive-room-upload-picker-command">{file ? '重新选择' : '选择'}</span>
        </label>}
        {dialog.type === 'upload-folder' && <label className="archive-room-upload-picker">
          <input disabled={busy} multiple onChange={(event) => onChangeFiles(Array.from(event.target.files ?? []))} ref={(input) => { if (input) input.webkitdirectory = true; }} type="file" />
          <span className="archive-room-upload-picker-icon"><FolderUp size={20} /></span>
          <span className="archive-room-upload-picker-main"><strong>{folderName || '选择文件夹'}</strong>{files.length > 0 && <small>{files.length} 个文件 · {formatBytes(folderBytes)}{skippedFiles > 0 ? ` · 已排除 ${skippedFiles} 个 .DS_Store` : ''}</small>}</span>
          <span className="archive-room-upload-picker-command">{files.length > 0 ? '重新选择' : '选择'}</span>
        </label>}
        {dialog.type === 'create-post' && <label>帖子链接<span className="archive-room-link-input">{titleLoading ? <LoaderCircle aria-label="正在提取帖子标题" className="animate-spin" size={15} /> : <Link2 size={15} />}<input autoFocus disabled={busy} inputMode="url" maxLength={2048} onChange={(event) => onChangeUrl(event.target.value)} value={url} /></span></label>}
        {dialog.type === 'move' ? <label>目标文件夹<select disabled={foldersLoading || busy} onChange={(event) => onChangeName(event.target.value)} value={name}>{foldersLoading ? <option value="">读取文件夹</option> : folderOptions.map((option) => <option key={option.entryKey ?? 'root'} value={option.label}>{option.label}</option>)}</select></label> : dialog.type !== 'upload-folder' && <label>{dialog.type === 'upload' ? '文件名' : dialog.type === 'create-post' ? '帖子名称（选填）' : '名称'}<input autoFocus={dialog.type !== 'create-post'} disabled={busy} maxLength={255} onChange={(event) => onChangeName(event.target.value)} value={name} /></label>}
        {isUploading && <div className="archive-room-upload-progress" role="status"><div className="archive-room-upload-progress-label"><span title={uploadName}>{uploadName}</span><span className="archive-room-upload-speed">{formatTransferRate(uploadSpeed)}</span><strong>{uploadProgress ?? 0}%</strong></div><progress aria-label="上传进度" max={100} value={uploadProgress ?? 0} /></div>}
        <div className="archive-room-dialog-actions"><button disabled={busy} onClick={onClose} type="button">取消</button><button disabled={confirmDisabled} onClick={onSubmit} type="button">{busy && <LoaderCircle className="animate-spin" size={15} />}{isUploading ? '上传中' : '确认'}</button></div>
      </div>
    </section>
  </div>;
}

function ArchiveDeleteDialog({ busy, entry, onCancel, onConfirm }: { busy: boolean; entry: ArchiveEntry; onCancel: () => void; onConfirm: () => void }) {
  return <div className="archive-room-dialog-backdrop" onMouseDown={busy ? undefined : onCancel} role="presentation"><section aria-labelledby="archive-room-delete-title" aria-modal="true" className="archive-room-delete-dialog" onMouseDown={(event) => event.stopPropagation()} role="dialog"><header className="archive-room-delete-header"><span className="archive-room-delete-icon"><AlertTriangle size={19} /></span><div><h2 id="archive-room-delete-title">确认删除</h2><p>删除后将无法访问此档案项。</p></div><button aria-label="关闭" className="archive-room-dialog-close" disabled={busy} onClick={onCancel} type="button"><X size={17} /></button></header><div className="archive-room-delete-body"><strong title={entry.name}>{entry.name}</strong><div className="archive-room-dialog-actions"><button disabled={busy} onClick={onCancel} type="button">取消</button><button className="archive-room-delete-confirm" disabled={busy} onClick={onConfirm} type="button">{busy && <LoaderCircle className="animate-spin" size={15} />}删除</button></div></div></section></div>;
}

async function uploadArchiveFolder(files: File[], parentKey: string | null, onProgress: (progress: number, loaded: number) => void) {
  const plannedFiles = files.filter((file) => !isDsStoreFile(file)).map((file) => {
    const segments = file.webkitRelativePath.split('/').filter(Boolean);
    if (segments.length < 2) throw new Error('浏览器未提供文件夹结构，无法上传整个文件夹。');
    return { file, segments };
  });
  if (plannedFiles.length === 0) throw new Error('所选文件夹中没有可上传的文件。');

  const rootName = plannedFiles[0].segments[0];
  if (plannedFiles.some((item) => item.segments[0] !== rootName)) throw new Error('请选择单个文件夹。');
  const directoryPaths = new Set<string>();
  for (const item of plannedFiles) {
    for (let depth = 1; depth < item.segments.length; depth += 1) {
      directoryPaths.add(item.segments.slice(0, depth).join('/'));
    }
  }

  const folderKeys = new Map<string, string | null>([['', parentKey]]);
  const sortedDirectories = Array.from(directoryPaths).sort((left, right) => {
    const depthDifference = left.split('/').length - right.split('/').length;
    return depthDifference || left.localeCompare(right, 'zh-CN');
  });
  for (const path of sortedDirectories) {
    const separator = path.lastIndexOf('/');
    const parentPath = separator === -1 ? '' : path.slice(0, separator);
    const name = separator === -1 ? path : path.slice(separator + 1);
    const folder = await createArchiveFolder(name, folderKeys.get(parentPath) ?? null);
    if (!folder) throw new Error(`无法创建文件夹“${name}”。`);
    folderKeys.set(path, folder.entryKey);
  }

  const totalBytes = plannedFiles.reduce((total, item) => total + item.file.size, 0);
  let completedBytes = 0;
  let completedFiles = 0;
  for (const item of plannedFiles) {
    const folderPath = item.segments.slice(0, -1).join('/');
    const name = item.segments[item.segments.length - 1];
    await uploadArchiveFile({
      file: item.file,
      name,
      parentKey: folderKeys.get(folderPath) ?? null,
      onProgress: (_fileProgress, loaded) => {
        const aggregateLoaded = completedBytes + loaded;
        const progress = totalBytes > 0 ? Math.round((aggregateLoaded / totalBytes) * 100) : Math.round((completedFiles / plannedFiles.length) * 100);
        onProgress(Math.min(100, progress), aggregateLoaded);
      },
    });
    completedBytes += item.file.size;
    completedFiles += 1;
    const progress = totalBytes > 0 ? Math.round((completedBytes / totalBytes) * 100) : Math.round((completedFiles / plannedFiles.length) * 100);
    onProgress(Math.min(100, progress), completedBytes);
  }
  return { fileCount: plannedFiles.length, rootName };
}

function isDsStoreFile(file: File) { return file.name === '.DS_Store' || file.webkitRelativePath.split('/').includes('.DS_Store'); }
function getArchiveKind(entry: ArchiveEntry): ArchiveKind { if (entry.entryType === 'folder') return 'folder'; if (entry.entryType === 'post') return 'post'; const mime = entry.mimeType ?? ''; if (mime.startsWith('image/')) return 'image'; if (mime.startsWith('video/')) return 'video'; if (mime.startsWith('audio/')) return 'audio'; if (mime.includes('zip') || mime.includes('compressed') || /\.(zip|rar|7z|tar|gz)$/i.test(entry.name)) return 'archive'; return 'document'; }
function formatEntryDetail(entry: ArchiveEntry) { return entry.entryType === 'folder' ? `${entry.items ?? 0} 个项目` : entry.entryType === 'post' ? '帖子' : formatBytes(entry.byteSize); }
function formatDate(timestamp: number) { return timestamp ? new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(timestamp / 1000)) : '—'; }
function formatBytes(bytes: number) { if (bytes < 1024) return `${bytes} B`; const units = ['KB', 'MB', 'GB', 'TB']; let value = bytes; let unit = -1; do { value /= 1024; unit += 1; } while (value >= 1024 && unit < units.length - 1); return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unit]}`; }
function getErrorMessage(error: unknown) { return error instanceof Error && error.message.trim() ? error.message : '档案室操作失败，请稍后重试。'; }
function formatTransferRate(bytesPerSecond: number | null) {
  if (!bytesPerSecond || !Number.isFinite(bytesPerSecond)) return '计算中...';
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  let value = bytesPerSecond;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`;
}
