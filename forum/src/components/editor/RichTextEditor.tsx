import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  AtSign,
  Bold,
  Eraser,
  Heading1,
  Image as ImageIcon,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListOrdered,
  MessageSquareQuote,
  Minus,
  Palette,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
} from 'lucide-react';
import {
  type ClipboardEvent,
  type ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { renderForumMarkup } from '../../utils/forumMarkup';
import { translateLegacyBbcode } from '../../utils/legacyBbcode';
import { getPublicProfileAppPath } from '../../utils/userRoutes';
import { PastedImageDialog } from './PastedImageDialog';
import {
  defaultRichTextFont,
  defaultRichTextFontSize,
  defaultTextColor,
  editorModeGroups,
  htmlVoidTags,
  markdownFloorQuoteMetaPattern,
  maxInlineImageBytes,
  richTextFontOptions,
  richTextFontSizeOptions,
} from './RichTextEditor.constants';
import { useIsDarkTheme, useIsMobileViewport } from './RichTextEditor.hooks';
import {
  compressImageFileUnderLimit,
  createUploadablePngFileUnderLimit,
  getClipboardImageFile,
  getImageFileMd5Hex,
  getImageAltText,
  uploadEditorImage,
} from './RichTextEditor.images';
import {
  applyInlineStyleToElement,
  focusRichTextEditorAtEnd,
  getInheritedRichInlineStyle,
  normalizeCssColor,
  richInlineStyleToString,
} from './RichTextEditor.richText';
import type {
  EditorPopover,
  PastedImageState,
  RichInlineStyle,
  RichTextEditorMode,
  RichTextEditorValue,
} from './RichTextEditor.types';

export type { RichTextEditorMode, RichTextEditorValue } from './RichTextEditor.types';

type RichTextEditorProps = {
  ariaLabel: string;
  focusRequest?: number;
  onChange: (value: RichTextEditorValue) => void;
  placeholder?: string;
  value: RichTextEditorValue;
};

type ActiveRichImageResize = {
  aspectRatio: number;
  image: HTMLImageElement;
  maxWidth: number;
  pointerId: number;
  startHeight: number;
  startWidth: number;
  startX: number;
  startY: number;
};

type RichImageResizeHandle = {
  left: number;
  top: number;
};

const maxEditorHistoryEntries = 120;
const richImageResizeMinWidth = 48;

export function getRichTextEditorStorageValue(value: RichTextEditorValue): RichTextEditorValue {
  if (value.mode === 'markdown') {
    return value;
  }

  return {
    ...value,
    content: compactHtmlForStorage(value.content),
  };
}

export function getRichTextEditorHtmlValue(value: RichTextEditorValue) {
  const html = value.mode === 'markdown' ? renderMarkdownToHtml(value.content) : value.content;
  return compactHtmlForStorage(html);
}

export function getRichTextEditorPreviewDocument(
  value: RichTextEditorValue,
  options: { embedded?: boolean } = {},
) {
  const previewHtml = value.mode === 'markdown'
    ? renderForumMarkup(renderMarkdownToHtml(value.content))
    : value.content;
  return buildHtmlPreviewDocument(
    previewHtml,
    document.documentElement.classList.contains('dark'),
    options.embedded,
  );
}

function areEditorValuesEqual(currentValue: RichTextEditorValue, nextValue: RichTextEditorValue) {
  return currentValue.content === nextValue.content && currentValue.mode === nextValue.mode;
}

function pushEditorHistoryEntry(stack: RichTextEditorValue[], entry: RichTextEditorValue) {
  const lastEntry = stack[stack.length - 1];

  if (lastEntry && areEditorValuesEqual(lastEntry, entry)) {
    return;
  }

  stack.push({ ...entry });

  if (stack.length > maxEditorHistoryEntries) {
    stack.shift();
  }
}

function clampImageDimension(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function applyImagePixelDimensions(image: HTMLImageElement, width: number, height: number) {
  image.style.width = `${width}px`;
  image.style.height = `${height}px`;
  image.setAttribute('width', String(width));
  image.setAttribute('height', String(height));
}

type ImageDimensions = {
  height?: string;
  width?: string;
};

function normalizeImageDimensionValue(value: string | null | undefined) {
  const trimmedValue = value?.trim() ?? '';

  if (!trimmedValue) {
    return undefined;
  }

  const numericMatch = trimmedValue.match(/^(\d+(?:\.\d+)?)(px|%)?$/i);

  if (!numericMatch) {
    return undefined;
  }

  const numericValue = Number(numericMatch[1]);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return undefined;
  }

  const unit = numericMatch[2]?.toLowerCase() ?? 'px';
  const roundedValue = Math.round(numericValue * 100) / 100;

  return `${roundedValue}${unit}`;
}

function getHtmlImageDimensions(image: HTMLElement): ImageDimensions {
  return {
    height: normalizeImageDimensionValue(image.style.height) ?? normalizeImageDimensionValue(image.getAttribute('height')),
    width: normalizeImageDimensionValue(image.style.width) ?? normalizeImageDimensionValue(image.getAttribute('width')),
  };
}

function formatMarkdownImageDimensions(image: HTMLElement) {
  const dimensions = getHtmlImageDimensions(image);
  const attributes = [
    dimensions.width ? `width=${dimensions.width}` : '',
    dimensions.height ? `height=${dimensions.height}` : '',
  ].filter(Boolean);

  return attributes.length > 0 ? `{${attributes.join(' ')}}` : '';
}

function parseMarkdownImageDimensions(attributes: string | undefined): ImageDimensions {
  if (!attributes) {
    return {};
  }

  const dimensions: ImageDimensions = {};
  const attributePattern = /\b(width|height)\s*[:=]\s*([0-9.]+(?:px|%)?)/gi;
  let match: RegExpExecArray | null;

  while ((match = attributePattern.exec(attributes)) !== null) {
    const value = normalizeImageDimensionValue(match[2]);

    if (!value) {
      continue;
    }

    if (match[1].toLowerCase() === 'width') {
      dimensions.width = value;
    } else {
      dimensions.height = value;
    }
  }

  return dimensions;
}

function buildImageDimensionStyleAttribute(dimensions: ImageDimensions) {
  const styles = [
    dimensions.width ? `width: ${dimensions.width}` : '',
    dimensions.height ? `height: ${dimensions.height}` : '',
  ].filter(Boolean);

  return styles.length > 0 ? ` style="${escapeAttribute(`${styles.join('; ')};`)}"` : '';
}

export function RichTextEditor({
  ariaLabel,
  focusRequest = 0,
  onChange,
  placeholder = '写下你的回复...',
  value,
}: RichTextEditorProps) {
  const editorShellRef = useRef<HTMLElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const sourceLineNumbersRef = useRef<HTMLDivElement>(null);
  const htmlHighlightRef = useRef<HTMLPreElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const sourceSelectionRef = useRef<{ end: number; start: number } | null>(null);
  const selectedRichImageRef = useRef<HTMLImageElement | null>(null);
  const activeRichImageResizeRef = useRef<ActiveRichImageResize | null>(null);
  const currentValueRef = useRef<RichTextEditorValue>(value);
  const undoStackRef = useRef<RichTextEditorValue[]>([]);
  const redoStackRef = useRef<RichTextEditorValue[]>([]);
  const isApplyingHistoryRef = useRef(false);
  const [activePopover, setActivePopover] = useState<EditorPopover>(null);
  const [isAutoHeightEnabled, setIsAutoHeightEnabled] = useState(false);
  const [showSourceLineNumbers, setShowSourceLineNumbers] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [popoverTextValue, setPopoverTextValue] = useState('');
  const [popoverValue, setPopoverValue] = useState('');
  const [fontSelectValue, setFontSelectValue] = useState('');
  const [fontSizeSelectValue, setFontSizeSelectValue] = useState(defaultRichTextFontSize);
  const [pastedImage, setPastedImage] = useState<PastedImageState | null>(null);
  const [selectedTextColor, setSelectedTextColor] = useState(defaultTextColor);
  const [hexSourceValue, setHexSourceValue] = useState(defaultTextColor);
  const [richImageResizeHandle, setRichImageResizeHandle] = useState<RichImageResizeHandle | null>(null);
  const isDarkTheme = useIsDarkTheme();
  const isMobileViewport = useIsMobileViewport();
  const isMarkdownMode = value.mode === 'markdown';
  const isHtmlMode = value.mode === 'html';
  const isSourceMode = isMarkdownMode || isHtmlMode;
  const hasEditorContent = hasModeSwitchingContent(value);
  const shouldShowSourceLineNumbers = isSourceMode && showSourceLineNumbers;
  const sourceLineCount = useMemo(() => Math.max(1, value.content.split('\n').length), [value.content]);
  const sourceLineNumbers = useMemo(
    () => Array.from({ length: sourceLineCount }, (_, index) => index + 1),
    [sourceLineCount],
  );
  const sourceLineNumberColumnWidth = `${Math.max(2, String(sourceLineCount).length) + 1}ch`;
  const sourceTextareaWrap = shouldShowSourceLineNumbers ? 'off' : 'soft';
  const markdownSourceOverflowClassName = isAutoHeightEnabled
    ? shouldShowSourceLineNumbers
      ? 'overflow-x-auto overflow-y-hidden'
      : 'overflow-hidden'
    : shouldShowSourceLineNumbers
      ? 'overflow-auto'
      : 'overflow-y-auto';
  const htmlSourceOverflowClassName = isAutoHeightEnabled
    ? shouldShowSourceLineNumbers
      ? 'overflow-x-auto overflow-y-hidden'
      : 'overflow-hidden'
    : 'overflow-auto';
  const splitPaneClassName = isMobileViewport
    ? `flex flex-col ${isAutoHeightEnabled ? 'min-h-[50vh]' : 'h-[50vh]'}`
    : `flex flex-row ${isAutoHeightEnabled ? 'min-h-[50vh]' : 'h-[50vh]'}`;
  const splitPaneChildClassName = 'min-h-0 min-w-0 flex-1 basis-0';
  const splitPaneDividerClassName = isMobileViewport
    ? 'border-t border-zinc-200/80 dark:border-white/10'
    : 'border-l border-zinc-200/80 dark:border-white/10';
  const htmlSourcePaneClassName = isMobileViewport
    ? `${splitPaneChildClassName} flex flex-col border-b border-zinc-200/80 dark:border-white/10`
    : `${splitPaneChildClassName} flex flex-col border-r border-zinc-200/80 dark:border-white/10`;
  const markdownPreview = useMemo(
    () => renderForumMarkup(renderMarkdownToHtml(value.content)),
    [value.content],
  );
  const highlightedHtml = useMemo(() => highlightHtmlSource(value.content), [value.content]);
  const htmlPreviewDocument = useMemo(
    () => buildHtmlPreviewDocument(value.content, isDarkTheme),
    [isDarkTheme, value.content],
  );

  const syncSourceLineNumbersScroll = () => {
    if (!sourceLineNumbersRef.current || !sourceRef.current) {
      return;
    }

    sourceLineNumbersRef.current.scrollTop = sourceRef.current.scrollTop;
  };

  const resizeSourceTextarea = () => {
    const textarea = sourceRef.current;
    if (!textarea) {
      return;
    }

    if (!isAutoHeightEnabled) {
      textarea.style.height = '';
      if (htmlHighlightRef.current) {
        htmlHighlightRef.current.style.height = '';
      }
      return;
    }

    textarea.style.height = 'auto';
    const nextHeight = `${Math.max(textarea.scrollHeight, Math.round(window.innerHeight * 0.4))}px`;
    textarea.style.height = nextHeight;

    if (htmlHighlightRef.current) {
      htmlHighlightRef.current.style.height = nextHeight;
    }
  };

  useEffect(() => {
    if (areEditorValuesEqual(currentValueRef.current, value)) {
      isApplyingHistoryRef.current = false;
      return;
    }

    currentValueRef.current = value;

    if (isApplyingHistoryRef.current) {
      isApplyingHistoryRef.current = false;
      return;
    }

    undoStackRef.current = [];
    redoStackRef.current = [];
  }, [value.content, value.mode]);

  useEffect(() => {
    if (isSourceMode || !editorRef.current || editorRef.current.innerHTML === value.content) {
      return;
    }

    editorRef.current.innerHTML = value.content;
    selectedRichImageRef.current = null;
    setRichImageResizeHandle(null);
  }, [isSourceMode, value.content]);

  useEffect(() => {
    if (!isSourceMode) {
      return;
    }

    selectedRichImageRef.current = null;
    activeRichImageResizeRef.current = null;
    setRichImageResizeHandle(null);
  }, [isSourceMode]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(resizeSourceTextarea);

    return () => window.cancelAnimationFrame(frame);
  }, [isAutoHeightEnabled, isSourceMode, value.content, value.mode]);

  useEffect(() => {
    if (!shouldShowSourceLineNumbers) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(syncSourceLineNumbersScroll);

    return () => window.cancelAnimationFrame(frame);
  }, [shouldShowSourceLineNumbers, sourceLineCount, value.mode]);

  useEffect(() => {
    if (focusRequest === 0) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      if (sourceRef.current) {
        sourceRef.current.focus();
        sourceRef.current.setSelectionRange(sourceRef.current.value.length, sourceRef.current.value.length);
        return;
      }

      if (editorRef.current) {
        focusRichTextEditorAtEnd(editorRef.current);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [focusRequest]);

  useEffect(() => {
    if (!pastedImage) {
      return undefined;
    }

    return () => URL.revokeObjectURL(pastedImage.previewUrl);
  }, [pastedImage?.previewUrl]);

  const commitEditorValue = (nextValue: RichTextEditorValue, recordHistory = true) => {
    const previousValue = currentValueRef.current;

    if (areEditorValuesEqual(previousValue, nextValue)) {
      return;
    }

    if (recordHistory) {
      pushEditorHistoryEntry(undoStackRef.current, previousValue);
      redoStackRef.current = [];
    } else {
      isApplyingHistoryRef.current = true;
    }

    currentValueRef.current = nextValue;
    onChange(nextValue);
  };

  const updateContent = (content: string) => {
    commitEditorValue({
      content,
      mode: currentValueRef.current.mode,
    });
  };

  const updateMode = (nextMode: RichTextEditorMode) => {
    const currentValue = currentValueRef.current;

    if (nextMode === currentValue.mode || isCrossGroupModeSwitchLocked(currentValue, nextMode)) {
      return;
    }

    setActivePopover(null);
    setIsColorPickerOpen(false);
    savedRangeRef.current = null;
    sourceSelectionRef.current = null;
    commitEditorValue({
      content: convertEditorContent(currentValue.content, currentValue.mode, nextMode),
      mode: nextMode,
    });
  };

  const focusEditorAfterHistoryChange = (nextValue: RichTextEditorValue) => {
    savedRangeRef.current = null;
    sourceSelectionRef.current = null;

    window.requestAnimationFrame(() => {
      if (nextValue.mode === 'rich') {
        if (editorRef.current) {
          focusRichTextEditorAtEnd(editorRef.current);
        }
        return;
      }

      if (!sourceRef.current) {
        return;
      }

      const selectionPosition = sourceRef.current.value.length;
      sourceRef.current.focus();
      sourceRef.current.setSelectionRange(selectionPosition, selectionPosition);
      sourceSelectionRef.current = {
        end: selectionPosition,
        start: selectionPosition,
      };
    });
  };

  const undoEditorChange = () => {
    const previousValue = undoStackRef.current.pop();

    if (!previousValue) {
      return;
    }

    pushEditorHistoryEntry(redoStackRef.current, currentValueRef.current);
    commitEditorValue(previousValue, false);
    focusEditorAfterHistoryChange(previousValue);
  };

  const redoEditorChange = () => {
    const nextValue = redoStackRef.current.pop();

    if (!nextValue) {
      return;
    }

    pushEditorHistoryEntry(undoStackRef.current, currentValueRef.current);
    commitEditorValue(nextValue, false);
    focusEditorAfterHistoryChange(nextValue);
  };

  const handleEditorKeyDown = (event: KeyboardEvent<HTMLDivElement | HTMLTextAreaElement>) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) {
      return;
    }

    const key = event.key.toLowerCase();
    const isUndoShortcut = key === 'z' && !event.shiftKey;
    const isRedoShortcut = key === 'y' || (key === 'z' && event.shiftKey);

    if (!isUndoShortcut && !isRedoShortcut) {
      return;
    }

    event.preventDefault();

    if (isUndoShortcut) {
      undoEditorChange();
      return;
    }

    redoEditorChange();
  };

  const handleRichEditorKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const editor = event.currentTarget;
    const selection = window.getSelection();

    if (
      event.key === 'Enter'
      && !event.nativeEvent.isComposing
      && !event.ctrlKey
      && !event.metaKey
      && !event.altKey
      && selection
      && selection.rangeCount > 0
    ) {
      const range = selection.getRangeAt(0);

      if (
        editor.contains(range.commonAncestorContainer)
        && !isSelectionInsideStructuredRichBlock(editor, range.commonAncestorContainer)
      ) {
        event.preventDefault();
        document.execCommand('insertLineBreak', false);
        updateContent(editor.innerHTML);
        return;
      }
    }

    handleEditorKeyDown(event);
  };

  const clearRichImageSelection = () => {
    selectedRichImageRef.current = null;
    activeRichImageResizeRef.current = null;
    setRichImageResizeHandle(null);
  };

  const updateRichImageResizeHandle = () => {
    const editorShell = editorShellRef.current;
    const editor = editorRef.current;
    const image = selectedRichImageRef.current;

    if (!editorShell || !editor || !image || !editor.contains(image)) {
      clearRichImageSelection();
      return;
    }

    const shellBounds = editorShell.getBoundingClientRect();
    const imageBounds = image.getBoundingClientRect();

    if (imageBounds.width <= 0 || imageBounds.height <= 0) {
      clearRichImageSelection();
      return;
    }

    setRichImageResizeHandle({
      left: imageBounds.right - shellBounds.left,
      top: imageBounds.bottom - shellBounds.top,
    });
  };

  const selectRichImage = (image: HTMLImageElement) => {
    selectedRichImageRef.current = image;
    window.requestAnimationFrame(updateRichImageResizeHandle);
  };

  const handleRichEditorClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLImageElement) {
      selectRichImage(event.target);
      return;
    }

    clearRichImageSelection();
  };

  const handleRichImageResizePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    const image = selectedRichImageRef.current;
    const editor = editorRef.current;

    if (!image || !editor) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    const imageBounds = image.getBoundingClientRect();
    const startWidth = imageBounds.width;
    const startHeight = imageBounds.height;

    activeRichImageResizeRef.current = {
      aspectRatio: startHeight > 0 ? startWidth / startHeight : 1,
      image,
      maxWidth: Math.max(richImageResizeMinWidth, editor.clientWidth),
      pointerId: event.pointerId,
      startHeight,
      startWidth,
      startX: event.clientX,
      startY: event.clientY,
    };
  };

  const handleRichImageResizePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const resizeState = activeRichImageResizeRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const horizontalDelta = event.clientX - resizeState.startX;
    const verticalDelta = (event.clientY - resizeState.startY) * resizeState.aspectRatio;
    const resizeDelta = Math.abs(horizontalDelta) >= Math.abs(verticalDelta) ? horizontalDelta : verticalDelta;
    const nextWidth = clampImageDimension(
      Math.round(resizeState.startWidth + resizeDelta),
      richImageResizeMinWidth,
      resizeState.maxWidth,
    );
    const nextHeight = Math.max(1, Math.round(nextWidth / resizeState.aspectRatio));

    applyImagePixelDimensions(resizeState.image, nextWidth, nextHeight);
    updateRichImageResizeHandle();
  };

  const finishRichImageResize = (event: PointerEvent<HTMLButtonElement>) => {
    const resizeState = activeRichImageResizeRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    activeRichImageResizeRef.current = null;
    updateContent(editorRef.current?.innerHTML ?? '');
    updateRichImageResizeHandle();
  };

  const runRichCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    updateContent(editorRef.current?.innerHTML ?? '');
  };

  const insertRichHtml = (html: string) => {
    editorRef.current?.focus();
    restoreRichSelection();
    document.execCommand('insertHTML', false, html);
    updateContent(editorRef.current?.innerHTML ?? '');
  };

  const insertRichImage = (url: string, altText: string) => {
    const marker = `capubbs-inserted-image-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    editorRef.current?.focus();
    restoreRichSelection();
    document.execCommand(
      'insertHTML',
      false,
      `<img src="${escapeAttribute(url)}" alt="${escapeAttribute(altText)}" data-capubbs-image-marker="${marker}">`,
    );

    const image = editorRef.current?.querySelector<HTMLImageElement>(`img[data-capubbs-image-marker="${marker}"]`);
    image?.removeAttribute('data-capubbs-image-marker');
    updateContent(editorRef.current?.innerHTML ?? '');

    if (image) {
      selectRichImage(image);
    }
  };

  const openPastedImageDialog = (file: File) => {
    setPastedImage({
      isCompressing: false,
      isUploading: false,
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
      workingFile: file,
    });
  };

  const closePastedImageDialog = () => {
    setPastedImage(null);
  };

  const handleEditorPaste = (event: ClipboardEvent<HTMLDivElement | HTMLTextAreaElement>) => {
    const imageFile = getClipboardImageFile(event.clipboardData);

    if (!imageFile) {
      return;
    }

    event.preventDefault();
    saveSelection();
    setActivePopover(null);
    setIsColorPickerOpen(false);
    openPastedImageDialog(imageFile);
  };

  const compressPastedImage = async () => {
    if (!pastedImage || pastedImage.isCompressing) {
      return;
    }

    setPastedImage((current) =>
      current
        ? {
            ...current,
            error: undefined,
            isCompressing: true,
            isUploading: false,
          }
        : current,
    );

    try {
      const compressedFile = await compressImageFileUnderLimit(pastedImage.originalFile, maxInlineImageBytes);

      setPastedImage((current) =>
        current
          ? {
              ...current,
              error: undefined,
              isCompressing: false,
              previewUrl: URL.createObjectURL(compressedFile),
              workingFile: compressedFile,
            }
          : current,
      );
    } catch (error) {
      setPastedImage((current) =>
        current
          ? {
              ...current,
              error: error instanceof Error ? error.message : '图片压缩失败，请换一张图片再试。',
              isCompressing: false,
            }
          : current,
      );
    }
  };

  const uploadAndInsertPastedImage = async () => {
    if (
      !pastedImage ||
      pastedImage.isCompressing ||
      pastedImage.isUploading ||
      pastedImage.workingFile.size > maxInlineImageBytes
    ) {
      return;
    }

    setPastedImage((current) =>
      current
        ? {
            ...current,
            error: undefined,
            isUploading: true,
          }
        : current,
    );

    try {
      const pngFile = await createUploadablePngFileUnderLimit(pastedImage.workingFile, maxInlineImageBytes);
      const md5 = await getImageFileMd5Hex(pngFile);
      const { url } = await uploadEditorImage(pngFile, md5);
      const altText = getImageAltText(pastedImage.originalFile);

      if (isMarkdownMode) {
        replaceSourceSelection(`![${escapeMarkdownLinkText(altText)}](${url})`);
      } else if (isHtmlMode) {
        replaceSourceSelection(`<img src="${escapeAttribute(url)}" alt="${escapeAttribute(altText)}">`);
      } else {
        insertRichImage(url, altText);
      }

      closePastedImageDialog();
    } catch (error) {
      setPastedImage((current) =>
        current
          ? {
              ...current,
              error: error instanceof Error ? error.message : '图片上传失败，请稍后重试。',
              isUploading: false,
            }
          : current,
      );
    }
  };

  const getRichSelectionHtml = (fallback: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return fallback;
    }

    const range = selection.getRangeAt(0);
    if (!editorRef.current?.contains(range.commonAncestorContainer) || range.collapsed) {
      return fallback;
    }

    const container = document.createElement('div');
    container.appendChild(range.cloneContents());

    return container.innerHTML || escapeHtml(selection.toString()) || fallback;
  };

  const wrapRichSelectionWithTag = (tagName: string, fallback: string, className = '') => {
    const classAttribute = className ? ` class="${escapeAttribute(className)}"` : '';
    insertRichHtml(`<${tagName}${classAttribute}>${getRichSelectionHtml(fallback)}</${tagName}>`);
  };

  const applyRichInlineStyle = (style: RichInlineStyle, fallback: string) => {
    editorRef.current?.focus();
    restoreRichSelection();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) {
      insertRichHtml(`<span style="${escapeAttribute(richInlineStyleToString(style))}">${escapeHtml(fallback)}</span>`);
      savedRangeRef.current = null;
      return;
    }

    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) {
      insertRichHtml(`<span style="${escapeAttribute(richInlineStyleToString(style))}">${escapeHtml(fallback)}</span>`);
      savedRangeRef.current = null;
      return;
    }

    const wrapper = document.createElement('span');
    applyInlineStyleToElement(wrapper, style);

    try {
      if (range.collapsed) {
        wrapper.textContent = fallback;
        range.insertNode(wrapper);
      } else {
        range.surroundContents(wrapper);
      }

      selection.removeAllRanges();
      const nextRange = document.createRange();
      nextRange.selectNodeContents(wrapper);
      selection.addRange(nextRange);
      updateContent(editorRef.current.innerHTML);
    } catch {
      const inheritedStyle = getInheritedRichInlineStyle(range);
      const nextStyle = {
        ...inheritedStyle,
        ...style,
      };
      insertRichHtml(`<span style="${escapeAttribute(richInlineStyleToString(nextStyle))}">${getRichSelectionHtml(fallback)}</span>`);
    }

    savedRangeRef.current = null;
  };

  const handleRichFontChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const fontName = event.target.value;

    setFontSelectValue(fontName);

    if (!fontName) {
      return;
    }

    applyRichInlineStyle({ fontFamily: fontName }, '文字');
  };

  const handleRichFontSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const fontSize = event.target.value;

    if (!fontSize) {
      return;
    }

    setFontSizeSelectValue(fontSize);
    applyRichInlineStyle({ fontSize }, '文字');
  };

  const applyRichTextColor = (color: string) => {
    const normalizedColor = normalizeCssColor(color);

    if (!normalizedColor) {
      return;
    }

    setSelectedTextColor(normalizedColor);
    setHexSourceValue(normalizedColor);
    applyRichInlineStyle({ color: normalizedColor }, '文字');
  };

  const handleHexSourceChange = (nextValue: string) => {
    const normalizedInput = nextValue.toUpperCase();
    setHexSourceValue(normalizedInput);

    if (/^#[0-9A-F]{6}$/.test(normalizedInput)) {
      setSelectedTextColor(normalizedInput);
    }
  };

  const applyHexSourceColor = () => {
    if (/^#[0-9A-F]{6}$/.test(hexSourceValue)) {
      applyRichTextColor(hexSourceValue);
    }
  };

  const toggleColorPicker = () => {
    saveSelection();
    setActivePopover(null);
    setIsColorPickerOpen((open) => !open);
  };

  const saveSelection = () => {
    if (isSourceMode) {
      if (sourceRef.current) {
        sourceSelectionRef.current = {
          end: sourceRef.current.selectionEnd,
          start: sourceRef.current.selectionStart,
        };
      }
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (editorRef.current?.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  const restoreRichSelection = () => {
    if (!savedRangeRef.current) {
      return;
    }

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(savedRangeRef.current);
  };

  const getCurrentSelectionText = () => {
    if (isSourceMode) {
      const selection = sourceSelectionRef.current;

      if (!selection) {
        return '';
      }

      return value.content.slice(selection.start, selection.end).trim();
    }

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return '';
    }

    const range = selection.getRangeAt(0);

    if (!editorRef.current?.contains(range.commonAncestorContainer)) {
      return '';
    }

    return selection.toString().trim();
  };

  const openPopover = (popover: Exclude<EditorPopover, null>) => {
    saveSelection();
    setIsColorPickerOpen(false);
    setPopoverTextValue(popover === 'link' ? getCurrentSelectionText() : '');
    setPopoverValue('');
    setActivePopover(popover);
  };

  const closePopover = () => {
    setActivePopover(null);
    setPopoverTextValue('');
    setPopoverValue('');
  };

  const handlePopoverSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activePopover) {
      return;
    }

    if (activePopover === 'link') {
      const linkText = popoverTextValue.trim();
      const linkHref = popoverValue.trim();

      if (!linkText || !linkHref) {
        return;
      }

      if (isMarkdownMode) {
        replaceSourceSelection(`[${escapeMarkdownLinkText(linkText)}](${normalizeUrl(linkHref)})`);
      } else if (isHtmlMode) {
        replaceSourceSelection(
          `<a href="${escapeAttribute(safeUrl(linkHref))}" target="_blank" rel="noreferrer">${escapeHtml(linkText)}</a>`,
        );
      } else {
        restoreRichSelection();
        insertRichHtml(
          `<a href="${escapeAttribute(safeUrl(linkHref))}" target="_blank" rel="noreferrer">${escapeHtml(linkText)}</a>`,
        );
      }
    } else if (activePopover === 'image') {
      const submittedValue = popoverValue.trim();
      if (!submittedValue) {
        return;
      }

      if (isMarkdownMode) {
        wrapSourceSelection('![', `](${normalizeUrl(submittedValue)})`, '图片说明');
      } else if (isHtmlMode) {
        replaceSourceSelection(`<img src="${escapeAttribute(safeUrl(submittedValue))}" alt="">`);
      } else {
        restoreRichSelection();
        insertRichImage(normalizeUrl(submittedValue), '');
      }
    } else if (activePopover === 'mention') {
      const submittedValue = popoverValue.trim();
      if (!submittedValue) {
        return;
      }

      const mention = `[at]${submittedValue}[/at]`;
      if (isMarkdownMode) {
        replaceSourceSelection(mention);
      } else if (isHtmlMode) {
        const username = escapeHtml(submittedValue);
        const profileHref = getPublicProfileAppPath(submittedValue);
        replaceSourceSelection(`<a href="${escapeAttribute(profileHref)}">@${username}</a>`);
      } else {
        restoreRichSelection();
        insertRichHtml(mention);
      }
    } else if (activePopover === 'quote') {
      const submittedValue = popoverValue.trim();
      if (!submittedValue) {
        return;
      }

      if (isHtmlMode) {
        wrapSourceSelection(
          `<blockquote class="forum-quote" data-user="${escapeAttribute(submittedValue)}">`,
          '</blockquote>',
          '引用内容',
        );
      } else {
        restoreRichSelection();
        insertRichHtml(`[quote=${submittedValue}]引用内容[/quote]`);
      }
    }

    savedRangeRef.current = null;
    closePopover();
  };

  const getSourceSelection = () => {
    const textarea = sourceRef.current;
    if (!textarea) {
      return null;
    }

    const start = sourceSelectionRef.current?.start ?? textarea.selectionStart;
    const end = sourceSelectionRef.current?.end ?? textarea.selectionEnd;

    return {
      end,
      selectedText: value.content.slice(start, end),
      start,
      textarea,
    };
  };

  const replaceSourceRange = (
    range: NonNullable<ReturnType<typeof getSourceSelection>>,
    replacement: string,
    nextSelectionStart = range.start + replacement.length,
    nextSelectionEnd = nextSelectionStart,
  ) => {
    const nextContent = `${value.content.slice(0, range.start)}${replacement}${value.content.slice(range.end)}`;
    sourceSelectionRef.current = null;
    updateContent(nextContent);
    window.requestAnimationFrame(() => {
      range.textarea.focus();
      range.textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd);
    });
  };

  const wrapSourceSelection = (prefix: string, suffix: string, fallback = '') => {
    const range = getSourceSelection();
    if (!range) {
      return;
    }

    const selectedText = range.selectedText || fallback;
    const replacement = `${prefix}${selectedText}${suffix}`;
    replaceSourceRange(
      range,
      replacement,
      range.start + prefix.length,
      range.start + prefix.length + selectedText.length,
    );
  };

  const replaceSourceSelection = (replacement: string) => {
    const range = getSourceSelection();
    if (!range) {
      return;
    }

    replaceSourceRange(range, replacement);
  };

  const insertSourceBlock = (block: string) => {
    const range = getSourceSelection();
    if (!range) {
      return;
    }

    const before = value.content.slice(0, range.start);
    const after = value.content.slice(range.end);
    const prefix = before.trim().length === 0 || before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
    const suffix = after.trim().length === 0 || after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n';
    const replacement = `${prefix}${block}${suffix}`;

    replaceSourceRange(range, replacement);
  };

  const insertHorizontalRule = () => {
    setActivePopover(null);
    setIsColorPickerOpen(false);

    if (isMarkdownMode) {
      insertSourceBlock('---');
      return;
    }

    if (isHtmlMode) {
      insertSourceBlock('<hr>');
      return;
    }

    insertRichHtml('<hr><p><br></p>');
  };

  const handleMarkdownSourceScroll = () => {
    syncSourceLineNumbersScroll();
  };

  const handleHtmlSourceScroll = () => {
    if (!sourceRef.current || !htmlHighlightRef.current) {
      syncSourceLineNumbersScroll();
      return;
    }

    htmlHighlightRef.current.scrollLeft = sourceRef.current.scrollLeft;
    htmlHighlightRef.current.scrollTop = sourceRef.current.scrollTop;
    syncSourceLineNumbersScroll();
  };

  const handleToolbarMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const renderSourceLineNumbers = (variant: 'code' | 'markdown') => {
    if (!shouldShowSourceLineNumbers) {
      return null;
    }

    const className =
      variant === 'code'
        ? 'capubbs-source-code-line-numbers'
        : 'px-2 py-3 text-right font-mono text-[0.72rem] leading-6';

    return (
      <div
        ref={sourceLineNumbersRef}
        aria-hidden="true"
        className={`shrink-0 select-none overflow-hidden border-r border-zinc-200/80 bg-zinc-50/80 text-zinc-400 dark:border-white/10 dark:bg-white/[0.035] dark:text-zinc-500 ${className}`}
        style={{ minWidth: sourceLineNumberColumnWidth }}
      >
        {sourceLineNumbers.map((lineNumber) => (
          <span key={lineNumber} className="block">
            {lineNumber}
          </span>
        ))}
      </div>
    );
  };

  const popoverConfig = getPopoverConfig(activePopover);

  return (
    <>
    <section
      ref={editorShellRef}
      className="capubbs-rich-text-editor relative overflow-hidden rounded-[2px] border border-zinc-200 bg-white/70 shadow-sm dark:border-white/10 dark:bg-white/[0.05]"
      data-auto-height={isAutoHeightEnabled ? 'true' : 'false'}
    >
      <div className="bg-white/70 dark:bg-white/[0.04]">
        {!isSourceMode ? (
          <div className="capubbs-rich-toolbar overflow-x-auto border-b border-zinc-200/80 px-1.5 py-1 dark:border-white/10">
            <div className="flex min-w-max flex-nowrap items-center gap-px">
              <ToolbarButton label="加粗" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('bold')}>
                <Bold size={14} />
              </ToolbarButton>
              <ToolbarButton label="斜体" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('italic')}>
                <Italic size={14} />
              </ToolbarButton>
              <ToolbarButton label="下划线" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('underline')}>
                <Underline size={14} />
              </ToolbarButton>
              <ToolbarButton label="删除线" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('strikeThrough')}>
                <Strikethrough size={14} />
              </ToolbarButton>

              <ToolbarDivider />

              <label className="flex h-7 items-center rounded-[var(--control-radius)] border border-zinc-200 bg-white px-1 dark:border-white/10 dark:bg-zinc-950">
                <span className="sr-only">字体</span>
                <select
                  value={fontSelectValue}
                  onMouseDown={saveSelection}
                  onFocus={saveSelection}
                  onChange={handleRichFontChange}
                  className="h-6 w-[5.25rem] border-0 bg-transparent px-0 text-[0.68rem] font-medium text-zinc-700 outline-none dark:text-zinc-200"
                  aria-label="字体"
                >
                  <option value="">默认</option>
                  {richTextFontOptions.map((fontOption) => (
                    <option key={fontOption.value} value={fontOption.value}>
                      {fontOption.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex h-7 items-center rounded-[var(--control-radius)] border border-zinc-200 bg-white px-1 dark:border-white/10 dark:bg-zinc-950">
                <span className="sr-only">字号</span>
                <select
                  value={fontSizeSelectValue}
                  onMouseDown={saveSelection}
                  onFocus={saveSelection}
                  onChange={handleRichFontSizeChange}
                  className="h-6 w-11 border-0 bg-transparent px-0 text-[0.68rem] font-medium text-zinc-700 outline-none dark:text-zinc-200"
                  aria-label="字号"
                >
                  {richTextFontSizeOptions.map((fontSizeOption) => (
                    <option key={fontSizeOption.value} value={fontSizeOption.value}>
                      {fontSizeOption.label}
                    </option>
                  ))}
                </select>
              </label>

              <ToolbarDivider />

              <ToolbarButton label="上标" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('superscript')}>
                <Superscript size={14} />
              </ToolbarButton>
              <ToolbarButton label="下标" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('subscript')}>
                <Subscript size={14} />
              </ToolbarButton>
              <ToolbarButton label="标题" onMouseDown={handleToolbarMouseDown} onClick={() => wrapRichSelectionWithTag('h2', '标题')}>
                <Heading1 size={14} />
              </ToolbarButton>
              <ToolbarButton label="引用" onMouseDown={handleToolbarMouseDown} onClick={() => wrapRichSelectionWithTag('blockquote', '引用内容', 'forum-quote')}>
                <MessageSquareQuote size={14} />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton label="左对齐" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('justifyLeft')}>
                <AlignLeft size={14} />
              </ToolbarButton>
              <ToolbarButton label="居中" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('justifyCenter')}>
                <AlignCenter size={14} />
              </ToolbarButton>
              <ToolbarButton label="右对齐" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('justifyRight')}>
                <AlignRight size={14} />
              </ToolbarButton>
              <ToolbarButton label="两端对齐" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('justifyFull')}>
                <AlignJustify size={14} />
              </ToolbarButton>
              <ToolbarButton label="无序列表" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('insertUnorderedList')}>
                <List size={14} />
              </ToolbarButton>
              <ToolbarButton label="有序列表" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('insertOrderedList')}>
                <ListOrdered size={14} />
              </ToolbarButton>
              <ToolbarButton label="增加缩进" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('indent')}>
                <IndentIncrease size={14} />
              </ToolbarButton>
              <ToolbarButton label="减少缩进" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('outdent')}>
                <IndentDecrease size={14} />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton label="插入链接" onMouseDown={handleToolbarMouseDown} onClick={() => openPopover('link')}>
                <Link2 size={14} />
              </ToolbarButton>
              <ToolbarButton label="插入图片" onMouseDown={handleToolbarMouseDown} onClick={() => openPopover('image')}>
                <ImageIcon size={14} />
              </ToolbarButton>
              <ToolbarButton label="@ 用户" onMouseDown={handleToolbarMouseDown} onClick={() => openPopover('mention')}>
                <AtSign size={14} />
              </ToolbarButton>
              <ToolbarButton label="分隔线" onMouseDown={handleToolbarMouseDown} onClick={insertHorizontalRule}>
                <Minus size={14} />
              </ToolbarButton>
              <ToolbarButton label="清除格式" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('removeFormat')}>
                <Eraser size={14} />
              </ToolbarButton>

              <ToolbarDivider />

              <button
                type="button"
                onMouseDown={(event) => {
                  handleToolbarMouseDown(event);
                  saveSelection();
                }}
                onClick={toggleColorPicker}
                className={`relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--control-radius)] text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white ${
                  isColorPickerOpen ? 'bg-zinc-100 text-zinc-950 dark:bg-white/10 dark:text-white' : ''
                }`}
                aria-label="文字颜色"
                title="文字颜色"
              >
                <Palette size={14} />
                <span
                  className="pointer-events-none absolute inset-x-1 bottom-0.5 h-0.5 rounded-full"
                  style={{ backgroundColor: normalizeCssColor(selectedTextColor) ?? defaultTextColor }}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        ) : null}

        {isColorPickerOpen && !isSourceMode ? (
          <div className="capubbs-editor-color-panel flex flex-wrap items-end gap-2 border-b border-zinc-200/80 px-2 py-2 dark:border-white/10">
            <label className="grid gap-1 text-[0.68rem] font-semibold text-zinc-500 dark:text-zinc-400">
              取色
              <input
                type="color"
                value={normalizeCssColor(selectedTextColor) ?? defaultTextColor}
                onMouseDown={saveSelection}
                onChange={(event) => {
                  const color = event.target.value.toUpperCase();
                  setSelectedTextColor(color);
                  setHexSourceValue(color);
                }}
                className="h-8 w-10 cursor-pointer border border-zinc-200 bg-white p-1 dark:border-white/10 dark:bg-zinc-950"
                aria-label="选择文字颜色"
              />
            </label>
            <label className="grid min-w-[10rem] flex-1 gap-1 text-[0.68rem] font-semibold text-zinc-500 dark:text-zinc-400">
              HEX 色值
              <input
                value={hexSourceValue}
                onChange={(event) => handleHexSourceChange(event.target.value)}
                maxLength={7}
                pattern="#[0-9A-Fa-f]{6}"
                placeholder="#174F38"
                spellCheck={false}
                className="h-8 border border-zinc-200 bg-white px-2 font-mono text-xs font-medium uppercase text-zinc-800 outline-none transition focus:border-emerald-700/60 focus:ring-2 focus:ring-emerald-700/10 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100"
                aria-label="六位十六进制颜色"
              />
            </label>
            <button
              type="button"
              onMouseDown={handleToolbarMouseDown}
              onClick={applyHexSourceColor}
              disabled={!/^#[0-9A-F]{6}$/.test(hexSourceValue)}
              className="h-8 rounded-[var(--control-radius)] bg-emerald-800 px-3 text-xs font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              应用
            </button>
          </div>
        ) : null}

        {popoverConfig ? (
          <form
            onSubmit={handlePopoverSubmit}
            className="flex flex-wrap items-center gap-2 border-t border-zinc-200/80 px-2 py-2 dark:border-white/10"
          >
            {activePopover === 'link' ? (
              <>
                <label className="min-w-[10rem] flex-1">
                  <span className="sr-only">链接文本</span>
                  <input
                    autoFocus
                    value={popoverTextValue}
                    onChange={(event) => setPopoverTextValue(event.target.value)}
                    placeholder="链接文本"
                    className="h-9 w-full rounded-[1px] border border-zinc-200 bg-white/80 px-3 text-sm font-semibold text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-[#174f38] focus:ring-2 focus:ring-[#174f38] dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-zinc-500"
                  />
                </label>
                <label className="min-w-[12rem] flex-[1.4]">
                  <span className="sr-only">链接地址</span>
                  <input
                    value={popoverValue}
                    onChange={(event) => setPopoverValue(event.target.value)}
                    placeholder="链接地址"
                    className="h-9 w-full rounded-[1px] border border-zinc-200 bg-white/80 px-3 text-sm font-semibold text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-[#174f38] focus:ring-2 focus:ring-[#174f38] dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-zinc-500"
                  />
                </label>
              </>
            ) : (
              <label className="min-w-0 flex-1">
                <span className="sr-only">{popoverConfig.label}</span>
                <input
                  autoFocus
                  value={popoverValue}
                  onChange={(event) => setPopoverValue(event.target.value)}
                  placeholder={popoverConfig.placeholder}
                  className="h-9 w-full rounded-[1px] border border-zinc-200 bg-white/80 px-3 text-sm font-semibold text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-[#174f38] focus:ring-2 focus:ring-[#174f38] dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-zinc-500"
                />
              </label>
            )}
            <button
              type="submit"
              className="h-9 rounded-[1px] bg-[#174f38] px-3 text-sm font-bold text-white transition hover:bg-[#123d2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] dark:bg-emerald-200 dark:text-zinc-950 dark:hover:bg-emerald-100"
            >
              插入
            </button>
            <button
              type="button"
              onClick={closePopover}
              className="h-9 rounded-[1px] border border-zinc-200 bg-white/70 px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]"
            >
              取消
            </button>
          </form>
        ) : null}
      </div>

      {isMarkdownMode ? (
        <div key="markdown-editor-pane" className={splitPaneClassName} data-editor-mode="markdown">
          <div className={`${splitPaneChildClassName} flex overflow-hidden bg-white/45 dark:bg-white/[0.03]`}>
            {renderSourceLineNumbers('markdown')}
            <textarea
              ref={sourceRef}
              aria-label={ariaLabel}
              value={value.content}
              placeholder={placeholder}
              wrap={sourceTextareaWrap}
              onChange={(event) => updateContent(event.target.value)}
              onKeyDown={handleEditorKeyDown}
              onPaste={handleEditorPaste}
              onScroll={handleMarkdownSourceScroll}
              className={`min-w-0 flex-1 resize-none border-0 bg-transparent px-3 py-3 text-sm leading-6 text-zinc-800 outline-none placeholder:text-zinc-400 focus:ring-0 dark:text-white dark:placeholder:text-zinc-500 ${isAutoHeightEnabled ? 'min-h-[50vh]' : 'min-h-0'} ${markdownSourceOverflowClassName}`}
            />
          </div>
          <div
            aria-label="Markdown预览"
            className={`capubbs-editor-prose ${splitPaneChildClassName} bg-zinc-50/70 px-3 py-3 text-sm leading-6 text-zinc-800 dark:bg-white/[0.035] dark:text-zinc-100 ${splitPaneDividerClassName} ${isAutoHeightEnabled ? 'overflow-visible' : 'overflow-y-auto'}`}
            dangerouslySetInnerHTML={{ __html: markdownPreview }}
          />
        </div>
      ) : isHtmlMode ? (
        <div key="html-editor-pane" className={splitPaneClassName} data-editor-mode="html">
          <div className={htmlSourcePaneClassName}>
            <div className="flex h-9 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-3 text-xs font-bold text-zinc-500 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300">
              <span>HTML源码</span>
              <span>{value.content.length} 字符</span>
            </div>
            <div
              className={`capubbs-code-shell flex ${isAutoHeightEnabled ? 'min-h-[calc(50vh-2.25rem)]' : 'min-h-0 flex-1'}`}
              data-source-line-numbers={shouldShowSourceLineNumbers ? 'true' : undefined}
            >
              {renderSourceLineNumbers('code')}
              <div className="relative min-w-0 flex-1">
                <pre
                  ref={htmlHighlightRef}
                  aria-hidden="true"
                  className="capubbs-code-layer pointer-events-none absolute inset-0"
                >
                  <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
                </pre>
                <textarea
                  ref={sourceRef}
                  aria-label={ariaLabel}
                  value={value.content}
                  placeholder="<article>...</article>"
                  spellCheck={false}
                  wrap={sourceTextareaWrap}
                  onChange={(event) => updateContent(event.target.value)}
                  onKeyDown={handleEditorKeyDown}
                  onPaste={handleEditorPaste}
                  onScroll={handleHtmlSourceScroll}
                  className={`capubbs-code-editor relative z-10 min-h-0 w-full resize-none border-0 bg-transparent outline-none focus:ring-0 ${htmlSourceOverflowClassName}`}
                />
              </div>
            </div>
          </div>
          <div className={`card-surface ${splitPaneChildClassName} flex flex-col`}>
            <div className="flex h-9 items-center justify-between border-b border-zinc-200/80 px-3 text-xs font-bold text-zinc-500 dark:border-white/10 dark:text-zinc-300">
              <span>HTML预览</span>
            </div>
            <iframe
              title="HTML预览"
              sandbox=""
              srcDoc={htmlPreviewDocument}
              className="capubbs-html-preview-frame min-h-0 w-full flex-1 border-0"
            />
          </div>
        </div>
      ) : (
        <div
          key="rich-editor-pane"
          ref={editorRef}
          role="textbox"
          data-editor-mode="rich"
          aria-label={ariaLabel}
          aria-multiline="true"
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onClick={handleRichEditorClick}
          onInput={(event) => {
            updateContent(event.currentTarget.innerHTML);
            window.requestAnimationFrame(updateRichImageResizeHandle);
          }}
          onBlur={(event) => updateContent(event.currentTarget.innerHTML)}
          onKeyDown={handleRichEditorKeyDown}
          onPaste={handleEditorPaste}
          onScroll={updateRichImageResizeHandle}
          className={`capubbs-editor-prose capubbs-rich-editor-input px-3 py-3 text-sm leading-6 text-zinc-800 outline-none dark:text-zinc-100 ${isAutoHeightEnabled ? 'min-h-[50vh] overflow-visible' : 'h-[50vh] overflow-y-auto'}`}
          style={{ fontFamily: defaultRichTextFont }}
        />
      )}

      {richImageResizeHandle && !isSourceMode ? (
        <button
          type="button"
          aria-label="调整图片大小"
          title="调整图片大小"
          onPointerCancel={finishRichImageResize}
          onPointerDown={handleRichImageResizePointerDown}
          onPointerMove={handleRichImageResizePointerMove}
          onPointerUp={finishRichImageResize}
          className="absolute z-20 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize items-center justify-center rounded-[1px] border border-[#174f38] bg-white shadow-md transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] dark:border-emerald-200 dark:bg-zinc-950"
          style={{
            left: `${richImageResizeHandle.left}px`,
            top: `${richImageResizeHandle.top}px`,
          }}
        >
          <span className="h-2.5 w-2.5 border-b-2 border-r-2 border-[#174f38] dark:border-emerald-200" />
        </button>
      ) : null}

      <footer className="capubbs-editor-statusbar flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200/80 px-3 py-2 text-xs font-semibold text-zinc-500 dark:border-white/10 dark:text-zinc-400">
        <span>{plainTextLength(value.content, value.mode)} 字</span>
        <div className="capubbs-editor-statusbar-controls flex flex-wrap items-center gap-3">
          <label className="capubbs-editor-toggle inline-flex h-7 items-center gap-1.5 rounded-[1px] border border-zinc-200 bg-white/60 px-2 text-[0.72rem] font-bold text-zinc-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300">
            <input
              type="checkbox"
              checked={isAutoHeightEnabled}
              onChange={(event) => setIsAutoHeightEnabled(event.target.checked)}
              className="h-3.5 w-3.5 accent-[#174f38]"
            />
            自适应高度
          </label>
          {isSourceMode ? (
            <label className="capubbs-editor-toggle inline-flex h-7 items-center gap-1.5 rounded-[1px] border border-zinc-200 bg-white/60 px-2 text-[0.72rem] font-bold text-zinc-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300">
              <input
                type="checkbox"
                checked={showSourceLineNumbers}
                onChange={(event) => setShowSourceLineNumbers(event.target.checked)}
                className="h-3.5 w-3.5 accent-[#174f38]"
              />
              显示行号
            </label>
          ) : null}
          <div aria-label="编辑模式" className="inline-flex shrink-0 items-center gap-1" role="group">
            {editorModeGroups.map((modeGroup) => (
              <div
                key={modeGroup.map((modeOption) => modeOption.mode).join('-')}
                className="capubbs-editor-mode-tabs inline-flex h-7 items-center rounded-[1px] border border-zinc-200 bg-white/60 p-0.5 text-[0.72rem] font-bold dark:border-white/10 dark:bg-white/[0.06]"
              >
                {modeGroup.map((modeOption) => {
                  const isActive = modeOption.mode === value.mode;
                  const isLocked = hasEditorContent
                    && (isMarkdownMode !== (modeOption.mode === 'markdown'));

                  return (
                    <button
                      key={modeOption.mode}
                      type="button"
                      aria-pressed={isActive}
                      disabled={isLocked}
                      onClick={() => updateMode(modeOption.mode)}
                      className={`capubbs-editor-mode-tab h-6 rounded-[1px] px-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] ${
                        isActive
                          ? 'bg-[#174f38] text-white shadow-sm dark:bg-emerald-200 dark:text-zinc-950'
                          : isLocked
                            ? 'cursor-not-allowed text-zinc-400 opacity-50 dark:text-zinc-500'
                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-[#174f38] dark:text-zinc-300 dark:hover:bg-white/[0.08] dark:hover:text-white'
                      }`}
                    >
                      {modeOption.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </section>
    <PastedImageDialog
      image={pastedImage}
      onCancel={closePastedImageDialog}
      onCompress={compressPastedImage}
      onUpload={uploadAndInsertPastedImage}
    />
    </>
  );
}

function ToolbarButton({
  children,
  label,
  onClick,
  onMouseDown,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  onMouseDown: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={onMouseDown}
      onClick={onClick}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--control-radius)] border border-transparent text-[#174f38] transition hover:border-zinc-200 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] dark:text-white dark:hover:border-white/10 dark:hover:bg-white/[0.1]"
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-0.5 h-4 w-px shrink-0 bg-zinc-200 dark:bg-white/10" />;
}

function getPopoverConfig(popover: EditorPopover) {
  if (popover === 'image') {
    return {
      label: '图片地址',
      placeholder: '图片地址',
    };
  }

  if (popover === 'link') {
    return {
      label: '链接地址',
      placeholder: '链接地址',
    };
  }

  if (popover === 'mention') {
    return {
      label: '用户 ID',
      placeholder: '用户 ID',
    };
  }

  if (popover === 'quote') {
    return {
      label: '引用用户',
      placeholder: '引用用户',
    };
  }

  return null;
}

function convertEditorContent(content: string, from: RichTextEditorMode, to: RichTextEditorMode) {
  if (from === to) {
    return content;
  }

  if (to === 'rich') {
    return from === 'markdown' ? renderMarkdownToHtml(content) : content;
  }

  if (to === 'markdown') {
    return htmlToMarkdown(content);
  }

  if (from === 'markdown') {
    return formatHtmlForSource(renderMarkdownToHtml(content));
  }

  return formatHtmlForSource(content);
}

function isCrossGroupModeSwitchLocked(value: RichTextEditorValue, nextMode: RichTextEditorMode) {
  const switchesMarkdownGroup = (value.mode === 'markdown') !== (nextMode === 'markdown');
  return switchesMarkdownGroup && hasModeSwitchingContent(value);
}

function isSelectionInsideStructuredRichBlock(editor: HTMLElement, node: Node) {
  let element = node instanceof Element ? node : node.parentElement;

  while (element && element !== editor) {
    if (/^(?:BLOCKQUOTE|H[1-6]|LI|PRE|T[DH])$/.test(element.tagName)) {
      return true;
    }

    element = element.parentElement;
  }

  return false;
}

function hasModeSwitchingContent(value: RichTextEditorValue) {
  if (value.mode !== 'rich') {
    return value.content.trim().length > 0;
  }

  const container = document.createElement('div');
  container.innerHTML = value.content;
  return (
    (container.textContent ?? '').replace(/\u00a0/g, ' ').trim().length > 0
    || Boolean(container.querySelector('img, hr'))
  );
}

function buildHtmlPreviewDocument(html: string, isDarkTheme: boolean, embedded = false) {
  const renderedHtml = translateLegacyBbcode(html);
  const theme = isDarkTheme
    ? {
        background: '#171d19',
        blockquoteBorder: 'rgb(217 249 157 / 0.45)',
        blockquoteColor: 'rgb(255 255 255 / 0.74)',
        codeBackground: 'rgb(255 255 255 / 0.1)',
        codeColor: 'rgb(255 255 255 / 0.9)',
        color: '#e4e4e7',
        colorScheme: 'dark',
        headingColor: '#ffffff',
        linkColor: '#d9f99d',
        preBackground: '#0f172a',
        preBorder: 'rgb(255 255 255 / 0.14)',
        preColor: '#e5e7eb',
        tableBorder: 'rgb(255 255 255 / 0.14)',
      }
    : {
        background: '#fffefa',
        blockquoteBorder: 'rgb(56 87 114 / 0.45)',
        blockquoteColor: '#875a41',
        codeBackground: 'rgb(228 228 231 / 0.8)',
        codeColor: '#3f3f46',
        color: '#3f3f46',
        colorScheme: 'light',
        headingColor: '#174f38',
        linkColor: '#174f38',
        preBackground: '#f6f8fa',
        preBorder: '#d0d7de',
        preColor: '#24292f',
        tableBorder: '#d4d4d8',
      };
  const previewHead = `
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="script-src 'none'; object-src 'none'">
  <base target="_blank">
  <style>
    :root {
      color-scheme: ${theme.colorScheme};
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      --capubbs-preview-bg: ${theme.background};
      --capubbs-preview-text: ${theme.color};
      --capubbs-preview-heading: ${theme.headingColor};
      --capubbs-preview-link: ${theme.linkColor};
      --capubbs-preview-quote-border: ${theme.blockquoteBorder};
      --capubbs-preview-quote-text: ${theme.blockquoteColor};
      --capubbs-preview-code-bg: ${theme.codeBackground};
      --capubbs-preview-code-text: ${theme.codeColor};
      --capubbs-preview-pre-bg: ${theme.preBackground};
      --capubbs-preview-pre-border: ${theme.preBorder};
      --capubbs-preview-pre-text: ${theme.preColor};
      --capubbs-preview-table-border: ${theme.tableBorder};
    }

    html {
      background: var(--capubbs-preview-bg);
    }

    body {
      background: var(--capubbs-preview-bg);
      color: var(--capubbs-preview-text);
      font-size: 14px;
      line-height: 1.7;
      margin: 0;
      padding: ${embedded ? '0' : '16px'};
      word-break: break-word;
    }

    @media (min-width: 640px) {
      body {
        font-size: 15px;
      }
    }

    body > :first-child {
      margin-top: 0;
    }

    body > :last-child {
      margin-bottom: 0;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: var(--capubbs-preview-heading);
      font-weight: 800;
      line-height: 1.35;
      margin: 0.9rem 0 0.45rem;
    }

    a {
      color: var(--capubbs-preview-link);
      font-weight: 700;
      text-decoration: underline;
      text-underline-offset: 0.16em;
    }

    blockquote {
      border: 0;
      color: inherit;
      margin: 12px 0 12px 2em;
      padding: 0;
    }

    blockquote.forum-quote,
    blockquote.forum-legacy-quote,
    blockquote.capubbs-floor-quote {
      border-left: 3px solid var(--capubbs-preview-quote-border);
      color: var(--capubbs-preview-quote-text);
      margin: 12px 0;
      padding: 2px 0 2px 12px;
    }

    blockquote.capubbs-floor-quote {
      color: inherit;
    }

    hr {
      border: 0;
      border-top: 1px solid ${isDarkTheme ? 'rgb(255 255 255 / 0.18)' : 'rgb(56 87 114 / 0.24)'};
      margin: 16px 0;
    }

    .capubbs-floor-quote-content {
      color: ${isDarkTheme ? 'rgb(212 212 216 / 0.78)' : '#71717a'};
      font-size: 0.875em;
      line-height: 1.65;
      margin-bottom: 8px;
    }

    .capubbs-floor-quote-meta {
      align-items: center;
      color: ${isDarkTheme ? '#fff' : '#18181b'};
      display: flex;
      font-size: 0.875em;
      font-weight: 600;
      gap: 12px;
      justify-content: space-between;
      margin: 9px 0 0;
    }

    .capubbs-floor-quote-jump {
      margin-left: auto;
      white-space: nowrap;
    }

    code,
    pre {
      font-family: "SFMono-Regular", "Cascadia Code", "Fira Code", Consolas, "Liberation Mono", monospace;
    }

    code {
      background: var(--capubbs-preview-code-bg);
      border-radius: 4px;
      color: var(--capubbs-preview-code-text);
      font-size: 0.92em;
      padding: 1px 4px;
    }

    pre {
      background: var(--capubbs-preview-pre-bg);
      border: 1px solid var(--capubbs-preview-pre-border);
      border-radius: 8px;
      color: var(--capubbs-preview-pre-text);
      line-height: 1.65;
      margin: 12px 0;
      overflow: auto;
      padding: 12px;
      white-space: pre-wrap;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }

    img {
      border-radius: 6px;
      display: inline-block;
      max-width: 100%;
      vertical-align: middle;
    }

    table {
      border-collapse: collapse;
      margin: 12px 0;
      width: 100%;
    }

    th,
    td {
      border: 1px solid var(--capubbs-preview-table-border);
      padding: 6px 8px;
      text-align: left;
    }
  </style>
`;
  const trimmedHtml = renderedHtml.trim();

  if (/<html[\s>]/i.test(trimmedHtml)) {
    if (/<head[\s>]/i.test(trimmedHtml)) {
      return trimmedHtml.replace(/<head([^>]*)>/i, `<head$1>${previewHead}`);
    }

    return trimmedHtml.replace(/<html([^>]*)>/i, `<html$1><head>${previewHead}</head>`);
  }

  return `<!doctype html>
<html>
<head>${previewHead}</head>
<body>${renderedHtml}</body>
</html>`;
}

function highlightHtmlSource(source: string) {
  if (!source) {
    return '';
  }

  const tokenPattern = /(<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\/?[a-zA-Z][^<>]*?>|<!doctype[^>]*>|&[a-zA-Z0-9#]+;)/gi;
  let highlighted = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(source)) !== null) {
    highlighted += escapeHtml(source.slice(lastIndex, match.index));
    highlighted += highlightHtmlToken(match[0]);
    lastIndex = match.index + match[0].length;
  }

  highlighted += escapeHtml(source.slice(lastIndex));

  return highlighted;
}

function highlightHtmlToken(token: string) {
  if (token.startsWith('<!--') || token.startsWith('<![CDATA[')) {
    return `<span class="capubbs-code-comment">${escapeHtml(token)}</span>`;
  }

  if (/^&[a-zA-Z0-9#]+;$/.test(token)) {
    return `<span class="capubbs-code-entity">${escapeHtml(token)}</span>`;
  }

  const escapedToken = escapeHtml(token);
  const tagMatch = escapedToken.match(/^(&lt;!?\/?)([^\s&/]+)([\s\S]*?)((?:\/)?&gt;)$/i);
  if (!tagMatch) {
    return escapedToken;
  }

  const [, open, tagName, attributes, close] = tagMatch;

  return [
    `<span class="capubbs-code-punctuation">${open}</span>`,
    `<span class="capubbs-code-tag">${tagName}</span>`,
    highlightEscapedHtmlAttributes(attributes),
    `<span class="capubbs-code-punctuation">${close}</span>`,
  ].join('');
}

function highlightEscapedHtmlAttributes(attributes: string) {
  return attributes.replace(
    /([:\w.-]+)(\s*=\s*)(&quot;[\s\S]*?&quot;|&#039;[\s\S]*?&#039;|[^\s&]+)/g,
    (_match, name: string, equals: string, attributeValue: string) => (
      `<span class="capubbs-code-attr">${name}</span>` +
      `<span class="capubbs-code-punctuation">${equals}</span>` +
      `<span class="capubbs-code-string">${attributeValue}</span>`
    ),
  );
}

function formatHtmlForSource(html: string) {
  const trimmedHtml = html.trim();
  if (!trimmedHtml) {
    return '';
  }

  const tokens = trimmedHtml.match(/<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<!doctype[^>]*>|<\/?[a-zA-Z][^<>]*?>|[^<]+/gi);
  if (!tokens) {
    return trimmedHtml;
  }

  let depth = 0;
  const lines: string[] = [];

  tokens.forEach((rawToken) => {
    const token = rawToken.trim();
    if (!token) {
      return;
    }

    const isClosingTag = /^<\//.test(token);
    const isOpeningTag = /^<[a-zA-Z][^>]*>$/.test(token);
    const tagName = token.match(/^<\/?\s*([a-zA-Z0-9:-]+)/)?.[1]?.toLowerCase() ?? '';
    const isVoidTag = htmlVoidTags.has(tagName);
    const isSelfClosing = /\/>$/.test(token);
    const shouldIndentNext = isOpeningTag && !isClosingTag && !isSelfClosing && !isVoidTag;

    if (isClosingTag) {
      depth = Math.max(depth - 1, 0);
    }

    lines.push(`${'  '.repeat(depth)}${token}`);

    if (shouldIndentNext) {
      depth += 1;
    }
  });

  return lines.join('\n');
}

function compactHtmlForStorage(html: string) {
  if (!html.trim()) {
    return '';
  }

  const protectedBlocks: string[] = [];
  const tokenizedHtml = html.replace(
    /<(pre|code|textarea)\b[\s\S]*?<\/\1>/gi,
    (block) => {
      const token = `___CAPUBBS_HTML_BLOCK_${protectedBlocks.length}___`;
      protectedBlocks.push(block);
      return token;
    },
  );

  const compactedHtml = tokenizedHtml
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n+/g, '')
    .trim();

  return protectedBlocks.reduce(
    (content, block, index) => content.replace(`___CAPUBBS_HTML_BLOCK_${index}___`, block.trim()),
    compactedHtml,
  );
}

function renderMarkdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let orderedListItems: string[] = [];
  let quoteLines: string[] = [];
  let codeLines: string[] = [];
  let isCodeBlock = false;

  const flushParagraph = () => {
    if (paragraph.length === 0) {
      return;
    }

    blocks.push(`<p>${renderMarkdownInline(paragraph.join(' '))}</p>`);
    paragraph = [];
  };

  const flushLists = () => {
    if (listItems.length > 0) {
      blocks.push(`<ul>${listItems.map((item) => `<li>${renderMarkdownInline(item)}</li>`).join('')}</ul>`);
      listItems = [];
    }

    if (orderedListItems.length > 0) {
      blocks.push(`<ol>${orderedListItems.map((item) => `<li>${renderMarkdownInline(item)}</li>`).join('')}</ol>`);
      orderedListItems = [];
    }
  };

  const flushQuote = () => {
    if (quoteLines.length === 0) {
      return;
    }

    blocks.push(renderMarkdownQuoteBlock(quoteLines));
    quoteLines = [];
  };

  const flushCodeBlock = () => {
    if (codeLines.length === 0) {
      return;
    }

    blocks.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
    codeLines = [];
  };

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (isCodeBlock) {
        flushCodeBlock();
      } else {
        flushParagraph();
        flushLists();
        flushQuote();
      }

      isCodeBlock = !isCodeBlock;
      continue;
    }

    if (isCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.trim() === '') {
      flushParagraph();
      flushLists();
      flushQuote();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    const horizontalRuleMatch = line.match(/^\s{0,3}(?:-{3,}|\*{3,}|_{3,}|(?:-\s*){3,}|(?:\*\s*){3,}|(?:_\s*){3,})\s*$/);
    const unorderedListMatch = line.match(/^\s*[-*]\s+(.+)$/);
    const orderedListMatch = line.match(/^\s*\d+\.\s+(.+)$/);
    const quoteMatch = line.match(/^\s*>\s?(.*)$/);

    if (headingMatch) {
      flushParagraph();
      flushLists();
      flushQuote();
      const level = Math.min(headingMatch[1].length, 6);
      blocks.push(`<h${level}>${renderMarkdownInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    if (horizontalRuleMatch) {
      flushParagraph();
      flushLists();
      flushQuote();
      blocks.push('<hr>');
      continue;
    }

    if (quoteMatch) {
      flushParagraph();
      flushLists();
      quoteLines.push(quoteMatch[1]);
      continue;
    }

    if (unorderedListMatch) {
      flushParagraph();
      flushQuote();
      listItems.push(unorderedListMatch[1]);
      continue;
    }

    if (orderedListMatch) {
      flushParagraph();
      flushQuote();
      orderedListItems.push(orderedListMatch[1]);
      continue;
    }

    flushLists();
    flushQuote();
    paragraph.push(line.trim());
  }

  if (isCodeBlock) {
    flushCodeBlock();
  }

  flushParagraph();
  flushLists();
  flushQuote();

  return blocks.join('');
}

