import test from 'node:test';
import assert from 'node:assert/strict';
import { Access, hasFullVersion } from '../src/access.js';
import { LETTERS } from '../src/letters.js';
const customer = (active = true, verification = 'VERIFIED') => ({ entitlements: { verification, active: active ? { full_version: { isActive: true, productIdentifier: 'full_version', verification } } : {} } });
test('exactly the first seven letter pairs are free; all digits require purchase', () => {
  const access = new Access();
  const free = Object.keys(LETTERS).filter(ch => access.canPlay(ch));
  assert.deepEqual(free.sort(), ['a','ą','b','c','ć','d','e','A','Ą','B','C','Ć','D','E'].sort());
});
test('a confirmed purchase unlocks everything; an authoritative revocation relocks', () => {
  const access = new Access(); let changes = 0;
  access.addEventListener('change', () => changes++);
  access.update(customer());
  assert.ok(Object.keys(LETTERS).every(ch => access.canPlay(ch)));
  access.update(customer()); assert.equal(changes, 1);
  access.update(customer(false)); assert.equal(access.canPlay('Ę'), false); assert.equal(changes, 2);
});
test('failed verification, wrong product, or malformed state never grants access', () => {
  assert.equal(hasFullVersion(customer(true, 'FAILED')), false);
  assert.equal(hasFullVersion({ entitlements: { active: { full_version: { isActive: true, productIdentifier: 'other' } } } }), false);
  for (const value of [undefined, {}, { full: true }, { paid: true }]) assert.equal(hasFullVersion(value), false);
});
test('capital Ą tail starts on the A stroke', () => {
  const main = LETTERS['Ą'][0].d;
  const tail = LETTERS['Ą'][2].d;
  assert.ok(main.includes('L 121 191.4 L 141.9 188.5'));
  assert.ok(tail.startsWith(`M ${(121 + 141.9) / 2} ${(191.4 + 188.5) / 2} `));
});
