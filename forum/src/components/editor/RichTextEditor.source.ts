import { type KeyboardEvent, type RefObject, useEffect, useMemo } from 'react';
import { useForumContentFontSize } from '../../hooks/useForumContentFontSize';
import { renderForumMarkup } from '../../utils/forumMarkup';
import {
  buildHtmlPreviewDocument,
  compactHtmlForStorage,
  highlightHtmlSource,
} from './RichTextEditor.html';
import {
  getMarkdownListEnterEdit,
  getMarkdownTabEdit,
  type MarkdownSourceEdit,
} from './RichTextEditor.markdown';
import { renderMarkdownToHtml } from './RichTextEditor.markdownRender';
import type { RichTextEditorValue } from './RichTextEditor.types';

type SourceEditorOptions = {
  handleEditorKeyDown: (event: KeyboardEvent<HTMLDivElement | HTMLTextAreaElement>) => void;
  htmlHighlightRef: RefObject<HTMLPreElement | null>;
  isAutoHeightEnabled: boolean;
  isDarkTheme: boolean;
  isHtmlPreviewOpen: boolean;
  isMobileViewport: boolean;
  isSourceMode: boolean;
  showSourceLineNumbers: boolean;
  sourceLineNumbersRef: RefObject<HTMLDivElement | null>;
  sourceRef: RefObject<HTMLTextAreaElement | null>;
  sourceSelectionRef: RefObject<{ end: number; start: number } | null>;
  updateContent: (content: string) => void;
  value: RichTextEditorValue;
};

