import { Braces, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  createHtmlSnippet,
  readHtmlSnippets,
  storeHtmlSnippets,
  type HtmlSnippet,
} from './RichTextEditor.snippets';

type SnippetDraft = {
  code: string;
  id: string | null;
  name: string;
};

const emptyDraft: SnippetDraft = { code: '', id: null, name: '' };

export function HtmlSnippetDialog({
  onCancel,
  onInsert,
}: {
  onCancel: () => void;
  onInsert: (code: string) => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [snippets, setSnippets] = useState(readHtmlSnippets);
  const [draft, setDraft] = useState<SnippetDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HtmlSnippet | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.add('html-snippet-dialog-open');
    closeButtonRef.current?.focus();

    return () => document.body.classList.remove('html-snippet-dialog-open');
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;

      if (deleteTarget) {
        setDeleteTarget(null);
      } else if (draft) {
        setDraft(null);
        setError('');
      } else {
        onCancel();
      }
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [deleteTarget, draft, onCancel]);

  function persist(nextSnippets: HtmlSnippet[]) {
    try {
      storeHtmlSnippets(nextSnippets);
      setSnippets(nextSnippets);
      setError('');
      return true;
    } catch {
      setError('本地保存失败，请检查浏览器存储空间。');
      return false;
    }
  }

  function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;

    const name = draft.name.trim();
    if (!name || !draft.code.trim()) return;

    const nextSnippets = draft.id
      ? snippets.map((snippet) => (
          snippet.id === draft.id ? { ...snippet, code: draft.code, name } : snippet
        ))
      : [...snippets, createHtmlSnippet(name, draft.code)];

    if (persist(nextSnippets)) setDraft(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (persist(snippets.filter((snippet) => snippet.id !== deleteTarget.id))) {
      setDeleteTarget(null);
    }
  }

  const dialogTitle = draft ? (draft.id ? '编辑代码片段' : '新增代码片段') : '代码片段';

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] grid place-items-center bg-black/65 p-[18px] backdrop-blur-sm dark:bg-black/75"
      onMouseDown={onCancel}
      role="presentation"
    >
      <section
        aria-labelledby="html-snippet-dialog-title"
        aria-modal="true"
        className="flex max-h-[min(780px,calc(100dvh-36px))] w-[min(760px,100%)] flex-col overflow-hidden rounded-[2px] border border-zinc-200 bg-white text-zinc-950 shadow-2xl dark:border-white/10 dark:bg-zinc-950 dark:text-white"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-zinc-200 px-4 py-3.5 dark:border-white/10">
          <span className="grid h-[34px] w-[34px] place-items-center rounded-[2px] bg-emerald-50 text-[#174f38] dark:bg-emerald-200 dark:text-zinc-950">
            <Braces size={18} />
          </span>
          <h2 id="html-snippet-dialog-title" className="m-0 text-[length:var(--ui-font-size-xl)] font-bold">
            {dialogTitle}
          </h2>
          <button
            ref={closeButtonRef}
            aria-label="关闭代码片段"
            className="grid h-[34px] w-[34px] place-items-center text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
            onClick={onCancel}
            type="button"
          >
            <X size={18} />
          </button>
        </header>

        {draft ? (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={submitDraft}>
            <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-4">
              <label className="grid content-start gap-1.5 text-[length:var(--ui-font-size-md)] font-bold text-zinc-600 dark:text-zinc-300">
                名称
                <input
                  autoFocus
                  className="h-10 rounded-[1px] border border-zinc-200 bg-white px-3 text-[length:var(--ui-font-size-lg)] font-medium text-zinc-950 outline-none focus:border-[#174f38] focus:ring-2 focus:ring-[#174f38]/15 dark:border-white/10 dark:bg-white/[0.05] dark:text-white"
                  maxLength={80}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  value={draft.name}
                />
              </label>
              <label className="grid min-h-[18rem] content-start grid-rows-[auto_minmax(0,1fr)] gap-1.5 text-[length:var(--ui-font-size-md)] font-bold text-zinc-600 dark:text-zinc-300">
                HTML
                <textarea
                  className="min-h-[18rem] resize-y rounded-[1px] border border-zinc-200 bg-zinc-50 p-3 font-mono text-[length:var(--ui-font-size-md)] font-normal leading-6 text-zinc-950 outline-none focus:border-[#174f38] focus:ring-2 focus:ring-[#174f38]/15 dark:border-white/10 dark:bg-slate-950 dark:text-zinc-100"
                  onChange={(event) => setDraft({ ...draft, code: event.target.value })}
                  spellCheck={false}
                  value={draft.code}
                />
              </label>
              {error ? <p className="m-0 text-[length:var(--ui-font-size-md)] font-bold text-rose-700 dark:text-rose-300" role="alert">{error}</p> : null}
            </div>
            <footer className="flex justify-end gap-2 border-t border-zinc-200 px-4 py-3 dark:border-white/10">
              <button
                className="h-9 rounded-[1px] border border-zinc-200 px-3 text-[length:var(--ui-font-size-lg)] font-bold text-zinc-600 transition hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
                onClick={() => { setDraft(null); setError(''); }}
                type="button"
              >
                取消
              </button>
              <button
                className="h-9 rounded-[1px] bg-[#174f38] px-3 text-[length:var(--ui-font-size-lg)] font-bold text-white transition hover:bg-[#123d2c] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-emerald-200 dark:text-zinc-950 dark:hover:bg-emerald-100"
                disabled={!draft.name.trim() || !draft.code.trim()}
                type="submit"
              >
                保存
              </button>
            </footer>
          </form>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <button
                className="mb-3 inline-flex h-9 items-center gap-1.5 rounded-[1px] bg-[#174f38] px-3 text-[length:var(--ui-font-size-lg)] font-bold text-white transition hover:bg-[#123d2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] dark:bg-emerald-200 dark:text-zinc-950 dark:hover:bg-emerald-100"
                onClick={() => setDraft(emptyDraft)}
                type="button"
              >
                <Plus size={16} />
                新增片段
              </button>

              {snippets.length > 0 ? (
                <ol className="m-0 grid list-none gap-2 p-0">
                  {snippets.map((snippet) => (
                    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[2px] border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/[0.035]" key={snippet.id}>
                      <div className="min-w-0">
                        <strong className="block truncate text-[length:var(--ui-font-size-lg)] text-zinc-900 dark:text-white">{snippet.name}</strong>
                        <code className="mt-1 block truncate font-mono text-[length:var(--ui-font-size-sm)] font-normal text-zinc-500 dark:text-zinc-400">{snippet.code}</code>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className="h-8 rounded-[1px] px-2 text-[length:var(--ui-font-size-md)] font-bold text-[#174f38] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] dark:text-emerald-200 dark:hover:bg-white/10"
                          onClick={() => onInsert(snippet.code)}
                          type="button"
                        >
                          插入
                        </button>
                        <button
                          aria-label={`编辑“${snippet.name}”`}
                          className="grid h-8 w-8 place-items-center text-zinc-500 transition hover:bg-white hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                          onClick={() => setDraft({ ...snippet })}
                          type="button"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          aria-label={`删除“${snippet.name}”`}
                          className="grid h-8 w-8 place-items-center text-zinc-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 dark:text-zinc-400 dark:hover:bg-rose-300/10 dark:hover:text-rose-300"
                          onClick={() => setDeleteTarget(snippet)}
                          type="button"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}
              {error ? <p className="mt-3 text-[length:var(--ui-font-size-md)] font-bold text-rose-700 dark:text-rose-300" role="alert">{error}</p> : null}
            </div>
          </>
        )}
      </section>

      {deleteTarget ? (
        <div
          className="absolute inset-0 z-10 grid place-items-center bg-black/55 p-4"
          onMouseDown={() => setDeleteTarget(null)}
          role="presentation"
        >
          <section
            aria-labelledby="html-snippet-delete-title"
            aria-modal="true"
            className="w-[min(28rem,100%)] rounded-[2px] border border-zinc-200 bg-white p-4 text-zinc-950 shadow-2xl dark:border-white/10 dark:bg-zinc-950 dark:text-white"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h3 id="html-snippet-delete-title" className="m-0 text-[length:var(--ui-font-size-xl)] font-bold">删除代码片段</h3>
            <p className="my-3 truncate text-[length:var(--ui-font-size-lg)] text-zinc-600 dark:text-zinc-300">{deleteTarget.name}</p>
            <div className="flex justify-end gap-2">
              <button className="h-9 rounded-[1px] border border-zinc-200 px-3 font-bold text-zinc-600 dark:border-white/10 dark:text-zinc-300" onClick={() => setDeleteTarget(null)} type="button">取消</button>
              <button autoFocus className="h-9 rounded-[1px] bg-rose-700 px-3 font-bold text-white hover:bg-rose-800" onClick={confirmDelete} type="button">删除</button>
            </div>
          </section>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
