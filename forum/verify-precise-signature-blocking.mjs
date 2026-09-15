import assert from 'node:assert/strict';
import {
  BLOCKED_SIGNATURES_STORAGE_KEY,
  getSignatureBlockKey,
  parseBlockedSignatures,
  readBlockedSignaturesSnapshot,
  saveSignatureBlocked,
  subscribeBlockedSignatures,
} from './src/utils/preciseSignatureBlocking.ts';

const values = new Map();
const events = new EventTarget();
globalThis.window = {
  localStorage: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  },
  addEventListener: events.addEventListener.bind(events),
  removeEventListener: events.removeEventListener.bind(events),
  dispatchEvent: events.dispatchEvent.bind(events),
};
const floor = { author: { name: 'alice' }, signatureIndex: 1, signatureHtml: '<script>play()</script>' };
const key = getSignatureBlockKey(floor);
const read = () => parseBlockedSignatures(readBlockedSignaturesSnapshot());
let updates = 0;
const unsubscribe = subscribeBlockedSignatures(() => { updates += 1; });
assert.equal(saveSignatureBlocked(key, true), true);
assert.equal(updates, 1);
assert.equal(read().has(getSignatureBlockKey({ ...floor, id: 'another-thread', floor: 22 })), true);
assert.equal(read().has(getSignatureBlockKey({ ...floor, signatureHtml: '<style>p{color:red}</style>new' })), true);
assert.equal(read().has(getSignatureBlockKey({ ...floor, signatureIndex: 2 })), false);
assert.equal(read().has(getSignatureBlockKey({ ...floor, author: { name: 'bob' } })), false);
const bob = getSignatureBlockKey({ ...floor, author: { name: 'bob' } });
assert.equal(saveSignatureBlocked(bob, true), true);
assert.equal(saveSignatureBlocked(key, false), true);
assert.equal(read().has(key), false);
assert.equal(read().has(bob), true);
assert.equal(getSignatureBlockKey(undefined), null);
assert.equal(getSignatureBlockKey({ ...floor, signatureIndex: 0 }), null);
assert.equal(getSignatureBlockKey({ ...floor, signatureHtml: '' }), null);
for (const value of ['invalid', '{}', 'null', '[null,1]']) {
  values.set(BLOCKED_SIGNATURES_STORAGE_KEY, value);
  assert.equal(read().size, 0);
}
const beforeStorage = updates;
const storageEvent = new Event('storage');
Object.assign(storageEvent, { key: BLOCKED_SIGNATURES_STORAGE_KEY });
events.dispatchEvent(storageEvent);
assert.equal(updates, beforeStorage + 1);
unsubscribe();
events.dispatchEvent(storageEvent);
assert.equal(updates, beforeStorage + 1);
window.localStorage.setItem = () => { throw new Error('storage unavailable'); };
assert.equal(saveSignatureBlocked(key, true), false);
assert.equal(read().has(key), false);
console.log('precise signature blocking verification passed');
