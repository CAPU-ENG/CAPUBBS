import { getPublicProfilePath } from './userRoutes';

type LegacyBbcodeReplacement = [RegExp, (...matches: string[]) => string];

export function translateLegacyBbcode(value: string) {
  const normalizedValue = normalizeUnclosedHeadings(value);
  if (!normalizedValue.includes('[')) return normalizedValue;

  // Translate BBCode inside text nodes so an unclosed token cannot consume
  // adjacent HTML elements (for example, wrapping the rest of a post in h2).
  // Parse as a fragment so leading <style>/<script> nodes stay in the
  // returned markup instead of being promoted to a temporary document head.
  const template = document.createElement('template');
  template.innerHTML = normalizedValue;
  const fragment = template.content;
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
  let currentNode = walker.nextNode();
  while (currentNode) {
    const parentTag = currentNode.parentElement?.tagName;
    if (parentTag !== 'SCRIPT' && parentTag !== 'STYLE' && parentTag !== 'TEXTAREA') {
      textNodes.push(currentNode as Text);
    }
    currentNode = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    const translated = translateLegacyBbcodeText(escapeHtml(textNode.nodeValue ?? ''));
    if (translated === escapeHtml(textNode.nodeValue ?? '')) return;

    const replacement = document.createElement('template');
    replacement.innerHTML = translated;
    textNode.replaceWith(replacement.content);
  });

  return template.innerHTML;
}

type HeadingToken = {
  end: number;
  name: string;
  paired: boolean;
  start: number;
  closing: boolean;
};

function normalizeUnclosedHeadings(value: string) {
  const tokenPattern = /<\s*(\/?)\s*h([1-6])\b[^>]*>/gi;
  const tokens: HeadingToken[] = [];
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(value)) !== null) {
    if (isInsideProtectedMarkup(value, match.index)) continue;
    tokens.push({
      closing: Boolean(match[1]),
      end: tokenPattern.lastIndex,
      name: `h${match[2]}`,
      paired: false,
      start: match.index,
    });
  }

  const openStack: number[] = [];
  tokens.forEach((token, index) => {
    if (!token.closing) {
      openStack.push(index);
      return;
    }

    for (let stackIndex = openStack.length - 1; stackIndex >= 0; stackIndex -= 1) {
      const openIndex = openStack[stackIndex];
      if (tokens[openIndex].name !== token.name) continue;
      tokens[openIndex].paired = true;
      token.paired = true;
      openStack.splice(stackIndex, 1);
      break;
    }
  });

  const insertions = tokens
    .filter((token) => !token.closing && !token.paired)
    .map((token) => ({
      position: findHeadingLineBreak(value, token.end),
      start: token.start,
      text: `</${token.name}>`,
    }));
  if (insertions.length === 0) return value;

  const groupedInsertions = new Map<number, typeof insertions>();
  insertions.forEach((insertion) => {
    const group = groupedInsertions.get(insertion.position) ?? [];
    group.push(insertion);
    groupedInsertions.set(insertion.position, group);
  });

  let normalized = value;
  Array.from(groupedInsertions.entries())
    .sort(([left], [right]) => right - left)
    .forEach(([position, group]) => {
      const suffix = group
        .sort((left, right) => right.start - left.start)
        .map((insertion) => insertion.text)
        .join('');
      normalized = `${normalized.slice(0, position)}${suffix}${normalized.slice(position)}`;
    });
  return normalized;
}

function findHeadingLineBreak(value: string, start: number) {
  const match = value.slice(start).search(/(?:\r\n?|\n|<br\b[^>]*>)/i);
  return match < 0 ? value.length : start + match;
}

function isInsideProtectedMarkup(value: string, position: number) {
  const before = value.slice(0, position);
  const openingComment = before.lastIndexOf('<!--');
  const closingComment = before.lastIndexOf('-->');
  if (openingComment > closingComment) return true;

  const openingScript = before.lastIndexOf('<script');
  const closingScript = before.lastIndexOf('</script');
  const openingStyle = before.lastIndexOf('<style');
  const closingStyle = before.lastIndexOf('</style');
  return openingScript > closingScript || openingStyle > closingStyle;
}

