import assert from 'node:assert/strict';
import {
  convertTableToVcf,
  getVCardDisplayName,
  normalizeContactTable,
} from './src/utils/tableToVcf.ts';

const table = normalizeContactTable([
  ['ID', '姓名', '职务', '电话'],
  [20260001, '张三', '领队', 13800138000],
  ['member-02', '李,四', '摄影', '13900139000；13700137000'],
  ['', '', '', ''],
]);

assert.deepEqual(table.rows, [
  { id: '20260001', name: '张三', role: '领队', phone: '13800138000' },
  { id: 'member-02', name: '李,四', role: '摄影', phone: '13900139000；13700137000' },
]);
assert.equal(getVCardDisplayName(table.rows[0]), '20260001｜张三｜领队');

const result = convertTableToVcf(table.rows);
assert.equal(result.contactCount, 2);
assert.match(result.content, /BEGIN:VCARD\r\nVERSION:3\.0\r\n/);
assert.match(result.content, /FN:20260001｜张三｜领队\r\n/);
assert.match(result.content, /TEL;TYPE=CELL:13800138000\r\n/);
assert.match(result.content, /FN:member-02｜李\\,四｜摄影\r\n/);
assert.equal((result.content.match(/TEL;TYPE=CELL:/g) ?? []).length, 3);
assert.ok(result.content.endsWith('END:VCARD\r\n'));

assert.throws(
  () => normalizeContactTable([['姓名', 'ID', '职务', '电话'], ['张三', '20260001', '领队', '13800138000']]),
  /表头应依次为 ID、姓名、职务、电话/,
);
assert.throws(
  () => normalizeContactTable([['ID', '姓名', '职务', '电话'], ['', '', '', ''], ['20260001', '张三', '', '13800138000']]),
  /第 3 行缺少职务/,
);
assert.throws(() => normalizeContactTable([['ID', '姓名', '职务', '电话']]), /没有可转换的数据/);

console.log('table to VCF verification passed');
