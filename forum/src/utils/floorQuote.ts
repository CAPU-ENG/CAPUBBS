import type { RichTextEditorValue } from '../components/editor/RichTextEditor';
import { toForumHref } from './forumBasePath.ts';

const FLOOR_QUOTE_COMMENT_PREFIX = 'capubbs:quote ';

export type FloorQuoteTarget = {
  author: string;
  authorHref: string;
  floor: number;
  floorHref: string;
  quote?: string;
};

type FloorQuoteMetadata = {
  floor?: number;
  href?: string;
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

export function buildLegacyFloorQuoteStorage({
  author,
  floor,
  href,
  text,
}: {
  author: string;
  floor?: number;
  href?: string;
  text: string;
}) {
  const quote = `[quote=${sanitizeLegacyQuoteAuthor(author)}]${normalizeLegacyQuoteText(text)}[/quote]`;
  const metadata = buildFloorQuoteMetadata({ floor, href });
  return metadata ? `${quote}<!--${FLOOR_QUOTE_COMMENT_PREFIX}${metadata}-->` : quote;
}

export function normalizeFloorQuotesForLegacyStorage(html: string) {
  if (!html.trim() || typeof document === 'undefined') return html;

  const template = document.createElement('template');
  template.innerHTML = html;
  const quotes = Array.from(template.content.querySelectorAll(
    'blockquote.capubbs-floor-quote, blockquote.forum-legacy-quote',
  ));

  quotes.forEach((quote) => {
    const jump = quote.querySelector<HTMLAnchorElement>('.capubbs-floor-quote-jump[href]');
    if (!quote.classList.contains('capubbs-floor-quote') && !jump) return;

    const existingMetadataComment = getAdjacentFloorQuoteMetadataComment(quote);
    const existingMetadata = parseFloorQuoteMetadata(existingMetadataComment?.data);
    const href = jump?.getAttribute('href') ?? existingMetadata.href;
    const storage = buildLegacyFloorQuoteStorage({
      author: getFloorQuoteAuthor(quote),
      floor: getFloorNumberFromHref(href) ?? existingMetadata.floor,
      href,
      text: getFloorQuoteText(quote),
    });
    const { comment, text } = splitFloorQuoteStorage(storage);
    const replacement: Node[] = [document.createTextNode(text)];

    existingMetadataComment?.remove();
    if (comment) replacement.push(document.createComment(comment));
    quote.replaceWith(...replacement);
  });

  return template.innerHTML.trim();
}

export function restoreLegacyFloorQuoteLinks(html: string) {
  if (!html.includes(FLOOR_QUOTE_COMMENT_PREFIX) || typeof document === 'undefined') return html;

  const template = document.createElement('template');
  template.innerHTML = html;
  getCommentNodes(template.content).forEach((comment) => {
    const metadata = parseFloorQuoteMetadata(comment.data);
    const href = normalizeFloorQuoteHref(metadata.href);
    const quote = getPreviousElementSibling(comment);
    if (!href || !quote || !quote.matches('.quotel, blockquote.forum-legacy-quote')) return;

    const content = quote.querySelector('.quoter, .forum-legacy-quote-content') ?? quote;
    const authorLink = content.querySelector('a');
    if (!authorLink || content.querySelector('.capubbs-floor-quote-jump')) return;

    const jump = document.createElement('a');
    jump.className = 'capubbs-floor-quote-jump';
    jump.setAttribute('href', href);
    jump.textContent = '>>';
    authorLink.after(jump);
  });

  return template.innerHTML;
}

function splitQuoteParagraphs(value: string) {
  return value
    .replace(/\r\n?/g, '\n')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function getFloorQuoteAuthor(quote: Element) {
  const meta = quote.querySelector('.capubbs-floor-quote-meta');
  const content = quote.querySelector('.forum-legacy-quote-content') ?? quote;
  const author = meta?.querySelector('a')?.textContent
    ?? content.querySelector('a:not(.capubbs-floor-quote-jump)')?.textContent
    ?? '';
  return author.replace(/^@/, '').trim() || '匿名用户';
}

function getFloorQuoteText(quote: Element) {
  const contentBlocks = Array.from(quote.querySelectorAll('.capubbs-floor-quote-content'));
  if (contentBlocks.length > 0) {
    return contentBlocks
      .map((block) => block.textContent?.trim() ?? '')
      .filter(Boolean)
      .join('\n');
  }

  const content = quote.querySelector('.forum-legacy-quote-content');
  if (!content) return quote.textContent?.trim() ?? '';

  const clone = content.cloneNode(true) as Element;
  clone.querySelector('.capubbs-floor-quote-jump')?.remove();
  clone.querySelector('a')?.remove();
  return (clone.textContent ?? '')
    .replace(/^\s*引用自\s*[：:]\s*/, '')
    .trim();
}

function buildFloorQuoteMetadata(metadata: FloorQuoteMetadata) {
  const href = normalizeFloorQuoteHref(metadata.href);
  const floor = normalizeFloorNumber(metadata.floor);
  const payload: FloorQuoteMetadata = {};
  if (href) payload.href = href;
  if (floor) payload.floor = floor;
  return Object.keys(payload).length > 0 ? JSON.stringify(payload) : '';
}

function parseFloorQuoteMetadata(value: string | undefined): FloorQuoteMetadata {
  const text = value?.trim() ?? '';
  if (!text.startsWith(FLOOR_QUOTE_COMMENT_PREFIX)) return {};

  try {
    const parsed = JSON.parse(text.slice(FLOOR_QUOTE_COMMENT_PREFIX.length)) as FloorQuoteMetadata;
    return {
      floor: normalizeFloorNumber(parsed.floor),
      href: normalizeFloorQuoteHref(parsed.href),
    };
  } catch {
    return {};
  }
}

function normalizeFloorQuoteHref(value: string | undefined) {
  const href = value?.trim();
  if (!href) return undefined;

  let url: URL;
  try {
    url = new URL(href, 'https://chexie.net/');
  } catch {
    return undefined;
  }

  const isRelative = !/^[a-z][a-z\d+.-]*:/i.test(href) && !href.startsWith('//');
  if (!isRelative && url.hostname !== 'chexie.net' && !url.hostname.endsWith('.chexie.net')) {
    return undefined;
  }

  const threadPathMatch = url.pathname.match(/^\/(?:bbs-new|capubbs-new)?\/?threads\/(\d+)-(\d+)$/i);
  const bid = positiveInteger(url.searchParams.get('bid'))
    ?? positiveInteger(threadPathMatch?.[1]);
  const tid = positiveInteger(url.searchParams.get('tid'))
    ?? positiveInteger(threadPathMatch?.[2]);
  const floor = positiveInteger(url.searchParams.get('pid'))
    ?? positiveInteger(url.searchParams.get('floor'))
    ?? getFloorNumberFromHref(url.hash);
  if (!bid || !tid || !floor) return undefined;

  const page = positiveInteger(url.searchParams.get('p'))
    ?? positiveInteger(url.searchParams.get('page'))
    ?? Math.ceil(floor / 12);
  const params = new URLSearchParams({ bid: String(bid), tid: String(tid), p: String(page) });
  return toForumHref(`/?${params.toString()}#${floor}`);
}

function normalizeFloorNumber(value: number | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  const floor = Math.floor(value);
  return floor > 0 ? floor : undefined;
}

function getFloorNumberFromHref(value: string | undefined) {
  const match = value?.match(/#(?:floor-)?(\d+)\b/i);
  return match ? normalizeFloorNumber(Number(match[1])) : undefined;
}

function positiveInteger(value: string | undefined | null) {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : undefined;
}

function normalizeLegacyQuoteText(value: string) {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/\[\/quote]/gi, '[/ quote]')
    .trim();
}

function sanitizeLegacyQuoteAuthor(value: string) {
  return (value.trim() || '匿名用户').replaceAll(']', '');
}

function getAdjacentFloorQuoteMetadataComment(element: Element) {
  let node = element.nextSibling;
  while (node?.nodeType === 3 && !node.textContent?.trim()) node = node.nextSibling;
  return node?.nodeType === 8 && node.textContent?.trim().startsWith(FLOOR_QUOTE_COMMENT_PREFIX)
    ? node as Comment
    : null;
}

function getPreviousElementSibling(comment: Comment) {
  let node = comment.previousSibling;
  while (node?.nodeType === 3 && !node.textContent?.trim()) node = node.previousSibling;
  return node?.nodeType === 1 ? node as Element : null;
}

function getCommentNodes(root: ParentNode) {
  const comments: Comment[] = [];
  const visit = (node: Node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === 8) comments.push(child as Comment);
      else visit(child);
    });
  };
  visit(root);
  return comments;
}

function splitFloorQuoteStorage(storage: string) {
  const match = storage.match(/<!--([\s\S]*?)-->$/);
  return match
    ? { comment: match[1], text: storage.slice(0, match.index) }
    : { comment: '', text: storage };
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
