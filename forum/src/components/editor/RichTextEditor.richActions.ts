import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from 'react';
import { richTextHeadingOptions } from './RichTextEditor.constants';
import { escapeAttribute, escapeHtml } from './RichTextEditor.html';
import {
  maxRecentTextColors, mergeFullySelectedChildRichSpansIntoWrapper,
  normalizeRedundantRichSpans, normalizeRichIndentation,
  readRichCommandStates, removeOverriddenRichInlineStyles,
  removeOverriddenRichInlineStylesFromFullySelectedAncestors,
  richTypingStyleAttribute, richTypingStyleMarker,
  toggleRichFirstLineIndentForRange,
  type RichToggleCommandStates,
} from './RichTextEditor.richDom';
import { applyInlineStyleToElement, normalizeCssColor } from './RichTextEditor.richText';
import type { EditorPopover, RichInlineStyle } from './RichTextEditor.types';

type Options = {
  editorRef: RefObject<HTMLDivElement | null>;
  hexSourceValue: string;
  isSourceMode: boolean;
  savedRangeRef: RefObject<Range | null>;
  setActivePopover: Dispatch<SetStateAction<EditorPopover>>;
  setActiveRichCommands: Dispatch<SetStateAction<RichToggleCommandStates>>;
  setFontSelectValue: Dispatch<SetStateAction<string>>;
  setFontSizeSelectValue: Dispatch<SetStateAction<string>>;
  setHeadingSelectValue: Dispatch<SetStateAction<string>>;
  setHexSourceValue: Dispatch<SetStateAction<string>>;
  setIsColorPickerOpen: Dispatch<SetStateAction<boolean>>;
  setRecentTextColors: Dispatch<SetStateAction<string[]>>;
  setSelectedTextColor: Dispatch<SetStateAction<string>>;
  sourceRef: RefObject<HTMLTextAreaElement | null>;
  sourceSelectionRef: RefObject<{ end: number; start: number } | null>;
  updateContent: (content: string) => void;
};

export function createRichTextEditorRichActions({
  editorRef, hexSourceValue, isSourceMode, savedRangeRef,
  setActivePopover, setActiveRichCommands, setFontSelectValue, setFontSizeSelectValue,
  setHeadingSelectValue, setHexSourceValue, setIsColorPickerOpen, setRecentTextColors,
  setSelectedTextColor, sourceRef, sourceSelectionRef, updateContent,
}: Options) {
  const runRichCommand = (command: string, commandValue?: string) => {
    const editor = editorRef.current;
    editor?.focus();
    document.execCommand(command, false, commandValue);
    if (editor && (command === 'indent' || command === 'outdent')) {
      normalizeRichIndentation(editor);
    }
    updateContent(editor?.innerHTML ?? '');
    if (editor) setActiveRichCommands(readRichCommandStates(editor));
  };

  const toggleRichFirstLineIndent = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;

    toggleRichFirstLineIndentForRange(range, editor);

    updateContent(editor.innerHTML);
    setActiveRichCommands(readRichCommandStates(editor));
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
    editorRef.current?.focus();
    restoreRichSelection();
    document.execCommand(
      'insertHTML',
      false,
      `<${tagName}${classAttribute}>${getRichSelectionHtml(fallback)}</${tagName}>`,
    );
    updateContent(editorRef.current?.innerHTML ?? '');
  };

  const applyRichInlineStyle = (style: RichInlineStyle) => {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || !selection) {
      savedRangeRef.current = null;
      return;
    }

    const currentRange = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const range = currentRange
      && editor.contains(currentRange.commonAncestorContainer)
      ? currentRange.cloneRange()
      : savedRangeRef.current?.cloneRange();

    if (!range || !editor.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = null;
      return;
    }

    editor.focus();
    selection.removeAllRanges();
    selection.addRange(range);

    const wrapper = document.createElement('span');
    applyInlineStyleToElement(wrapper, style);
    const nextRange = document.createRange();

    if (range.collapsed) {
      wrapper.setAttribute(richTypingStyleAttribute, 'true');
      const marker = document.createTextNode(richTypingStyleMarker);
      wrapper.appendChild(marker);
      range.insertNode(wrapper);
      nextRange.setStart(marker, marker.length);
      nextRange.collapse(true);
    } else {
      const selectedContent = range.extractContents();
      removeOverriddenRichInlineStyles(selectedContent, style);
      wrapper.appendChild(selectedContent);
      mergeFullySelectedChildRichSpansIntoWrapper(wrapper);
      range.insertNode(wrapper);
      normalizeRedundantRichSpans(editor);
      removeOverriddenRichInlineStylesFromFullySelectedAncestors(wrapper, editor, style);
      normalizeRedundantRichSpans(editor);
      nextRange.selectNodeContents(wrapper);
    }

    selection.removeAllRanges();
    selection.addRange(nextRange);
    updateContent(editor.innerHTML);
    savedRangeRef.current = null;
  };

  const handleRichFontChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const fontName = event.target.value;

    setFontSelectValue(fontName);

    if (!fontName) {
      return;
    }

    applyRichInlineStyle({ fontFamily: fontName });
  };

  const handleRichFontSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const fontSize = event.target.value;

    if (!fontSize) {
      return;
    }

    setFontSizeSelectValue(fontSize);
    applyRichInlineStyle({ fontSize });
  };

  const handleRichHeadingChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const headingTag = event.target.value;

    if (!richTextHeadingOptions.some((option) => option.value === headingTag)) {
      return;
    }

    setHeadingSelectValue(headingTag);
    editorRef.current?.focus();
    restoreRichSelection();
    document.execCommand('formatBlock', false, headingTag);
    updateContent(editorRef.current?.innerHTML ?? '');
    savedRangeRef.current = null;
  };

  const applyRichTextColor = (color: string) => {
    const normalizedColor = normalizeCssColor(color);

    if (!normalizedColor) {
      return;
    }

    setSelectedTextColor(normalizedColor);
    setHexSourceValue(normalizedColor);
    setRecentTextColors((currentColors) => {
      return [
        normalizedColor,
        ...currentColors.filter((recentColor) => recentColor !== normalizedColor),
      ].slice(0, maxRecentTextColors);
    });
    applyRichInlineStyle({ color: normalizedColor });
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


  return {
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
    wrapRichSelectionWithTag,
  };
}