function renderMarkdownQuoteBlock(quoteLines: string[]) {
  const metaLineIndex = findFloorQuoteMetaLineIndex(quoteLines);

  if (metaLineIndex === -1) {
    return `<blockquote class="forum-quote">${quoteLines.map((line) => `<p>${renderMarkdownInline(line)}</p>`).join('')}</blockquote>`;
  }

  const metaMatch = quoteLines[metaLineIndex].match(markdownFloorQuoteMetaPattern);

  if (!metaMatch) {
    return `<blockquote class="forum-quote">${quoteLines.map((line) => `<p>${renderMarkdownInline(line)}</p>`).join('')}</blockquote>`;
  }

  const quoteContent = quoteLines
    .slice(0, metaLineIndex)
    .filter((line) => line.trim().length > 0)
    .map((line) => `<p class="capubbs-floor-quote-content">${renderMarkdownInline(line)}</p>`)
    .join('');
  const author = unescapeMarkdownLinkText(metaMatch[1]);
  const authorHref = safeUrl(metaMatch[2]);
  const floorHref = safeUrl(metaMatch[3]);

  return [
    '<blockquote class="capubbs-floor-quote">',
    quoteContent,
    `<p class="capubbs-floor-quote-meta"><span>引用自 <a href="${escapeAttribute(authorHref)}" target="_blank" rel="noreferrer">${escapeHtml(author)}</a></span><a class="capubbs-floor-quote-jump" href="${escapeAttribute(floorHref)}" target="_blank" rel="noreferrer">&gt;&gt;</a></p>`,
    '</blockquote>',
  ].join('');
}

