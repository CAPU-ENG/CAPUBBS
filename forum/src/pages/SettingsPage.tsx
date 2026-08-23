import { Accessibility, Check, ChevronDown, CircleHelp, CirclePlus, MonitorCog, Pin, PinOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { ALL_BOARDS, PRIMARY_BOARDS, SECONDARY_BOARDS, getBoardById } from '../data/boards';
import {
  useAssistiveBarEnabled,
  useAutoSaveEnabled,
  useBackToTopEnabled,
  useSignatureToggleEnabled,
  useWaterfallFeedEnabled,
} from '../hooks/useAssistiveFeatures';
import { useAvatarFollowDisabled } from '../hooks/useAvatarFollow';
import { useCompactMode } from '../hooks/useCompactMode';
import { useForumContentFontSize } from '../hooks/useForumContentFontSize';
import { usePinnedBoardIds } from '../hooks/usePinnedBoards';
import { useTheme } from '../hooks/useTheme';
import {
  saveAssistiveBarEnabled,
  saveAutoSaveEnabled,
  saveBackToTopEnabled,
  saveSignatureToggleEnabled,
  saveWaterfallFeedEnabled,
} from '../utils/assistiveFeatures';
import { saveAvatarFollowDisabled } from '../utils/avatarFollow';
import { saveCompactMode } from '../utils/compactMode';
import {
  FORUM_CONTENT_FONT_SIZE_OPTIONS,
  saveForumContentFontSize,
} from '../utils/forumFontSize';
import { MAX_PINNED_BOARDS, savePinnedBoardIds } from '../utils/localSettings';
import { saveThemeFollowsSystem } from '../utils/theme';

export function SettingsPage() {
  const assistiveBarEnabled = useAssistiveBarEnabled();
  const autoSaveEnabled = useAutoSaveEnabled();
  const avatarFollowDisabled = useAvatarFollowDisabled();
  const backToTopEnabled = useBackToTopEnabled();
  const compactMode = useCompactMode();
  const forumContentFontSize = useForumContentFontSize();
  const pinnedBoardIds = usePinnedBoardIds();
  const { followsSystem } = useTheme();
  const signatureToggleEnabled = useSignatureToggleEnabled();
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
              <div className="settings-checkbox-row">
                <label className="settings-checkbox-option">
                  <input
                    checked={followsSystem}
                    onChange={(event) => saveThemeFollowsSystem(event.target.checked)}
                    type="checkbox"
                  />
                  <span className="settings-checkbox-mark" aria-hidden="true"><Check size={14} /></span>
                  <span><strong>系统昼夜</strong></span>
                </label>
                <span className="settings-option-help">
                  <button aria-describedby="system-theme-help" aria-label="查看系统昼夜说明" type="button">
                    <CircleHelp size={14} />
                  </button>
                  <span id="system-theme-help" role="tooltip">
                    页面昼夜模式会自动跟随系统设置切换。
                  </span>
                </span>
              </div>

              <div className="settings-checkbox-row">
                <label className="settings-checkbox-option">
                  <input
                    checked={compactMode}
                    onChange={(event) => saveCompactMode(event.target.checked)}
                    type="checkbox"
                  />
                  <span className="settings-checkbox-mark" aria-hidden="true"><Check size={14} /></span>
                  <span><strong>紧凑模式</strong></span>
                </label>
                <span className="settings-option-help">
                  <button aria-describedby="compact-mode-help" aria-label="查看紧凑模式说明" type="button">
                    <CircleHelp size={14} />
                  </button>
                  <span id="compact-mode-help" role="tooltip">
                    首页主题列表会缩小行高，只保留标题、作者和时间，隐藏摘要、头像、回复数与浏览数。
                  </span>
                </span>
              </div>

              <div className="settings-checkbox-row">
                <label className="settings-checkbox-option">
                  <input
                    checked={avatarFollowDisabled}
                    onChange={(event) => saveAvatarFollowDisabled(event.target.checked)}
                    type="checkbox"
                  />
                  <span className="settings-checkbox-mark" aria-hidden="true"><Check size={14} /></span>
                  <span><strong>取消头像跟随</strong></span>
                </label>
              </div>
            </div>

            <div className="settings-font-size-control">
              <div className="settings-font-size-heading">
                <label htmlFor="forum-content-font-size">默认字体大小</label>
                <output htmlFor="forum-content-font-size">{forumContentFontSize}px</output>
              </div>
              <input
                aria-valuetext={`${forumContentFontSize}px`}
                id="forum-content-font-size"
                max={FORUM_CONTENT_FONT_SIZE_OPTIONS.at(-1)}
                min={FORUM_CONTENT_FONT_SIZE_OPTIONS[0]}
                onChange={(event) => saveForumContentFontSize(Number(event.target.value))}
                step={1}
                type="range"
                value={forumContentFontSize}
              />
              <div className="settings-font-size-ticks" aria-hidden="true">
                {FORUM_CONTENT_FONT_SIZE_OPTIONS.map((fontSize) => (
                  <span key={fontSize}>{fontSize}px</span>
                ))}
              </div>
              <p
                className="settings-font-size-preview"
                style={{ fontSize: `${forumContentFontSize}px` }}
              >
                协会创办之初就成功举行了1996年的以“庆红军长征胜利60周年”为主题的暑期社会考察活动，之后的几年里，陆续举办了1997的庆香港回归探炎黄血脉自行车考察 、1998年的丝绸之路文化之旅自行车考察、1999年的迎澳门回归环保自行车考察......早期的暑期远征多以骑行+实践的模式进行，暑期队员在途径的地域开展社会考察、支教、宣讲等活动，最后回到学校将所见所闻所想编写为实践报告册。可以说，协会的前辈们在骑车的过程中将社会考察放到了十分重要的位置。 --毛球
              </p>
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
              <div className="settings-checkbox-column">
                <div className="settings-checkbox-row">
                  <label className="settings-checkbox-option">
                    <input
                      checked={waterfallFeedEnabled}
                      onChange={(event) => saveWaterfallFeedEnabled(event.target.checked)}
                      type="checkbox"
                    />
                    <span className="settings-checkbox-mark" aria-hidden="true"><Check size={14} /></span>
                    <span><strong>瀑布流</strong></span>
                  </label>
                  <span className="settings-option-help">
                    <button aria-describedby="waterfall-feed-help" aria-label="查看瀑布流说明" type="button">
                      <CircleHelp size={14} />
                    </button>
                    <span id="waterfall-feed-help" role="tooltip">
                      首页接近列表底部时自动加载更多帖子，无需点击“加载更多”。
                    </span>
                  </span>
                </div>

                <div className="settings-checkbox-row">
                  <label className="settings-checkbox-option">
                    <input
                      checked={autoSaveEnabled}
                      onChange={(event) => saveAutoSaveEnabled(event.target.checked)}
                      type="checkbox"
                    />
                    <span className="settings-checkbox-mark" aria-hidden="true"><Check size={14} /></span>
                    <span><strong>自动保存</strong></span>
                  </label>
                  <span className="settings-option-help">
                    <button aria-describedby="auto-save-help" aria-label="查看自动保存说明" type="button">
                      <CircleHelp size={14} />
                    </button>
                    <span id="auto-save-help" role="tooltip">
                      编辑回复或发帖时自动存入草稿箱，发布成功后删除对应草稿。
                    </span>
                  </span>
                </div>
              </div>

              <div className="settings-checkbox-column">
                <div className="settings-checkbox-row">
                  <label className="settings-checkbox-option">
                    <input
                      checked={assistiveBarEnabled}
                      onChange={(event) => saveAssistiveBarEnabled(event.target.checked)}
                      type="checkbox"
                    />
                    <span className="settings-checkbox-mark" aria-hidden="true"><Check size={14} /></span>
                    <span><strong>开启辅助栏</strong></span>
                  </label>
                  <span className="settings-option-help">
                    <button aria-describedby="assistive-bar-help" aria-label="查看辅助栏说明" type="button">
                      <CircleHelp size={14} />
                    </button>
                    <span id="assistive-bar-help" role="tooltip">
                      在帖子详情页右侧显示楼层目录与辅助功能，关闭后页面仅保留主栏。
                    </span>
                  </span>
                </div>

                <div className="settings-checkbox-row">
                  <label className={assistiveBarEnabled ? 'settings-checkbox-option' : 'settings-checkbox-option settings-checkbox-option-disabled'}>
                    <input
                      checked={backToTopEnabled}
                      disabled={!assistiveBarEnabled}
                      onChange={(event) => saveBackToTopEnabled(event.target.checked)}
                      type="checkbox"
                    />
                    <span className="settings-checkbox-mark" aria-hidden="true"><Check size={14} /></span>
                    <span><strong>回到顶部</strong></span>
                  </label>
                  <span className="settings-option-help">
                    <button aria-describedby="back-to-top-help" aria-label="查看回到顶部说明" type="button">
                      <CircleHelp size={14} />
                    </button>
                    <span id="back-to-top-help" role="tooltip">
                      在帖子详情页右栏显示回到顶部按钮，点击后直接跳转到页面顶部。
                    </span>
                  </span>
                </div>

                <div className="settings-checkbox-row">
                  <label className={assistiveBarEnabled ? 'settings-checkbox-option' : 'settings-checkbox-option settings-checkbox-option-disabled'}>
                    <input
                      checked={signatureToggleEnabled}
                      disabled={!assistiveBarEnabled}
                      onChange={(event) => saveSignatureToggleEnabled(event.target.checked)}
                      type="checkbox"
                    />
                    <span className="settings-checkbox-mark" aria-hidden="true"><Check size={14} /></span>
                    <span><strong>屏蔽签名档</strong></span>
                  </label>
                  <span className="settings-option-help">
                    <button aria-describedby="signature-toggle-help" aria-label="查看屏蔽签名档说明" type="button">
                      <CircleHelp size={14} />
                    </button>
                    <span id="signature-toggle-help" role="tooltip">
                      在帖子详情页右栏显示签名档开关，屏蔽状态会在不同帖子间保留。
                    </span>
                  </span>
                </div>
              </div>
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
