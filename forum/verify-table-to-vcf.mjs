import assert from 'node:assert/strict';
import {
  convertTableToVcf,
  getVCardDisplayName,
  normalizeContactTable,
} from './src/utils/tableToVcf.ts';

const table = normalizeContactTable([
  ['ID', '姓名', '职务', '电话'],
  ['example_member_01', '张三', '领队', 13800138000],
  ['', '李,四', '', '13900139000；13700137000'],
  ['', '', '', ''],
]);

assert.deepEqual(table.rows, [
  { name: '张三', role: '领队', phone: '13800138000', username: 'example_member_01' },
  { name: '李,四', role: '', phone: '13900139000；13700137000', username: '' },
]);
assert.equal(getVCardDisplayName(table.rows[0]), 'example_member_01｜张三｜领队');
assert.equal(getVCardDisplayName(table.rows[1]), '李,四');

const result = convertTableToVcf(table.rows);
assert.equal(result.contactCount, 2);
assert.match(result.content, /BEGIN:VCARD\r\nVERSION:3\.0\r\n/);
assert.match(result.content, /FN:example_member_01｜张三｜领队\r\n/);
assert.match(result.content, /TEL;TYPE=CELL:13800138000\r\n/);
assert.match(result.content, /FN:李\\,四\r\n/);
assert.equal((result.content.match(/TEL;TYPE=CELL:/g) ?? []).length, 3);
assert.ok(result.content.endsWith('END:VCARD\r\n'));

const withoutOptionalColumns = normalizeContactTable([
  ['姓名', '电话'],
  ['王五', '13600136000'],
]);
assert.deepEqual(withoutOptionalColumns.rows[0], {
  name: '王五',
  role: '',
  phone: '13600136000',
  username: '',
});
assert.equal(getVCardDisplayName(withoutOptionalColumns.rows[0]), '王五');

const withoutIdColumn = normalizeContactTable([
  ['姓名', '职务', '电话'],
  ['赵六', '后勤', '13500135000'],
]);
assert.equal(getVCardDisplayName(withoutIdColumn.rows[0]), '赵六｜后勤');

const withoutRoleColumn = normalizeContactTable([
  ['ID', '姓名', '电话'],
  ['member-07', '钱七', '13400134000'],
]);
assert.equal(getVCardDisplayName(withoutRoleColumn.rows[0]), 'member-07｜钱七');

assert.throws(
  () => normalizeContactTable([['姓名', 'ID', '职务', '电话'], ['张三', 'example_member_01', '领队', '13800138000']]),
  /表头顺序应为 ID、姓名、职务、电话，ID 和职务可省略/,
);
assert.throws(
  () => normalizeContactTable([['ID', '姓名', '职务', '电话'], ['', '', '', ''], ['example_member_01', '', '', '13800138000']]),
  /第 3 行缺少姓名/,
);
assert.throws(
  () => normalizeContactTable([['ID', '姓名', '职务'], ['example_member_01', '张三', '领队']]),
  /表格必须包含姓名和电话列/,
);
assert.throws(() => normalizeContactTable([['ID', '姓名', '职务', '电话']]), /没有可转换的数据/);

console.log('table to VCF verification passed');
