import { FORUM_DEFAULT_FONT_SIZE } from '../../utils/forumFontSize';
import { translateLegacyBbcode } from '../../utils/legacyBbcode';
import { htmlVoidTags } from './RichTextEditor.constants';
export function buildHtmlPreviewDocument(html: string, isDarkTheme: boolean, embedded = false) {
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
      font-size: ${FORUM_DEFAULT_FONT_SIZE};
      line-height: 1.7;
      margin: 0;
      padding: ${embedded ? '0' : '16px'};
      word-break: break-word;
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
      margin: 0 0 0 2em;
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

export function highlightHtmlSource(source: string) {
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

export function formatHtmlForSource(html: string) {
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

export function compactHtmlForStorage(html: string) {
  if (!html.trim()) {
    return '';
  }

  const htmlWithSingleLineTags = html.replace(
    /<[^>]*>/g,
    (tag) => tag.replace(/[\t ]*[\r\n]+[\t ]*/g, ' '),
  );

  return htmlWithSingleLineTags
    .replace(/[\t ]*[\r\n]+[\t ]*/g, '')
    .replace(/>[\t ]+</g, '><')
    .trim();
}

export function normalizeUrl(url: string) {
  const trimmedUrl = url.trim();

  if (/^(https?:|mailto:|\/|#|data:image\/)/i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}

export function safeUrl(url: string) {
  const normalizedUrl = normalizeUrl(url);
  return /^javascript:/i.test(normalizedUrl) ? '#' : normalizedUrl;
}

export function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function escapeAttribute(text: string) {
  return escapeHtml(text).replace(/`/g, '&#096;');
}
