import type { RichTextEditorValue } from '../components/editor/RichTextEditor';

export type FloorQuoteTarget = {
  author: string;
  authorHref: string;
  floor: number;
  floorHref: string;
  quote?: string;
};

export function appendFloorQuote(
  current: RichTextEditorValue,
  target: FloorQuoteTarget,
): RichTextEditorValue {
  const quote = target.quote?.trim();
  if (!quote) return current;

  const separator = current.content.trim()
    ? current.mode === 'rich'
      ? '<p><br></p>'
      : '\n\n'
    : '';

  if (current.mode === 'markdown') {
    const quoteLines = splitQuoteParagraphs(quote)
      .flatMap((paragraph, index) => (index === 0 ? [paragraph] : ['', paragraph]))
      .map((line) => `> ${line}`);
    const quoteMarkup = [
      ...quoteLines,
      '> ',
      `> 引用自 [${escapeMarkdownLinkText(target.author)}](${target.authorHref}) [>>](${target.floorHref})`,
      '',
    ].join('\n');

    return {
      ...current,
      content: `${current.content}${separator}${quoteMarkup}`,
    };
  }

  const quoteParagraphs = splitQuoteParagraphs(quote)
    .map((paragraph) => `<p class="capubbs-floor-quote-content">${escapeHtml(paragraph)}</p>`)
    .join('');
  const quoteMarkup = [
    '<blockquote class="capubbs-floor-quote">',
    quoteParagraphs,
    `<p class="capubbs-floor-quote-meta"><span>引用自 <a href="${escapeHtml(target.authorHref)}">${escapeHtml(target.author)}</a></span><a class="capubbs-floor-quote-jump" href="${escapeHtml(target.floorHref)}">&gt;&gt;</a></p>`,
    '</blockquote>',
    '<p><br></p>',
  ].join('');

  return {
    ...current,
    content: `${current.content}${separator}${quoteMarkup}`,
  };
}

function splitQuoteParagraphs(value: string) {
  return value
    .replace(/\r\n?/g, '\n')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function escapeMarkdownLinkText(value: string) {
  return value.replace(/([\\[\]])/g, '\\$1');
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
