import { BadgeCheck, CircleAlert, FileSpreadsheet, ListChecks, Upload, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { findForumUsername } from '../../api/profile';
import { readTableRows } from '../../utils/readTableRows';
import { getPublicProfilePath } from '../../utils/userRoutes';
import { getForumNavigationHref } from '../../utils/forumNavigation';
import { Button } from '../Button';
import { LoadingSpinner as LoaderCircle } from '../layout/LoadingSpinner';

const MAX_ROWS = 500;
const CHECK_CONCURRENCY = 6;

type CheckRow = {
  checkedUsername: string;
  failed: boolean;
  forumUsername: string | null;
  key: string;
  username: string;
};

type RowStatus = 'checking' | 'duplicate' | 'error' | 'found' | 'missing-id' | 'not-found' | 'stale';

const STATUS_ORDER: Record<RowStatus, number> = {
  'missing-id': 0,
  'not-found': 1,
  error: 2,
  duplicate: 3,
  stale: 4,
  checking: 5,
  found: 6,
};

export function IdListCheckPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const keyRef = useRef(0);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<CheckRow[]>([]);
  const [recheckingKeys, setRecheckingKeys] = useState<ReadonlySet<string>>(() => new Set());
  const statuses = useMemo(() => rowStatuses(rows, recheckingKeys), [recheckingKeys, rows]);

  async function loadFile(file: File | null) {
    if (!file || loading) return;
    setLoading(true);
    setError('');
    setFileName(file.name);
    setRows([]);

    try {
      const usernames = normalizeIdRows(await readTableRows(file));
      const results = await mapWithConcurrency(usernames, CHECK_CONCURRENCY, checkUsername);
      const checked = usernames.map((username, index): CheckRow => ({
        checkedUsername: username,
        failed: results[index] === undefined,
        forumUsername: results[index] ?? null,
        key: String(keyRef.current++),
        username,
      }));
      const initialStatuses = rowStatuses(checked, new Set());
      setRows(checked
        .map((row, index) => ({ index, row }))
        .sort((a, b) => STATUS_ORDER[initialStatuses.get(a.row.key) ?? 'found'] - STATUS_ORDER[initialStatuses.get(b.row.key) ?? 'found'] || a.index - b.index)
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

  function editRow(key: string, username: string) {
    setRows((current) => current.map((row) => row.key === key ? { ...row, username } : row));
  }

  function removeRow(key: string) {
    setRows((current) => current.filter((row) => row.key !== key));
  }

  async function recheckRow(key: string) {
    const row = rows.find((item) => item.key === key);
    const username = row?.username.trim() ?? '';
    if (!row || !username || (username === row.checkedUsername && !row.failed) || recheckingKeys.has(key)) return;
    setRecheckingKeys((current) => new Set(current).add(key));
    const result = await checkUsername(username);
    setRows((current) => current.map((item) => item.key === key && item.username.trim() === username
      ? { ...item, checkedUsername: username, failed: result === undefined, forumUsername: result ?? null }
      : item));
    setRecheckingKeys((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
  }

  const countOf = (status: RowStatus) => rows.filter((row) => statuses.get(row.key) === status).length;

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
              <thead><tr><th>ID</th><th>论坛 ID</th><th aria-label="操作" /></tr></thead>
              <tbody>
                {rows.map((row) => {
                  const status = statuses.get(row.key) ?? 'stale';
                  return (
                    <tr key={row.key}>
                      <td>
                        <div className="toolbox-id-check-id">
                          <input
                            aria-label="会员 ID"
                            className="forum-input"
                            onBlur={() => void recheckRow(row.key)}
                            onChange={(event) => editRow(row.key, event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') event.currentTarget.blur();
                            }}
                            type="text"
                            value={row.username}
                          />
                          <span data-state={status}>
                            {status === 'found' ? <BadgeCheck size={13} /> : <CircleAlert size={13} />}
                            {statusLabel(status)}
                          </span>
                        </div>
                      </td>
                      <td>
                        {status === 'found' && row.forumUsername ? (
                          <a href={getForumNavigationHref(getPublicProfilePath(row.forumUsername), window.location.href)} rel="noreferrer" target="_blank">
                            {row.forumUsername}
                          </a>
                        ) : null}
                      </td>
                      <td>
                        <Button aria-label="移除" icon onClick={() => removeRow(row.key)} title="移除" type="button"><X size={15} /></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {rows.length > 0 ? (
          <footer className="toolbox-converter-footer">
            <div>
              <span>存在 {countOf('found')}</span>
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

async function checkUsername(username: string): Promise<string | null | undefined> {
  try {
    return await findForumUsername(username);
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

function rowStatuses(rows: CheckRow[], recheckingKeys: ReadonlySet<string>) {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const identity = row.username.trim().toLocaleLowerCase();
    counts.set(identity, (counts.get(identity) ?? 0) + 1);
  });
  return new Map(rows.map((row): [string, RowStatus] => {
    const username = row.username.trim();
    if (recheckingKeys.has(row.key)) return [row.key, 'checking'];
    if (!username) return [row.key, 'missing-id'];
    if (username !== row.checkedUsername) return [row.key, 'stale'];
    if (row.failed) return [row.key, 'error'];
    if (!row.forumUsername) return [row.key, 'not-found'];
    if ((counts.get(username.toLocaleLowerCase()) ?? 0) > 1) return [row.key, 'duplicate'];
    return [row.key, 'found'];
  }));
}

function statusLabel(status: RowStatus) {
  if (status === 'found') return '存在';
  if (status === 'not-found') return '未找到';
  if (status === 'duplicate') return '重复';
  if (status === 'missing-id') return '缺少 ID';
  if (status === 'checking') return '核查中';
  if (status === 'error') return '核查失败';
  return '待核查';
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