function findFloorQuoteMetaLineIndex(quoteLines: string[]) {
  for (let index = quoteLines.length - 1; index >= 0; index -= 1) {
    if (!quoteLines[index].trim()) {
      continue;
    }

    return markdownFloorQuoteMetaPattern.test(quoteLines[index]) ? index : -1;
  }

  return -1;
}

function unescapeMarkdownLinkText(text: string) {
  return text.replace(/\\([\\[\]])/g, '$1');
}

function escapeMarkdownLinkText(text: string) {
  return text.replace(/([\\[\]])/g, '\\$1');
}

function renderMarkdownInline(rawText: string) {
  let html = escapeHtml(rawText);

  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]+)\})?/g,
    (_match, alt: string, url: string, attributes: string | undefined) => {
      const dimensions = parseMarkdownImageDimensions(attributes);

      return `<img src="${escapeAttribute(safeUrl(url))}" alt="${escapeAttribute(alt)}"${buildImageDimensionStyleAttribute(dimensions)}>`;
    },
  );
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, text: string, url: string) => `<a href="${escapeAttribute(safeUrl(url))}" target="_blank" rel="noreferrer">${text}</a>`,
  );
  html = html.replace(/\[at\](.+?)\[\/at\]/g, (_match, username: string) => {
    const safeUsername = escapeHtml(username);
    return `<a href="${escapeAttribute(getPublicProfileAppPath(username))}">@${safeUsername}</a>`;
  });
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  return html;
}

