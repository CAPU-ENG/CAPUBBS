import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, AtSign, Bold, Eraser,
  Images as GalleryIcon, Image as ImageIcon, IndentDecrease, IndentIncrease,
  Italic, Link2, List, ListOrdered, MessageSquareQuote, Minus, Palette,
  Strikethrough, Subscript, Superscript, TextInitial, Underline,
} from 'lucide-react';
import type {
  ChangeEventHandler, Dispatch, FormEventHandler, MouseEventHandler,
  ReactNode, RefObject, SetStateAction,
} from 'react';
import {
  defaultTextColor, richTextFontOptions, richTextFontSizeOptions, richTextHeadingOptions,
} from './RichTextEditor.constants';
import { editorImageInputAccept } from './RichTextEditor.images';
import { normalizeCssColor } from './RichTextEditor.richText';
import type { RichToggleCommandStates } from './RichTextEditor.richDom';
import type { EditorPopover } from './RichTextEditor.types';

type Props = {
  activePopover: EditorPopover;
  activeRichCommands: RichToggleCommandStates;
  applyHexSourceColor: () => void;
  applyRichTextColor: (color: string) => void;
  closePopover: () => void;
  fontSelectValue: string;
  fontSizeSelectValue: string;
  handleColorActionMouseDown: MouseEventHandler<HTMLButtonElement>;
  handleHexSourceChange: (value: string) => void;
  handleLocalImageFileChange: ChangeEventHandler<HTMLInputElement>;
  handlePopoverSubmit: FormEventHandler<HTMLFormElement>;
  handleRichFontChange: ChangeEventHandler<HTMLSelectElement>;
  handleRichFontSizeChange: ChangeEventHandler<HTMLSelectElement>;
  handleRichHeadingChange: ChangeEventHandler<HTMLSelectElement>;
  handleToolbarMouseDown: MouseEventHandler<HTMLButtonElement>;
  headingSelectValue: string;
  hexSourceValue: string;
  imageFileError: string;
  imageFileInputRef: RefObject<HTMLInputElement | null>;
  insertHorizontalRule: () => void;
  isCheckingImageFile: boolean;
  isColorPickerOpen: boolean;
  isSourceMode: boolean;
  openGalleryDialog: () => void;
  openPopover: (popover: Exclude<EditorPopover, null>) => void;
  openQuotePopover: () => void;
  popoverConfig: { label: string; placeholder: string } | null;
  popoverTextValue: string;
  popoverValue: string;
  recentTextColors: string[];
  runRichCommand: (command: string, commandValue?: string) => void;
  saveSelection: () => void;
  selectedTextColor: string;
  setPopoverTextValue: Dispatch<SetStateAction<string>>;
  setPopoverValue: Dispatch<SetStateAction<string>>;
  toggleColorPicker: () => void;
  toggleRichFirstLineIndent: () => void;
};

