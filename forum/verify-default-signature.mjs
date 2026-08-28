import assert from 'node:assert/strict';
import {
  DEFAULT_SIGNATURE_STORAGE_KEY_PREFIX,
  normalizeSignatureIndex,
  readDefaultSignatureIndex,
  saveDefaultSignatureIndex,
} from './src/utils/defaultSignature.ts';

assert.equal(normalizeSignatureIndex('0'), 0);
assert.equal(normalizeSignatureIndex('3'), 3);
assert.equal(normalizeSignatureIndex('-1'), 0);
assert.equal(normalizeSignatureIndex('4'), 0);
assert.equal(normalizeSignatureIndex('1.5'), 0);
assert.equal(normalizeSignatureIndex('invalid'), 0);

const values = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  },
};

assert.equal(readDefaultSignatureIndex('alice'), 0);
assert.equal(saveDefaultSignatureIndex(2, 'alice'), true);
assert.equal(readDefaultSignatureIndex('alice'), 2);
assert.equal(readDefaultSignatureIndex('bob'), 0);
assert.equal(values.get(`${DEFAULT_SIGNATURE_STORAGE_KEY_PREFIX}alice`), '2');
assert.equal(saveDefaultSignatureIndex(4, 'alice'), false);
assert.equal(readDefaultSignatureIndex('alice'), 2);
assert.equal(saveDefaultSignatureIndex(1, ''), false);

console.log('default signature verification passed');