function htmlToMarkdown(html: string) {
  if (!html.trim()) {
    return '';
  }

  const container = document.createElement('div');
  container.innerHTML = html;
  const markdown = Array.from(container.childNodes).map(nodeToMarkdown).join('');

  return markdown.replace(/\n{3,}/g, '\n\n').trim();
}

function nodeToMarkdown(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? '';
    const parentTag = node.parentElement?.tagName.toLowerCase();
    if (parentTag === 'code' || parentTag === 'pre') {
      return text;
    }

    return text.trim() ? text : '';
  }

  if (!(node instanceof HTMLElement)) {
    return '';
  }

  const content = Array.from(node.childNodes).map(nodeToMarkdown).join('');

  switch (node.tagName.toLowerCase()) {
    case 'a':
      return `[${content || node.textContent || '链接'}](${node.getAttribute('href') || '#'})`;
    case 'b':
    case 'strong':
      return `**${content}**`;
    case 'br':
      return '\n';
    case 'blockquote':
      return `${content.split('\n').filter(Boolean).map((line) => `> ${line}`).join('\n')}\n\n`;
    case 'code':
      if (node.parentElement?.tagName.toLowerCase() === 'pre') {
        return content;
      }

      return `\`${content}\``;
    case 'div':
    case 'p':
      return `${content}\n\n`;
    case 'del':
    case 's':
    case 'strike':
      return `~~${content}~~`;
    case 'em':
    case 'i':
      return `_${content}_`;
    case 'h1':
      return `# ${content}\n\n`;
    case 'h2':
      return `## ${content}\n\n`;
    case 'h3':
      return `### ${content}\n\n`;
    case 'h4':
      return `#### ${content}\n\n`;
    case 'h5':
      return `##### ${content}\n\n`;
    case 'h6':
      return `###### ${content}\n\n`;
    case 'hr':
      return '\n---\n\n';
    case 'img':
      return `![${escapeMarkdownLinkText(node.getAttribute('alt') || '图片')}](${node.getAttribute('src') || ''})${formatMarkdownImageDimensions(node)}`;
    case 'li':
      return `- ${content}\n`;
    case 'ol':
      return `\n${Array.from(node.children)
        .filter((child) => child.tagName.toLowerCase() === 'li')
        .map((child, index) => `${index + 1}. ${Array.from(child.childNodes).map(nodeToMarkdown).join('')}`)
        .join('\n')}\n\n`;
    case 'pre':
      return `\n\`\`\`\n${node.textContent ?? ''}\n\`\`\`\n\n`;
    case 'ul':
      return `\n${content}\n`;
    default:
      return content;
  }
}

function plainTextLength(content: string, mode: RichTextEditorMode) {
  if (mode !== 'rich') {
    return content.length;
  }

  const container = document.createElement('div');
  container.innerHTML = content;
  return (container.textContent ?? '').length;
}

function normalizeUrl(url: string) {
  const trimmedUrl = url.trim();

  if (/^(https?:|mailto:|\/|#|data:image\/)/i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}

function safeUrl(url: string) {
  const normalizedUrl = normalizeUrl(url);
  return /^javascript:/i.test(normalizedUrl) ? '#' : normalizedUrl;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttribute(text: string) {
  return escapeHtml(text).replace(/`/g, '&#096;');
}
