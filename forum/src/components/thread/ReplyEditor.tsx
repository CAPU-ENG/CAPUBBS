import { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Code2,
  Image,
  Italic,
  Link,
  List,
  Paperclip,
  Quote,
  Save,
  Send,
  Underline,
  X,
  type LucideIcon,
} from 'lucide-react';

export type ReplyTarget = {
  author: string;
  floor: number;
  quote?: string;
};

type EditorMode = 'rich' | 'markdown' | 'html';

const toolbarItems: Array<{
  command: string;
  icon: LucideIcon;
  label: string;
  value?: string;
}> = [
  { command: 'bold', icon: Bold, label: '粗体' },
  { command: 'italic', icon: Italic, label: '斜体' },
  { command: 'underline', icon: Underline, label: '下划线' },
  { command: 'insertUnorderedList', icon: List, label: '列表' },
  { command: 'formatBlock', value: 'blockquote', icon: Quote, label: '引用' },
  { command: 'formatBlock', value: 'pre', icon: Code2, label: '代码' },
];

export function ReplyEditor({
  editorRef,
  onClearTarget,
  target,
  threadTitle,
}: {
  editorRef: React.RefObject<HTMLElement | null>;
  onClearTarget: () => void;
  target: ReplyTarget | null;
  threadTitle: string;
}) {
  const [mode, setMode] = useState<EditorMode>('rich');
  const [content, setContent] = useState('');
  const [signature, setSignature] = useState('1');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const richEditorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const draft = window.localStorage.getItem('capubbs-thread-reply-draft');
    if (!draft) return;
    try {
      const parsed = JSON.parse(draft) as { content?: string; mode?: EditorMode; signature?: string };
      setContent(parsed.content ?? '');
      setMode(parsed.mode ?? 'rich');
      setSignature(parsed.signature ?? '1');
    } catch {
      window.localStorage.removeItem('capubbs-thread-reply-draft');
    }
  }, []);

  useEffect(() => {
    if (mode === 'rich' && richEditorRef.current && richEditorRef.current.innerHTML !== content) {
      richEditorRef.current.innerHTML = content;
    }
  }, [content, mode]);

  function runCommand(command: string, value?: string) {
    richEditorRef.current?.focus();
    document.execCommand(command, false, value);
    setContent(richEditorRef.current?.innerHTML ?? '');
  }

  function addLink() {
    const href = window.prompt('输入链接地址');
    if (href) runCommand('createLink', href);
  }

  function addImage() {
    const src = window.prompt('输入图片地址');
    if (src) runCommand('insertImage', src);
  }

  function saveDraft() {
    window.localStorage.setItem('capubbs-thread-reply-draft', JSON.stringify({ content, mode, signature }));
    setStatus('草稿已保存在本机');
  }

  function publishReply() {
    const plainText = mode === 'rich'
      ? (richEditorRef.current?.textContent ?? '').trim()
      : content.trim();
    if (!plainText) {
      setStatus('请先填写回复内容');
      richEditorRef.current?.focus();
      return;
    }
    setStatus('演示模式：回复内容已通过本地校验');
  }

  return (
    <section className="reply-editor" ref={editorRef} aria-labelledby="reply-editor-title">
      <header className="reply-editor-heading">
        <div>
          <span className="eyebrow">REPLY</span>
          <h2 id="reply-editor-title">写回复</h2>
        </div>
        <p>Re: {threadTitle}</p>
      </header>

      {target && (
        <div className="reply-target">
          <span>回复 @{target.author} · #{target.floor}</span>
          {target.quote && <q>{target.quote}</q>}
          <button aria-label="取消回复目标" onClick={onClearTarget} type="button"><X size={15} /></button>
        </div>
      )}

      <div className="editor-mode-tabs" role="tablist" aria-label="编辑模式">
        {(['rich', 'markdown', 'html'] as EditorMode[]).map((editorMode) => (
          <button
            aria-selected={mode === editorMode}
            className={mode === editorMode ? 'editor-mode-active' : ''}
            key={editorMode}
            onClick={() => setMode(editorMode)}
            role="tab"
            type="button"
          >
            {editorMode === 'rich' ? '富文本' : editorMode === 'markdown' ? 'Markdown' : 'HTML'}
          </button>
        ))}
      </div>

      {mode === 'rich' && (
        <div className="editor-toolbar" role="toolbar" aria-label="文本格式">
          <select aria-label="段落样式" defaultValue="p" onChange={(event) => runCommand('formatBlock', event.target.value)}>
            <option value="p">正文</option>
            <option value="h2">二级标题</option>
            <option value="h3">三级标题</option>
          </select>
          {toolbarItems.map(({ command, icon: Icon, label, value }) => (
            <button aria-label={label} key={label} onClick={() => runCommand(command, value)} title={label} type="button">
              <Icon size={16} />
            </button>
          ))}
          <span className="editor-toolbar-divider" />
          <button aria-label="插入链接" onClick={addLink} title="插入链接" type="button"><Link size={16} /></button>
          <button aria-label="插入图片" onClick={addImage} title="插入图片" type="button"><Image size={16} /></button>
        </div>
      )}

      {mode === 'rich' ? (
        <div
          aria-label="回复内容"
          className="rich-reply-input"
          contentEditable
          data-placeholder="写下你的回复……"
          onInput={(event) => setContent(event.currentTarget.innerHTML)}
          ref={richEditorRef}
          role="textbox"
          suppressContentEditableWarning
        />
      ) : (
        <textarea
          aria-label={`${mode} 回复内容`}
          className="source-reply-input"
          onChange={(event) => setContent(event.target.value)}
          placeholder={mode === 'markdown' ? '使用 Markdown 写下你的回复……' : '使用 HTML 写下你的回复……'}
          value={content}
        />
      )}

      {attachments.length > 0 && (
        <ul className="reply-attachments">
          {attachments.map((attachment) => <li key={attachment}><Paperclip size={13} />{attachment}</li>)}
        </ul>
      )}

      <footer className="reply-editor-footer">
        <label>
          <span>签名档</span>
          <select value={signature} onChange={(event) => setSignature(event.target.value)}>
            <option value="0">不使用签名</option>
            <option value="1">签名档 1</option>
            <option value="2">签名档 2</option>
          </select>
        </label>
        <input
          className="sr-only"
          multiple
          onChange={(event) => setAttachments(Array.from(event.target.files ?? []).map((file) => file.name))}
          ref={fileInputRef}
          type="file"
        />
        <button className="reply-secondary-button" onClick={() => fileInputRef.current?.click()} type="button">
          <Paperclip size={15} />添加附件
        </button>
        {status && <span className="reply-editor-status" role="status">{status}</span>}
        <div className="reply-editor-submit">
          <button className="reply-secondary-button" onClick={saveDraft} type="button"><Save size={15} />保存草稿</button>
          <button className="reply-publish-button" onClick={publishReply} type="button"><Send size={15} />发布回复</button>
        </div>
      </footer>
    </section>
  );
}
