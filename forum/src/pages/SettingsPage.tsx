import { Check, ChevronDown, CirclePlus, MonitorCog, Pin, PinOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { ALL_BOARDS, PRIMARY_BOARDS, SECONDARY_BOARDS, getBoardById } from '../data/boards';
import { useCompactMode } from '../hooks/useCompactMode';
import { usePinnedBoardIds } from '../hooks/usePinnedBoards';
import { useTheme } from '../hooks/useTheme';
import { saveCompactMode } from '../utils/compactMode';
import { MAX_PINNED_BOARDS, savePinnedBoardIds } from '../utils/localSettings';
import { saveThemeFollowsSystem } from '../utils/theme';

export function SettingsPage() {
  const compactMode = useCompactMode();
  const pinnedBoardIds = usePinnedBoardIds();
  const { followsSystem } = useTheme();
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
          <section className="settings-panel settings-appearance-panel" aria-labelledby="appearance-settings-title">
            <div className="settings-panel-heading">
              <span className="settings-panel-icon"><MonitorCog size={17} /></span>
              <div>
                <h2 id="appearance-settings-title">外观</h2>
                <p>控制论坛界面的昼夜显示方式。</p>
              </div>
            </div>

            <label className="settings-checkbox-option">
              <input
                checked={followsSystem}
                onChange={(event) => saveThemeFollowsSystem(event.target.checked)}
                type="checkbox"
              />
              <span className="settings-checkbox-mark" aria-hidden="true"><Check size={14} /></span>
              <span>
                <strong>自动跟随系统切换昼夜模式</strong>
                <small>开启后，论坛会随设备的浅色或深色外观设置实时切换。</small>
              </span>
            </label>

            <label className="settings-checkbox-option">
              <input
                checked={compactMode}
                onChange={(event) => saveCompactMode(event.target.checked)}
                type="checkbox"
              />
              <span className="settings-checkbox-mark" aria-hidden="true"><Check size={14} /></span>
              <span><strong>紧凑模式</strong></span>
            </label>
          </section>

          <section className="settings-panel settings-pinned-board-panel" aria-labelledby="pinned-boards-title">
            <div className="settings-panel-heading">
              <span className="settings-panel-icon"><Pin size={17} /></span>
              <div>
                <h2 id="pinned-boards-title">常驻版块</h2>
                <p>将常用版块固定在桌面端顶部导航中，点击即可直接进入。</p>
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
                {pinnedBoards.length === 0 ? <em>选择后显示在这里</em> : null}
              </div>
            </div>

            <div className="settings-selection">
              <div className="settings-selection-heading">
                <div>
                  <h3>已选择</h3>
                  <p>版块会按照加入顺序显示在桌面端导航栏中。</p>
                </div>
              </div>

              {pinnedBoards.length > 0 ? (
                <ol className="settings-pinned-list">
                  {pinnedBoards.map((board, index) => (
                    <li key={board.id}>
                      <span className="settings-order">{String(index + 1).padStart(2, '0')}</span>
                      <div className="settings-pinned-board">
                        <strong>{board.label}</strong>
                        <small>版块 ID · {board.id}</small>
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
                  <div><strong>还没有常驻版块</strong><p>从下方选择最多三个常用版块。</p></div>
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
