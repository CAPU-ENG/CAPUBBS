export type MarkdownSourceEdit = {
  content: string;
  selectionEnd: number;
  selectionStart: number;
};

const markdownIndent = '  ';
const unorderedListPattern = /^(\s*)([-+*])([ \t]+)(.*)$/;
const orderedListPattern = /^(\s*)(\d+)(\.)([ \t]+)(.*)$/;

export function getMarkdownTabEdit(
  content: string,
  selectionStart: number,
  selectionEnd: number,
  outdent: boolean,
): MarkdownSourceEdit {
  const lineStart = content.lastIndexOf('\n', Math.max(0, selectionStart - 1)) + 1;
  const selectionEndsAtNextLineStart = selectionEnd > selectionStart && content[selectionEnd - 1] === '\n';
  const lastSelectedOffset = selectionEndsAtNextLineStart ? selectionEnd - 1 : selectionEnd;
  const followingLineBreak = content.indexOf('\n', lastSelectedOffset);
  const lineEnd = followingLineBreak === -1 ? content.length : followingLineBreak;
  const selectedLines = content.slice(lineStart, lineEnd).split('\n');
  const indentationChanges: number[] = [];
  const replacement = selectedLines.map((line) => {
    if (!outdent) {
      indentationChanges.push(markdownIndent.length);
      return `${markdownIndent}${line}`;
    }

    const removableIndent = line.startsWith('\t')
      ? 1
      : Math.min(line.match(/^ */)?.[0].length ?? 0, markdownIndent.length);
    indentationChanges.push(-removableIndent);
    return line.slice(removableIndent);
  }).join('\n');
  const nextContent = `${content.slice(0, lineStart)}${replacement}${content.slice(lineEnd)}`;
  const firstLineChange = indentationChanges[0] ?? 0;

  if (selectionStart === selectionEnd) {
    const offsetInLine = selectionStart - lineStart;
    const caretChange = firstLineChange >= 0
      ? firstLineChange
      : -Math.min(-firstLineChange, offsetInLine);
    const nextCaret = selectionStart + caretChange;
    return { content: nextContent, selectionEnd: nextCaret, selectionStart: nextCaret };
  }

  const selectionStartChange = firstLineChange >= 0
    ? firstLineChange
    : -Math.min(-firstLineChange, selectionStart - lineStart);
  const totalChange = indentationChanges.reduce((sum, change) => sum + change, 0);

  return {
    content: nextContent,
    selectionEnd: selectionEnd + totalChange,
    selectionStart: selectionStart + selectionStartChange,
  };
}

export function getMarkdownListEnterEdit(
  content: string,
  selectionStart: number,
  selectionEnd: number,
): MarkdownSourceEdit | null {
  if (selectionStart !== selectionEnd) return null;

  const lineStart = content.lastIndexOf('\n', Math.max(0, selectionStart - 1)) + 1;
  const followingLineBreak = content.indexOf('\n', selectionStart);
  const lineEnd = followingLineBreak === -1 ? content.length : followingLineBreak;
  const fullLine = content.slice(lineStart, lineEnd);
  const lineBeforeCaret = content.slice(lineStart, selectionStart);
  const fullUnorderedMatch = fullLine.match(unorderedListPattern);
  const fullOrderedMatch = fullLine.match(orderedListPattern);
  const unorderedMatch = lineBeforeCaret.match(unorderedListPattern);
  const orderedMatch = lineBeforeCaret.match(orderedListPattern);

  if (unorderedMatch && fullUnorderedMatch && fullUnorderedMatch[4].trim() === '') {
    return removeEmptyMarkdownListItem(content, lineStart, lineEnd);
  }

  if (orderedMatch && fullOrderedMatch && fullOrderedMatch[5].trim() === '') {
    return removeEmptyMarkdownListItem(content, lineStart, lineEnd);
  }

  let nextMarker = '';
  if (unorderedMatch) {
    nextMarker = `${unorderedMatch[1]}${unorderedMatch[2]}${unorderedMatch[3]}`;
  } else if (orderedMatch) {
    const nextNumber = incrementMarkdownListNumber(orderedMatch[2]);
    nextMarker = `${orderedMatch[1]}${nextNumber}${orderedMatch[3]}${orderedMatch[4]}`;
  } else {
    return null;
  }

  const insertion = `\n${nextMarker}`;
  const nextCaret = selectionStart + insertion.length;
  return {
    content: `${content.slice(0, selectionStart)}${insertion}${content.slice(selectionEnd)}`,
    selectionEnd: nextCaret,
    selectionStart: nextCaret,
  };
}

function removeEmptyMarkdownListItem(content: string, lineStart: number, lineEnd: number) {
  return {
    content: `${content.slice(0, lineStart)}${content.slice(lineEnd)}`,
    selectionEnd: lineStart,
    selectionStart: lineStart,
  };
}

function incrementMarkdownListNumber(value: string) {
  const currentNumber = Number(value);
  if (!Number.isSafeInteger(currentNumber)) return value;

  const incremented = String(currentNumber + 1);
  return value.startsWith('0') ? incremented.padStart(value.length, '0') : incremented;
}
