import MarkdownIt, {
  type RendererRule,
  type StateCore,
  type StateInline,
} from 'markdown-it';
import { getPublicProfileAppPath } from '../../utils/userRoutes.ts';

const markdownFloorQuoteMetaPattern = /^引用自 \[((?:\\.|[^\]])+)\]\(([^)]+)\) \[>>\]\(([^)]+)\)$/;

const markdownRenderer = new MarkdownIt({
  breaks: false,
  html: false,
  linkify: false,
  typographer: false,
});

markdownRenderer.inline.ruler.before('link', 'capubbs_mention', parseMarkdownMention);
markdownRenderer.core.ruler.after('inline', 'capubbs_image_dimensions', applyMarkdownImageDimensions);

const defaultLinkOpenRenderer: RendererRule = markdownRenderer.renderer.rules.link_open
  ?? ((tokens, index, options, _environment, renderer) => renderer.renderToken(tokens, index, options));
markdownRenderer.renderer.rules.link_open = (tokens, index, options, environment, renderer) => {
  tokens[index].attrSet('target', '_blank');
  tokens[index].attrSet('rel', 'noreferrer');
  return defaultLinkOpenRenderer(tokens, index, options, environment, renderer);
};

const defaultBlockquoteOpenRenderer: RendererRule = markdownRenderer.renderer.rules.blockquote_open
  ?? ((tokens, index, options, _environment, renderer) => renderer.renderToken(tokens, index, options));
markdownRenderer.renderer.rules.blockquote_open = (tokens, index, options, environment, renderer) => {
  tokens[index].attrJoin('class', 'forum-quote');
  return defaultBlockquoteOpenRenderer(tokens, index, options, environment, renderer);
};

export function renderMarkdownToHtml(markdown: string) {
  if (!markdown.trim()) return '';

  const extracted = extractMarkdownFloorQuotes(markdown.replace(/\r\n?/g, '\n'));
  let html = markdownRenderer.render(extracted.markdown);

  extracted.floorQuotes.forEach(({ html: floorQuoteHtml, placeholder }) => {
    html = html.replace(`<p>${placeholder}</p>\n`, floorQuoteHtml);
  });

  return html.trim();
}

function parseMarkdownMention(state: StateInline, silent: boolean) {
  if (!state.src.startsWith('[at]', state.pos)) return false;

  const closingTag = '[/at]';
  const closingIndex = state.src.indexOf(closingTag, state.pos + 4);
  if (closingIndex === -1) return false;

  const username = state.src.slice(state.pos + 4, closingIndex);
  if (!username) return false;

  if (!silent) {
    const linkOpen = state.push('link_open', 'a', 1);
    linkOpen.attrSet('href', getPublicProfileAppPath(username, '/'));
    const text = state.push('text', '', 0);
    text.content = `@${username}`;
    state.push('link_close', 'a', -1);
  }

  state.pos = closingIndex + closingTag.length;
  return true;
}

function applyMarkdownImageDimensions(state: StateCore) {
  state.tokens.forEach((blockToken) => {
    const inlineTokens = blockToken.children;
    if (!inlineTokens) return;

    for (let index = 0; index < inlineTokens.length - 1; index += 1) {
      const image = inlineTokens[index];
      const followingText = inlineTokens[index + 1];
      if (image.type !== 'image' || followingText.type !== 'text') continue;

      const dimensionMatch = followingText.content.match(/^\{([^}]+)\}/);
      if (!dimensionMatch) continue;

      const style = parseMarkdownImageDimensionStyle(dimensionMatch[1]);
      if (!style) continue;

      image.attrSet('style', style);
      followingText.content = followingText.content.slice(dimensionMatch[0].length);
      if (!followingText.content) inlineTokens.splice(index + 1, 1);
    }
  });
}

function parseMarkdownImageDimensionStyle(attributes: string) {
  const styles: string[] = [];
  const attributePattern = /\b(width|height)\s*[:=]\s*([0-9.]+(?:px|%)?)/gi;
  let match: RegExpExecArray | null;

  while ((match = attributePattern.exec(attributes)) !== null) {
    const value = normalizeMarkdownImageDimension(match[2]);
    if (value) styles.push(`${match[1].toLowerCase()}: ${value}`);
  }

  return styles.length > 0 ? `${styles.join('; ')};` : '';
}

function normalizeMarkdownImageDimension(value: string) {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)(px|%)?$/i);
  if (!match) return '';

  const numericValue = Number(match[1]);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return '';

  const roundedValue = Math.round(numericValue * 100) / 100;
  return `${roundedValue}${match[2]?.toLowerCase() ?? 'px'}`;
}

