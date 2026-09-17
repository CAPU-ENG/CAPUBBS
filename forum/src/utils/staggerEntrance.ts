export function staggerEntrance(elements: Iterable<HTMLElement>) {
  let index = 0;

  for (const element of elements) {
    if (element.dataset.forumEntered) continue;

    // Keep long lists quick and start each new batch without replaying existing rows.
    element.style.setProperty('--forum-enter-delay', `${Math.min(index, 10) * 24}ms`);
    element.dataset.forumEntered = 'true';
    index += 1;
  }
}
