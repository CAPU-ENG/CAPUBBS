import { getForumNavigationHref } from './forumNavigation.ts';

/** Rewrite anchor destinations only; fragment parsing keeps top-level styles and scripts intact. */
export function normalizeForumContentLinks(html: string) {
  if (!/<a\b/i.test(html)) return html;
  const template = document.createElement('template');
  template.innerHTML = html;
  let changed = false;
  for (const anchor of template.content.querySelectorAll('a[href]')) {
    const href = anchor.getAttribute('href')!;
    if (!href.trim() || href.trim().startsWith('#') || anchor.hasAttribute('download')) continue;
    const canonical = getForumNavigationHref(href, 'https://chexie.net/bbs/content/');
    if (canonical === href) continue;
    anchor.setAttribute('href', canonical);
    changed = true;
  }
  return changed ? template.innerHTML : html;
}
