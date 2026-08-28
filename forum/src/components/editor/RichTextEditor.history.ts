import {
  type Dispatch,
  type KeyboardEvent,
  type RefObject,
  type SetStateAction,
  useEffect,
  useRef,
} from 'react';
import { convertEditorContent, isCrossGroupModeSwitchLocked } from './RichTextEditor.content';
import { focusRichTextEditorAtEnd } from './RichTextEditor.richText';
import type { EditorPopover, RichTextEditorMode, RichTextEditorValue } from './RichTextEditor.types';

const maxEditorHistoryEntries = 120;

type HistoryOptions = {
  editorRef: RefObject<HTMLDivElement | null>;
  onChange: (value: RichTextEditorValue) => void;
  savedRangeRef: RefObject<Range | null>;
  setActivePopover: Dispatch<SetStateAction<EditorPopover>>;
  setIsColorPickerOpen: Dispatch<SetStateAction<boolean>>;
  sourceRef: RefObject<HTMLTextAreaElement | null>;
  sourceSelectionRef: RefObject<{ end: number; start: number } | null>;
  value: RichTextEditorValue;
};

function areEditorValuesEqual(currentValue: RichTextEditorValue, nextValue: RichTextEditorValue) {
  return currentValue.content === nextValue.content && currentValue.mode === nextValue.mode;
}

function pushEditorHistoryEntry(stack: RichTextEditorValue[], entry: RichTextEditorValue) {
  const lastEntry = stack[stack.length - 1];
  if (lastEntry && areEditorValuesEqual(lastEntry, entry)) return;

  stack.push({ ...entry });
  if (stack.length > maxEditorHistoryEntries) stack.shift();
}

export function useRichTextEditorHistory({
  editorRef,
  onChange,
  savedRangeRef,
  setActivePopover,
  setIsColorPickerOpen,
  sourceRef,
  sourceSelectionRef,
  value,
}: HistoryOptions) {
  const currentValueRef = useRef<RichTextEditorValue>(value);
  const undoStackRef = useRef<RichTextEditorValue[]>([]);
  const redoStackRef = useRef<RichTextEditorValue[]>([]);
  const isApplyingHistoryRef = useRef(false);

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

  const commitEditorValue = (nextValue: RichTextEditorValue, recordHistory = true) => {
    const previousValue = currentValueRef.current;
    if (areEditorValuesEqual(previousValue, nextValue)) return;

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
    commitEditorValue({ content, mode: currentValueRef.current.mode });
  };

  const updateMode = (nextMode: RichTextEditorMode) => {
    const currentValue = currentValueRef.current;
    if (nextMode === currentValue.mode || isCrossGroupModeSwitchLocked(currentValue, nextMode)) return;

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
        if (editorRef.current) focusRichTextEditorAtEnd(editorRef.current);
        return;
      }
      if (!sourceRef.current) return;

      const selectionPosition = sourceRef.current.value.length;
      sourceRef.current.focus();
      sourceRef.current.setSelectionRange(selectionPosition, selectionPosition);
      sourceSelectionRef.current = { end: selectionPosition, start: selectionPosition };
    });
  };

  const undoEditorChange = () => {
    const previousValue = undoStackRef.current.pop();
    if (!previousValue) return;

    pushEditorHistoryEntry(redoStackRef.current, currentValueRef.current);
    commitEditorValue(previousValue, false);
    focusEditorAfterHistoryChange(previousValue);
  };

  const redoEditorChange = () => {
    const nextValue = redoStackRef.current.pop();
    if (!nextValue) return;

    pushEditorHistoryEntry(undoStackRef.current, currentValueRef.current);
    commitEditorValue(nextValue, false);
    focusEditorAfterHistoryChange(nextValue);
  };

  const handleEditorKeyDown = (event: KeyboardEvent<HTMLDivElement | HTMLTextAreaElement>) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;

    const key = event.key.toLowerCase();
    const isUndoShortcut = key === 'z' && !event.shiftKey;
    const isRedoShortcut = key === 'y' || (key === 'z' && event.shiftKey);
    if (!isUndoShortcut && !isRedoShortcut) return;

    event.preventDefault();
    if (isUndoShortcut) undoEditorChange();
    else redoEditorChange();
  };

  return { currentValueRef, handleEditorKeyDown, updateContent, updateMode };
}
