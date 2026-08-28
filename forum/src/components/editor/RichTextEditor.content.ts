import { renderForumMarkup } from '../../utils/forumMarkup';
import { translateLegacyBbcode } from '../../utils/legacyBbcode';
import { stripEditorGalleryEditControls } from './RichTextEditor.gallery';
import {
  buildHtmlPreviewDocument,
  compactHtmlForStorage,
  formatHtmlForSource,
} from './RichTextEditor.html';
import { renderMarkdownToHtml } from './RichTextEditor.markdownRender';
import { finalizeRichTypingStyles } from './RichTextEditor.richDom';
import type { RichTextEditorMode, RichTextEditorValue } from './RichTextEditor.types';

export function getRichTextEditorStorageValue(value: RichTextEditorValue): RichTextEditorValue {
  if (value.mode === 'markdown') return value;

  return {
    ...value,
    content: compactHtmlForStorage(
      value.mode === 'rich' ? translateRichTextBbcode(value.content) : value.content,
    ),
  };
}

export function getRichTextEditorHtmlValue(value: RichTextEditorValue) {
  const html = value.mode === 'markdown'
    ? renderMarkdownToHtml(value.content)
    : value.mode === 'rich'
      ? translateRichTextBbcode(value.content)
      : value.content;
  return compactHtmlForStorage(html);
}

export function getRichTextEditorPreviewDocument(
  value: RichTextEditorValue,
  options: { embedded?: boolean } = {},
) {
  const previewHtml = value.mode === 'markdown'
    ? renderForumMarkup(renderMarkdownToHtml(value.content))
    : value.mode === 'rich'
      ? translateRichTextBbcode(value.content)
      : value.content;
  return buildHtmlPreviewDocument(
    value.mode === 'markdown' ? previewHtml : compactHtmlForStorage(previewHtml),
    document.documentElement.classList.contains('dark'),
    options.embedded,
  );
}

export function hasRichTextEditorHtmlContent(content: string) {
  const container = document.createElement('div');
  container.innerHTML = finalizeRichTypingStyles(content);
  return (
    (container.textContent ?? '').replace(/\u00a0/g, ' ').trim().length > 0
    || Boolean(container.querySelector('img, hr'))
  );
}

export function convertEditorContent(
  content: string,
  from: RichTextEditorMode,
  to: RichTextEditorMode,
) {
  if (from === to) return content;
  if (to === 'rich') {
    return from === 'markdown' ? renderMarkdownToHtml(content) : compactHtmlForStorage(content);
  }
  if (to === 'markdown') return htmlToMarkdown(content);
  if (from === 'markdown') return formatHtmlForSource(renderMarkdownToHtml(content));
  return formatHtmlForSource(from === 'rich' ? translateRichTextBbcode(content) : content);
}

export function translateRichTextBbcode(content: string) {
  return translateLegacyBbcode(finalizeRichTypingStyles(stripEditorGalleryEditControls(content)));
}

export function isCrossGroupModeSwitchLocked(
  value: RichTextEditorValue,
  nextMode: RichTextEditorMode,
) {
  const switchesMarkdownGroup = (value.mode === 'markdown') !== (nextMode === 'markdown');
  return switchesMarkdownGroup && hasModeSwitchingContent(value);
}

export function hasModeSwitchingContent(value: RichTextEditorValue) {
  return value.mode === 'rich'
    ? hasRichTextEditorHtmlContent(value.content)
    : value.content.trim().length > 0;
}

type ImageDimensions = {
  height?: string;
  width?: string;
};

function normalizeImageDimensionValue(value: string | null | undefined) {
  const trimmedValue = value?.trim() ?? '';
  if (!trimmedValue) return undefined;

  const numericMatch = trimmedValue.match(/^(\d+(?:\.\d+)?)(px|%)?$/i);
  if (!numericMatch) return undefined;

  const numericValue = Number(numericMatch[1]);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return undefined;

  const unit = numericMatch[2]?.toLowerCase() ?? 'px';
  const roundedValue = Math.round(numericValue * 100) / 100;
  return `${roundedValue}${unit}`;
}

