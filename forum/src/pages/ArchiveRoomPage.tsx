import {
  Archive,
  ArrowDownAZ,
  ChevronRight,
  Download,
  FileArchive,
  FileAudio2,
  FileImage,
  FileText,
  FileVideo2,
  Folder,
  FolderPlus,
  Grid2X2,
  HardDrive,
  List,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Upload,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';

type ArchiveKind = 'archive' | 'audio' | 'document' | 'folder' | 'image' | 'video';

type ArchiveEntry = {
  id: string;
  kind: ArchiveKind;
  name: string;
  owner: string;
  size: string;
  updatedAt: string;
  items?: number;
  masked?: boolean;
};

const DEMO_ENTRIES: ArchiveEntry[] = [
  { id: 'photos', kind: 'folder', name: '图片素材', owner: '组织部', size: '—', updatedAt: '2026-08-18', items: 128 },
  { id: 'routes', kind: 'folder', name: '路线资料', owner: '远征队', size: '—', updatedAt: '2026-08-12', items: 36 },
  { id: 'annual-report', kind: 'document', name: '2025 年度协会总结.pdf', owner: '组织部', size: '4.8 MB', updatedAt: '2026-02-03' },
  { id: 'summer-video', kind: 'video', name: '2025 暑期远征纪录片.mp4', owner: '远征队', size: '1.2 GB', updatedAt: '2026-01-18' },
  { id: 'logo-kit', kind: 'archive', name: '车协视觉素材包.zip', owner: '宣传部', size: '86.2 MB', updatedAt: '2025-12-22' },
  { id: 'training-audio', kind: 'audio', name: '夜骑集合铃声.mp3', owner: '王小明', size: '3.1 MB', updatedAt: '2025-11-05' },
  { id: 'route-map', kind: 'image', name: '京西路线图.png', owner: '李同学', size: '2.6 MB', updatedAt: '2025-10-29' },
];

const KIND_META: Record<ArchiveKind, { icon: LucideIcon; tone: string }> = {
  archive: { icon: FileArchive, tone: 'archive-room-file-archive' },
  audio: { icon: FileAudio2, tone: 'archive-room-file-audio' },
  document: { icon: FileText, tone: 'archive-room-file-document' },
  folder: { icon: Folder, tone: 'archive-room-file-folder' },
  image: { icon: FileImage, tone: 'archive-room-file-image' },
  video: { icon: FileVideo2, tone: 'archive-room-file-video' },
};

export function ArchiveRoomPage() {
  const { status: authStatus, viewer } = useAuth();
  const [entries, setEntries] = useState(DEMO_ENTRIES);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'updatedAt'>('name');
  const [notice, setNotice] = useState('');
  const canManage = authStatus === 'authenticated' && (viewer?.rights ?? 0) > 2;
  const isAuthenticated = authStatus === 'authenticated' || authStatus === 'restoring';

  const visibleEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return entries
      .filter((entry) => !entry.masked && (!normalizedQuery || entry.name.toLocaleLowerCase().includes(normalizedQuery)))
      .sort((left, right) => {
        if (left.kind !== right.kind) return left.kind === 'folder' ? -1 : 1;
        return left[sortBy].localeCompare(right[sortBy], 'zh-CN');
      });
  }, [entries, query, sortBy]);

  function enterFolder(entry: ArchiveEntry) {
    if (entry.kind !== 'folder') return;
    setCurrentPath((path) => [...path, entry.name]);
    setNotice(`已进入 ${entry.name}`);
  }

  function goToPath(index: number) {
    setCurrentPath((path) => path.slice(0, index));
    setNotice('');
  }

  function maskEntry(entry: ArchiveEntry) {
    setEntries((items) => items.map((item) => item.id === entry.id ? { ...item, masked: true } : item));
    setNotice(`“${entry.name}”已被 Mask，服务器文件仍保留。`);
  }

  function showUnavailable(action: string) {
    setNotice(`${action}功能将在接入档案室服务后启用。`);
  }

  return (
    <div className="archive-room-page relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar contextHref="#archive-room-title" contextTitle="档案室" />

      <main className="archive-room-shell" id="archive-room-title">
        <section className="archive-room-panel" aria-labelledby="archive-room-heading">
          <header className="archive-room-heading">
            <div className="archive-room-title-wrap">
              <span className="archive-room-title-icon"><Archive size={20} /></span>
              <div>
                <div className="archive-room-kicker">PAN / ARCHIVE</div>
                <h1 id="archive-room-heading">档案室</h1>
              </div>
            </div>
            <div className="archive-room-capacity" aria-label="档案室容量">
              <HardDrive size={16} />
              <span><strong>1.34 TB</strong> 可用</span>
            </div>
          </header>

          {!isAuthenticated && (
            <div className="archive-room-auth-banner" role="status">
              <ShieldCheck size={17} />
              <span>登录后访问档案室</span>
              <a href="/login">前往登录</a>
            </div>
          )}

          <div className="archive-room-toolbar">
            <nav className="archive-room-breadcrumb" aria-label="档案室路径">
              <button className={currentPath.length === 0 ? 'is-current' : ''} onClick={() => goToPath(0)} type="button">
                <Archive size={15} /> pan
              </button>
              {currentPath.map((segment, index) => (
                <span className="archive-room-breadcrumb-segment" key={`${segment}-${index}`}>
                  <ChevronRight size={14} />
                  <button className={index === currentPath.length - 1 ? 'is-current' : ''} onClick={() => goToPath(index + 1)} type="button">
                    {segment}
                  </button>
                </span>
              ))}
            </nav>

            <div className="archive-room-actions">
              <label className="archive-room-search">
                <Search size={15} />
                <span className="sr-only">搜索档案</span>
                <input onChange={(event) => setQuery(event.target.value)} placeholder="搜索当前目录" value={query} />
                {query && <button aria-label="清空搜索" onClick={() => setQuery('')} type="button"><X size={14} /></button>}
              </label>
              <button className="archive-room-action-button" disabled={!canManage} onClick={() => showUnavailable('上传')} title={canManage ? '上传文件' : '权限大于 2 才能上传'} type="button">
                <Upload size={15} /> <span>上传</span>
              </button>
              <button className="archive-room-action-button" disabled={!canManage} onClick={() => showUnavailable('新建文件夹')} title={canManage ? '新建文件夹' : '权限大于 2 才能新建文件夹'} type="button">
                <FolderPlus size={15} /> <span>新建文件夹</span>
              </button>
            </div>
          </div>

          <div className="archive-room-subtoolbar">
            <span className="archive-room-count">{visibleEntries.length} 个项目</span>
            <div className="archive-room-subtools">
              <label className="archive-room-sort">
                <ArrowDownAZ size={14} />
                <span className="sr-only">排序方式</span>
                <select onChange={(event) => setSortBy(event.target.value as 'name' | 'updatedAt')} value={sortBy}>
                  <option value="name">按名称</option>
                  <option value="updatedAt">按更新时间</option>
                </select>
              </label>
              <div className="archive-room-view-switch" aria-label="视图模式" role="group">
                <button aria-label="列表视图" aria-pressed={viewMode === 'list'} className={viewMode === 'list' ? 'is-active' : ''} onClick={() => setViewMode('list')} type="button"><List size={16} /></button>
                <button aria-label="网格视图" aria-pressed={viewMode === 'grid'} className={viewMode === 'grid' ? 'is-active' : ''} onClick={() => setViewMode('grid')} type="button"><Grid2X2 size={16} /></button>
              </div>
            </div>
          </div>

          {notice && <div className="archive-room-notice" role="status">{notice}</div>}

          {viewMode === 'list' ? (
            <ArchiveList entries={visibleEntries} canManage={canManage} onEnter={enterFolder} onMask={maskEntry} onDownload={() => showUnavailable('下载')} />
          ) : (
            <ArchiveGrid entries={visibleEntries} canManage={canManage} onEnter={enterFolder} onMask={maskEntry} onDownload={() => showUnavailable('下载')} />
          )}
        </section>

        <footer className="archive-room-footer">
          <span><ShieldCheck size={14} /> 文件由档案室统一管理</span>
          <span>当前用户：{viewer?.username ?? '未登录'}</span>
        </footer>
      </main>
    </div>
  );
}

