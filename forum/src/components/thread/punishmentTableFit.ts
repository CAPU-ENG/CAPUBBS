/** Self-contained: also serialized into the isolated HTML frame. */
export function preparePunishmentTableFit(root: HTMLElement) {
  const view = root.ownerDocument.defaultView;
  if (!view) return () => {};
  const cleanups: Array<() => void> = [];
  root.querySelectorAll<HTMLTableElement>('.forum-punishment-table').forEach((table) => {
    const viewport = table.parentElement;
    if (!viewport?.classList.contains('forum-punishment-scroll')) return;
    let disposed = false;
    function fit() {
      if (disposed || !viewport) return;
      const available = viewport.clientWidth;
      const natural = Math.max(table.offsetWidth, table.scrollWidth);
      if (available <= 0 || natural <= 0) return;
      const scale = Math.min(1, available / natural);
      const transform = `scale(${scale})`;
      const height = `${Math.ceil(table.offsetHeight * scale)}px`;
      if (table.style.transform !== transform) table.style.transform = transform;
      if (viewport.style.height !== height) viewport.style.height = height;
    }
    const observer = view.ResizeObserver ? new view.ResizeObserver(fit) : null;
    observer?.observe(viewport);
    observer?.observe(table);
    view.addEventListener('resize', fit);
    root.ownerDocument.fonts?.ready.then(fit);
    fit();
    cleanups.push(() => {
      disposed = true;
      observer?.disconnect();
      view.removeEventListener('resize', fit);
    });
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
