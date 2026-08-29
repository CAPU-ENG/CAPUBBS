import { FORUM_DEFAULT_FONT_SIZE } from '../../utils/forumFontSize';
import { translateLegacyBbcode } from '../../utils/legacyBbcode';
import galleryStyles from '../../styles/gallery.css?raw';
import { htmlVoidTags } from './RichTextEditor.constants';
export function buildHtmlPreviewDocument(
  html: string,
  isDarkTheme: boolean,
  embedded = false,
  fontSize = FORUM_DEFAULT_FONT_SIZE,
) {
  const renderedHtml = translateLegacyBbcode(html);
  const theme = isDarkTheme
    ? {
        background: '#171d19',
        brand: '#69b98d',
        brandStrong: '#8bcca6',
        colorScheme: 'dark',
        line: '#2c362f',
        lineStrong: '#3c493f',
        surfaceRaised: '#1c241f',
        surfaceSoft: '#1f2822',
        text: '#dde5de',
        textFaint: '#748078',
        textMuted: '#a0aca2',
        textStrong: '#f6faf6',
      }
    : {
        background: '#fffefa',
        brand: '#236b4c',
        brandStrong: '#174f38',
        colorScheme: 'light',
        line: '#e1e6df',
        lineStrong: '#cdd5cc',
        surfaceRaised: '#ffffff',
        surfaceSoft: '#f6f8f4',
        text: '#20231f',
        textFaint: '#919991',
        textMuted: '#687068',
        textStrong: '#111411',
      };
  const previewHead = `
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="script-src 'none'; object-src 'none'">
  <base target="_blank">
  <style>
    @layer components {
      :root {
        color-scheme: ${theme.colorScheme};
        font-family: "Noto Sans CJK SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
        --surface: ${theme.background};
        --surface-raised: ${theme.surfaceRaised};
        --surface-soft: ${theme.surfaceSoft};
        --text: ${theme.text};
        --text-strong: ${theme.textStrong};
        --text-muted: ${theme.textMuted};
        --text-faint: ${theme.textFaint};
        --line: ${theme.line};
        --line-strong: ${theme.lineStrong};
        --brand: ${theme.brand};
        --brand-strong: ${theme.brandStrong};
      }

      html {
        background: var(--surface);
      }

      body {
        margin: 0;
        padding: ${embedded ? '0' : '16px'};
        background: var(--surface);
        color: var(--text);
        font-size: ${fontSize};
        line-height: 1.6;
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      body > :first-child {
        margin-top: 0;
      }

      body > :last-child {
        margin-bottom: 0;
      }

      body p,
      body div {
        margin: 0;
      }

      body p {
        margin: 0 0 0.75em;
      }

      body > div + div {
        margin-top: 0.55em;
      }

      a {
        color: var(--brand-strong);
        font-weight: inherit;
        text-decoration: underline;
        text-decoration-thickness: 1px;
        text-underline-offset: 0.16em;
      }

      .forum-mention {
        text-decoration: none;
      }

      blockquote {
        margin: 0 0 0 2em;
        border: 0;
        padding: 0;
        background: transparent;
        color: inherit;
      }

      blockquote.forum-quote,
      .forum-legacy-quote,
      blockquote.capubbs-floor-quote {
        margin: 0.8em 0;
        border-left: 3px solid color-mix(in srgb, var(--brand) 38%, var(--line));
        padding: 0.55em 0.75em;
        background: var(--surface-soft);
        color: var(--text-muted);
      }

      .capubbs-floor-quote-jump {
        margin-left: 0.75em;
      }

      .forum-legacy-quote-content {
        margin: 0;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        margin: 0.9rem 0 0.45rem;
        color: var(--brand-strong);
        font-weight: 800;
        line-height: 1.35;
      }

      h1 { font-size: 1.45rem; }
      h2 { font-size: 1.25rem; }
      h3 { font-size: 1.1rem; }
      h4,
      h5,
      h6 { font-size: 1em; }

      ul,
      ol {
        margin: 0.65em 0;
        padding-left: 1.45em;
      }

      ul { list-style: disc; }
      ol { list-style: decimal; }
      ol.capubbs-ordered-list-alpha { list-style-type: lower-alpha; }
      ol.capubbs-ordered-list-roman { list-style-type: lower-roman; }

      pre {
        max-width: 100%;
        overflow-x: auto;
        margin: 0.75em 0;
        border-radius: 2px;
        padding: 0.75em;
        background: #182531;
        color: #f8fafc;
        white-space: pre-wrap;
      }

      code,
      kbd {
        border-radius: 2px;
        padding: 0.08em 0.25em;
        background: color-mix(in srgb, var(--surface-soft) 75%, var(--line));
        font-family: "SFMono-Regular", "Cascadia Code", Consolas, monospace;
        font-size: 0.9em;
      }

      pre code {
        padding: 0;
        background: transparent;
        color: inherit;
      }

      font[size="1"] { font-size: 11px; }
      font[size="2"] { font-size: 13px; }
      font[size="3"] { font-size: 15px; }
      font[size="4"] { font-size: 17px; }
      font[size="5"] { font-size: 19px; }
      font[size="6"] { font-size: 21px; }
      font[size="7"] { font-size: 23px; }

      hr {
        margin: 0.9em 0;
        border: 0;
        border-top: 1px solid var(--line-strong);
      }

      img {
        display: inline-block;
        height: auto;
        max-width: 100%;
        vertical-align: middle;
      }

      img[role="button"] {
        cursor: zoom-in;
      }

      img[role="button"]:focus-visible {
        outline: 2px solid var(--brand);
        outline-offset: 3px;
      }

      table {
        display: block;
        max-width: 100%;
        overflow-x: auto;
        border-collapse: collapse;
      }

      td,
      th {
        border: 1px solid var(--line);
        padding: 0.35em 0.5em;
      }
    }

    ${galleryStyles}
  </style>
`;
  const trimmedHtml = addPreviewBodyClass(renderedHtml.trim());

  if (/<html[\s>]/i.test(trimmedHtml)) {
    if (/<head[\s>]/i.test(trimmedHtml)) {
      return trimmedHtml.replace(/<head([^>]*)>/i, `<head$1>${previewHead}`);
    }

    return trimmedHtml.replace(/<html([^>]*)>/i, `<html$1><head>${previewHead}</head>`);
  }

  return `<!doctype html>
<html>
<head>${previewHead}</head>
<body class="forum-markup forum-markup-floor" data-forum-markup="floor">${renderedHtml}</body>
</html>`;
}

function addPreviewBodyClass(html: string) {
  return html.replace(/<body([^>]*)>/i, (_match, attributes: string) => {
    const classMatch = attributes.match(/\sclass\s*=\s*(?:(["'])(.*?)\1|([^\s"'=<>`]+))/i);
    const attributesWithoutVariant = attributes.replace(/\sdata-forum-markup\s*=\s*(?:["'][^"']*["']|[^\s>]+)/i, '');
    if (!classMatch) {
      return `<body${attributesWithoutVariant} class="forum-markup forum-markup-floor" data-forum-markup="floor">`;
    }

    const classNames = new Set((classMatch[2] ?? classMatch[3]).split(/\s+/).filter(Boolean));
    classNames.add('forum-markup');
    classNames.add('forum-markup-floor');
    const nextClassAttribute = ` class="${Array.from(classNames).join(' ')}"`;
    const nextAttributes = attributesWithoutVariant.replace(classMatch[0], nextClassAttribute);
    return `<body${nextAttributes} data-forum-markup="floor">`;
  });
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
