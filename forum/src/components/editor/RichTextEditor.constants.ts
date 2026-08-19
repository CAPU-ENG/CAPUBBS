import type { RichTextEditorMode } from './RichTextEditor.types';

export const maxInlineImageBytes = 2 * 1024 * 1024;
export const imageCompressionMaxEdge = 2200;

export const editorModes: Array<{ label: string; mode: RichTextEditorMode }> = [
  { label: '富文本', mode: 'rich' },
  { label: 'Markdown', mode: 'markdown' },
  { label: 'HTML', mode: 'html' },
];

export const richTextFontOptions = [
  { label: '黑体', value: "SimHei, 'Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC', sans-serif" },
  { label: '微软雅黑', value: "'Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC', sans-serif" },
  { label: '宋体', value: "SimSun, 'Songti SC', serif" },
  { label: '楷体', value: "KaiTi, 'Kaiti SC', serif" },
  { label: '仿宋', value: "FangSong, 'FangSong_GB2312', serif" },
  { label: '等宽', value: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace" },
];

export const richTextFontSizeOptions = [
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
  { label: '32', value: '32px' },
];

export const defaultRichTextFont = richTextFontOptions[0].value;
export const defaultRichTextFontSize = richTextFontSizeOptions[1].value;
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
