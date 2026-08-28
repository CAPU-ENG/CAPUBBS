export type MarkdownSourceEdit = {
  content: string;
  selectionEnd: number;
  selectionStart: number;
};

const markdownIndent = '  ';
const unorderedListPattern = /^(\s*)([-+*])([ \t]+)(.*)$/;
const orderedListPattern = /^(\s*)(\d+)([.)])([ \t]+)(.*)$/;
const markdownListMarkerPattern = /^( *)(?:[-+*]|\d+[.)])[ \t]+/;

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
  const indentationWidth = outdent
    ? getMarkdownOutdentWidth(content, lineStart, selectedLines[0])
    : getMarkdownIndentWidth(content, lineStart, selectedLines[0]);
  const indentation = ' '.repeat(indentationWidth);
  const baseIndent = selectedLines[0].match(/^\s*/)?.[0] ?? '';
  let nextOrderedNumber = 1;
  const lineEdits = selectedLines.map((line) => {
    if (outdent) return createMarkdownOutdentLineEdit(line, indentationWidth);

    const orderedMatch = line.match(orderedListPattern);
    const shouldRenumber = orderedMatch?.[1] === baseIndent;
    const replacementNumber = shouldRenumber
      ? formatMarkdownListNumber(nextOrderedNumber, orderedMatch[2])
      : null;
    if (shouldRenumber) nextOrderedNumber += 1;

    return createMarkdownIndentLineEdit(line, indentation, orderedMatch, replacementNumber);
  });
  const replacement = lineEdits.map((edit) => edit.content).join('\n');
  const nextContent = `${content.slice(0, lineStart)}${replacement}${content.slice(lineEnd)}`;

  return {
    content: nextContent,
    selectionEnd: lineStart + mapMarkdownEditOffset(
      selectedLines,
      lineEdits,
      selectionEnd - lineStart,
    ),
    selectionStart: lineStart + mapMarkdownEditOffset(
      selectedLines,
      lineEdits,
      selectionStart - lineStart,
    ),
  };
}

function formatMarkdownListNumber(value: number, originalValue: string) {
  const nextValue = String(value);
  return originalValue.startsWith('0') ? nextValue.padStart(originalValue.length, '0') : nextValue;
}

type MarkdownLineEdit = {
  content: string;
  mapOffset: (offset: number) => number;
};

function createMarkdownIndentLineEdit(
  line: string,
  indentation: string,
  orderedMatch: RegExpMatchArray | null,
  replacementNumber: string | null,
): MarkdownLineEdit {
  if (!orderedMatch || replacementNumber === null) {
    return {
      content: `${indentation}${line}`,
      mapOffset: (offset) => indentation.length + offset,
    };
  }

  const numberStart = orderedMatch[1].length;
  const numberEnd = numberStart + orderedMatch[2].length;
  const numberLengthChange = replacementNumber.length - orderedMatch[2].length;
  return {
    content: `${indentation}${line.slice(0, numberStart)}${replacementNumber}${line.slice(numberEnd)}`,
    mapOffset: (offset) => {
      if (offset <= numberStart) return indentation.length + offset;
      if (offset >= numberEnd) return indentation.length + offset + numberLengthChange;
      return indentation.length + numberStart + Math.min(offset - numberStart, replacementNumber.length);
    },
  };
}

function createMarkdownOutdentLineEdit(line: string, indentationWidth: number): MarkdownLineEdit {
  const removableIndent = line.startsWith('\t')
    ? 1
    : Math.min(line.match(/^ */)?.[0].length ?? 0, indentationWidth);
  return {
    content: line.slice(removableIndent),
    mapOffset: (offset) => Math.max(0, offset - removableIndent),
  };
}

function mapMarkdownEditOffset(
  originalLines: string[],
  lineEdits: MarkdownLineEdit[],
  originalOffset: number,
) {
  let remainingOffset = originalOffset;
  let nextOffset = 0;

  for (let index = 0; index < originalLines.length; index += 1) {
    const originalLine = originalLines[index];
    const lineEdit = lineEdits[index];
    if (remainingOffset <= originalLine.length) {
      return nextOffset + lineEdit.mapOffset(remainingOffset);
    }

    remainingOffset -= originalLine.length + 1;
    nextOffset += lineEdit.content.length + 1;
  }

  return nextOffset;
}

function getMarkdownIndentWidth(content: string, lineStart: number, currentLine: string) {
  const previousLine = getPreviousMarkdownLine(content, lineStart);
  const previousMarker = previousLine?.match(markdownListMarkerPattern);
  const currentIndentWidth = currentLine.match(/^ */)?.[0].length ?? 0;

  if (previousMarker && previousMarker[1].length === currentIndentWidth) {
    return previousMarker[0].length - currentIndentWidth;
  }

  return markdownIndent.length;
}

function getMarkdownOutdentWidth(content: string, lineStart: number, currentLine: string) {
  const currentIndentWidth = currentLine.match(/^ */)?.[0].length ?? 0;
  if (currentIndentWidth === 0) return markdownIndent.length;

  let precedingLineStart = lineStart;
  while (precedingLineStart > 0) {
    const previousLine = getPreviousMarkdownLine(content, precedingLineStart);
    if (previousLine === null || !previousLine.trim()) break;

    const previousMarker = previousLine.match(markdownListMarkerPattern);
    const previousIndentWidth = previousMarker?.[1].length;
    if (typeof previousIndentWidth === 'number' && previousIndentWidth < currentIndentWidth) {
      return currentIndentWidth - previousIndentWidth;
    }

    precedingLineStart -= previousLine.length + 1;
  }

  return Math.min(markdownIndent.length, currentIndentWidth);
}

function getPreviousMarkdownLine(content: string, lineStart: number) {
  if (lineStart <= 0) return null;

  const previousLineEnd = lineStart - 1;
  const previousLineStart = content.lastIndexOf('\n', Math.max(0, previousLineEnd - 1)) + 1;
  return content.slice(previousLineStart, previousLineEnd);
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
