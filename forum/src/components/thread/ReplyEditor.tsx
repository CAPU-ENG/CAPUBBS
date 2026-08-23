import { LoaderCircle, Save, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getRichTextEditorHtmlValue,
  getRichTextEditorStorageValue,
  type RichTextEditorValue,
} from "../editor/RichTextEditor";
import {
  publishThreadReply,
  uploadThreadAttachment,
} from "../../api/thread";
import { useAutoSaveEnabled } from "../../hooks/useAssistiveFeatures";
import { queueLocalDraftCleanup } from "../../utils/draftCleanup";
import {
  appendFloorQuote,
  normalizeFloorQuotesForLegacyStorage,
} from "../../utils/floorQuote";
import {
  saveStoredReplyDraft,
  type ReplyDraftSaveFailureReason,
  type StoredReplyAttachment,
} from "../../utils/replyDraftStorage";
import { getThreadFloorHref } from "../../utils/threadRoutes";
import {
  formatPostEditorBytes,
  formatPostEditorPreviewTimestamp,
  hasPostEditorContent,
  AUTO_SAVE_STATUS,
  PostEditor,
  PostEditorPreviewDialog,
  type PostEditorPreviewAuthor,
} from "./PostEditor";

export type QuoteRequest = {
  author: string;
  authorHref: string;
  floor: number;
  floorHref: string;
  quote?: string;
  requestId: number;
};

type ReplyAttachment = StoredReplyAttachment & { restored?: boolean };

