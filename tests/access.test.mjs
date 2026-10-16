import test from 'node:test';
import assert from 'node:assert/strict';
import { Access, hasFullVersion } from '../src/access.js';
import { LETTERS } from '../src/letters.js';
const customer = (active = true, verification = 'VERIFIED') => ({ entitlements: { verification, active: active ? { full_version: { isActive: true, productIdentifier: 'full_version', verification } } : {} } });
test('the first seven letters in their available cases are free; all digits require purchase', () => {
  const access = new Access();
  const free = Object.keys(LETTERS).filter(ch => access.canPlay(ch));
  assert.deepEqual(free.sort(), ['a','ą','b','c','ć','d','e','A','B','C','Ć','D','E'].sort());
});
test('a confirmed purchase unlocks everything; an authoritative revocation relocks', () => {
  const access = new Access(); let changes = 0;
  access.addEventListener('change', () => changes++);
  access.update(customer());
  assert.ok(Object.keys(LETTERS).every(ch => access.canPlay(ch)));
  access.update(customer()); assert.equal(changes, 1);
  access.update(customer(false)); assert.equal(access.canPlay('ę'), false); assert.equal(changes, 2);
});
test('failed verification, wrong product, or malformed state never grants access', () => {
  assert.equal(hasFullVersion(customer(true, 'FAILED')), false);
  assert.equal(hasFullVersion({ entitlements: { active: { full_version: { isActive: true, productIdentifier: 'other' } } } }), false);
  for (const value of [undefined, {}, { full: true }, { paid: true }]) assert.equal(hasFullVersion(value), false);
});
test('removed capitals cannot be played, including after a purchase', () => {
  const access = new Access();
  access.update(customer());
  for (const ch of ['Ą', 'Ę']) {
    assert.equal(Object.hasOwn(LETTERS, ch), false);
    assert.equal(access.canPlay(ch), false);
  }
  assert.equal(Object.keys(LETTERS).length, 72);
});
