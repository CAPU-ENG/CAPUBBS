// Match the old forum's htmlspecialchars_decode (ENT_COMPAT), followed by
// its newline and space conversion. Decode once, leaving other entities intact.
export function normalizeLegacyPostText(value: string) {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"' };
  return value
    .replace(/&(amp|lt|gt|quot|#\d+|#x[\da-fA-F]+);/g, (entity, name: string) => {
      if (!name.startsWith('#')) return named[name];
      const code = name.startsWith('#x')
        ? Number.parseInt(name.slice(2), 16)
        : Number.parseInt(name.slice(1), 10);
      return [34, 38, 60, 62].includes(code) ? String.fromCharCode(code) : entity;
    })
    .replace(/\r\n?|\n/g, '<br>')
    .replace(/ /g, '&nbsp;');
}
