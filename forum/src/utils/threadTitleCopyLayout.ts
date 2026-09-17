type TextRect = { top: number; right: number; bottom: number };
type Origin = { top: number; left: number };

const COMPACT_ICON_SIZE = 12;
const COMPACT_ICON_GAP = 3;

export function getThreadTitleCopyIconPosition(
  textRects: readonly TextRect[],
  iconRect: Pick<TextRect, 'top'>,
  buttonRect: Origin,
) {
  if (textRects.length === 0) return null;
  const lastTextBottom = Math.max(...textRects.map((rect) => rect.bottom));
  if (iconRect.top < lastTextBottom - 1) return null;

  const firstRect = textRects.reduce((first, rect) => rect.top < first.top ? rect : first);
  const firstLine = textRects.filter((rect) => rect.top < firstRect.bottom && rect.bottom > firstRect.top);
  const firstLineRight = Math.max(...firstLine.map((rect) => rect.right));

  return {
    left: firstLineRight - buttonRect.left + COMPACT_ICON_GAP,
    top: firstRect.top - buttonRect.top + (firstRect.bottom - firstRect.top - COMPACT_ICON_SIZE) / 2,
  };
}

export function observeThreadTitleCopyLayout(heading: HTMLElement) {
  const button = heading.querySelector<HTMLButtonElement>('.thread-title-copy-button');
  const text = heading.querySelector<HTMLElement>('.thread-title-copy-text');
  const icon = heading.querySelector<SVGElement>('.thread-title-copy-icon');
  if (!button || !text || !icon) return;

  let frame = 0;
  let disposed = false;

  function update() {
    frame = 0;
    if (disposed || !button || !text || !icon) return;

    // Measure the normal inline icon first so wider layouts can restore it.
    button.removeAttribute('data-copy-icon-floating');
    const position = getThreadTitleCopyIconPosition(
      Array.from(text.getClientRects()),
      icon.getBoundingClientRect(),
      button.getBoundingClientRect(),
    );

    if (position) {
      button.style.setProperty('--thread-title-copy-icon-left', `${position.left}px`);
      button.style.setProperty('--thread-title-copy-icon-top', `${position.top}px`);
      button.setAttribute('data-copy-icon-floating', 'true');
    } else {
      button.style.removeProperty('--thread-title-copy-icon-left');
      button.style.removeProperty('--thread-title-copy-icon-top');
    }
  }

  function scheduleUpdate() {
    if (!disposed && !frame) frame = window.requestAnimationFrame(update);
  }

  update();
  const observer = new ResizeObserver(scheduleUpdate);
  observer.observe(button);
  window.addEventListener('resize', scheduleUpdate);
  document.fonts?.addEventListener('loadingdone', scheduleUpdate);
  void document.fonts?.ready.then(scheduleUpdate);

  return () => {
    disposed = true;
    observer.disconnect();
    window.removeEventListener('resize', scheduleUpdate);
    document.fonts?.removeEventListener('loadingdone', scheduleUpdate);
    if (frame) window.cancelAnimationFrame(frame);
  };
}
