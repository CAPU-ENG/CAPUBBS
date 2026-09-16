const HANGING_PUNCTUATION_PATTERN = /^[《【（“]/;
const TITLE_INDENTATION_CLASS_NAME = 'title-indentation';

/** 标题缩进：沿用首页规则，将全角起始标点向左悬挂半个字宽。 */
export function getTitleIndentationClassName(title: string, baseClassName?: string) {
  const classNames = baseClassName ? [baseClassName] : [];

  if (HANGING_PUNCTUATION_PATTERN.test(title)) {
    classNames.push(TITLE_INDENTATION_CLASS_NAME);
  }

  return classNames.length > 0 ? classNames.join(' ') : undefined;
}