const AUTO_SAVE_DELAY_MS = 1_200;

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
  const autoSaveEnabled = useAutoSaveEnabled();
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
  const [statusIsError, setStatusIsError] = useState(false);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [savedDraftId, setSavedDraftId] = useState<string | null>(null);
  const [savedDraftSnapshot, setSavedDraftSnapshot] = useState(() => getReplyDraftSnapshot(
    { content: "", mode: "rich" },
    0,
    [],
  ));
  const appliedQuoteRequestRef = useRef(0);
  const lastAutoSaveAttemptRef = useRef<string | null>(null);
  const currentDraftSnapshot = getReplyDraftSnapshot(editorValue, signatureIndex, attachments);

  useEffect(() => {
    if (!quoteRequest || appliedQuoteRequestRef.current === quoteRequest.requestId) return;
    appliedQuoteRequestRef.current = quoteRequest.requestId;

    if (quoteRequest.quote) {
      setEditorValue((current) => appendFloorQuote(current, quoteRequest));
    }
    setFocusRequest((request) => request + 1);
    setStatus("");
    setStatusIsError(false);
  }, [quoteRequest]);

  useEffect(() => {
    if (
      !autoSaveEnabled
      || currentDraftSnapshot === savedDraftSnapshot
      || currentDraftSnapshot === lastAutoSaveAttemptRef.current
      || isSavingDraft
      || isPublishing
      || isUploadingAttachments
      || (!hasPostEditorContent(editorValue) && attachments.length === 0)
    ) return;

    const timer = window.setTimeout(() => { void saveDraft(true); }, AUTO_SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [
    attachments.length,
    autoSaveEnabled,
    currentDraftSnapshot,
    isPublishing,
    isSavingDraft,
    isUploadingAttachments,
    savedDraftSnapshot,
  ]);

  function updateEditorValue(nextValue: RichTextEditorValue) {
    setEditorValue(nextValue);
    setStatus("");
    setStatusIsError(false);
  }

  async function addAttachments(files: File[]) {
    if (files.length === 0 || isUploadingAttachments) return;
    const oversizedFile = files.find((file) => file.size > 100 * 1024 * 1024);
    if (oversizedFile) {
      setStatus(`${oversizedFile.name} 超过 100MB，无法上传。`);
      setStatusIsError(true);
      return;
    }

    setStatus(files.length > 1 ? `正在上传 ${files.length} 个附件…` : `正在上传 ${files[0].name}…`);
    setStatusIsError(false);
    setIsUploadingAttachments(true);
    try {
      const results = await Promise.allSettled(files.map(uploadThreadAttachment));
      const uploaded = results.flatMap((result, index) => result.status === "fulfilled"
        ? [{
          ...result.value,
          lastModified: files[index].lastModified,
          type: files[index].type || "application/octet-stream",
        }]
        : []);
      const failedCount = results.length - uploaded.length;
      if (uploaded.length > 0) setAttachments((current) => [...current, ...uploaded]);
      setStatus(failedCount > 0
        ? `已添加 ${uploaded.length} 个附件，${failedCount} 个上传失败。`
        : `已添加 ${uploaded.length} 个附件`);
      setStatusIsError(failedCount > 0);
    } finally {
      setIsUploadingAttachments(false);
    }
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
    setStatus("");
    setStatusIsError(false);
  }

  async function saveDraft(automatic = false) {
    if (isSavingDraft) return;
    if (automatic) lastAutoSaveAttemptRef.current = currentDraftSnapshot;
    if (!hasPostEditorContent(editorValue) && attachments.length === 0) {
      setStatus("没有可保存的内容");
      setStatusIsError(true);
      return;
    }

    setIsSavingDraft(true);
    if (!automatic) setStatus("正在保存草稿…");
    setStatusIsError(false);

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
        setStatusIsError(true);
        return;
      }

      setSavedDraftId(saveResult.draft.id);
      setSavedDraftSnapshot(currentDraftSnapshot);
      setStatus(automatic ? AUTO_SAVE_STATUS : "已存入草稿箱，可前往个人中心-草稿箱查看");
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function publishReply() {
    if (isPublishing || isUploadingAttachments) return;
    if (!hasPostEditorContent(editorValue)) {
      setStatus("请先填写回复内容");
      setStatusIsError(true);
      setFocusRequest((request) => request + 1);
      return;
    }

    const html = normalizeFloorQuotesForLegacyStorage(getRichTextEditorHtmlValue(editorValue));
    if (html.length > 100_000) {
      setStatus("正文超过 10 万字符，请精简内容或检查是否粘贴了过大的图片。");
      setStatusIsError(true);
      return;
    }

    setIsPublishing(true);
    setStatus("正在发布回复…");
    setStatusIsError(false);
    try {
      const published = await publishThreadReply({
        attachments: attachments.map((attachment) => attachment.id),
        bid,
        signatureIndex,
        text: html,
        tid,
        title: threadTitle,
      });
      queueLocalDraftCleanup({ bid, ownerKey, tid, type: "reply" });

      window.location.href = published.pid > 0
        ? getThreadFloorHref(published.bid, published.tid, published.pid)
        : `/?${new URLSearchParams({ bid: String(published.bid), tid: String(published.tid) }).toString()}`;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "回复发布失败，请稍后重试。");
      setStatusIsError(true);
      setIsPublishing(false);
    }
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
    setStatusIsError(false);
  }

  return (
    <>
      <PostEditor
        ariaLabel={`回复主题：${threadTitle}`}
        attachmentDialogDescription="文件会立即上传，并在发布回复后关联到内容"
        attachments={attachments}
        editorRef={editorRef}
        editorValue={editorValue}
        focusRequest={focusRequest}
        heading="写回复"
        headingMeta={`Re: ${threadTitle}`}
        id="reply-editor"
        name="reply-signature"
        formatAttachmentMeta={(attachment) => formatPostEditorBytes(attachment.size)}
        onAddAttachments={(files) => void addAttachments(files)}
        onChange={updateEditorValue}
        onPreview={openPreview}
        onRemoveAttachment={removeAttachment}
        onSignatureChange={(value) => {
          setSignatureIndex(value);
          setStatus("");
          setStatusIsError(false);
        }}
        onSubmit={() => void publishReply()}
        placeholder="写下你的回复……"
        previewDisabled={!hasPostEditorContent(editorValue)}
        secondaryActions={(
          <button className="reply-secondary-button" disabled={isSavingDraft || isPublishing} onClick={() => void saveDraft()} type="button">
            {isSavingDraft ? <LoaderCircle className="thread-edit-spinner" size={15} /> : <Save size={15} />}
            <span className="reply-action-label-full">{isSavingDraft ? "保存中" : "存入草稿"}</span>
            <span className="reply-action-label-compact">{isSavingDraft ? "保存中" : "草稿"}</span>
          </button>
        )}
        signatureIndex={signatureIndex}
        status={status}
        statusIsError={statusIsError}
        submitCompactLabel={isPublishing ? "发布中" : "发布"}
        submitDisabled={isPublishing || isUploadingAttachments}
        submitIcon={isPublishing ? <LoaderCircle className="thread-edit-spinner" size={15} /> : <Send size={15} />}
        submitLabel={isPublishing ? "正在发布" : "发布回复"}
        uploadingAttachments={isUploadingAttachments}
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

function getReplyDraftSnapshot(
  editorValue: RichTextEditorValue,
  signatureIndex: number,
  attachments: ReplyAttachment[],
) {
  return JSON.stringify({
    attachments: attachments.map(({ restored: _restored, ...attachment }) => attachment),
    editor: getRichTextEditorStorageValue(editorValue),
    signatureIndex,
  });
}

function getReplyDraftSaveError(reason: ReplyDraftSaveFailureReason) {
  if (reason === "missing-owner") return "无法确认登录用户，请刷新页面后重试";
  if (reason === "quota") return "草稿内容过大或本机草稿空间已满";
  if (reason === "unavailable") return "浏览器已禁用本站本地存储，请调整隐私设置后重试";
  return "草稿保存失败，请稍后重试";
}
