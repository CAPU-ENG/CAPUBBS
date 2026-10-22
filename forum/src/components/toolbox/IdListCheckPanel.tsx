import { BadgeCheck, CircleAlert, FileSpreadsheet, ListChecks, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { findForumMember, type ForumMemberSummary } from '../../api/profile';
import { readTableRows } from '../../utils/readTableRows';
import { getPublicProfilePath } from '../../utils/userRoutes';
import { getForumNavigationHref } from '../../utils/forumNavigation';
import { Button } from '../Button';
import { LoadingSpinner as LoaderCircle } from '../layout/LoadingSpinner';

const MAX_ROWS = 500;
const CHECK_CONCURRENCY = 6;

type RowStatus = 'duplicate' | 'error' | 'found' | 'not-found';

type CheckRow = {
  member: ForumMemberSummary | null;
  status: RowStatus;
  username: string;
};

const STATUS_ORDER: Record<RowStatus, number> = {
  'not-found': 0,
  error: 1,
  duplicate: 2,
  found: 3,
};

export function IdListCheckPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<CheckRow[]>([]);

  async function loadFile(file: File | null) {
    if (!file || loading) return;
    setLoading(true);
    setError('');
    setFileName(file.name);
    setRows([]);

    try {
      const usernames = normalizeIdRows(await readTableRows(file));
      const results = await mapWithConcurrency(usernames, CHECK_CONCURRENCY, checkUsername);
      const counts = new Map<string, number>();
      usernames.forEach((username) => {
        const identity = username.toLocaleLowerCase();
        counts.set(identity, (counts.get(identity) ?? 0) + 1);
      });
      const checked = usernames.map((username, index): CheckRow => {
        const result = results[index];
        const status: RowStatus = result === undefined ? 'error'
          : result === null ? 'not-found'
            : (counts.get(username.toLocaleLowerCase()) ?? 0) > 1 ? 'duplicate'
              : 'found';
        return { member: result ?? null, status, username };
      });
      setRows(checked
        .map((row, index) => ({ index, row }))
        .sort((a, b) => STATUS_ORDER[a.row.status] - STATUS_ORDER[b.row.status] || a.index - b.index)
        .map(({ row }) => row));
    } catch (loadError) {
      setFileName('');
      setError(loadError instanceof Error && loadError.message.trim() ? loadError.message : '表格读取失败。');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function resetTable() {
    setError('');
    setFileName('');
    setRows([]);
    if (inputRef.current) inputRef.current.value = '';
  }

  const countOf = (status: RowStatus) => rows.filter((row) => row.status === status).length;

  return (
    <section className="forum-card toolbox-workspace" aria-labelledby="id-check-title">
      <header className="toolbox-workspace-header">
        <span className="toolbox-workspace-icon"><ListChecks size={17} /></span>
        <h1 id="id-check-title">名单核查</h1>
      </header>

      <div className="toolbox-converter">
        <p className="toolbox-file-format">
          <FileSpreadsheet aria-hidden="true" size={15} />
          CSV / XLSX / TSV：第一列会员 ID，每行一名会员，最多 {MAX_ROWS} 名。
        </p>

        <div className="toolbox-file-row">
          <input
            accept=".xlsx,.csv,.tsv,text/csv,text/tab-separated-values"
            hidden
            onChange={(event) => void loadFile(event.target.files?.[0] ?? null)}
            ref={inputRef}
            type="file"
          />
          <Button disabled={loading} onClick={() => inputRef.current?.click()} type="button">
            {loading ? <LoaderCircle className="animate-spin" size={15} /> : <Upload size={15} />}
            {loading ? '核查中' : rows.length > 0 ? '更换表格' : '选择表格'}
          </Button>
          {fileName ? (
            <output><FileSpreadsheet size={15} /><span title={fileName}>{fileName}</span></output>
          ) : null}
          {rows.length > 0 ? (
            <Button aria-label="移除表格" icon hoverDanger onClick={resetTable} title="移除表格" type="button">
              <X size={16} />
            </Button>
          ) : null}
        </div>

        {!fileName ? (
          <div className="toolbox-table-scroll">
            <table className="toolbox-table toolbox-id-check-example">
              <caption>示例表格</caption>
              <thead><tr><th>会员 ID</th></tr></thead>
              <tbody>
                <tr><td>example_member_01</td></tr>
                <tr><td>example_member_02</td></tr>
                <tr><td>example_member_03</td></tr>
              </tbody>
            </table>
          </div>
        ) : null}

        {rows.length > 0 ? (
          <div className="toolbox-table-scroll">
            <table className="toolbox-table toolbox-id-check-table">
              <thead><tr><th>ID</th><th>状态</th><th>UID</th><th>星级</th><th>注册时间</th><th>签到数</th></tr></thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.username}-${index}`}>
                    <td title={row.username}>
                      {row.member ? (
                        <a href={getForumNavigationHref(getPublicProfilePath(row.member.username), window.location.href)} rel="noreferrer" target="_blank">
                          {row.member.username}
                        </a>
                      ) : row.username}
                    </td>
                    <td>
                      <span className="toolbox-id-check-status" data-state={row.status}>
                        {row.status === 'found' ? <BadgeCheck size={13} /> : <CircleAlert size={13} />}
                        {statusLabel(row.status)}
                      </span>
                    </td>
                    <td>{row.member ? row.member.uid || '' : ''}</td>
                    <td>{row.member ? row.member.star : ''}</td>
                    <td>{row.member?.registeredAt ?? ''}</td>
                    <td>{row.member ? row.member.signCount : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {rows.length > 0 ? (
          <footer className="toolbox-converter-footer">
            <div>
              <span>存在 {countOf('found') + countOf('duplicate')}</span>
              <span>未找到 {countOf('not-found')}</span>
              {countOf('duplicate') > 0 ? <span>重复 {countOf('duplicate')}</span> : null}
              {countOf('error') > 0 ? <span>核查失败 {countOf('error')}</span> : null}
            </div>
          </footer>
        ) : null}

        {error ? <p className="toolbox-feedback toolbox-feedback-error" role="alert">{error}</p> : null}
      </div>
    </section>
  );
}

async function checkUsername(username: string): Promise<ForumMemberSummary | null | undefined> {
  try {
    return await findForumMember(username);
  } catch {
    return undefined;
  }
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function statusLabel(status: RowStatus) {
  if (status === 'found') return '存在';
  if (status === 'not-found') return '未找到';
  if (status === 'duplicate') return '重复';
  return '核查失败';
}

function normalizeIdRows(rows: unknown[][]) {
  const populatedRows = rows.filter((row) => Array.isArray(row) && row.some((cell) => cellText(cell)));
  const contentRows = populatedRows.length > 0 && isHeaderRow(populatedRows[0]) ? populatedRows.slice(1) : populatedRows;
  const usernames = contentRows.map((row) => cellText(row[0])).filter(Boolean);
  if (usernames.length === 0) throw new Error('表格中没有可核查的 ID。');
  if (usernames.length > MAX_ROWS) throw new Error(`一次最多核查 ${MAX_ROWS} 名会员。`);
  return usernames;
}

function isHeaderRow(row: unknown[]) {
  const id = cellText(row[0]).toLocaleLowerCase().replace(/\s+/g, '');
  return id === 'id' || id === '会员id' || id === '论坛id' || id === '用户名';
}

function cellText(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}
