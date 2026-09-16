export function isForumForeground() {
  return document.visibilityState === 'visible' && document.hasFocus();
}
