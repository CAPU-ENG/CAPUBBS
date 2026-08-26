import assert from 'node:assert/strict';
import {
  convertTableToVcf,
  inferContactColumnMapping,
  normalizeContactTable,
} from './src/utils/tableToVcf.ts';

const table = normalizeContactTable([
  ['姓名', '手机号', '电子邮箱', '单位', '职务', '备注'],
  ['张三', 13800138000, 'zhang@example.com', '北京大学自行车协会', '会长', '第一行\n第二行'],
  ['李,四', '13900139000；13700137000', '', '', '', ''],
  ['', '', '', '', '', ''],
]);

assert.equal(table.rows.length, 2);
assert.deepEqual(inferContactColumnMapping(table.headers), {
  name: 0,
  phone: 1,
  email: 2,
  organization: 3,
  title: 4,
  note: 5,
});

const result = convertTableToVcf(table.rows, inferContactColumnMapping(table.headers));
assert.equal(result.contactCount, 2);
assert.equal(result.skippedRowCount, 0);
assert.match(result.content, /BEGIN:VCARD\r\nVERSION:3\.0\r\n/);
assert.match(result.content, /FN:张三\r\n/);
assert.match(result.content, /TEL;TYPE=CELL:13800138000\r\n/);
assert.match(result.content, /EMAIL;TYPE=INTERNET:zhang@example\.com\r\n/);
assert.match(result.content, /NOTE:第一行\\n第二行\r\n/);
assert.match(result.content, /FN:李\\,四\r\n/);
assert.equal((result.content.match(/TEL;TYPE=CELL:/g) ?? []).length, 3);
assert.ok(result.content.endsWith('END:VCARD\r\n'));

const fallback = convertTableToVcf([['', '13800138000'], ['', '']], {
  name: 0,
  phone: 1,
  email: null,
  organization: null,
  title: null,
  note: null,
});
assert.equal(fallback.contactCount, 1);
assert.equal(fallback.skippedRowCount, 1);
assert.match(fallback.content, /FN:13800138000/);

assert.throws(() => normalizeContactTable([['姓名', '手机号']]), /没有可转换的数据/);

console.log('table to VCF verification passed');
