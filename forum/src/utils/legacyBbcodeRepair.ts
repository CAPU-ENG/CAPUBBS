export function repairUnclosedLegacyBbcode(value: string) {
  const tokenPattern = /\[(\/?)(quote|url|img|at|color|font|size|b|i|u|s)(?:=([^\]\r\n]*))?]/gi;
  const stack: string[] = [];
  let balanced = '';
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(value)) !== null) {
    const [token, closingMarker, rawTag, argument] = match;
    const tag = rawTag.toLowerCase();
    balanced += value.slice(cursor, match.index);

    if (closingMarker) {
      let openIndex = -1;
      if (argument === undefined) {
        for (let index = stack.length - 1; index >= 0; index -= 1) {
          if (stack[index] === tag) {
            openIndex = index;
            break;
          }
        }
      }

      if (openIndex < 0) {
        balanced += token;
      } else {
        while (stack.length - 1 > openIndex) balanced += `[/${stack.pop()}]`;
        stack.pop();
        balanced += token;
      }
    } else if (isRepairableLegacyBbcodeOpening(tag, argument)) {
      stack.push(tag);
      balanced += token;
    } else {
      balanced += token;
    }

    cursor = tokenPattern.lastIndex;
  }

  balanced += value.slice(cursor);
  while (stack.length > 0) balanced += `[/${stack.pop()}]`;
  return balanced;
}

function isRepairableLegacyBbcodeOpening(tag: string, argument: string | undefined) {
  // An image source lives between the opening and closing tags. Without the
  // closing tag, a literal example such as "支持 [img] 标签" is
  // indistinguishable from image content and must remain visible as written.
  if (tag === 'img') return false;
  if (tag === 'quote' || tag === 'url') return argument === undefined || argument.trim() !== '';
  if (tag === 'color' || tag === 'font' || tag === 'size') return argument !== undefined && argument.trim() !== '';
  return argument === undefined;
}
