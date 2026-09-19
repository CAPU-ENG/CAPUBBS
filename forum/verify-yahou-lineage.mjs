import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildYahouIndex, findYahouMembers, parseYahouLineage, yahouAncestors } from './src/data/yahouLineage.ts';

const data = parseYahouLineage(JSON.parse(await readFile(new URL('./data/yahou-lineage.json', import.meta.url), 'utf8')));
const index = buildYahouIndex(data);
assert.equal(index.members.size, data.nodes.length);
assert.equal([...index.children.get(null)].reduce((total, member) => total + 1 + index.descendants.get(member.id), 0), data.nodes.length);
for (const member of data.nodes) {
  const path = yahouAncestors(index, member.id);
  assert.equal(path.at(-1).id, member.id);
  assert.equal(path[0].parentId, null);
  assert.equal(path.length, index.generations.get(member.id));
  if (index.children.has(member.id)) assert.equal(member.status, 'qualified');
}

const fixture = {
  schemaVersion: 1, revision: 1, root: '实践部',
  nodes: [
    { id: '__proto__', parentId: null, status: 'qualified' },
    { id: '0', parentId: '__proto__', status: 'qualified' },
    { id: '师傅', parentId: '0', status: 'qualified' },
    { id: '徒弟', parentId: '师傅', status: 'pending' },
    { id: 'Alpine', parentId: '__proto__', status: 'passed' },
    { id: 'AL', parentId: '__proto__', status: 'passed' },
  ],
};
const small = buildYahouIndex(parseYahouLineage(fixture));
assert.deepEqual(yahouAncestors(small, '徒弟').map((member) => member.id), ['__proto__', '0', '师傅', '徒弟']);
assert.deepEqual(findYahouMembers(small, ' al ').map((member) => member.id), ['AL', 'Alpine']);
assert.deepEqual(findYahouMembers(small, '不存在'), []);
assert.deepEqual(findYahouMembers(small, '   '), []);
assert.equal(small.descendants.get('__proto__'), 5);
assert.equal(small.descendants.get('师傅'), 1);

function invalid(change, pattern) {
  const value = structuredClone(fixture);
  change(value);
  assert.throws(() => parseYahouLineage(value), pattern);
}
invalid((value) => value.nodes.push(value.nodes[0]), /重复/);
invalid((value) => { value.nodes[3].parentId = '失踪的师傅'; }, /找不到/);
invalid((value) => { value.nodes[0].parentId = '师傅'; }, /循环/);
invalid((value) => { value.nodes[2].status = 'passed'; }, /收徒资格/);
invalid((value) => { value.nodes[3].status = 'unknown'; }, /无效/);
invalid((value) => { value.revision = 0; }, /格式/);
assert.equal(buildYahouIndex(parseYahouLineage({ ...fixture, nodes: [] })).members.size, 0);
console.log(`Yahou lineage verification passed: ${data.nodes.length} members; relationships, ancestry, search, and malformed data.`);
