// Decode once like the old forum's htmlspecialchars_decode (ENT_COMPAT).
// Normalize explicit line breaks before the legacy newline/space conversion.
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
    .replace(/\r\n?/g, '\n')
    // Old editors stored both <br /> and a following source newline. Treat
    // that pair as one break, retaining additional breaks and blank lines.
    .replace(/<br[\t ]*\/?>\n?/gi, '\n')
    .replace(/\n/g, '<br>')
    .replace(/ /g, '&nbsp;');
}