function extractMarkdownFloorQuotes(markdown: string) {
  const lines = markdown.split('\n');
  const outputLines: string[] = [];
  const floorQuotes: Array<{ html: string; placeholder: string }> = [];
  let activeFence: { length: number; marker: string } | null = null;

  for (let index = 0; index < lines.length;) {
    const fence = parseMarkdownFence(lines[index]);
    if (fence) {
      if (!activeFence) {
        activeFence = fence;
      } else if (
        fence.canClose
        && fence.marker === activeFence.marker
        && fence.length >= activeFence.length
      ) {
        activeFence = null;
      }
      outputLines.push(lines[index]);
      index += 1;
      continue;
    }

    if (activeFence) {
      outputLines.push(lines[index]);
      index += 1;
      continue;
    }

    const firstQuoteLine = parseMarkdownQuoteLine(lines[index]);
    if (firstQuoteLine === null) {
      outputLines.push(lines[index]);
      index += 1;
      continue;
    }

    const originalLines: string[] = [];
    const quoteLines: string[] = [];
    while (index < lines.length) {
      const quoteLine = parseMarkdownQuoteLine(lines[index]);
      if (quoteLine === null) break;
      originalLines.push(lines[index]);
      quoteLines.push(quoteLine);
      index += 1;
    }

    const floorQuoteHtml = renderMarkdownFloorQuote(quoteLines);
    if (!floorQuoteHtml) {
      outputLines.push(...originalLines);
      continue;
    }

    const placeholder = createFloorQuotePlaceholder(markdown, floorQuotes.length);
    if (outputLines.length > 0 && outputLines.at(-1) !== '') outputLines.push('');
    outputLines.push(placeholder, '');
    floorQuotes.push({ html: floorQuoteHtml, placeholder });
  }

  return { floorQuotes, markdown: outputLines.join('\n') };
}

function parseMarkdownFence(line: string) {
  const match = line.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/);
  if (!match || (match[1][0] === '`' && match[2].includes('`'))) return null;

  return {
    canClose: match[2].trim().length === 0,
    length: match[1].length,
    marker: match[1][0],
  };
}

function parseMarkdownQuoteLine(line: string) {
  const match = line.match(/^\s{0,3}>\s?(.*)$/);
  return match ? match[1] : null;
}

function renderMarkdownFloorQuote(quoteLines: string[]) {
  const metaLineIndex = findFloorQuoteMetaLineIndex(quoteLines);
  if (metaLineIndex === -1) return '';

  const metaMatch = quoteLines[metaLineIndex].match(markdownFloorQuoteMetaPattern);
  if (!metaMatch) return '';

  const quoteContent = quoteLines
    .slice(0, metaLineIndex)
    .filter((line) => line.trim().length > 0)
    .map((line) => `<p class="capubbs-floor-quote-content">${markdownRenderer.renderInline(line)}</p>`)
    .join('');
  const author = unescapeMarkdownLinkText(metaMatch[1]);
  const authorHref = normalizeMarkdownUrl(metaMatch[2]);
  const floorHref = normalizeMarkdownUrl(metaMatch[3]);
  const escapeHtml = markdownRenderer.utils.escapeHtml;

  return [
    '<blockquote class="capubbs-floor-quote">',
    quoteContent,
    `<p class="capubbs-floor-quote-meta"><span>引用自 <a href="${escapeHtml(authorHref)}" target="_blank" rel="noreferrer">${escapeHtml(author)}</a></span><a class="capubbs-floor-quote-jump" href="${escapeHtml(floorHref)}" target="_blank" rel="noreferrer">&gt;&gt;</a></p>`,
    '</blockquote>',
  ].join('');
}

function findFloorQuoteMetaLineIndex(quoteLines: string[]) {
  for (let index = quoteLines.length - 1; index >= 0; index -= 1) {
    if (!quoteLines[index].trim()) continue;
    return markdownFloorQuoteMetaPattern.test(quoteLines[index]) ? index : -1;
  }

  return -1;
}

function normalizeMarkdownUrl(value: string) {
  const normalizedUrl = markdownRenderer.normalizeLink(value);
  return markdownRenderer.validateLink(normalizedUrl) ? normalizedUrl : '#';
}

function unescapeMarkdownLinkText(text: string) {
  return text.replace(/\\([\\[\]])/g, '$1');
}

function createFloorQuotePlaceholder(markdown: string, index: number) {
  let placeholder = `CAPUBBSFLOORQUOTEPLACEHOLDER${index}`;
  while (markdown.includes(placeholder)) placeholder += 'X';
  return placeholder;
}