export function RichTextEditorControls(props: Props) {
  const {
    activePopover, activeRichCommands, applyHexSourceColor, applyRichTextColor,
    closePopover, fontSelectValue, fontSizeSelectValue, handleColorActionMouseDown,
    handleHexSourceChange, handleLocalImageFileChange, handlePopoverSubmit,
    handleRichFontChange, handleRichFontSizeChange, handleRichHeadingChange,
    handleToolbarMouseDown, headingSelectValue, hexSourceValue, imageFileError,
    imageFileInputRef, isCheckingImageFile, isColorPickerOpen, isSourceMode,
    insertHorizontalRule,
    openGalleryDialog, openPopover, openQuotePopover, popoverConfig, popoverTextValue, popoverValue,
    recentTextColors, runRichCommand, saveSelection, selectedTextColor,
    setPopoverTextValue, setPopoverValue,
    toggleColorPicker, toggleRichFirstLineIndent,
  } = props;

  return (
      <div className="bg-white/70 dark:bg-white/[0.04]">
        {!isSourceMode ? (
          <div className="capubbs-rich-toolbar overflow-x-auto border-b border-zinc-200/80 px-1.5 py-1 dark:border-white/10">
            <div className="flex min-w-max flex-nowrap items-center gap-[0.5px]">
              <ToolbarButton active={activeRichCommands.bold} label="加粗" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('bold')}>
                <Bold size={14} />
              </ToolbarButton>
              <ToolbarButton active={activeRichCommands.italic} label="斜体" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('italic')}>
                <Italic size={14} />
              </ToolbarButton>
              <ToolbarButton active={activeRichCommands.underline} label="下划线" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('underline')}>
                <Underline size={14} />
              </ToolbarButton>
              <ToolbarButton active={activeRichCommands.strikeThrough} label="删除线" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('strikeThrough')}>
                <Strikethrough size={14} />
              </ToolbarButton>

              <ToolbarDivider />

              <label className="flex h-6 items-center rounded-[var(--control-radius)] border border-zinc-200 bg-white px-1 dark:border-white/10 dark:bg-zinc-950">
                <span className="sr-only">字体</span>
                <select
                  value={fontSelectValue}
                  onMouseDown={saveSelection}
                  onFocus={saveSelection}
                  onChange={handleRichFontChange}
                  className="h-5 w-16 border-0 bg-transparent px-0 text-[length:var(--ui-font-size-md)] font-medium text-zinc-700 outline-none dark:text-zinc-200"
                  aria-label="字体"
                >
                  <option value="">字体</option>
                  {richTextFontOptions.map((fontOption) => (
                    <option key={fontOption.value} value={fontOption.value}>
                      {fontOption.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex h-6 items-center rounded-[var(--control-radius)] border border-zinc-200 bg-white px-1 dark:border-white/10 dark:bg-zinc-950">
                <span className="sr-only">字号</span>
                <select
                  value={fontSizeSelectValue}
                  onMouseDown={saveSelection}
                  onFocus={saveSelection}
                  onChange={handleRichFontSizeChange}
                  className="h-5 w-12 border-0 bg-transparent px-0 text-[length:var(--ui-font-size-md)] font-medium text-zinc-700 outline-none dark:text-zinc-200"
                  aria-label="字号"
                >
                  <option value="">字号</option>
                  {richTextFontSizeOptions.map((fontSizeOption) => (
                    <option key={fontSizeOption.value} value={fontSizeOption.value}>
                      {fontSizeOption.label}
                    </option>
                  ))}
                </select>
              </label>

              <ToolbarDivider />

              <ToolbarButton active={activeRichCommands.superscript} label="上标" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('superscript')}>
                <Superscript size={14} />
              </ToolbarButton>
              <ToolbarButton active={activeRichCommands.subscript} label="下标" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('subscript')}>
                <Subscript size={14} />
              </ToolbarButton>
              <label className="flex h-6 items-center rounded-[var(--control-radius)] border border-zinc-200 bg-white px-1 dark:border-white/10 dark:bg-zinc-950">
                <span className="sr-only">标题格式</span>
                <select
                  value={headingSelectValue}
                  onMouseDown={saveSelection}
                  onFocus={saveSelection}
                  onChange={handleRichHeadingChange}
                  className="h-5 w-16 border-0 bg-transparent px-0 text-[length:var(--ui-font-size-md)] font-medium text-zinc-700 outline-none dark:text-zinc-200"
                  aria-label="标题格式"
                >
                  {richTextHeadingOptions.map((headingOption) => (
                    <option key={headingOption.value} value={headingOption.value}>
                      {headingOption.label}
                    </option>
                  ))}
                </select>
              </label>
              <ToolbarButton active={activePopover === 'quote'} label="引用" onMouseDown={handleToolbarMouseDown} onClick={openQuotePopover}>
                <MessageSquareQuote size={14} />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton active={activeRichCommands.firstLineIndent} label="首行缩进" onMouseDown={handleToolbarMouseDown} onClick={toggleRichFirstLineIndent}>
                <TextInitial size={14} />
              </ToolbarButton>
              <ToolbarButton label="左对齐" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('justifyLeft')}>
                <AlignLeft size={14} />
              </ToolbarButton>
              <ToolbarButton label="居中" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('justifyCenter')}>
                <AlignCenter size={14} />
              </ToolbarButton>
              <ToolbarButton label="右对齐" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('justifyRight')}>
                <AlignRight size={14} />
              </ToolbarButton>
              <ToolbarButton label="两端对齐" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('justifyFull')}>
                <AlignJustify size={14} />
              </ToolbarButton>
              <ToolbarButton label="无序列表" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('insertUnorderedList')}>
                <List size={14} />
              </ToolbarButton>
              <ToolbarButton label="有序列表" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('insertOrderedList')}>
                <ListOrdered size={14} />
              </ToolbarButton>
              <ToolbarButton label="增加缩进" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('indent')}>
                <IndentIncrease size={14} />
              </ToolbarButton>
              <ToolbarButton label="减少缩进" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('outdent')}>
                <IndentDecrease size={14} />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton label="插入链接" onMouseDown={handleToolbarMouseDown} onClick={() => openPopover('link')}>
                <Link2 size={14} />
              </ToolbarButton>
              <ToolbarButton label="插入图片" onMouseDown={handleToolbarMouseDown} onClick={() => openPopover('image')}>
                <ImageIcon size={14} />
              </ToolbarButton>
              <ToolbarButton label="插入图廊" onMouseDown={handleToolbarMouseDown} onClick={openGalleryDialog}>
                <GalleryIcon size={14} />
              </ToolbarButton>
              <ToolbarButton label="@ 用户" onMouseDown={handleToolbarMouseDown} onClick={() => openPopover('mention')}>
                <AtSign size={14} />
              </ToolbarButton>
              <ToolbarButton label="分隔线" onMouseDown={handleToolbarMouseDown} onClick={insertHorizontalRule}>
                <Minus size={14} />
              </ToolbarButton>
              <ToolbarButton label="清除格式" onMouseDown={handleToolbarMouseDown} onClick={() => runRichCommand('removeFormat')}>
                <Eraser size={14} />
              </ToolbarButton>

              <ToolbarDivider />

              <button
                type="button"
                onMouseDown={(event) => {
                  handleToolbarMouseDown(event);
                  saveSelection();
                }}
                onClick={toggleColorPicker}
                className={`relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--control-radius)] text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white ${
                  isColorPickerOpen ? 'bg-zinc-100 text-zinc-950 dark:bg-white/10 dark:text-white' : ''
                }`}
                aria-label="文字颜色"
                title="文字颜色"
              >
                <Palette size={14} />
                <span
                  className="pointer-events-none absolute inset-x-1 bottom-0.5 h-0.5 rounded-full"
                  style={{ backgroundColor: normalizeCssColor(selectedTextColor) ?? defaultTextColor }}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        ) : null}

        {isColorPickerOpen && !isSourceMode ? (
          <div className="capubbs-editor-color-panel flex flex-wrap items-end gap-2 border-b border-zinc-200/80 px-2 py-2 dark:border-white/10">
            {recentTextColors.length > 0 ? (
              <div className="grid gap-1 text-[length:var(--ui-font-size-md)] font-semibold text-zinc-500 dark:text-zinc-400">
                <span>最近使用</span>
                <div className="flex h-7 items-center gap-1">
                  {recentTextColors.map((recentColor) => (
                    <button
                      key={recentColor}
                      type="button"
                      aria-label={`使用最近颜色 ${recentColor}`}
                      title={recentColor}
                      onMouseDown={handleColorActionMouseDown}
                      onClick={() => applyRichTextColor(recentColor)}
                      className="h-6 w-6 rounded-[var(--control-radius)] border border-zinc-300 shadow-sm transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] dark:border-white/20"
                      style={{ backgroundColor: recentColor }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
            <label className="grid w-24 gap-1 text-[length:var(--ui-font-size-md)] font-semibold text-zinc-500 dark:text-zinc-400">
              颜色
              <input
                value={hexSourceValue}
                onMouseDown={saveSelection}
                onChange={(event) => handleHexSourceChange(event.target.value)}
                maxLength={7}
                pattern="#[0-9A-Fa-f]{6}"
                placeholder="#174F38"
                spellCheck={false}
                className="h-7 w-full border border-zinc-200 bg-white px-2 font-mono text-[length:var(--ui-font-size-md)] font-medium uppercase text-zinc-800 outline-none transition focus:border-emerald-700/60 focus:ring-2 focus:ring-emerald-700/10 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100"
                aria-label="六位十六进制颜色"
              />
            </label>
            <button
              type="button"
              onMouseDown={handleColorActionMouseDown}
              onClick={applyHexSourceColor}
              disabled={!/^#[0-9A-F]{6}$/.test(hexSourceValue)}
              className="h-7 rounded-[var(--control-radius)] bg-emerald-800 px-2.5 text-[length:var(--ui-font-size-md)] font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              应用
            </button>
          </div>
        ) : null}

        {popoverConfig ? (
          <form
            onSubmit={handlePopoverSubmit}
            className="flex flex-wrap items-center gap-2 border-t border-zinc-200/80 px-2 py-2 dark:border-white/10"
          >
            {activePopover === 'link' ? (
              <>
                <label className="min-w-[10rem] flex-1">
                  <span className="sr-only">链接文本</span>
                  <input
                    autoFocus
                    value={popoverTextValue}
                    onChange={(event) => setPopoverTextValue(event.target.value)}
                    placeholder="链接文本"
                    className="h-9 w-full rounded-[1px] border border-zinc-200 bg-white/80 px-3 text-[length:var(--ui-font-size-lg)] font-semibold text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-[#174f38] focus:ring-2 focus:ring-[#174f38] dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-zinc-500"
                  />
                </label>
                <label className="min-w-[12rem] flex-[1.4]">
                  <span className="sr-only">链接地址</span>
                  <input
                    value={popoverValue}
                    onChange={(event) => setPopoverValue(event.target.value)}
                    placeholder="链接地址"
                    className="h-9 w-full rounded-[1px] border border-zinc-200 bg-white/80 px-3 text-[length:var(--ui-font-size-lg)] font-semibold text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-[#174f38] focus:ring-2 focus:ring-[#174f38] dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-zinc-500"
                  />
                </label>
              </>
            ) : (
              <label className="min-w-0 flex-1">
                <span className="sr-only">{popoverConfig.label}</span>
                <input
                  autoFocus
                  value={popoverValue}
                  onChange={(event) => setPopoverValue(event.target.value)}
                  placeholder={popoverConfig.placeholder}
                  className="h-9 w-full rounded-[1px] border border-zinc-200 bg-white/80 px-3 text-[length:var(--ui-font-size-lg)] font-semibold text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-[#174f38] focus:ring-2 focus:ring-[#174f38] dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-zinc-500"
                />
              </label>
            )}
            {activePopover === 'image' ? (
              <>
                <input
                  ref={imageFileInputRef}
                  type="file"
                  accept={editorImageInputAccept}
                  onChange={handleLocalImageFileChange}
                  className="sr-only"
                  tabIndex={-1}
                />
                <button
                  type="button"
                  disabled={isCheckingImageFile}
                  onClick={() => imageFileInputRef.current?.click()}
                  className="h-9 rounded-[1px] border border-[#174f38] bg-white/70 px-3 text-[length:var(--ui-font-size-md)] font-bold text-[#174f38] transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] disabled:cursor-wait disabled:opacity-50 dark:border-emerald-200 dark:bg-white/[0.06] dark:text-emerald-200 dark:hover:bg-emerald-200/10"
                >
                  {isCheckingImageFile ? '检查中...' : '上传图片'}
                </button>
              </>
            ) : null}
            <button
              type="submit"
              disabled={isCheckingImageFile}
              className="h-9 rounded-[1px] bg-[#174f38] px-3 text-[length:var(--ui-font-size-md)] font-bold text-white transition hover:bg-[#123d2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] dark:bg-emerald-200 dark:text-zinc-950 dark:hover:bg-emerald-100"
            >
              {activePopover === 'quote' ? '确认' : '插入'}
            </button>
            <button
              type="button"
              onClick={closePopover}
              disabled={isCheckingImageFile}
              className="h-9 rounded-[1px] border border-zinc-200 bg-white/70 px-3 text-[length:var(--ui-font-size-md)] font-semibold text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]"
            >
              取消
            </button>
            {activePopover === 'image' && imageFileError ? (
              <p role="alert" className="basis-full text-[length:var(--ui-font-size-sm)] font-semibold text-rose-700 dark:text-rose-200">
                {imageFileError}
              </p>
            ) : null}
          </form>
        ) : null}
      </div>

  );
}

function ToolbarButton({
  active,
  children,
  label,
  onClick,
  onMouseDown,
}: {
  active?: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
  onMouseDown: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={typeof active === 'boolean' ? active : undefined}
      title={label}
      onMouseDown={onMouseDown}
      onClick={onClick}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--control-radius)] border text-[#174f38] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174f38] dark:text-white ${
        active
          ? 'border-[#174f38]/30 bg-[#174f38]/10 shadow-inner dark:border-emerald-200/30 dark:bg-emerald-200/15'
          : 'border-transparent hover:border-zinc-200 hover:bg-zinc-100 dark:hover:border-white/10 dark:hover:bg-white/[0.1]'
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-px h-4 w-px shrink-0 bg-zinc-200 dark:bg-white/10" />;
}
