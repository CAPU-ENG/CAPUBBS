const HANGING_PUNCTUATION_PATTERN = /^[《【（]/;
const HANGING_PUNCTUATION_CLASS_NAME = 'thread-title-hanging-punctuation';

export function getThreadTitleClassName(title: string, baseClassName?: string) {
  const classNames = baseClassName ? [baseClassName] : [];

  if (HANGING_PUNCTUATION_PATTERN.test(title)) {
    classNames.push(HANGING_PUNCTUATION_CLASS_NAME);
  }

  return classNames.length > 0 ? classNames.join(' ') : undefined;
}
