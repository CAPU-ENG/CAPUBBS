import { Check, CirclePlus, Pin, PinOff, Save } from 'lucide-react';
import { useRef, useState } from 'react';
import { AppBackground } from '../components/layout/AppBackground';
import { TopBar } from '../components/layout/TopBar';
import { ALL_BOARDS, PRIMARY_BOARDS, SECONDARY_BOARDS, getBoardById } from '../data/boards';
import { usePinnedBoardIds } from '../hooks/usePinnedBoards';
import { MAX_PINNED_BOARDS, savePinnedBoardIds } from '../utils/localSettings';

export function SettingsPage() {
  const pinnedBoardIds = usePinnedBoardIds();
  const [draftBoardIds, setDraftBoardIds] = useState(pinnedBoardIds);
  const draftBoardIdsRef = useRef(pinnedBoardIds);
  const [feedback, setFeedback] = useState('调整完成后，点击“保存设置”应用到 Navbar。');
  const pinnedBoards = draftBoardIds
    .map(getBoardById)
    .filter((board) => board !== undefined);
  const isFull = draftBoardIds.length >= MAX_PINNED_BOARDS;
  const hasChanges = !sameBoardIds(draftBoardIds, pinnedBoardIds);

  function addBoard(boardId: number) {
    const board = getBoardById(boardId);
    const currentBoardIds = draftBoardIdsRef.current;
    if (currentBoardIds.length >= MAX_PINNED_BOARDS) {
      setFeedback(`最多只能常驻 ${MAX_PINNED_BOARDS} 个版块，请先移除一个。`);
      return;
    }
    if (!board || currentBoardIds.includes(boardId)) return;
    updateDraftBoardIds([...currentBoardIds, boardId]);
    setFeedback(`已选择“${board.label}”，保存后会显示在 Navbar。`);
  }

  function removeBoard(boardId: number) {
    const board = getBoardById(boardId);
    updateDraftBoardIds(draftBoardIdsRef.current.filter((id) => id !== boardId));
    if (board) setFeedback(`已移除“${board.label}”，保存后生效。`);
  }

  function saveSettings() {
    const result = savePinnedBoardIds(draftBoardIdsRef.current);
    updateDraftBoardIds(result.boardIds);
    setFeedback(
      result.saved
        ? '设置已保存，Navbar 已更新。'
        : '浏览器未能写入本地设置，请检查隐私模式或网站存储权限。',
    );
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
        <section className="settings-panel" aria-labelledby="pinned-boards-title">
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
                <p>版块会按照加入顺序显示在桌面端 Navbar 中。</p>
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
            <BoardGroup
              boardIds={draftBoardIds}
              disabled={isFull}
              label="其他版块"
              onAdd={addBoard}
              onRemove={removeBoard}
              boards={SECONDARY_BOARDS}
            />
          </div>

          <footer className="settings-panel-footer">
            <p aria-live="polite" role="status"><Check size={15} />{feedback}</p>
            <button disabled={!hasChanges} onClick={saveSettings} type="button">
              <Save size={15} />保存设置
            </button>
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
              className={`${selected ? 'settings-board-option-selected' : ''} ${!selected && disabled ? 'settings-board-option-limit' : ''}`}
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
