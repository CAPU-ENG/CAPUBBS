import { getPublicProfilePath } from './userRoutes';

type LegacyBbcodeReplacement = [RegExp, (...matches: string[]) => string];

const legacyBbcodeTokenPattern = /\[(?:\/?(?:quote|url|img|at|color|font|size|b|i|u|s))(?:=[^\]\r\n]*)?]/gi;

export function escapeLegacyBbcodeInHtmlText(value: string) {
  let escaped = '';
  let cursor = 0;

  while (cursor < value.length) {
    const tagStart = value.indexOf('<', cursor);
    if (tagStart < 0) {
      return escaped + escapeLegacyBbcodeTokens(value.slice(cursor));
    }

    escaped += escapeLegacyBbcodeTokens(value.slice(cursor, tagStart));

    if (value.startsWith('<!--', tagStart)) {
      const commentEnd = value.indexOf('-->', tagStart + 4);
      if (commentEnd < 0) {
        return escaped + value.slice(tagStart);
      }

      escaped += value.slice(tagStart, commentEnd + 3);
      cursor = commentEnd + 3;
      continue;
    }

    const tagEnd = findHtmlTagEnd(value, tagStart + 1);
    if (tagEnd < 0) {
      return escaped + escapeLegacyBbcodeTokens(value.slice(tagStart));
    }

    escaped += value.slice(tagStart, tagEnd + 1);
    cursor = tagEnd + 1;
  }

  return escaped;
}

function escapeLegacyBbcodeTokens(value: string) {
  return value.replace(
    legacyBbcodeTokenPattern,
    (token) => `&#91;${token.slice(1, -1)}&#93;`,
  );
}

function findHtmlTagEnd(value: string, start: number) {
  let quote = '';

  for (let index = start; index < value.length; index += 1) {
    const character = value[index];
    if (quote) {
      if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '>') return index;
  }

  return -1;
}

export function translateLegacyBbcode(value: string) {
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
