export type RichTextEditorMode = 'rich' | 'markdown' | 'html';

export type RichTextEditorValue = {
  content: string;
  mode: RichTextEditorMode;
};

export type EditorPopover = 'image' | 'link' | 'mention' | 'quote' | null;

export type PastedImageState = {
  error?: string;
  isCompressing: boolean;
  isUploading: boolean;
  originalFile: File;
  previewUrl: string;
  workingFile: File;
};

export type RichInlineStyle = {
  color?: string;
  fontFamily?: string;
  fontSize?: string;
};