export function useRichTextEditorSource({
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
}: SourceEditorOptions) {
  const forumContentFontSize = useForumContentFontSize();
  const shouldShowSourceLineNumbers = isSourceMode && showSourceLineNumbers;
  const sourceLineCount = useMemo(() => Math.max(1, value.content.split('\n').length), [value.content]);
  const sourceLineNumbers = useMemo(
    () => Array.from({ length: sourceLineCount }, (_, index) => index + 1),
    [sourceLineCount],
  );
  const sourceLineNumberColumnWidth = `${Math.max(2, String(sourceLineCount).length) + 1}ch`;
  const sourceTextareaWrap = 'soft';
  const markdownSourceOverflowClassName = isAutoHeightEnabled
    ? 'overflow-hidden'
    : 'overflow-x-hidden overflow-y-auto';
  const htmlSourceOverflowClassName = isAutoHeightEnabled
    ? 'overflow-hidden'
    : 'overflow-x-hidden overflow-y-auto';
  const splitPaneClassName = isMobileViewport
    ? `flex flex-col ${isAutoHeightEnabled ? 'min-h-[50vh]' : 'h-[50vh]'}`
    : `flex flex-row ${isAutoHeightEnabled ? 'min-h-[50vh]' : 'h-[50vh]'}`;
  const splitPaneChildClassName = 'min-h-0 min-w-0 flex-1 basis-0';
  const splitPaneDividerClassName = isMobileViewport
    ? 'border-t border-zinc-200/80 dark:border-white/10'
    : 'border-l border-zinc-200/80 dark:border-white/10';
  const htmlSourcePaneClassName = `${splitPaneChildClassName} flex flex-col ${
    isHtmlPreviewOpen && isMobileViewport
      ? 'border-b border-zinc-200/80 dark:border-white/10'
      : isHtmlPreviewOpen
        ? 'border-r border-zinc-200/80 dark:border-white/10'
        : ''
  }`;
  const markdownPreview = useMemo(
    () => renderForumMarkup(renderMarkdownToHtml(value.content)),
    [value.content],
  );
  const highlightedHtml = useMemo(() => highlightHtmlSource(value.content), [value.content]);
  const htmlPreviewDocument = useMemo(
    () => buildHtmlPreviewDocument(
      compactHtmlForStorage(value.content),
      isDarkTheme,
      false,
      `${forumContentFontSize}px`,
    ),
    [forumContentFontSize, isDarkTheme, value.content],
  );

  const syncSourceLineNumbersScroll = () => {
    if (sourceLineNumbersRef.current && sourceRef.current) {
      sourceLineNumbersRef.current.scrollTop = sourceRef.current.scrollTop;
    }
  };

  const resizeSourceTextarea = () => {
    const textarea = sourceRef.current;
    if (!textarea) return;

    if (!isAutoHeightEnabled) {
      textarea.style.height = '';
      if (htmlHighlightRef.current) htmlHighlightRef.current.style.height = '';
      return;
    }

    textarea.style.height = 'auto';
    const nextHeight = `${Math.max(textarea.scrollHeight, Math.round(window.innerHeight * 0.4))}px`;
    textarea.style.height = nextHeight;
    if (htmlHighlightRef.current) htmlHighlightRef.current.style.height = nextHeight;
  };

  useEffect(() => {
    const textarea = sourceRef.current;
    if (!isSourceMode || !textarea) return undefined;

    // Measure logical lines with the textarea's typography and available width,
    // so a wrapped line keeps one number and reserves space for its continuations.
    const mirror = document.createElement('div');
    mirror.style.cssText = 'position:fixed;left:-100000px;top:0;visibility:hidden;pointer-events:none;';
    mirror.setAttribute('aria-hidden', 'true');
    document.body.appendChild(mirror);
    const updateLayout = () => {
      resizeSourceTextarea();
      const style = window.getComputedStyle(textarea);
      const contentWidth = textarea.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      if (htmlHighlightRef.current) {
        htmlHighlightRef.current.style.width = `${textarea.clientWidth}px`;
        htmlHighlightRef.current.scrollTop = textarea.scrollTop;
      }
      if (shouldShowSourceLineNumbers && sourceLineNumbersRef.current) {
        for (const property of [
          'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
          'letter-spacing', 'word-spacing', 'tab-size', 'white-space', 'word-break', 'overflow-wrap',
        ]) {
          mirror.style.setProperty(property, style.getPropertyValue(property));
        }
        mirror.style.width = `${Math.max(0, contentWidth)}px`;
        const lines = textarea.value.split('\n').map((line) => {
          const row = document.createElement('div');
          row.textContent = line || '\u200b';
          return row;
        });
        mirror.replaceChildren(...lines);
        const heights = lines.map((line) => line.getBoundingClientRect().height);
        Array.from(sourceLineNumbersRef.current.children).forEach((number, index) => {
          (number as HTMLElement).style.height = `${heights[index]}px`;
        });
        syncSourceLineNumbersScroll();
      }
    };
    let frame = window.requestAnimationFrame(updateLayout);
    const scheduleLayout = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateLayout);
    };
    const observer = new ResizeObserver(scheduleLayout);
    observer.observe(textarea);
    window.addEventListener('resize', scheduleLayout);
    document.fonts.addEventListener('loadingdone', scheduleLayout);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', scheduleLayout);
      document.fonts.removeEventListener('loadingdone', scheduleLayout);
      mirror.remove();
    };
  }, [isAutoHeightEnabled, isSourceMode, shouldShowSourceLineNumbers, value.content, value.mode, forumContentFontSize]);

  const applyMarkdownSourceEdit = (textarea: HTMLTextAreaElement, edit: MarkdownSourceEdit) => {
    sourceSelectionRef.current = null;
    updateContent(edit.content);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(edit.selectionStart, edit.selectionEnd);
    });
  };

  const handleMarkdownEditorKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return;

    const textarea = event.currentTarget;
    const hasCommandModifier = event.ctrlKey || event.metaKey || event.altKey;
    let edit: MarkdownSourceEdit | null = null;
    if (event.key === 'Tab' && !hasCommandModifier) {
      edit = getMarkdownTabEdit(
        textarea.value,
        textarea.selectionStart,
        textarea.selectionEnd,
        event.shiftKey,
      );
    } else if (event.key === 'Enter' && !event.shiftKey && !hasCommandModifier) {
      edit = getMarkdownListEnterEdit(
        textarea.value,
        textarea.selectionStart,
        textarea.selectionEnd,
      );
    }

    if (edit) {
      event.preventDefault();
      applyMarkdownSourceEdit(textarea, edit);
      return;
    }
    handleEditorKeyDown(event);
  };

  const getSourceSelection = () => {
    const textarea = sourceRef.current;
    if (!textarea) return null;

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
    sourceSelectionRef.current = null;
    updateContent(`${value.content.slice(0, range.start)}${replacement}${value.content.slice(range.end)}`);
    window.requestAnimationFrame(() => {
      range.textarea.focus();
      range.textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd);
    });
  };

  const wrapSourceSelection = (prefix: string, suffix: string, fallback = '') => {
    const range = getSourceSelection();
    if (!range) return;

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
    if (range) replaceSourceRange(range, replacement);
  };

  const insertSourceBlock = (block: string) => {
    const range = getSourceSelection();
    if (!range) return;

    const before = value.content.slice(0, range.start);
    const after = value.content.slice(range.end);
    const prefix = before.trim().length === 0 || before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
    const suffix = after.trim().length === 0 || after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n';
    const replacement = `${prefix}${block}${suffix}`;
    replaceSourceRange(range, replacement);
  };

  const handleMarkdownSourceScroll = () => syncSourceLineNumbersScroll();
  const handleHtmlSourceScroll = () => {
    const textarea = sourceRef.current;
    const highlight = htmlHighlightRef.current;
    if (textarea && highlight) {
      highlight.scrollTop = textarea.scrollTop;
      highlight.scrollLeft = textarea.scrollLeft;
    }
    syncSourceLineNumbersScroll();
  };

  return {
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
  };
}
