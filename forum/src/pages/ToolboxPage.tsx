import Papa from 'papaparse';
import {
  CheckCircle2,
  ContactRound,
  Download,
  FileSpreadsheet,
  LoaderCircle,
  Upload,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useRef, useState, type DragEvent } from 'react';
import { readSheet } from 'read-excel-file/browser';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import {
  EMPTY_CONTACT_MAPPING,
  convertTableToVcf,
  inferContactColumnMapping,
  normalizeContactTable,
  type ContactColumnMapping,
  type ContactField,
  type ContactTable,
} from '../utils/tableToVcf';

type ToolTab = 'table-vcf';

const TOOL_TABS: Array<{ icon: LucideIcon; id: ToolTab; label: string }> = [
  { icon: ContactRound, id: 'table-vcf', label: '表格转 VCF' },
];

const CONTACT_FIELDS: Array<{ id: ContactField; label: string }> = [
  { id: 'name', label: '姓名' },
  { id: 'phone', label: '手机' },
  { id: 'email', label: '邮箱' },
  { id: 'organization', label: '单位' },
  { id: 'title', label: '职位' },
  { id: 'note', label: '备注' },
];

export function ToolboxPage() {
  const [activeTab, setActiveTab] = useState<ToolTab>(readTabFromLocation);

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
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapping, setMapping] = useState<ContactColumnMapping>(EMPTY_CONTACT_MAPPING);
  const [notice, setNotice] = useState('');
  const [table, setTable] = useState<ContactTable | null>(null);

  async function loadFile(file: File | null) {
    if (!file || loading) return;
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const rows = await readTableRows(file);
      const nextTable = normalizeContactTable(rows);
      setFileName(file.name);
      setMapping(inferContactColumnMapping(nextTable.headers));
      setTable(nextTable);
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
    setMapping(EMPTY_CONTACT_MAPPING);
    setNotice('');
    setTable(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function updateMapping(field: ContactField, value: string) {
    setMapping((current) => ({
      ...current,
      [field]: value === '' ? null : Number(value),
    }));
    setError('');
    setNotice('');
  }

  function downloadVcf() {
    if (!table) return;
    if (mapping.name === null && mapping.phone === null && mapping.email === null) {
      setError('请至少选择姓名、手机或邮箱字段。');
      return;
    }

    const result = convertTableToVcf(table.rows, mapping);
    if (result.contactCount === 0) {
      setError('所选字段中没有可转换的联系人。');
      return;
    }

    const blob = new Blob([result.content], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${fileBaseName(fileName)}.vcf`;
    link.href = url;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setError('');
    setNotice(
      result.skippedRowCount > 0
        ? `已导出 ${result.contactCount} 位联系人，跳过 ${result.skippedRowCount} 行空数据。`
        : `已导出 ${result.contactCount} 位联系人。`,
    );
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void loadFile(event.dataTransfer.files[0] ?? null);
  }

  return (
    <section className="toolbox-workspace" aria-labelledby="table-vcf-title">
      <header className="toolbox-workspace-header">
        <span className="toolbox-workspace-icon"><Wrench size={17} /></span>
        <h1 id="table-vcf-title">表格转 VCF</h1>
      </header>

      {!table ? (
        <div
          className="toolbox-upload-zone"
          data-dragging={dragging}
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          {loading ? <LoaderCircle className="animate-spin" size={26} /> : <FileSpreadsheet size={26} />}
          <button disabled={loading} onClick={() => inputRef.current?.click()} type="button">
            <Upload size={16} />
            {loading ? '正在读取' : '选择表格'}
          </button>
        </div>
      ) : (
        <>
          <div className="toolbox-file-bar">
            <FileSpreadsheet size={18} />
            <strong title={fileName}>{fileName}</strong>
            <span>{table.rows.length} 行</span>
            <button aria-label="移除表格" onClick={resetTable} title="移除表格" type="button">
              <X size={17} />
            </button>
          </div>

          <div className="toolbox-mapping-grid">
            {CONTACT_FIELDS.map((field) => (
              <label key={field.id}>
                <span>{field.label}</span>
                <select
                  onChange={(event) => updateMapping(field.id, event.target.value)}
                  value={mapping[field.id] ?? ''}
                >
                  <option value="">不导出</option>
                  {table.headers.map((header, columnIndex) => (
                    <option key={`${columnIndex}-${header}`} value={columnIndex}>
                      {header}（第 {columnIndex + 1} 列）
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="toolbox-preview-scroll">
            <table className="toolbox-preview-table">
              <thead>
                <tr>{CONTACT_FIELDS.map((field) => <th key={field.id}>{field.label}</th>)}</tr>
              </thead>
              <tbody>
                {table.rows.slice(0, 5).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {CONTACT_FIELDS.map((field) => (
                      <td key={field.id}>{previewCell(row, mapping[field.id]) || '--'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="toolbox-workspace-footer">
            <button className="toolbox-replace-button" onClick={() => inputRef.current?.click()} type="button">
              <Upload size={16} /> 更换表格
            </button>
            <button className="toolbox-download-button" onClick={downloadVcf} type="button">
              <Download size={16} /> 下载 VCF
            </button>
          </footer>
        </>
      )}

      <input
        accept=".xlsx,.csv,.tsv,text/csv,text/tab-separated-values"
        className="sr-only"
        onChange={(event) => void loadFile(event.target.files?.[0] ?? null)}
        ref={inputRef}
        type="file"
      />
      {error ? <p className="toolbox-feedback toolbox-feedback-error" role="alert">{error}</p> : null}
      {notice ? (
        <p className="toolbox-feedback toolbox-feedback-success" role="status">
          <CheckCircle2 size={16} /> {notice}
        </p>
      ) : null}
    </section>
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

function previewCell(row: string[], columnIndex: number | null) {
  return columnIndex === null ? '' : row[columnIndex] ?? '';
}

function fileBaseName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, '').trim();
  return baseName || 'contacts';
}

function readTabFromLocation(): ToolTab {
  const tab = new URLSearchParams(window.location.search).get('tab');
  return TOOL_TABS.some((item) => item.id === tab) ? tab as ToolTab : 'table-vcf';
}
