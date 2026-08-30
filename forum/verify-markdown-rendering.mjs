import assert from 'node:assert/strict';
import { getMarkdownTabEdit } from './src/components/editor/RichTextEditor.markdown.ts';
import { renderMarkdownToHtml } from './src/components/editor/RichTextEditor.markdownRender.ts';

const unorderedSource = '- 父项目\n- 子项目';
const unorderedEdit = getMarkdownTabEdit(
  unorderedSource,
  unorderedSource.length,
  unorderedSource.length,
  false,
);
assert.equal(unorderedEdit.content, '- 父项目\n  - 子项目');
assert.match(
  renderMarkdownToHtml(unorderedEdit.content),
  /<ul>[\s\S]*<li>父项目[\s\S]*<ul>[\s\S]*<li>子项目<\/li>[\s\S]*<\/ul>[\s\S]*<\/li>[\s\S]*<\/ul>/,
);

const orderedSource = '1. 父项目\n2. 子项目';
const orderedEdit = getMarkdownTabEdit(
  orderedSource,
  orderedSource.length,
  orderedSource.length,
  false,
);
assert.equal(orderedEdit.content, '1. 父项目\n   1. 子项目');
assert.match(
  renderMarkdownToHtml(orderedEdit.content),
  /<ol[^>]*>[\s\S]*<li>父项目[\s\S]*<ol[^>]*>[\s\S]*<li>子项目<\/li>[\s\S]*<\/ol>[\s\S]*<\/li>[\s\S]*<\/ol>/,
);

assert.match(
  renderMarkdownToHtml('- 父项目\n  1. 子项目\n  2. 另一个子项目'),
  /<ul>[\s\S]*<ol[^>]*>[\s\S]*<li>子项目<\/li>[\s\S]*<li>另一个子项目<\/li>[\s\S]*<\/ol>[\s\S]*<\/ul>/,
);

assert.match(
  renderMarkdownToHtml('1. 父项目\n  2. 两空格子项目'),
  /<ol[^>]*>[\s\S]*<li>父项目[\s\S]*<ol[^>]*>[\s\S]*<li>两空格子项目<\/li>[\s\S]*<\/ol>[\s\S]*<\/li>[\s\S]*<\/ol>/,
);

assert.match(
  renderMarkdownToHtml('1. 父项目\n   2. 非一开头的子项目'),
  /<ol[^>]*>[\s\S]*<li>父项目[\s\S]*<ol[^>]*>[\s\S]*<li>非一开头的子项目<\/li>[\s\S]*<\/ol>[\s\S]*<\/li>[\s\S]*<\/ol>/,
);

const orderedListLevels = renderMarkdownToHtml(
  '1. 一级\n   1. 二级\n      1. 三级\n         1. 四级',
);
assert.match(orderedListLevels, /<ol class="capubbs-ordered-list-decimal">/);
assert.match(orderedListLevels, /<ol class="capubbs-ordered-list-alpha">/);
assert.match(orderedListLevels, /<ol class="capubbs-ordered-list-roman">/);
assert.equal(
  orderedListLevels.match(/<ol class="capubbs-ordered-list-decimal">/g)?.length,
  2,
);

assert.match(renderMarkdownToHtml('+ 项目'), /<ul>[\s\S]*<li>项目<\/li>[\s\S]*<\/ul>/);
assert.match(renderMarkdownToHtml('> 普通引用'), /<blockquote class="forum-quote">/);
assert.match(
  renderMarkdownToHtml('> 引用内容\n>\n> 引用自 [测试用户](/user/test) [>>](/thread/1#post-2)'),
  /<blockquote class="capubbs-floor-quote">[\s\S]*capubbs-floor-quote-jump/,
);
assert.match(
  renderMarkdownToHtml('[at]测试用户[/at]'),
  /<a href="\/bbs\/users\/%E6%B5%8B%E8%AF%95%E7%94%A8%E6%88%B7" target="_blank" rel="noreferrer">@测试用户<\/a>/,
);
assert.match(
  renderMarkdownToHtml('![图](https://example.com/image.png){width=120px height=50%}'),
  /<img src="https:\/\/example.com\/image.png" alt="图" style="width: 120px; height: 50%;">/,
);
assert.match(
  renderMarkdownToHtml('[链接](https://example.com)'),
  /<a href="https:\/\/example.com" target="_blank" rel="noreferrer">链接<\/a>/,
);

const escapedHtml = renderMarkdownToHtml('<script>alert(1)</script>');
assert.doesNotMatch(escapedHtml, /<script>/);
assert.match(escapedHtml, /&lt;script&gt;/);

const fencedQuote = renderMarkdownToHtml(
  '```md\n```not-a-closing-fence\n> 引用内容\n>\n> 引用自 [测试用户](/user/test) [>>](/thread/1#post-2)\n```',
);
assert.doesNotMatch(fencedQuote, /capubbs-floor-quote/);
assert.match(fencedQuote, /<code class="language-md">/);

console.log('markdown rendering verification passed (18 assertions)');
