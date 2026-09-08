const POST_LINK_PATTERN = /\[calendar-post\]([\s\S]*?)\[\/calendar-post\]/gi;

export function normalizeCalendarPostUrl(value: string) {
  const url = value.trim();
  if (!url || /[\s\\]/.test(url)) return '';
  if (!/^https?:\/\//i.test(url) && !/^\/(?!\/)/.test(url)) return '';
  try {
    const parsed = new URL(url, 'https://calendar.invalid');
    return ['http:', 'https:'].includes(parsed.protocol) ? url : '';
  } catch {
    return '';
  }
}

export function parseCalendarDescription(value: string) {
  let url = '';
  const description = value.replace(POST_LINK_PATTERN, (_match, encoded: string) => {
    try {
      url ||= normalizeCalendarPostUrl(decodeURIComponent(encoded));
    } catch {
      // Malformed metadata is hidden but must never become a navigation target.
    }
    return '';
  })
    // Older VARCHAR(40) storage may have cut off both the URL and closing marker.
    // Hide the remaining metadata, but do not turn an incomplete URL into a link.
    .replace(/\[calendar-post\][\s\S]*$/gi, '')
    .trim();
  return { description, url };
}

export function serializeCalendarDescription(description: string, postUrl: string) {
  const url = normalizeCalendarPostUrl(postUrl);
  const text = parseCalendarDescription(description).description;
  // Requires calendar.content to be TEXT: the legacy VARCHAR(40) truncates metadata.
  // Keep metadata on the same line: the legacy calendar response embeds raw text in JSON.
  return url ? `${text}[calendar-post]${encodeURIComponent(url)}[/calendar-post]` : text;
}
