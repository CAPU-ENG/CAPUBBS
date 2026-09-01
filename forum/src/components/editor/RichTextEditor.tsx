import { Braces, PanelRightOpen, X } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { getPublicProfileAppPath } from '../../utils/userRoutes';
import { PastedImageDialog } from './PastedImageDialog';
import { GalleryDialog } from './GalleryDialog';
import { HtmlSnippetDialog } from './HtmlSnippetDialog';
import { RichTextEditorControls } from './RichTextEditor.controls';
import { escapeMarkdownLinkText, hasModeSwitchingContent, plainTextLength } from './RichTextEditor.content';
import {
  defaultRichTextFontSize,
  defaultTextColor,
  editorModeGroups,
} from './RichTextEditor.constants';
import { escapeAttribute, escapeHtml, normalizeUrl, safeUrl } from './RichTextEditor.html';
import { useIsDarkTheme, useIsMobileViewport } from './RichTextEditor.hooks';
import { useRichTextEditorHistory } from './RichTextEditor.history';
import {
  createRichTextEditorMediaActions,
  type GalleryDialogState,
} from './RichTextEditor.media';
import { useRichTextEditorSource } from './RichTextEditor.source';
import {
  ensureEditorGalleryEditControls,
  getEditorGalleryAction,
  getEditorGalleryEditTarget,
  getEditorGalleryImageHeight,
  getEditorGalleryResizeTarget,
  moveEditorGallery,
} from './RichTextEditor.gallery';
import { focusRichTextEditorAtEnd } from './RichTextEditor.richText';
import {
  applyRichFirstLineIndent,
  createInactiveRichCommandStates,
  ensureRichParagraphBlocks,
  isRichFirstLineIndentActive,
  isSelectionInsideStructuredRichBlock,
  normalizeRichTypingStylesAfterInput,
  readRecentTextColors,
  readRichCommandStates,
  storeRecentTextColors,
  type RichToggleCommandStates,
} from './RichTextEditor.richDom';
import { createRichTextEditorRichActions } from './RichTextEditor.richActions';
import {
  applyGalleryImageHeight,
  clampImageDimension,
  galleryResizeMaxHeight,
  galleryResizeMinHeight,
  type ActiveGalleryResize,
  type ActiveRichImageResize,
  type RichImageResizeHandle,
} from './RichTextEditor.resize';
import type {
  EditorPopover,
  PastedImageState,
  RichTextEditorValue,
} from './RichTextEditor.types';

export type { RichTextEditorMode, RichTextEditorValue } from './RichTextEditor.types';
export {
  getRichTextEditorHtmlValue,
  getRichTextEditorPreviewDocument,
  getRichTextEditorStorageValue,
  hasRichTextEditorHtmlContent,
} from './RichTextEditor.content';