function getHtmlImageDimensions(image: HTMLElement): ImageDimensions {
  return {
    height: normalizeImageDimensionValue(image.style.height)
      ?? normalizeImageDimensionValue(image.getAttribute('height')),
    width: normalizeImageDimensionValue(image.style.width)
      ?? normalizeImageDimensionValue(image.getAttribute('width')),
  };
}

function formatMarkdownImageDimensions(image: HTMLElement) {
  const dimensions = getHtmlImageDimensions(image);
  const attributes = [
    dimensions.width ? `width=${dimensions.width}` : '',
    dimensions.height ? `height=${dimensions.height}` : '',
  ].filter(Boolean);
  return attributes.length > 0 ? `{${attributes.join(' ')}}` : '';
}

export function escapeMarkdownLinkText(text: string) {
  return text.replace(/([\\[\]])/g, '\\$1');
}

function htmlToMarkdown(html: string) {
  if (!html.trim()) return '';

  const container = document.createElement('div');
  container.innerHTML = html;
  const markdown = Array.from(container.childNodes).map(nodeToMarkdown).join('');
  return markdown.replace(/\n{3,}/g, '\n\n').trim();
}

function nodeToMarkdown(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? '';
    const parentTag = node.parentElement?.tagName.toLowerCase();
    if (parentTag === 'code' || parentTag === 'pre') return text;
    return text.trim() ? text : '';
  }
  if (!(node instanceof HTMLElement)) return '';

  const content = Array.from(node.childNodes).map(nodeToMarkdown).join('');
  switch (node.tagName.toLowerCase()) {
    case 'a':
      return `[${content || node.textContent || '链接'}](${node.getAttribute('href') || '#'})`;
    case 'b':
    case 'strong':
      return `**${content}**`;
    case 'br':
      return '\n';
    case 'blockquote':
      return `${content.split('\n').filter(Boolean).map((line) => `> ${line}`).join('\n')}\n\n`;
    case 'code':
      return node.parentElement?.tagName.toLowerCase() === 'pre' ? content : `\`${content}\``;
    case 'div':
    case 'p':
      return `${content}\n\n`;
    case 'del':
    case 's':
    case 'strike':
      return `~~${content}~~`;
    case 'em':
    case 'i':
      return `_${content}_`;
    case 'h1': return `# ${content}\n\n`;
    case 'h2': return `## ${content}\n\n`;
    case 'h3': return `### ${content}\n\n`;
    case 'h4': return `#### ${content}\n\n`;
    case 'h5': return `##### ${content}\n\n`;
    case 'h6': return `###### ${content}\n\n`;
    case 'hr':
      return '\n---\n\n';
    case 'img':
      return `![${escapeMarkdownLinkText(node.getAttribute('alt') || '图片')}](${node.getAttribute('src') || ''})${formatMarkdownImageDimensions(node)}`;
    case 'li':
      return `- ${content}\n`;
    case 'ol':
      return `\n${Array.from(node.children)
        .filter((child) => child.tagName.toLowerCase() === 'li')
        .map((child, index) => `${index + 1}. ${Array.from(child.childNodes).map(nodeToMarkdown).join('')}`)
        .join('\n')}\n\n`;
    case 'pre':
      return `\n\`\`\`\n${node.textContent ?? ''}\n\`\`\`\n\n`;
    case 'ul':
      return `\n${content}\n`;
    default:
      return content;
  }
}

export function plainTextLength(content: string, mode: RichTextEditorMode) {
  if (mode !== 'rich') return content.length;

  const container = document.createElement('div');
  container.innerHTML = finalizeRichTypingStyles(content);
  return (container.textContent ?? '').length;
}
