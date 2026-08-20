import { Save, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getRichTextEditorStorageValue,
  type RichTextEditorValue,
} from "../editor/RichTextEditor";
import {
  saveStoredReplyDraft,
  type ReplyDraftSaveFailureReason,
  type StoredReplyAttachment,
} from "../../utils/replyDraftStorage";
import {
  formatPostEditorPreviewTimestamp,
  hasPostEditorContent,
  PostEditor,
  PostEditorPreviewDialog,
  type PostEditorPreviewAuthor,
} from "./PostEditor";

export type QuoteRequest = {
  author: string;
  floor: number;
  quote?: string;
  requestId: number;
};

type ReplyAttachment = StoredReplyAttachment & { restored?: boolean };

export function ReplyEditor({
  bid,
  board,
  boardHref,
  editorRef,
  ownerKey,
  previewAuthor,
  previewFloor,
  previewSignatures,
  quoteRequest,
  tid,
  threadTitle,
}: {
  bid: number;
  board: string;
  boardHref: string;
  editorRef: React.RefObject<HTMLElement | null>;
  ownerKey: string;
  previewAuthor: PostEditorPreviewAuthor;
  previewFloor: number;
  previewSignatures: string[];
  quoteRequest: QuoteRequest | null;
  tid: number;
  threadTitle: string;
}) {
  const [editorValue, setEditorValue] = useState<RichTextEditorValue>({
    content: "",
    mode: "rich",
  });
  const [signatureIndex, setSignatureIndex] = useState(0);
  const [attachments, setAttachments] = useState<ReplyAttachment[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewedAt, setPreviewedAt] = useState("");
  const [focusRequest, setFocusRequest] = useState(0);
  const [status, setStatus] = useState("");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [savedDraftId, setSavedDraftId] = useState<string | null>(null);
  const appliedQuoteRequestRef = useRef(0);

  useEffect(() => {
    if (!quoteRequest || appliedQuoteRequestRef.current === quoteRequest.requestId) return;
    appliedQuoteRequestRef.current = quoteRequest.requestId;

    if (quoteRequest.quote) {
      setEditorValue((current) => appendQuote(current, quoteRequest));
    }
    setFocusRequest((request) => request + 1);
    setStatus("");
  }, [quoteRequest]);

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
        lastModified: file.lastModified,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
      })),
    ]);
    setStatus("");
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
    setStatus("");
  }

  async function saveDraft() {
    if (isSavingDraft) return;
    if (!hasPostEditorContent(editorValue) && attachments.length === 0) {
      setStatus("没有可保存的内容");
      return;
    }

    setIsSavingDraft(true);
    setStatus("正在保存草稿…");

    try {
      const saveResult = await saveStoredReplyDraft(
        {
          attachments: attachments.map(({ restored: _restored, ...attachment }) => attachment),
          bid,
          board,
          boardHref,
          editor: getRichTextEditorStorageValue(editorValue),
          excerpt: getReplyDraftExcerpt(editorValue, attachments),
          id: savedDraftId ?? undefined,
          signatureIndex,
          threadTitle,
          tid,
        },
        ownerKey,
      );

      if (!saveResult.ok) {
        setStatus(getReplyDraftSaveError(saveResult.reason));
        return;
      }

      setSavedDraftId(saveResult.draft.id);
      setStatus(saveResult.discardedDraftCount > 0
        ? `已存入草稿箱，并清理 ${saveResult.discardedDraftCount} 条最旧草稿`
        : "已存入草稿箱");
    } finally {
      setIsSavingDraft(false);
    }
  }

  function publishReply() {
    if (!hasPostEditorContent(editorValue)) {
      setStatus("请先填写回复内容");
      setFocusRequest((request) => request + 1);
      return;
    }

    setStatus("演示模式：回复内容已通过本地校验");
  }

  function openPreview() {
    if (!hasPostEditorContent(editorValue)) {
      setStatus("请先填写回复内容");
      setFocusRequest((request) => request + 1);
      return;
    }

    setPreviewedAt(formatPostEditorPreviewTimestamp(new Date()));
    setPreviewOpen(true);
    setStatus("");
  }

  return (
    <>
      <PostEditor
        ariaLabel={`回复主题：${threadTitle}`}
        attachmentDialogDescription="文件会先加入当前回复，发布时一并上传"
        attachments={attachments}
        editorRef={editorRef}
        editorValue={editorValue}
        focusRequest={focusRequest}
        heading="写回复"
        headingMeta={`Re: ${threadTitle}`}
        id="reply-editor"
        name="reply-signature"
        onAddAttachments={addAttachments}
        onChange={updateEditorValue}
        onPreview={openPreview}
        onRemoveAttachment={removeAttachment}
        onSignatureChange={(value) => {
          setSignatureIndex(value);
          setStatus("");
        }}
        onSubmit={publishReply}
        placeholder="写下你的回复……"
        previewDisabled={!hasPostEditorContent(editorValue)}
        secondaryActions={(
          <button className="reply-secondary-button" disabled={isSavingDraft} onClick={() => void saveDraft()} type="button">
            <Save size={15} />
            <span className="reply-action-label-full">存入草稿</span>
            <span className="reply-action-label-compact">草稿</span>
          </button>
        )}
        signatureIndex={signatureIndex}
        status={status}
        submitCompactLabel="发布"
        submitIcon={<Send size={15} />}
        submitLabel="发布回复"
      />
      {previewOpen && (
        <PostEditorPreviewDialog
          attachments={attachments}
          editorValue={editorValue}
          label="回复预览"
          onClose={() => setPreviewOpen(false)}
          previewAuthor={previewAuthor}
          previewFloor={previewFloor}
          previewSignature={signatureIndex > 0 ? previewSignatures[signatureIndex - 1] : undefined}
          previewedAt={previewedAt}
          title={`Re: ${threadTitle}`}
        />
      )}
    </>
  );
}

function appendQuote(
  current: RichTextEditorValue,
  target: QuoteRequest,
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

function getReplyDraftExcerpt(value: RichTextEditorValue, attachments: ReplyAttachment[]) {
  let excerpt = value.content;

  if (value.mode === "rich" || value.mode === "html") {
    const container = document.createElement("div");
    container.innerHTML = value.content;
    excerpt = container.textContent ?? "";
  } else {
    excerpt = value.content.replace(/[#*_>`\-[\]()~]/g, " ");
  }

  const normalizedExcerpt = excerpt.replace(/\s+/g, " ").trim();
  if (normalizedExcerpt) return normalizedExcerpt.slice(0, 120);
  return attachments.length > 0 ? "附件回复草稿" : "空白回复草稿";
}

function getReplyDraftSaveError(reason: ReplyDraftSaveFailureReason) {
  if (reason === "missing-owner") return "无法确认登录用户，请刷新页面后重试";
  if (reason === "quota") return "草稿内容过大或本机草稿空间已满";
  if (reason === "unavailable") return "浏览器已禁用本站本地存储，请调整隐私设置后重试";
  return "草稿保存失败，请稍后重试";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
