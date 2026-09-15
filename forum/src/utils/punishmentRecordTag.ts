import type { PunishmentRecord } from '../api/dataDisplay';

/** Parse as a fragment so top-level styles/scripts and unclosed tag siblings survive. */
export function preparePunishmentRecordTags(html: string) {
  if (!/<punishment_record\b/i.test(html)) return null;
  const template = document.createElement('template');
  template.innerHTML = html;
  const tags = Array.from(template.content.querySelectorAll('punishment_record'))
    .filter((tag) => !tag.closest('pre, code, textarea'));
  if (tags.length === 0) return null;

  const entries = tags.map((tag) => {
    const value = tag.getAttribute('year')?.trim() ?? '';
    const year = /^\d{4}$/.test(value) && Number(value) > 1 ? Number(value) : null;
    const placeholder = document.createElement('div');
    // The shorthand has no closing tag: following content may be parsed as children.
    tag.replaceWith(placeholder, ...Array.from(tag.childNodes));
    return { placeholder, year };
  });

  return {
    needsRecords: entries.some(({ year }) => year !== null),
    render(records: PunishmentRecord[], error?: string) {
      entries.forEach(({ placeholder, year }) => {
        if (year === null || error) {
          placeholder.textContent = year === null ? '罚跑记录学年无效' : error!;
          return;
        }
        const table = document.createElement('table');
        const title = `${year - 1}-${year} 学年罚跑记录`;
        table.className = 'forum-punishment-table';
        table.setAttribute('aria-label', title);
        const heading = document.createElement('div');
        heading.className = 'forum-punishment-title';
        heading.setAttribute('role', 'heading');
        heading.setAttribute('aria-level', '2');
        heading.textContent = title;
        const header = table.createTHead().insertRow();
        ['姓名', 'ID', '原因', '长度', '职务加罚', '开始时间', '结束时间', '完成情况'].forEach((label) => {
          const cell = document.createElement('th');
          cell.scope = 'col';
          cell.textContent = label;
          header.append(cell);
        });
        const body = table.createTBody();
        const selected = records.filter((record) => {
          const match = record.startDate.match(/^(\d{4})-(\d{1,2})-/);
          if (!match) return false;
          const month = Number(match[2]);
          return month >= 1 && month <= 12
            && Number(match[1]) + (month >= 9 ? 1 : 0) === year;
        });
        selected.forEach((record) => {
          const row = body.insertRow();
          const distance = !record.distance ? '—' : /公里|km/i.test(record.distance) ? record.distance : `${record.distance} km`;
          [record.name || '—', record.username || '—', record.reason || '—', distance,
            record.addition ? '是' : '否', formatDate(record.startDate), formatDate(record.endDate),
            record.isComplete ? '已完成' : '进行中'].forEach((value) => {
            row.insertCell().textContent = value;
          });
        });
        if (selected.length === 0) {
          const cell = body.insertRow().insertCell();
          cell.colSpan = 8;
          cell.className = 'forum-punishment-empty';
          cell.textContent = '暂无罚跑记录';
        }
        const scroll = document.createElement('div');
        scroll.className = 'forum-punishment-scroll';
        scroll.append(table);
        placeholder.className = 'forum-punishment-record';
        placeholder.replaceChildren(heading, scroll);
      });
      return template.innerHTML;
    },
  };
}

function formatDate(value: string) {
  return !value || value === '0000-00-00' ? '—' : value.replaceAll('-', '.');
}
