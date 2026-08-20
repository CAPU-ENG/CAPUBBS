import {
  ArrowDown,
  ArrowUp,
  Check,
  CirclePlus,
  MonitorCog,
  Pin,
  PinOff,
} from 'lucide-react';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { ALL_BOARDS, PRIMARY_BOARDS, SECONDARY_BOARDS, getBoardById } from '../data/boards';
import { usePinnedBoardIds } from '../hooks/usePinnedBoards';
import { MAX_PINNED_BOARDS, savePinnedBoardIds } from '../utils/localSettings';

export function SettingsPage() {
  const pinnedBoardIds = usePinnedBoardIds();
  const pinnedBoards = pinnedBoardIds
    .map(getBoardById)
    .filter((board) => board !== undefined);
  const isFull = pinnedBoardIds.length >= MAX_PINNED_BOARDS;

  function addBoard(boardId: number) {
    if (isFull || pinnedBoardIds.includes(boardId)) return;
    savePinnedBoardIds([...pinnedBoardIds, boardId]);
  }

  function removeBoard(boardId: number) {
    savePinnedBoardIds(pinnedBoardIds.filter((id) => id !== boardId));
  }

  function moveBoard(index: number, offset: -1 | 1) {
    const targetIndex = index + offset;
    if (targetIndex < 0 || targetIndex >= pinnedBoardIds.length) return;

    const next = [...pinnedBoardIds];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    savePinnedBoardIds(next);
  }

  return (
    <div className="settings-page relative min-h-screen text-[var(--text)] transition-colors duration-200">
      <AppBackground />
      <TopBar />

      <main className="settings-page-shell">
        <header className="settings-hero">
          <div>
            <p className="eyebrow">SETTINGS</p>
            <h1>设置</h1>
            <p>调整这台设备上的论坛使用习惯。</p>
          </div>
          <span className="settings-local-badge"><MonitorCog size={15} />仅保存在当前浏览器</span>
        </header>

        <section className="settings-panel" aria-labelledby="pinned-boards-title">
          <div className="settings-panel-heading">
            <span className="settings-panel-icon"><Pin size={17} /></span>
            <div>
              <h2 id="pinned-boards-title">常驻版块</h2>
              <p>将常用版块固定在桌面端顶部导航中，点击即可直接进入。</p>
            </div>
            <strong className="settings-count" aria-label={`已选择 ${pinnedBoardIds.length} 个，最多 ${MAX_PINNED_BOARDS} 个`}>
              {pinnedBoardIds.length}<span> / {MAX_PINNED_BOARDS}</span>
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
                <p>使用上下按钮调整它们在桌面端 Navbar 中的顺序。</p>
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
                    <div className="settings-order-actions">
                      <button
                        aria-label={`将${board.label}向前移动`}
                        disabled={index === 0}
                        onClick={() => moveBoard(index, -1)}
                        type="button"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        aria-label={`将${board.label}向后移动`}
                        disabled={index === pinnedBoards.length - 1}
                        onClick={() => moveBoard(index, 1)}
                        type="button"
                      >
                        <ArrowDown size={15} />
                      </button>
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
              boardIds={pinnedBoardIds}
              disabled={isFull}
              label="主要版块"
              onAdd={addBoard}
              onRemove={removeBoard}
              boards={PRIMARY_BOARDS}
            />
            <BoardGroup
              boardIds={pinnedBoardIds}
              disabled={isFull}
              label="其他版块"
              onAdd={addBoard}
              onRemove={removeBoard}
              boards={SECONDARY_BOARDS}
            />
          </div>

          <footer className="settings-panel-footer">
            <Check size={15} />更改会立即保存，并同步到当前浏览器内打开的其他论坛页面。
          </footer>
        </section>
      </main>
    </div>
  );
}

function BoardGroup({
  boardIds,
  boards,
  disabled,
  label,
  onAdd,
  onRemove,
}: {
  boardIds: number[];
  boards: typeof ALL_BOARDS;
  disabled: boolean;
  label: string;
  onAdd: (boardId: number) => void;
  onRemove: (boardId: number) => void;
}) {
  return (
    <fieldset className="settings-board-group">
      <legend>{label}</legend>
      <div className="settings-board-grid">
        {boards.map((board) => {
          const selected = boardIds.includes(board.id);
          return (
            <button
              aria-pressed={selected}
              className={selected ? 'settings-board-option-selected' : ''}
              disabled={!selected && disabled}
              key={board.id}
              onClick={() => selected ? onRemove(board.id) : onAdd(board.id)}
              type="button"
            >
              <span>{selected ? <Check size={15} /> : <CirclePlus size={15} />}</span>
              <strong>{board.label}</strong>
              <small>{selected ? '已常驻' : disabled ? '已达上限' : '添加'}</small>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
