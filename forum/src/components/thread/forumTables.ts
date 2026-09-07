/** Enhance ordinary post tables without changing saved HTML or executable embeds. */
export function prepareForumTables(container: HTMLElement) {
  const cleanups: Array<() => void> = [];

  container.querySelectorAll<HTMLTableElement>('table').forEach((table) => {
    // Nested/single-cell tables are often authored layouts, not data tables.
    if (table.parentElement?.closest('table') || table.querySelector('table')) return;
    if (table.rows.length < 2 || !Array.from(table.rows).some((row) => row.cells.length > 1)) return;

    let wrapper = table.parentElement;
    if (!wrapper?.classList.contains('forum-table-scroll')) {
      wrapper = table.ownerDocument.createElement('div');
      wrapper.className = 'forum-table-scroll';
      wrapper.tabIndex = 0;
      table.before(wrapper);
      wrapper.append(table);
      table.classList.add('forum-data-table');

      // Track occupied columns so a rowspan does not freeze the second column
      // on the following row. A cell spanning several columns stays scrollable.
      let occupied: number[] = [];
      let section: HTMLElement | null = null;
      Array.from(table.rows).forEach((row, rowIndex) => {
        if (section !== row.parentElement) {
          section = row.parentElement;
          occupied = [];
        }
        let column = 0;
        Array.from(row.cells).forEach((cell) => {
          while ((occupied[column] ?? 0) > 0) column += 1;
          if (column === 0 && cell.colSpan === 1) cell.classList.add('forum-table-first-column');
          if (rowIndex === 0 && !table.tHead) cell.classList.add('forum-table-heading');
          const rowSpan = cell.rowSpan === 0 ? table.rows.length : cell.rowSpan;
          for (let offset = 0; offset < cell.colSpan; offset += 1) occupied[column + offset] = rowSpan;
          column += cell.colSpan;

          const content = table.ownerDocument.createElement('div');
          content.className = 'forum-table-cell-content';
          while (cell.firstChild) content.append(cell.firstChild);
          cell.append(content);
        });
        occupied = occupied.map((remaining) => Math.max(0, remaining - 1));
      });
    }

    const scrollContainer = wrapper;
    const syncScroll = () => {
      scrollContainer.classList.toggle('forum-table-scrolled', scrollContainer.scrollLeft > 0);
    };
    syncScroll();
    scrollContainer.addEventListener('scroll', syncScroll, { passive: true });
    cleanups.push(() => scrollContainer.removeEventListener('scroll', syncScroll));
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