type RichTextEditorProps = {
  ariaLabel: string;
  focusRequest?: number;
  onChange: (value: RichTextEditorValue) => void;
  placeholder?: string;
  value: RichTextEditorValue;
};

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
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const sourceSelectionRef = useRef<{ end: number; start: number } | null>(null);
  const selectedRichImageRef = useRef<HTMLImageElement | null>(null);
  const activeRichImageResizeRef = useRef<ActiveRichImageResize | null>(null);
  const activeGalleryResizeRef = useRef<ActiveGalleryResize | null>(null);
  const pendingQuoteRef = useRef<HTMLElement | null>(null);
  const pendingQuoteIdRef = useRef(0);
  const [activePopover, setActivePopover] = useState<EditorPopover>(null);
  const [activeRichCommands, setActiveRichCommands] = useState<RichToggleCommandStates>(createInactiveRichCommandStates);
  const [isAutoHeightEnabled, setIsAutoHeightEnabled] = useState(false);
  const [isHtmlPreviewOpen, setIsHtmlPreviewOpen] = useState(true);
  const [isHtmlSnippetDialogOpen, setIsHtmlSnippetDialogOpen] = useState(false);
  const [showSourceLineNumbers, setShowSourceLineNumbers] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [popoverTextValue, setPopoverTextValue] = useState('');
  const [popoverValue, setPopoverValue] = useState('');
  const [fontSelectValue, setFontSelectValue] = useState('');
  const [fontSizeSelectValue, setFontSizeSelectValue] = useState(defaultRichTextFontSize);
  const [headingSelectValue, setHeadingSelectValue] = useState('p');
  const [imageFileError, setImageFileError] = useState('');
  const [galleryDialogState, setGalleryDialogState] = useState<GalleryDialogState | null>(null);
  const [isCheckingImageFile, setIsCheckingImageFile] = useState(false);
  const [pastedImage, setPastedImage] = useState<PastedImageState | null>(null);
  const [recentTextColors, setRecentTextColors] = useState(readRecentTextColors);
  const [selectedTextColor, setSelectedTextColor] = useState(defaultTextColor);
  const [hexSourceValue, setHexSourceValue] = useState(defaultTextColor);
  const [richImageResizeHandle, setRichImageResizeHandle] = useState<RichImageResizeHandle | null>(null);
  const { currentValueRef, handleEditorKeyDown, updateContent, updateMode } = useRichTextEditorHistory({
    editorRef,
    onChange,
    savedRangeRef,
    setActivePopover,
    setIsColorPickerOpen,
    sourceRef,
    sourceSelectionRef,
    value,
  });
  const isDarkTheme = useIsDarkTheme();
  const isMobileViewport = useIsMobileViewport();
  const isMarkdownMode = value.mode === 'markdown';
  const isHtmlMode = value.mode === 'html';
  const isSourceMode = isMarkdownMode || isHtmlMode;
  const hasEditorContent = hasModeSwitchingContent(value);
  const {
    handleHtmlSourceScroll,
    handleMarkdownEditorKeyDown,
    handleMarkdownSourceScroll,
    highlightedHtml,
    htmlPreviewDocument,
    htmlSourceOverflowClassName,
    htmlSourcePaneClassName,
    insertSourceBlock,
    markdownPreview,
    markdownSourceOverflowClassName,
    replaceSourceSelection,
    shouldShowSourceLineNumbers,
    sourceLineNumberColumnWidth,
    sourceLineNumbers,
    sourceTextareaWrap,
    splitPaneChildClassName,
    splitPaneClassName,
    splitPaneDividerClassName,
    wrapSourceSelection,
  } = useRichTextEditorSource({
    handleEditorKeyDown,
    htmlHighlightRef,
    isAutoHeightEnabled,
    isDarkTheme,
    isHtmlPreviewOpen,
    isMobileViewport,
    isSourceMode,
    showSourceLineNumbers,
    sourceLineNumbersRef,
    sourceRef,
    sourceSelectionRef,
    updateContent,
    value,
  });
  useEffect(() => {
    storeRecentTextColors(recentTextColors);
  }, [recentTextColors]);

  useEffect(() => {
    const editor = editorRef.current;
    if (isSourceMode || !editor) {
      return;
    }

    if (editor.innerHTML !== value.content) {
      editor.innerHTML = value.content;
      selectedRichImageRef.current = null;
      setRichImageResizeHandle(null);
    }

    ensureEditorGalleryEditControls(editor);
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
    if (isSourceMode) {
      setActiveRichCommands(createInactiveRichCommandStates());
      return undefined;
    }

    const syncCommandStates = () => {
      const editor = editorRef.current;
      setActiveRichCommands(editor ? readRichCommandStates(editor) : createInactiveRichCommandStates());
    };
    const handleFocusIn = (event: FocusEvent) => {
      const editorShell = editorShellRef.current;
      if (editorShell?.contains(event.target as Node)) {
        syncCommandStates();
      } else {
        setActiveRichCommands(createInactiveRichCommandStates());
      }
    };

    document.addEventListener('selectionchange', syncCommandStates);
    document.addEventListener('focusin', handleFocusIn);
    syncCommandStates();

    return () => {
      document.removeEventListener('selectionchange', syncCommandStates);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [isSourceMode]);

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

  const handleRichEditorKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const editor = event.currentTarget;
    const selection = window.getSelection();
    const galleryToEdit = getEditorGalleryEditTarget(event.target);
    const galleryAction = getEditorGalleryAction(event.target);
    const galleryResize = getEditorGalleryResizeTarget(event.target);

    if (galleryResize && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      const stage = galleryResize.gallery.querySelector<HTMLElement>('.capubbs-gallery-stage');
      const currentHeight = getEditorGalleryImageHeight(galleryResize.gallery)
        ?? stage?.getBoundingClientRect().height
        ?? galleryResizeMinHeight;
      const nextHeight = clampImageDimension(
        currentHeight + (event.key === 'ArrowDown' ? 20 : -20),
        galleryResizeMinHeight,
        galleryResizeMaxHeight,
      );
      applyGalleryImageHeight(galleryResize.gallery, galleryResize.resizeControl, nextHeight);
      updateContent(editor.innerHTML);
      return;
    }

    if (galleryToEdit && ['Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openEditorGalleryForEditing(galleryToEdit);
      return;
    }

    if (galleryAction && ['Enter', ' '].includes(event.key) && event.target instanceof Element) {
      event.preventDefault();
      moveEditorGallery(event.target, galleryAction);
      return;
    }

    if (
      ['ArrowLeft', 'ArrowRight'].includes(event.key)
      && event.target instanceof Element
      && event.target.closest('.capubbs-gallery')
    ) {
      event.preventDefault();
      moveEditorGallery(event.target, event.key === 'ArrowLeft' ? 'prev' : 'next');
      return;
    }

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
        && isRichFirstLineIndentActive(range, editor)
      ) {
        event.preventDefault();
        document.execCommand(event.shiftKey ? 'insertLineBreak' : 'insertParagraph', false);

        if (!event.shiftKey) {
          const nextSelection = window.getSelection();
          const nextRange = nextSelection?.rangeCount ? nextSelection.getRangeAt(0) : null;
          if (nextRange && editor.contains(nextRange.commonAncestorContainer)) {
            ensureRichParagraphBlocks(nextRange, editor).forEach(applyRichFirstLineIndent);
          }
        }

        updateContent(editor.innerHTML);
        setActiveRichCommands(readRichCommandStates(editor));
        return;
      }

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

  const {
    applyHexSourceColor,
    applyRichTextColor,
    handleHexSourceChange,
    handleRichFontChange,
    handleRichFontSizeChange,
    handleRichHeadingChange,
    restoreRichSelection,
    runRichCommand,
    saveSelection,
    toggleColorPicker,
    toggleRichFirstLineIndent,
  } = createRichTextEditorRichActions({
    editorRef,
    hexSourceValue,
    isSourceMode,
    savedRangeRef,
    setActivePopover,
    setActiveRichCommands,
    setFontSelectValue,
    setFontSizeSelectValue,
    setHeadingSelectValue,
    setHexSourceValue,
    setIsColorPickerOpen,
    setRecentTextColors,
    setSelectedTextColor,
    sourceRef,
    sourceSelectionRef,
    updateContent,
  });

  const focusQuoteTarget = (quote: HTMLElement | null) => {
    const editor = editorRef.current;
    if (!editor || !quote || !editor.contains(quote)) return;

    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(quote);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const openQuotePopover = () => {
    saveSelection();
    setIsColorPickerOpen(false);
    setImageFileError('');
    setPopoverTextValue('');
    setPopoverValue('');

    const editor = editorRef.current;
    if (!editor) return;

    pendingQuoteIdRef.current += 1;
    const pendingQuoteId = String(pendingQuoteIdRef.current);
    editor.focus();
    restoreRichSelection();
    document.execCommand(
      'insertHTML',
      false,
      `<blockquote class="forum-quote" data-capubbs-pending-quote="${pendingQuoteId}"><br></blockquote><p><br></p>`,
    );

    const quote = editor.querySelector<HTMLElement>(
      `[data-capubbs-pending-quote="${pendingQuoteId}"]`,
    );
    quote?.removeAttribute('data-capubbs-pending-quote');
    pendingQuoteRef.current = quote;
    updateContent(editor.innerHTML);
    savedRangeRef.current = null;
    setActivePopover('quote');
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
    pendingQuoteRef.current = null;
    setIsColorPickerOpen(false);
    setImageFileError('');
    setPopoverTextValue(popover === 'link' ? getCurrentSelectionText() : '');
    setPopoverValue('');
    setActivePopover(popover);
  };

  const closePopover = () => {
    pendingQuoteRef.current = null;
    setActivePopover(null);
    setImageFileError('');
    setPopoverTextValue('');
    setPopoverValue('');
  };

  const {
    closePastedImageDialog,
    compressPastedImage,
    finishGalleryResize,
    finishRichImageResize,
    handleEditorPaste,
    handleGalleryResizePointerDown,
    handleGalleryResizePointerMove,
    handleLocalImageFileChange,
    handleRichEditorClick,
    handleRichImageResizePointerDown,
    handleRichImageResizePointerMove,
    insertRichHtml,
    insertRichImage,
    openGalleryDialog,
    openEditorGalleryForEditing,
    updateRichImageResizeHandle,
    uploadAndInsertGallery,
    uploadAndInsertPastedImage,
  } = createRichTextEditorMediaActions({
    activeGalleryResizeRef,
    activeRichImageResizeRef,
    closePopover,
    currentValueRef,
    editorRef,
    editorShellRef,
    galleryDialogState,
    insertSourceBlock,
    isHtmlMode,
    isMarkdownMode,
    pastedImage,
    replaceSourceSelection,
    restoreRichSelection,
    saveSelection,
    selectedRichImageRef,
    setActivePopover,
    setGalleryDialogState,
    setImageFileError,
    setIsCheckingImageFile,
    setIsColorPickerOpen,
    setPastedImage,
    setRichImageResizeHandle,
    updateContent,
  });

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
      const quote = pendingQuoteRef.current;

      if (quote && editorRef.current?.contains(quote) && submittedValue) {
        const quoteContent = quote.innerHTML;
        const profileHref = getPublicProfileAppPath(submittedValue);
        quote.className = 'forum-legacy-quote';
        quote.setAttribute('data-user', submittedValue);
        quote.innerHTML = [
          '<div class="forum-legacy-quote-content">',
          `引用自 <a class="forum-mention" href="${escapeAttribute(profileHref)}">${escapeHtml(submittedValue)}</a>：<br>`,
          quoteContent,
          '</div>',
        ].join('');
        updateContent(editorRef.current.innerHTML);
      }

      savedRangeRef.current = null;
      closePopover();
      focusQuoteTarget(quote);
      return;
    }

    savedRangeRef.current = null;
    closePopover();
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

  const handleToolbarMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleColorActionMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    handleToolbarMouseDown(event);
    saveSelection();
  };

  const openHtmlSnippetDialog = () => {
    const textarea = sourceRef.current;
    if (textarea) {
      sourceSelectionRef.current = {
        end: textarea.selectionEnd,
        start: textarea.selectionStart,
      };
    }
    setIsHtmlSnippetDialogOpen(true);
  };

  const insertHtmlSnippet = (code: string) => {
    replaceSourceSelection(code);
    setIsHtmlSnippetDialogOpen(false);
  };

  const closeHtmlSnippetDialog = () => {
    sourceSelectionRef.current = null;
    setIsHtmlSnippetDialogOpen(false);
  };

  const renderSourceLineNumbers = (variant: 'code' | 'markdown') => {
    if (!shouldShowSourceLineNumbers) {
      return null;
    }

    const className =
      variant === 'code'
        ? 'capubbs-source-code-line-numbers'
        : 'px-2 py-3 text-right font-mono text-[length:var(--ui-font-size-md)] leading-6';

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
      <RichTextEditorControls
        activePopover={activePopover}
        activeRichCommands={activeRichCommands}
        applyHexSourceColor={applyHexSourceColor}
        applyRichTextColor={applyRichTextColor}
        closePopover={closePopover}
        fontSelectValue={fontSelectValue}
        fontSizeSelectValue={fontSizeSelectValue}
        handleColorActionMouseDown={handleColorActionMouseDown}
        handleHexSourceChange={handleHexSourceChange}
        handleLocalImageFileChange={handleLocalImageFileChange}
        handlePopoverSubmit={handlePopoverSubmit}
        handleRichFontChange={handleRichFontChange}
        handleRichFontSizeChange={handleRichFontSizeChange}
        handleRichHeadingChange={handleRichHeadingChange}
        handleToolbarMouseDown={handleToolbarMouseDown}
        headingSelectValue={headingSelectValue}
        hexSourceValue={hexSourceValue}
        imageFileError={imageFileError}
        imageFileInputRef={imageFileInputRef}
        insertHorizontalRule={insertHorizontalRule}
        isCheckingImageFile={isCheckingImageFile}
        isColorPickerOpen={isColorPickerOpen}
        isSourceMode={isSourceMode}
        openGalleryDialog={openGalleryDialog}
        openPopover={openPopover}
        openQuotePopover={openQuotePopover}
        popoverConfig={popoverConfig}
        popoverTextValue={popoverTextValue}
        popoverValue={popoverValue}
        recentTextColors={recentTextColors}
        runRichCommand={runRichCommand}
        saveSelection={saveSelection}
        selectedTextColor={selectedTextColor}
        setHexSourceValue={setHexSourceValue}
        setPopoverTextValue={setPopoverTextValue}
        setPopoverValue={setPopoverValue}
        setSelectedTextColor={setSelectedTextColor}
        toggleColorPicker={toggleColorPicker}
        toggleRichFirstLineIndent={toggleRichFirstLineIndent}
      />
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
              onKeyDown={handleMarkdownEditorKeyDown}
              onPaste={handleEditorPaste}
              onScroll={handleMarkdownSourceScroll}
              className={`min-w-0 flex-1 resize-none border-0 bg-transparent px-3 py-3 text-sm leading-6 text-zinc-800 outline-none placeholder:text-zinc-400 focus:ring-0 dark:text-white dark:placeholder:text-zinc-500 ${isAutoHeightEnabled ? 'min-h-[50vh]' : 'min-h-0'} ${markdownSourceOverflowClassName}`}
            />
          </div>
          <div
            aria-label="Markdown预览"
            className={`forum-markup capubbs-editor-prose ${splitPaneChildClassName} bg-zinc-50/70 px-3 py-3 dark:bg-white/[0.035] ${splitPaneDividerClassName} ${isAutoHeightEnabled ? 'overflow-visible' : 'overflow-y-auto'}`}
            data-forum-markup="floor"
            dangerouslySetInnerHTML={{ __html: markdownPreview }}
          />
        </div>
      ) : isHtmlMode ? (
        <div key="html-editor-pane" className={splitPaneClassName} data-editor-mode="html">
          <div className={htmlSourcePaneClassName}>
            <div className="flex h-9 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-3 text-[length:var(--ui-font-size-sm)] font-bold text-zinc-500 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300">
              <span>HTML源码</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="打开代码片段"
                  title="代码片段"
                  onClick={openHtmlSnippetDialog}
                  className="inline-flex h-6 items-center gap-1 rounded-[1px] px-1.5 transition hover:bg-zinc-200/70 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <Braces size={14} />
                  <span>代码片段</span>
                </button>
              {!isHtmlPreviewOpen ? (
                <button
                  type="button"
                  aria-label="打开 HTML 预览"
                  title="打开 HTML 预览"
                  onClick={() => setIsHtmlPreviewOpen(true)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-[1px] transition hover:bg-zinc-200/70 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <PanelRightOpen size={14} />
                </button>
              ) : null}
              </div>
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
          {isHtmlPreviewOpen ? (
            <div className={`card-surface ${splitPaneChildClassName} flex flex-col`}>
              <div className="flex h-9 items-center justify-between border-b border-zinc-200/80 px-3 text-[length:var(--ui-font-size-sm)] font-bold text-zinc-500 dark:border-white/10 dark:text-zinc-300">
                <span>HTML预览</span>
                <button
                  type="button"
                  aria-label="关闭 HTML 预览"
                  title="关闭 HTML 预览"
                  onClick={() => setIsHtmlPreviewOpen(false)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-[1px] transition hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
              <iframe
                title="HTML预览"
                sandbox=""
                srcDoc={htmlPreviewDocument}
                className="capubbs-html-preview-frame min-h-0 w-full flex-1 border-0"
              />
            </div>
          ) : null}
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
            normalizeRichTypingStylesAfterInput(event.currentTarget);
            updateContent(event.currentTarget.innerHTML);
            window.requestAnimationFrame(updateRichImageResizeHandle);
          }}
          onBlur={(event) => updateContent(event.currentTarget.innerHTML)}
          onKeyDown={handleRichEditorKeyDown}
          onPaste={handleEditorPaste}
          onPointerCancel={finishGalleryResize}
          onPointerDown={handleGalleryResizePointerDown}
          onPointerMove={handleGalleryResizePointerMove}
          onPointerUp={finishGalleryResize}
          onScroll={updateRichImageResizeHandle}
          className={`forum-markup capubbs-editor-prose capubbs-rich-editor-input px-3 py-3 outline-none ${isAutoHeightEnabled ? 'min-h-[50vh] overflow-visible' : 'h-[50vh] overflow-y-auto'}`}
          data-forum-markup="floor"
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

      <footer className="capubbs-editor-statusbar flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200/80 px-3 py-2 text-[length:var(--ui-font-size-sm)] font-semibold text-zinc-500 dark:border-white/10 dark:text-zinc-400">
        <span>{plainTextLength(value.content, value.mode)} 字</span>
        <div className="capubbs-editor-statusbar-controls flex flex-wrap items-center gap-3">
          <label className="capubbs-editor-toggle inline-flex h-7 items-center gap-1.5 rounded-[1px] border border-zinc-200 bg-white/60 px-2 text-[length:var(--ui-font-size-md)] font-bold text-zinc-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300">
            <input
              type="checkbox"
              checked={isAutoHeightEnabled}
              onChange={(event) => setIsAutoHeightEnabled(event.target.checked)}
              className="h-3.5 w-3.5 accent-[#174f38]"
            />
            自适应高度
          </label>
          {isSourceMode ? (
            <label className="capubbs-editor-toggle inline-flex h-7 items-center gap-1.5 rounded-[1px] border border-zinc-200 bg-white/60 px-2 text-[length:var(--ui-font-size-md)] font-bold text-zinc-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300">
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
                className="capubbs-editor-mode-tabs inline-flex h-7 items-center rounded-[1px] border border-zinc-200 bg-white/60 p-0.5 text-[length:var(--ui-font-size-md)] font-bold dark:border-white/10 dark:bg-white/[0.06]"
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
      previewAlt={pastedImage?.source === 'file' ? '本地图片预览' : undefined}
      title={pastedImage?.source === 'file' ? '插入本地图片' : undefined}
      onCancel={closePastedImageDialog}
      onCompress={compressPastedImage}
      onUpload={uploadAndInsertPastedImage}
    />
    {galleryDialogState ? (
      <GalleryDialog
        initialImages={galleryDialogState.images}
        initialTitle={galleryDialogState.title}
        onCancel={() => setGalleryDialogState(null)}
        onInsert={uploadAndInsertGallery}
      />
    ) : null}
    {isHtmlSnippetDialogOpen ? (
      <HtmlSnippetDialog
        onCancel={closeHtmlSnippetDialog}
        onInsert={insertHtmlSnippet}
      />
    ) : null}
    </>
  );
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
      label: '被引用人 ID',
      placeholder: '被引用人 ID（可留空）',
    };
  }

  return null;
}