function translateLegacyBbcodeText(value: string) {
  const replacements: LegacyBbcodeReplacement[] = [
    [/\[quote=([^\]]+)]([\s\S]*?)\[\/quote]/gi, (_match, author, content) => (
      `<blockquote class="forum-legacy-quote"><div class="forum-legacy-quote-content">`
      + `引用自 <a class="forum-mention" href="${escapeHtmlAttribute(getPublicProfilePath(forumMarkupToPlainText(author)))}">`
      + `${escapeHtml(forumMarkupToPlainText(author))}</a>：<br>${content}</div></blockquote>`
    )],
    [/\[quote]([\s\S]*?)\[\/quote]/gi, (_match, content) => `<blockquote class="forum-legacy-quote">${content}</blockquote>`],
    [/\[url=([^\]]+)]([\s\S]*?)\[\/url]/gi, (_match, href, content) => `<a class="forum-link" href="${escapeHtmlAttribute(href)}">${content}</a>`],
    [/\[url]([\s\S]*?)\[\/url]/gi, (_match, href) => `<a class="forum-link" href="${escapeHtmlAttribute(forumMarkupToPlainText(href))}">${href}</a>`],
    [/\[img]([\s\S]*?)\[\/img]/gi, (_match, src) => `<img src="${escapeHtmlAttribute(forumMarkupToPlainText(src))}" alt="">`],
    [/\[at]([\s\S]*?)\[\/at]/gi, (_match, name) => {
      const plainName = forumMarkupToPlainText(name);
      return `<a class="forum-mention" href="${escapeHtmlAttribute(getPublicProfilePath(plainName))}">@${escapeHtml(plainName)}</a>`;
    }],
    [/\[color=([^\]]+)]([\s\S]*?)\[\/color]/gi, (_match, color, content) => `<font color="${escapeHtmlAttribute(color)}">${content}</font>`],
    [/\[font=([^\]]+)]([\s\S]*?)\[\/font]/gi, (_match, face, content) => `<font face="${escapeHtmlAttribute(face)}">${content}</font>`],
    [/\[size=([^\]]+)]([\s\S]*?)\[\/size]/gi, (_match, size, content) => `<font size="${escapeHtmlAttribute(size)}">${content}</font>`],
    [/\[b]([\s\S]*?)\[\/b]/gi, (_match, content) => `<strong>${content}</strong>`],
    [/\[i]([\s\S]*?)\[\/i]/gi, (_match, content) => `<em>${content}</em>`],
    [/\[u]([\s\S]*?)\[\/u]/gi, (_match, content) => `<u>${content}</u>`],
    [/\[s]([\s\S]*?)\[\/s]/gi, (_match, content) => `<s>${content}</s>`],
  ];

  const replaceCompleteBbcode = (input: string) => {
    let html = input;
    while (true) {
      const before = html;
      replacements.forEach(([pattern, replace]) => {
        html = html.replace(pattern, replace);
      });
      if (html === before) return html;
    }
  };

  const html = replaceCompleteBbcode(value);
  const completedHtml = closeUnclosedLegacyBbcode(html);
  return completedHtml === html ? html : replaceCompleteBbcode(completedHtml);
}

export function forumMarkupToPlainText(value: string) {
  if (!value.trim()) return '';
  const parser = new DOMParser();
  const document = parser.parseFromString(value, 'text/html');
  return (document.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function closeUnclosedLegacyBbcode(value: string) {
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
    } else if (isValidLegacyBbcodeOpening(tag, argument)) {
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

function isValidLegacyBbcodeOpening(tag: string, argument: string | undefined) {
  if (tag === 'quote' || tag === 'url') return argument === undefined || argument.trim() !== '';
  if (tag === 'color' || tag === 'font' || tag === 'size') return argument !== undefined && argument.trim() !== '';
  return argument === undefined;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character] ?? character);
}

function escapeHtmlAttribute(value: string) {
  return escapeHtml(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
