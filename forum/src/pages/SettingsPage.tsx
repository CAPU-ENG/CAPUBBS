import {
  Accessibility,
  ArrowUpToLine,
  Check,
  ChevronDown,
  CirclePlus,
  ContactRound,
  ImageIcon,
  ListEnd,
  MonitorCog,
  PanelRight,
  PanelTopClose,
  Pin,
  PinOff,
  Quote,
  Rows3,
  Save,
  Signature,
  SunMoon,
  UserRound,
} from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { ALL_BOARDS, PRIMARY_BOARDS, SECONDARY_BOARDS, getBoardById } from '../data/boards';
import {
  useAssistiveBarEnabled,
  useAutoSaveEnabled,
  useBackToTopEnabled,
  useFloorDecorationEnabled,
  useSignatureToggleEnabled,
  useWaterfallFeedEnabled,
} from '../hooks/useAssistiveFeatures';
import { useAuthorProfileEnabled } from '../hooks/useAuthorProfile';
import { useAvatarFollowEnabled } from '../hooks/useAvatarFollow';
import { useCompactMode } from '../hooks/useCompactMode';
import { useForumContentFontSize } from '../hooks/useForumContentFontSize';
import { usePinnedBoardIds } from '../hooks/usePinnedBoards';
import { useTheme } from '../hooks/useTheme';
import { useTopBarAutoHideEnabled } from '../hooks/useTopBarAutoHide';
import {
  saveAssistiveBarEnabled,
  saveAutoSaveEnabled,
  saveBackToTopEnabled,
  saveFloorDecorationEnabled,
  saveSignatureToggleEnabled,
  saveWaterfallFeedEnabled,
} from '../utils/assistiveFeatures';
import { saveAuthorProfileEnabled } from '../utils/authorProfile';
import { saveAvatarFollowEnabled } from '../utils/avatarFollow';
import { saveCompactMode } from '../utils/compactMode';
import {
  FORUM_CONTENT_FONT_SIZE_OPTIONS,
  saveForumContentFontSize,
} from '../utils/forumFontSize';
import { MAX_PINNED_BOARDS, savePinnedBoardIds } from '../utils/localSettings';
import { saveThemeFollowsSystem } from '../utils/theme';
import { saveTopBarAutoHideEnabled } from '../utils/topBarAutoHide';

