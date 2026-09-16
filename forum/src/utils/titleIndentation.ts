const HANGING_PUNCTUATION_PATTERN = /^[《【（“]/;
const TITLE_INDENTATION_CLASS_NAME = 'title-indentation';

/** 标题缩进：仅将第一行的全角起始标点向左悬挂半个字宽，后续行正常对齐。 */
export function getTitleIndentationClassName(
  title: string,
  baseClassName?: string,
  layout: 'block' | 'inline' = 'block',
) {
  const classNames = baseClassName ? [baseClassName] : [];

  if (HANGING_PUNCTUATION_PATTERN.test(title)) {
    classNames.push(TITLE_INDENTATION_CLASS_NAME);
    if (layout === 'inline') classNames.push('title-indentation-inline');
  }

  return classNames.length > 0 ? classNames.join(' ') : undefined;
}
