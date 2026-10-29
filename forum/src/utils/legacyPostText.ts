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

const HTML_NEWLINE_TOKEN_PATTERN = /(<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script\s*>|<style\b[\s\S]*?<\/style\s*>|<pre\b[\s\S]*?<\/pre\s*>|<textarea\b[\s\S]*?<\/textarea\s*>|<\/?[a-zA-Z][^>]*>)/i;
const HTML_NEWLINE_BLOCK_TAGS = new Set([
  'address', 'article', 'aside', 'blockquote', 'caption', 'center', 'col', 'colgroup', 'dd',
  'details', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'ol', 'p',
  'section', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul',
]);

type HtmlNewlineTagKind = 'edge' | 'br' | 'open' | 'close' | 'raw' | 'other';

function htmlNewlineTagKind(token: string): HtmlNewlineTagKind {
  if (token.startsWith('<!--')) return 'other';
  const match = token.match(/^<(\/?)([a-zA-Z][a-zA-Z0-9]*)/);
  if (!match) return 'other';
  const name = match[2].toLowerCase();
  if (name === 'br') return 'br';
  if (['script', 'style', 'pre', 'textarea'].includes(name)) return 'raw';
  if (!HTML_NEWLINE_BLOCK_TAGS.has(name)) return 'other';
  return match[1] ? 'close' : 'open';
}

// Some ishtml=YES posts keep their line breaks as bare newlines (bid=1 tid=8280).
// Mirrors html_text_newlines_to_br in bbs/lib/mainfunc.php: only text-node
// newlines become <br>; tags, comments, script/style/pre/textarea, whitespace
// at block boundaries and full documents stay as written.
export function convertHtmlTextNewlines(value: string) {
  if (!/[\r\n]/.test(value)) return value;
  if (/<\s*(?:!doctype|html|head|body)\b/i.test(value)) return value;
  const tokens = value.replace(/\r\n?/g, '\n').split(HTML_NEWLINE_TOKEN_PATTERN);
  for (let index = 0; index < tokens.length; index += 2) {
    let text = tokens[index];
    if (!text.includes('\n')) continue;
    const prev = index > 0 ? htmlNewlineTagKind(tokens[index - 1]) : 'edge';
    const next = index + 1 < tokens.length ? htmlNewlineTagKind(tokens[index + 1]) : 'edge';
    if (!text.trim()) {
      if (['edge', 'close', 'raw'].includes(prev) || ['edge', 'open', 'raw'].includes(next)) continue;
    } else {
      if (['open', 'close', 'raw'].includes(prev)) text = text.replace(/^[ \t]*\n/, '');
      if (['open', 'close', 'raw'].includes(next)) text = text.replace(/\n[ \t]*$/, '');
    }
    if (prev === 'br') text = text.replace(/^[ \t]*\n/, '');
    if (next === 'br') text = text.replace(/\n[ \t]*$/, '');
    tokens[index] = text.replace(/\n/g, '<br>');
  }
  return tokens.join('');
}
