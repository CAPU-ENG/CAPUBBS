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

console.log('legacy post text verification passed (6 PHP parity cases)');
