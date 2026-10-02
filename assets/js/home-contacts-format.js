(() => {
  'use strict';
  // Contacts stay one plain-text document: "名称：内容" lines, then a blank line and free notes.
  // Keep in sync with homepage_contact_parse() in index/includes/contacts.php.
  const ROW = /^([^：\n]{1,16})：(.*)$/u;

  function parse(text) {
    const normalized = String(text).replace(/\r\n?/g, '\n').trim();
    const split = normalized.search(/\n[ \t]*\n/);
    const head = split < 0 ? normalized : normalized.slice(0, split);
    const notes = split < 0 ? [] : [normalized.slice(split).trim()];
    const rows = [];
    const loose = [];
    head.split('\n').forEach(line => {
      const match = ROW.exec(line);
      if (match && match[1].trim()) rows.push({ label: match[1].trim(), value: match[2].trim() });
      else if (rows.length) rows[rows.length - 1].value += '\n' + line.trim();
      else if (line.trim()) loose.push(line.trim());
    });
    if (loose.length) notes.unshift(loose.join('\n'));
    return { rows, notes: notes.filter(Boolean).join('\n\n') };
  }

  function serialize(rows, notes) {
    const lines = rows.map(row => `${row.label.trim()}：${row.value.trim()}`);
    const tail = String(notes).replace(/\r\n?/g, '\n').trim();
    return [lines.join('\n'), tail].filter(Boolean).join('\n\n');
  }

  window.CapuHomeContacts = { ROW, parse, serialize };
})();
