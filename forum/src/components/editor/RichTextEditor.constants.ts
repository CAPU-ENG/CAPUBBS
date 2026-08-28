import type { RichTextEditorMode } from './RichTextEditor.types';
import { FORUM_DEFAULT_FONT_SIZE } from '../../utils/forumFontSize';

export const maxInlineImageBytes = 2 * 1024 * 1024;
export const imageCompressionMaxEdge = 2200;

export const editorModeGroups: Array<Array<{ label: string; mode: RichTextEditorMode }>> = [
  [
    { label: '富文本', mode: 'rich' },
    { label: 'HTML', mode: 'html' },
  ],
  [{ label: 'Markdown', mode: 'markdown' }],
];

export const richTextFontOptions = [
  { label: '黑体', value: "'黑体', SimHei, sans-serif" },
  { label: '微软雅黑', value: "'微软雅黑', 'Microsoft YaHei', sans-serif" },
  { label: '宋体', value: "'宋体', SimSun, serif" },
  { label: '楷体', value: "'楷体', Kaiti, serif" },
  { label: '仿宋', value: "'仿宋', FangSong, serif" },
  { label: '幼圆', value: "'幼圆', YouYuan, sans-serif" },
  { label: '等宽', value: 'monospace' },
];

export const richTextFontSizeOptions = [
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '15', value: FORUM_DEFAULT_FONT_SIZE },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
  { label: '32', value: '32px' },
];

export const richTextHeadingOptions = [
  { label: '正文', value: 'p' },
  { label: '标题 1', value: 'h1' },
  { label: '标题 2', value: 'h2' },
  { label: '标题 3', value: 'h3' },
  { label: '标题 4', value: 'h4' },
  { label: '标题 5', value: 'h5' },
  { label: '标题 6', value: 'h6' },
];

export const defaultRichTextFontSize = FORUM_DEFAULT_FONT_SIZE;
export const defaultTextColor = '#111827';
export const mobileViewportQuery = '(max-width: 767px)';

export const htmlVoidTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

export const markdownFloorQuoteMetaPattern = /^引用自 \[((?:\\.|[^\]])+)\]\(([^)]+)\) \[>>\]\(([^)]+)\)$/;