function ArchiveList({ entries, canManage, onDownload, onEnter, onMask }: { entries: ArchiveEntry[]; canManage: boolean; onDownload: () => void; onEnter: (entry: ArchiveEntry) => void; onMask: (entry: ArchiveEntry) => void }) {
  return (
    <div className="archive-room-list-wrap">
      <table className="archive-room-list">
        <thead><tr><th>名称</th><th>上传人</th><th>大小</th><th>更新时间</th><th><span className="sr-only">操作</span></th></tr></thead>
        <tbody>
          {entries.map((entry) => <ArchiveListRow canManage={canManage} entry={entry} key={entry.id} onDownload={onDownload} onEnter={onEnter} onMask={onMask} />)}
          {entries.length === 0 && <tr><td className="archive-room-empty" colSpan={5}>当前目录没有匹配的文件</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function ArchiveListRow({ canManage, entry, onDownload, onEnter, onMask }: { canManage: boolean; entry: ArchiveEntry; onDownload: () => void; onEnter: (entry: ArchiveEntry) => void; onMask: (entry: ArchiveEntry) => void }) {
  const { icon: Icon, tone } = KIND_META[entry.kind];
  return (
    <tr className={entry.kind === 'folder' ? 'is-folder' : ''}>
      <td><button className="archive-room-entry-name" onClick={() => entry.kind === 'folder' ? onEnter(entry) : onDownload()} type="button"><span className={`archive-room-file-icon ${tone}`}><Icon size={17} /></span><span>{entry.name}</span>{entry.items !== undefined && <small>{entry.items}</small>}</button></td>
      <td><span className="archive-room-owner"><UserRound size={13} />{entry.owner}</span></td>
      <td>{entry.size}</td>
      <td>{entry.updatedAt}</td>
      <td><div className="archive-room-row-actions"><button aria-label={entry.kind === 'folder' ? `打开 ${entry.name}` : `下载 ${entry.name}`} className="archive-room-icon-action" onClick={() => entry.kind === 'folder' ? onEnter(entry) : onDownload()} title={entry.kind === 'folder' ? '打开文件夹' : '下载'} type="button">{entry.kind === 'folder' ? <ChevronRight size={16} /> : <Download size={15} />}</button><button aria-label={`更多 ${entry.name}`} className="archive-room-icon-action" onClick={() => canManage ? onMask(entry) : undefined} title={canManage ? 'Mask 文件' : '权限大于 2 才能操作'} type="button"><MoreHorizontal size={16} /></button></div></td>
    </tr>
  );
}

function ArchiveGrid({ entries, canManage, onDownload, onEnter, onMask }: { entries: ArchiveEntry[]; canManage: boolean; onDownload: () => void; onEnter: (entry: ArchiveEntry) => void; onMask: (entry: ArchiveEntry) => void }) {
  return (
    <div className="archive-room-grid">
      {entries.map((entry) => {
        const { icon: Icon, tone } = KIND_META[entry.kind];
        return <article className={`archive-room-grid-item ${entry.kind === 'folder' ? 'is-folder' : ''}`} key={entry.id}><button className="archive-room-grid-main" onClick={() => entry.kind === 'folder' ? onEnter(entry) : onDownload()} type="button"><span className={`archive-room-grid-icon ${tone}`}><Icon size={28} /></span><strong>{entry.name}</strong><span>{entry.kind === 'folder' ? `${entry.items ?? 0} 个项目` : entry.size}</span></button><div className="archive-room-grid-meta"><span>{entry.owner}</span><button aria-label={`更多 ${entry.name}`} className="archive-room-icon-action" onClick={() => canManage ? onMask(entry) : undefined} title={canManage ? 'Mask 文件' : '权限大于 2 才能操作'} type="button"><MoreHorizontal size={16} /></button></div></article>;
      })}
      {entries.length === 0 && <div className="archive-room-empty archive-room-empty-grid">当前目录没有匹配的文件</div>}
    </div>
  );
}