export function SettingsPage() {
  const assistiveBarEnabled = useAssistiveBarEnabled();
  const autoSaveEnabled = useAutoSaveEnabled();
  const authorProfileEnabled = useAuthorProfileEnabled();
  const avatarFollowEnabled = useAvatarFollowEnabled();
  const backToTopEnabled = useBackToTopEnabled();
  const compactMode = useCompactMode();
  const forumContentFontSize = useForumContentFontSize();
  const floorDecorationEnabled = useFloorDecorationEnabled();
  const pinnedBoardIds = usePinnedBoardIds();
  const { followsSystem } = useTheme();
  const signatureToggleEnabled = useSignatureToggleEnabled();
  const topBarAutoHideEnabled = useTopBarAutoHideEnabled();
  const waterfallFeedEnabled = useWaterfallFeedEnabled();
  const [draftBoardIds, setDraftBoardIds] = useState(pinnedBoardIds);
  const draftBoardIdsRef = useRef(pinnedBoardIds);
  const previousPinnedBoardIdsRef = useRef(pinnedBoardIds);
  const boardSaveQueueRef = useRef(Promise.resolve());
  const pinnedBoards = draftBoardIds
    .map(getBoardById)
    .filter((board) => board !== undefined);
  const secondaryBoardIds = new Set(SECONDARY_BOARDS.map((board) => board.id));
  const selectedSecondaryBoardCount = draftBoardIds.filter((boardId) => secondaryBoardIds.has(boardId)).length;
  const isFull = draftBoardIds.length >= MAX_PINNED_BOARDS;

  useEffect(() => {
    if (authorProfileEnabled && avatarFollowEnabled) saveAvatarFollowEnabled(false);
  }, [authorProfileEnabled, avatarFollowEnabled]);

  useEffect(() => {
    const previousPinnedBoardIds = previousPinnedBoardIdsRef.current;
    previousPinnedBoardIdsRef.current = pinnedBoardIds;
    if (sameBoardIds(draftBoardIdsRef.current, previousPinnedBoardIds)) {
      updateDraftBoardIds(pinnedBoardIds);
    }
  }, [pinnedBoardIds]);

  function addBoard(boardId: number) {
    const board = getBoardById(boardId);
    const currentBoardIds = draftBoardIdsRef.current;
    if (currentBoardIds.length >= MAX_PINNED_BOARDS) return;
    if (!board || currentBoardIds.includes(boardId)) return;
    updateAndSaveBoardIds([...currentBoardIds, boardId]);
  }

  function removeBoard(boardId: number) {
    if (!getBoardById(boardId)) return;
    updateAndSaveBoardIds(draftBoardIdsRef.current.filter((id) => id !== boardId));
  }

  function updateAndSaveBoardIds(boardIds: number[]) {
    updateDraftBoardIds(boardIds);
    boardSaveQueueRef.current = boardSaveQueueRef.current.then(async () => {
      const result = await savePinnedBoardIds(boardIds);
      if (!result.saved && sameBoardIds(draftBoardIdsRef.current, boardIds)) {
        updateDraftBoardIds(result.boardIds);
      }
    });
  }

  function updateDraftBoardIds(boardIds: number[]) {
    draftBoardIdsRef.current = boardIds;
    setDraftBoardIds(boardIds);
  }

  return (
    <div className="settings-page relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar />

      <main className="settings-page-shell">
        <div className="settings-options-column">
          <section className="settings-panel" aria-labelledby="appearance-settings-title">
            <div className="settings-panel-heading">
              <span className="settings-panel-icon"><MonitorCog size={17} /></span>
              <div>
                <h2 id="appearance-settings-title">外观</h2>
              </div>
            </div>

            <div className="settings-checkbox-list settings-checkbox-columns">
              <SettingsCheckbox
                checked={followsSystem}
                help="跟随系统设置自动切换日间或夜间模式。"
                helpId="system-theme-help"
                icon={<SunMoon size={15} />}
                label="系统昼夜"
                onChange={saveThemeFollowsSystem}
              />
              <SettingsCheckbox
                checked={compactMode}
                help="缩小首页主题行高，仅保留标题、作者和时间。"
                helpId="compact-mode-help"
                icon={<Rows3 size={15} />}
                label="紧凑模式"
                onChange={saveCompactMode}
              />
              <SettingsCheckbox
                checked={topBarAutoHideEnabled}
                help="帖子详情页向下滚动时隐藏导航栏，向上滚动时重新显示。"
                helpId="top-bar-auto-hide-help"
                icon={<PanelTopClose size={15} />}
                label="导航栏自动隐藏"
                onChange={saveTopBarAutoHideEnabled}
              />
              <SettingsCheckbox
                checked={authorProfileEnabled}
                desktopOnly
                help="在帖子详情页左侧展示发帖者的头像、标签和数据。"
                helpId="author-profile-help"
                icon={<ContactRound size={15} />}
                label="资料卡展示"
                onChange={(enabled) => {
                  saveAuthorProfileEnabled(enabled);
                  if (enabled) saveAvatarFollowEnabled(false);
                }}
              />
              <SettingsCheckbox
                checked={!authorProfileEnabled && avatarFollowEnabled}
                disabled={authorProfileEnabled}
                disabledReason="请先关闭资料卡展示"
                help="滚动楼层时让发帖者头像保持可见。"
                helpId="avatar-follow-help"
                icon={<UserRound size={15} />}
                label="头像跟随"
                onChange={saveAvatarFollowEnabled}
              />
            </div>

            <div className="settings-font-size-control">
              <div className="settings-font-size-heading">
                <span id="forum-content-font-size-label">默认字体大小</span>
              </div>
              <div
                aria-labelledby="forum-content-font-size-label"
                className="settings-font-size-options"
                role="group"
              >
                {FORUM_CONTENT_FONT_SIZE_OPTIONS.map((fontSize) => (
                  <button
                    aria-pressed={fontSize === forumContentFontSize}
                    className={fontSize === forumContentFontSize ? 'settings-font-size-option-active' : ''}
                    key={fontSize}
                    onClick={() => saveForumContentFontSize(fontSize)}
                    type="button"
                  >
                    {fontSize}px
                  </button>
                ))}
              </div>
              <div className="settings-font-size-preview">
                <span aria-hidden="true"><Quote size={18} /></span>
                <p style={{ fontSize: `${forumContentFontSize}px` }}>
                  协会创办之初就成功举行了1996年的以“庆红军长征胜利60周年”为主题的暑期社会考察活动，之后的几年里，陆续举办了1997的庆香港回归探炎黄血脉自行车考察 、1998年的丝绸之路文化之旅自行车考察、1999年的迎澳门回归环保自行车考察......早期的暑期远征多以骑行+实践的模式进行，暑期队员在途径的地域开展社会考察、支教、宣讲等活动，最后回到学校将所见所闻所想编写为实践报告册。可以说，协会的前辈们在骑车的过程中将社会考察放到了十分重要的位置。 --毛球
                </p>
              </div>
            </div>
          </section>

          <section className="settings-panel" aria-labelledby="assistive-settings-title">
            <div className="settings-panel-heading">
              <span className="settings-panel-icon"><Accessibility size={17} /></span>
              <div>
                <h2 id="assistive-settings-title">辅助</h2>
              </div>
            </div>

            <div className="settings-checkbox-list settings-checkbox-columns">
              <SettingsCheckbox
                checked={waterfallFeedEnabled}
                help="首页接近列表底部时自动加载更多帖子。"
                helpId="waterfall-feed-help"
                icon={<ListEnd size={15} />}
                label="瀑布流"
                onChange={saveWaterfallFeedEnabled}
              />
              <SettingsCheckbox
                checked={autoSaveEnabled}
                help="编辑回复或发帖时自动保存草稿，发布后自动清除。"
                helpId="auto-save-help"
                icon={<Save size={15} />}
                label="自动保存"
                onChange={saveAutoSaveEnabled}
              />
              <SettingsCheckbox
                checked={floorDecorationEnabled}
                icon={<ImageIcon size={15} />}
                label="展示楼层装饰"
                onChange={saveFloorDecorationEnabled}
              />
              <SettingsCheckbox
                checked={assistiveBarEnabled}
                help="在帖子详情页右侧显示楼层目录和辅助功能。"
                helpId="assistive-bar-help"
                icon={<PanelRight size={15} />}
                label="开启辅助栏"
                onChange={saveAssistiveBarEnabled}
              />
              <SettingsCheckbox
                checked={backToTopEnabled}
                disabled={!assistiveBarEnabled}
                disabledReason="请先开启辅助栏"
                help="在帖子详情页右栏显示回到顶部按钮。"
                helpId="back-to-top-help"
                icon={<ArrowUpToLine size={15} />}
                label="回到顶部"
                onChange={saveBackToTopEnabled}
              />
              <SettingsCheckbox
                checked={signatureToggleEnabled}
                disabled={!assistiveBarEnabled}
                disabledReason="请先开启辅助栏"
                help="在帖子详情页右栏提供可跨帖子保留的签名档开关。"
                helpId="signature-toggle-help"
                icon={<Signature size={15} />}
                label="屏蔽签名档"
                onChange={saveSignatureToggleEnabled}
              />
            </div>
          </section>

          <section className="settings-panel settings-pinned-board-panel" aria-labelledby="pinned-boards-title">
            <div className="settings-panel-heading">
              <span className="settings-panel-icon"><Pin size={17} /></span>
              <div>
                <h2 id="pinned-boards-title">常驻版块</h2>
              </div>
              <strong className="settings-count" aria-label={`已选择 ${draftBoardIds.length} 个，最多 ${MAX_PINNED_BOARDS} 个`}>
                {draftBoardIds.length}<span> / {MAX_PINNED_BOARDS}</span>
              </strong>
            </div>

            <div className="settings-nav-preview" aria-label="顶部导航预览">
              <span className="settings-preview-label">导航预览</span>
              <div className="settings-preview-links">
                <span>首页</span>
                <span>版块</span>
                {pinnedBoards.map((board) => <strong key={board.id}>{board.label}</strong>)}
              </div>
            </div>

            <div className="settings-selection">
              <div className="settings-selection-heading">
                <div>
                  <h3>已选择</h3>
                </div>
              </div>

              {pinnedBoards.length > 0 ? (
                <ol className="settings-pinned-list">
                  {pinnedBoards.map((board, index) => (
                    <li key={board.id}>
                      <span className="settings-order">{String(index + 1).padStart(2, '0')}</span>
                      <div className="settings-pinned-board">
                        <strong>{board.label}</strong>
                      </div>
                      <div className="settings-pinned-actions">
                        <button
                          aria-label={`取消常驻${board.label}`}
                          className="settings-remove-button"
                          onClick={() => removeBoard(board.id)}
                          type="button"
                        >
                          <PinOff size={15} /><span>移除</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="settings-empty-selection">
                  <Pin size={19} />
                  <strong>还没有常驻版块</strong>
                </div>
              )}
            </div>

            <div className="settings-board-picker">
              <BoardGroup
                boardIds={draftBoardIds}
                disabled={isFull}
                label="主要版块"
                onAdd={addBoard}
                onRemove={removeBoard}
                boards={PRIMARY_BOARDS}
              />
              <details className="settings-board-disclosure">
                <summary>
                  <strong>其他版块</strong>
                  <small>{selectedSecondaryBoardCount > 0 ? `已选择 ${selectedSecondaryBoardCount} 个` : '展开选择'}</small>
                  <ChevronDown size={15} />
                </summary>
                <BoardGroup
                  boardIds={draftBoardIds}
                  boards={SECONDARY_BOARDS}
                  disabled={isFull}
                  hideLegend
                  label="其他版块"
                  onAdd={addBoard}
                  onRemove={removeBoard}
                />
              </details>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function SettingsCheckbox({
  checked,
  desktopOnly = false,
  disabled = false,
  disabledReason,
  help,
  helpId,
  icon,
  label,
  onChange,
}: {
  checked: boolean;
  desktopOnly?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  help?: string;
  helpId?: string;
  icon: ReactNode;
  label: string;
  onChange: (checked: boolean) => unknown;
}) {
  const disabledReasonId = useId();
  const descriptionIds = [
    help && helpId ? helpId : '',
    disabled && disabledReason ? disabledReasonId : '',
  ].filter(Boolean).join(' ') || undefined;
  const rowClassName = [
    'settings-checkbox-row',
    checked ? 'settings-checkbox-row-selected' : '',
    desktopOnly ? 'settings-checkbox-row-desktop-only' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={rowClassName}>
      <label
        aria-disabled={disabled || undefined}
        className={disabled ? 'settings-checkbox-option settings-checkbox-option-disabled' : 'settings-checkbox-option'}
        tabIndex={disabled && disabledReason ? 0 : undefined}
      >
        <input
          aria-describedby={descriptionIds}
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span className="settings-option-logo" aria-hidden="true">{icon}</span>
        <span className="settings-option-label">
          <strong>{label}</strong>
          {help && helpId && <small id={helpId}>{help}</small>}
        </span>
        <span className="settings-checkbox-mark" aria-hidden="true"><Check size={14} /></span>
        {disabled && disabledReason && (
          <span className="settings-checkbox-disabled-reason" id={disabledReasonId} role="tooltip">
            {disabledReason}
          </span>
        )}
      </label>
    </div>
  );
}

function BoardGroup({
  boardIds,
  boards,
  disabled,
  hideLegend = false,
  label,
  onAdd,
  onRemove,
}: {
  boardIds: number[];
  boards: typeof ALL_BOARDS;
  disabled: boolean;
  hideLegend?: boolean;
  label: string;
  onAdd: (boardId: number) => void;
  onRemove: (boardId: number) => void;
}) {
  return (
    <fieldset className="settings-board-group">
      <legend className={hideLegend ? 'sr-only' : undefined}>{label}</legend>
      <div className="settings-board-grid">
        {boards.map((board) => {
          const selected = boardIds.includes(board.id);
          return (
            <button
              aria-pressed={selected}
              className={`${selected ? 'settings-board-option-selected' : ''} ${!selected && disabled ? 'settings-board-option-limit' : ''}`}
              disabled={!selected && disabled}
              key={board.id}
              onClick={() => selected ? onRemove(board.id) : onAdd(board.id)}
              type="button"
            >
              <span>{selected ? <Check size={15} /> : <CirclePlus size={15} />}</span>
              <strong>{board.label}</strong>
              <small>{selected ? '已选择' : disabled ? '已达上限' : '添加'}</small>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function sameBoardIds(left: number[], right: number[]) {
  return left.length === right.length && left.every((boardId, index) => boardId === right[index]);
}
