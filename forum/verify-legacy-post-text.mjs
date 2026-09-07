import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { normalizeLegacyPostText } from './src/utils/legacyPostText.ts';

const samples = [
  '第一段\n\n第二段\n第三段',
  '第一行\r\n第二行\r第三行\n第四行',
  '  缩进  内容\n[url]https://example.com[/url]',
  '&lt;b&gt;正文&lt;/b&gt; &amp;lt; &quot; &nbsp; &#039; &apos;',
  '&#60;b&#62;正文&#x3c;/b&#x3e; &#34; &#x22; &#38; &#x26; &#65;',
  '<style>.example{color:red}</style>\n<script>example()</script>',
];

for (const sample of samples) {
  const expected = execFileSync('php', ['-r', `
    $html = htmlspecialchars_decode(stream_get_contents(STDIN), ENT_COMPAT);
    $html = str_replace(array("\r\n", "\r"), "\n", $html);
    echo str_replace(array("\n", " "), array("<br>", "&nbsp;"), $html);
  `], { input: sample, encoding: 'utf8' });
  assert.equal(normalizeLegacyPostText(sample), expected);
}

const names = [
  '白程安', '池骋', '崔家梁', '戴翔', '范志康', '郭浩',
  '黄思议', '苏晓童', '谭凤周', '袁馨', '张骋寰', '张晓岚',
];
const announcement = '祝贺以上会员获得暑期技术组资格';
const editNote = '此贴子由 李桥 在 2014-05-18 00:52:07 编辑过。';
const roster = `${names.map((name) => `${name}&lt;br /&gt;\n`).join('')}&lt;br /&gt;\n${announcement}\n${editNote}`;
assert.equal(
  normalizeLegacyPostText(roster),
  `${names.join('<br>')}<br><br>${announcement}<br>${editNote.replace(/ /g, '&nbsp;')}`,
  'the supplied legacy roster must retain one line per name and its blank line',
);

for (const lineBreak of ['<br>', '<br/>', '<br />', '<BR />', '&lt;br /&gt;']) {
  assert.equal(normalizeLegacyPostText(`甲${lineBreak}乙`), '甲<br>乙');
  for (const newline of ['\n', '\r\n', '\r']) {
    assert.equal(normalizeLegacyPostText(`甲${lineBreak}${newline}乙`), '甲<br>乙');
    assert.equal(normalizeLegacyPostText(`甲${lineBreak}${newline}${newline}乙`), '甲<br><br>乙');
  }
  assert.equal(normalizeLegacyPostText(`甲${lineBreak}${lineBreak}乙`), '甲<br><br>乙');
}
assert.equal(normalizeLegacyPostText('&amp;lt;br /&amp;gt;'), '&lt;br&nbsp;/&gt;');

console.log('legacy post text verification passed (6 PHP parity cases, roster and 41 break cases)');
