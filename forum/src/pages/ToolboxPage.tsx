import Papa from 'papaparse';
import {
  CheckCircle2,
  ContactRound,
  Download,
  FileCode2,
  FileSpreadsheet,
  LoaderCircle,
  Upload,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { readSheet } from 'read-excel-file/browser';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  convertTableToVcf,
  getVCardDisplayName,
  normalizeContactTable,
  type ContactRow,
  type ContactTable,
} from '../utils/tableToVcf';

type ToolTab = 'table-vcf';

const TOOL_TABS: Array<{ icon: LucideIcon; id: ToolTab; label: string }> = [
  { icon: ContactRound, id: 'table-vcf', label: '表格转 VCF' },
];

const EXAMPLE_CONTACTS: ContactRow[] = [
  { username: 'example_member_01', name: '张三', role: '领队', phone: '13800138000' },
  { username: '', name: '李四', role: '', phone: '13900139000' },
];
const EXAMPLE_VCF = convertTableToVcf(EXAMPLE_CONTACTS).content;

export function ToolboxPage() {
  const [activeTab, setActiveTab] = useState<ToolTab>(readTabFromLocation);
  useDocumentTitle(TOOL_TABS.find((tab) => tab.id === activeTab)?.label ?? '工具箱');

  function selectTab(tab: ToolTab) {
    if (tab === activeTab) return;
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
  }

  return (
    <div className="toolbox-page relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar contextHref="#toolbox" contextTitle="工具箱" />

      <main className="toolbox-shell" id="toolbox">
        <nav aria-label="工具类型" className="toolbox-tabs" role="tablist">
          {TOOL_TABS.map(({ icon: Icon, id, label }) => (
            <button
              aria-controls={`toolbox-panel-${id}`}
              aria-selected={activeTab === id}
              className={activeTab === id ? 'toolbox-tab-active' : ''}
              id={`toolbox-tab-${id}`}
              key={id}
              onClick={() => selectTab(id)}
              role="tab"
              type="button"
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div
          aria-labelledby={`toolbox-tab-${activeTab}`}
          id={`toolbox-panel-${activeTab}`}
          role="tabpanel"
        >
          {activeTab === 'table-vcf' ? <TableToVcfTool /> : null}
        </div>
      </main>
    </div>
  );
}

function TableToVcfTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [table, setTable] = useState<ContactTable | null>(null);

  async function loadFile(file: File | null) {
    if (!file || loading) return;
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const rows = await readTableRows(file);
      setTable(normalizeContactTable(rows));
      setFileName(file.name);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '表格读取失败。');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function resetTable() {
    setError('');
    setFileName('');
    setNotice('');
    setTable(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function downloadVcf() {
    if (!table) return;
    const result = convertTableToVcf(table.rows);
    downloadTextFile(`${fileBaseName(fileName)}.vcf`, result.content, 'text/vcard;charset=utf-8');
    setError('');
    setNotice(`已导出 ${result.contactCount} 位联系人。`);
  }

  return (
    <section className="toolbox-workspace" aria-labelledby="table-vcf-title">
      <header className="toolbox-workspace-header">
        <span className="toolbox-workspace-icon"><Wrench size={17} /></span>
        <h1 id="table-vcf-title">表格转 VCF</h1>
      </header>

      <div className="toolbox-converter">
        <p className="toolbox-file-format">
          <FileSpreadsheet aria-hidden="true" size={15} />
          CSV / XLSX / TSV：姓名和电话为必填列；ID（论坛用户名）和职务可省略或留空。
        </p>

        <div className="toolbox-file-row">
          <input
            accept=".xlsx,.csv,.tsv,text/csv,text/tab-separated-values"
            hidden
            onChange={(event) => void loadFile(event.target.files?.[0] ?? null)}
            ref={inputRef}
            type="file"
          />
          <button className="toolbox-secondary-button" disabled={loading} onClick={() => inputRef.current?.click()} type="button">
            {loading ? <LoaderCircle className="animate-spin" size={15} /> : <Upload size={15} />}
            {loading ? '读取中' : table ? '更换表格' : '选择表格'}
          </button>
          {fileName ? (
            <output><FileSpreadsheet size={15} /><span title={fileName}>{fileName}</span></output>
          ) : null}
          {table ? (
            <button aria-label="移除表格" className="toolbox-icon-button" onClick={resetTable} title="移除表格" type="button">
              <X size={16} />
            </button>
          ) : null}
        </div>

        {!table ? <ToolExamples /> : <ContactPreview rows={table.rows} />}

        {table ? (
          <footer className="toolbox-converter-footer">
            <div><span>{table.rows.length} 位联系人</span></div>
            <button className="toolbox-primary-button" onClick={downloadVcf} type="button">
              <Download size={15} />下载 VCF
            </button>
          </footer>
        ) : null}

        {error ? <p className="toolbox-feedback toolbox-feedback-error" role="alert">{error}</p> : null}
        {notice ? (
          <p className="toolbox-feedback toolbox-feedback-success" role="status">
            <CheckCircle2 size={15} />{notice}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function ToolExamples() {
  return (
    <div className="toolbox-example-grid">
      <div className="toolbox-table-scroll">
        <table className="toolbox-table toolbox-example-table">
          <caption>示例表格</caption>
          <thead><tr><th>ID</th><th>姓名</th><th>职务</th><th>电话</th></tr></thead>
          <tbody>
            {EXAMPLE_CONTACTS.map((contact) => (
              <tr key={`${contact.username}-${contact.name}`}>
                <td>{contact.username || '（留空）'}</td>
                <td>{contact.name}</td>
                <td>{contact.role || '（留空）'}</td>
                <td>{contact.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="toolbox-output-example" aria-labelledby="toolbox-output-example-title">
        <header><FileCode2 size={15} /><h2 id="toolbox-output-example-title">示例输出</h2></header>
        <pre>{EXAMPLE_VCF}</pre>
      </section>
    </div>
  );
}

function ContactPreview({ rows }: { rows: ContactRow[] }) {
  return (
    <div className="toolbox-table-scroll">
      <table className="toolbox-table toolbox-contact-table">
        <thead><tr><th>ID</th><th>姓名</th><th>职务</th><th>电话</th><th>VCF 姓名</th></tr></thead>
        <tbody>
          {rows.map((contact, index) => (
            <tr key={`${contact.username}-${index}`}>
              <td>{contact.username}</td>
              <td>{contact.name}</td>
              <td>{contact.role}</td>
              <td>{contact.phone}</td>
              <td>{getVCardDisplayName(contact)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function readTableRows(file: File): Promise<unknown[][]> {
  const extension = file.name.toLocaleLowerCase().split('.').pop();
  if (extension === 'xlsx') return readSheet(file);
  if (extension === 'csv' || extension === 'tsv') return readDelimitedRows(file, extension === 'tsv' ? '\t' : '');
  throw new Error('请选择 XLSX、CSV 或 TSV 表格。');
}

function readDelimitedRows(file: File, delimiter: string): Promise<unknown[][]> {
  return new Promise((resolve, reject) => {
    Papa.parse<unknown[]>(file, {
      complete: (result) => {
        const fatalError = result.errors.find((parseError) => parseError.type !== 'Delimiter');
        if (fatalError) {
          reject(new Error(`表格读取失败：${fatalError.message}`));
          return;
        }
        resolve(result.data);
      },
      delimiter,
      error: () => reject(new Error('表格读取失败。')),
      skipEmptyLines: 'greedy',
    });
  });
}

function downloadTextFile(fileName: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.download = fileName;
  link.href = url;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function fileBaseName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, '').trim();
  return baseName || 'contacts';
}

function readTabFromLocation(): ToolTab {
  const tab = new URLSearchParams(window.location.search).get('tab');
  return TOOL_TABS.some((item) => item.id === tab) ? tab as ToolTab : 'table-vcf';
}
