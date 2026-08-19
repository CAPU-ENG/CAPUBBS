import {
  Eye,
  Paperclip,
  Save,
  Send,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  getRichTextEditorStorageValue,
  getRichTextEditorPreviewDocument,
  RichTextEditor,
  type RichTextEditorValue,
} from "../editor/RichTextEditor";

export type ReplyTarget = {
  author: string;
  floor: number;
  quote?: string;
};

type ReplyAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
};

type ReplyPreviewAuthor = {
  avatar: string;
  name: string;
};

const draftStorageKey = "capubbs-thread-reply-draft";
const signatureOptions = [
  { label: "不使用签名档", value: 0 },
  { label: "签名档 1", value: 1 },
  { label: "签名档 2", value: 2 },
  { label: "签名档 3", value: 3 },
] as const;

export function ReplyEditor({
  editorRef,
  onClearTarget,
  previewAuthor,
  previewFloor,
  previewSignatures,
  target,
  threadTitle,
}: {
  editorRef: React.RefObject<HTMLElement | null>;
  onClearTarget: () => void;
  previewAuthor: ReplyPreviewAuthor;
  previewFloor: number;
  previewSignatures: string[];
  target: ReplyTarget | null;
  threadTitle: string;
}) {
  const [editorValue, setEditorValue] = useState<RichTextEditorValue>({
    content: "",
    mode: "rich",
  });
  const [signatureIndex, setSignatureIndex] = useState(0);
  const [attachments, setAttachments] = useState<ReplyAttachment[]>([]);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewedAt, setPreviewedAt] = useState("");
  const [focusRequest, setFocusRequest] = useState(0);
  const [status, setStatus] = useState("");
  const appliedTargetRef = useRef("");

  useEffect(() => {
    const draft = window.localStorage.getItem(draftStorageKey);
    if (!draft) return;

    try {
      const parsed = JSON.parse(draft) as {
        attachments?: ReplyAttachment[];
        content?: string;
        editor?: RichTextEditorValue;
        mode?: RichTextEditorValue["mode"];
        signature?: string;
        signatureIndex?: number;
      };
      setEditorValue(
        parsed.editor ?? {
          content: parsed.content ?? "",
          mode: parsed.mode ?? "rich",
        },
      );
      setSignatureIndex(parsed.signatureIndex ?? Number(parsed.signature ?? 0));
      setAttachments(parsed.attachments ?? []);
      setStatus("草稿已恢复");
    } catch {
      window.localStorage.removeItem(draftStorageKey);
    }
  }, []);

  useEffect(() => {
    if (!target) {
      appliedTargetRef.current = "";
      return;
    }

    const targetKey = `${target.floor}:${target.author}:${target.quote ?? ""}`;
    if (appliedTargetRef.current === targetKey) return;
    appliedTargetRef.current = targetKey;

    if (target.quote) {
      setEditorValue((current) => appendQuote(current, target));
    }
    setFocusRequest((request) => request + 1);
    setStatus("");
  }, [target]);

  function updateEditorValue(nextValue: RichTextEditorValue) {
    setEditorValue(nextValue);
    setStatus("");
  }

  function addAttachments(files: File[]) {
    if (files.length === 0) return;

    setAttachments((current) => [
      ...current,
      ...files.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID?.() ?? Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
      })),
    ]);
    setStatus("");
  }

  function removeAttachment(id: string) {
    setAttachments((current) =>
      current.filter((attachment) => attachment.id !== id),
    );
    setStatus("");
  }

  function saveDraft() {
    if (!hasEditorContent(editorValue) && attachments.length === 0) {
      setStatus("没有可保存的内容");
      return;
    }

    window.localStorage.setItem(
      draftStorageKey,
      JSON.stringify({
        attachments,
        editor: getRichTextEditorStorageValue(editorValue),
        signatureIndex,
        threadTitle,
      }),
    );
    setStatus("已存入本机草稿");
  }

  function publishReply() {
    if (!hasEditorContent(editorValue)) {
      setStatus("请先填写回复内容");
      setFocusRequest((request) => request + 1);
      return;
    }

    setStatus("演示模式：回复内容已通过本地校验");
  }

  function openPreview() {
    if (!hasEditorContent(editorValue)) {
      setStatus("请先填写回复内容");
      setFocusRequest((request) => request + 1);
      return;
    }

    setPreviewedAt(formatPreviewTimestamp(new Date()));
    setPreviewOpen(true);
    setStatus("");
  }

  return (
    <section
      className="reply-editor"
      ref={editorRef}
      aria-labelledby="reply-editor-title"
    >
      <header className="reply-editor-heading">
        <h2 id="reply-editor-title">写回复</h2>
        <p>Re: {threadTitle}</p>
      </header>

      {target && (
        <div className="reply-target">
          <span>
            回复 @{target.author} · #{target.floor}
          </span>
          {target.quote && <q>{target.quote}</q>}
          <button
            aria-label="取消回复目标"
            onClick={onClearTarget}
            type="button"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="reply-editor-core">
        <RichTextEditor
          ariaLabel={`回复主题：${threadTitle}`}
          focusRequest={focusRequest}
          onChange={updateEditorValue}
          placeholder="写下你的回复……"
          value={editorValue}
        />
      </div>

      <div
        aria-label="选择签名档"
        className="reply-signature-options"
        role="radiogroup"
      >
        {signatureOptions.map((option) => (
          <label key={option.value}>
            <input
              checked={signatureIndex === option.value}
              name="reply-signature"
              onChange={() => {
                setSignatureIndex(option.value);
                setStatus("");
              }}
              type="radio"
              value={option.value}
            />
            {option.label}
          </label>
        ))}
      </div>

      {attachments.length > 0 && (
        <ul className="reply-attachments" aria-label="待上传附件">
          {attachments.map((attachment) => (
            <li key={attachment.id}>
              <Paperclip size={13} />
              <span>{attachment.name}</span>
              <small>{formatBytes(attachment.size)}</small>
              <button
                aria-label={`移除附件 ${attachment.name}`}
                onClick={() => removeAttachment(attachment.id)}
                type="button"
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer className="reply-editor-footer">
        <button
          className="reply-secondary-button"
          onClick={() => setAttachmentDialogOpen(true)}
          type="button"
        >
          <Paperclip size={15} />
          添加附件
          {attachments.length > 0 && (
            <span className="reply-attachment-count">{attachments.length}</span>
          )}
        </button>
        {status && (
          <span className="reply-editor-status" role="status">
            {status}
          </span>
        )}
        <div className="reply-editor-submit">
          <button
            className="reply-secondary-button"
            onClick={openPreview}
            type="button"
          >
            <Eye size={15} />
            预览
          </button>
          <button
            className="reply-secondary-button"
            onClick={saveDraft}
            type="button"
          >
            <Save size={15} />
            存入草稿
          </button>
          <button
            className="reply-publish-button"
            onClick={publishReply}
            type="button"
          >
            <Send size={15} />
            发布回复
          </button>
        </div>
      </footer>

      {attachmentDialogOpen && (
        <AttachmentDialog
          attachments={attachments}
          onAdd={addAttachments}
          onClose={() => setAttachmentDialogOpen(false)}
          onRemove={removeAttachment}
        />
      )}
      {previewOpen && (
        <ReplyPreviewDialog
          attachments={attachments}
          editorValue={editorValue}
          onClose={() => setPreviewOpen(false)}
          previewAuthor={previewAuthor}
          previewFloor={previewFloor}
          previewSignature={signatureIndex > 0 ? previewSignatures[signatureIndex - 1] : undefined}
          previewedAt={previewedAt}
          threadTitle={threadTitle}
        />
      )}
    </section>
  );
}

function ReplyPreviewDialog({
  attachments,
  editorValue,
  onClose,
  previewAuthor,
  previewFloor,
  previewSignature,
  previewedAt,
  threadTitle,
}: {
  attachments: ReplyAttachment[];
  editorValue: RichTextEditorValue;
  onClose: () => void;
  previewAuthor: ReplyPreviewAuthor;
  previewFloor: number;
  previewSignature?: string;
  previewedAt: string;
  threadTitle: string;
}) {
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  function resizePreviewFrame(frame: HTMLIFrameElement) {
    const previewDocument = frame.contentDocument;
    if (!previewDocument) return;

    const updateHeight = () => {
      frame.style.height = `${Math.max(120, previewDocument.documentElement.scrollHeight)}px`;
    };

    updateHeight();
    previewDocument.querySelectorAll("img").forEach((image) => {
      if (!image.complete) image.addEventListener("load", updateHeight, { once: true });
    });
  }

  return (
    <div
      className="reply-preview-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-labelledby="reply-preview-title"
        aria-modal="true"
        className="reply-preview-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header>
          <div>
            <span>回复预览</span>
            <h2 id="reply-preview-title">Re: {threadTitle}</h2>
          </div>
          <button aria-label="关闭回复预览" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </header>
        <div className="reply-preview-stage">
          <article className="thread-floor reply-preview-floor">
            <div className="thread-avatar-rail reply-preview-avatar-rail">
              <div className="thread-avatar-button">
                <img src={previewAuthor.avatar} alt="" />
              </div>
            </div>

            <div className="thread-floor-main">
              <header className="thread-floor-header">
                <div className="thread-floor-author">
                  <strong>{previewAuthor.name}</strong>
                </div>
                <div className="thread-floor-time">
                  <time>{previewedAt}</time>
                </div>
                <span className="thread-floor-index">#{previewFloor}</span>
              </header>

              <div className="thread-floor-body reply-preview-floor-body">
                <iframe
                  onLoad={(event) => resizePreviewFrame(event.currentTarget)}
                  sandbox="allow-same-origin"
                  srcDoc={getRichTextEditorPreviewDocument(editorValue, { embedded: true })}
                  title="回复正文预览"
                />
              </div>

              {previewSignature && (
                <footer className="thread-signature">
                  <p>{previewSignature}</p>
                </footer>
              )}

              {attachments.length > 0 && (
                <ul className="reply-preview-attachments" aria-label="回复附件预览">
                  {attachments.map((attachment) => (
                    <li key={attachment.id}>
                      <Paperclip size={13} />
                      <span>{attachment.name}</span>
                      <small>{formatBytes(attachment.size)}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        </div>
        <footer>
          <button
            className="reply-secondary-button"
            onClick={onClose}
            type="button"
          >
            返回编辑
          </button>
        </footer>
      </section>
    </div>
  );
}

function formatPreviewTimestamp(value: Date) {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
}

function AttachmentDialog({
  attachments,
  onAdd,
  onClose,
  onRemove,
}: {
  attachments: ReplyAttachment[];
  onAdd: (files: File[]) => void;
  onClose: () => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    onAdd(Array.from(event.currentTarget.files ?? []));
    event.currentTarget.value = "";
  }

  return (
    <div
      className="attachment-dialog-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-labelledby="attachment-dialog-title"
        aria-modal="true"
        className="attachment-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header>
          <span>
            <UploadCloud size={17} />
          </span>
          <h2 id="attachment-dialog-title">文件上传</h2>
          <button aria-label="关闭文件上传" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </header>
        <button
          className="attachment-drop-button"
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <UploadCloud size={22} />
          <strong>选择一个或多个文件</strong>
          <span>文件会先加入当前回复，发布时一并上传</span>
        </button>
        <input
          className="sr-only"
          multiple
          onChange={handleFileChange}
          ref={inputRef}
          type="file"
        />
        {attachments.length > 0 && (
          <ul>
            {attachments.map((attachment) => (
              <li key={attachment.id}>
                <div>
                  <strong>{attachment.name}</strong>
                  <span>{formatBytes(attachment.size)}</span>
                </div>
                <button
                  aria-label={`移除附件 ${attachment.name}`}
                  onClick={() => onRemove(attachment.id)}
                  type="button"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <footer>
          <button
            className="reply-publish-button"
            onClick={onClose}
            type="button"
          >
            完成
          </button>
        </footer>
      </section>
    </div>
  );
}

function appendQuote(
  current: RichTextEditorValue,
  target: ReplyTarget,
): RichTextEditorValue {
  const quote = target.quote?.trim();
  if (!quote) return current;

  const separator = current.content.trim()
    ? current.mode === "rich"
      ? "<p><br></p>"
      : "\n\n"
    : "";
  if (current.mode === "markdown") {
    return {
      ...current,
      content: `${current.content}${separator}> ${quote}\n>\n> 引用自 @${target.author} · #${target.floor}\n\n`,
    };
  }

  const quoteMarkup = `<blockquote><p>${escapeHtml(quote)}</p><p>引用自 @${escapeHtml(target.author)} · #${target.floor}</p></blockquote><p><br></p>`;
  return {
    ...current,
    content: `${current.content}${separator}${quoteMarkup}`,
  };
}

function hasEditorContent(value: RichTextEditorValue) {
  if (value.mode !== "rich") return value.content.trim().length > 0;

  const container = document.createElement("div");
  container.innerHTML = value.content;
  return (
    (container.textContent ?? "").replace(/\u00a0/g, " ").trim().length > 0 ||
    !!container.querySelector("img, hr")
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
