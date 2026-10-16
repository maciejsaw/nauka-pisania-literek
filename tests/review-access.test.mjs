import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { ReviewAccess } from '../src/review-access.js';
import { Access } from '../src/access.js';
import { Billing } from '../src/billing.js';
const code = randomBytes(20).toString('hex').toUpperCase();
const hash = createHash('sha256').update(code).digest('hex');
const free = { entitlements: { active: {} } };
function fixture(enabled = true) {
  const storage = { value: null, get: async () => storage.value, set: async value => { storage.value = value; }, remove: async () => { storage.value = null; } };
  const review = new ReviewAccess({ enabled, hash, storage });
  return { review, storage, access: new Access(review) };
}
test('only a valid code unlocks; credential is revalidated offline on restart', async () => {
  const { review, storage, access } = fixture();
  for (const invalid of ['', 'true', hash, '0'.repeat(40), null, 'X'.repeat(1000)]) {
    assert.equal(await review.activate(invalid), false);
    assert.equal(access.canPlay('ę'), false);
  }
  assert.equal(await review.activate(code.toLowerCase().match(/.{1,5}/g).join('-')), true);
  assert.equal(access.canPlay('ę'), true);
  assert.equal(access.paid, false);
  const restarted = new ReviewAccess({ enabled: true, hash, storage });
  await restarted.initialize(); assert.equal(restarted.active, true);
  await review.deactivate(); assert.equal(access.full, false);
  for (const invalidCache of ['true', hash, '{"active":true}']) {
    storage.value = invalidCache;
    await restarted.initialize(); assert.equal(restarted.active, false);
  }
});
test('disabled platforms and failed storage never grant review access', async () => {
  const disabled = fixture(false);
  assert.equal(await disabled.review.activate(code), false);
  const { review, storage, access } = fixture();
  storage.set = async () => { throw new Error('disk full'); };
  await assert.rejects(() => review.activate(code)); assert.equal(access.full, false);
});
test('review access is separate from paid purchases, restore and refunds', async () => {
  const { review, access } = fixture();
  await review.activate(code);
  const sdk = { configure: async () => {}, addCustomerInfoUpdateListener: async () => {}, getCustomerInfo: async () => ({ customerInfo: free }), restorePurchases: async () => ({ customerInfo: free }) };
  const billing = new Billing(sdk, access);
  await billing.initialize({});
  assert.equal(await billing.restore(), false);
  assert.equal(access.full, true); assert.equal(access.paid, false);
  access.update({ entitlements: { active: { full_version: { isActive: true, productIdentifier: 'full_version' } } } });
  await review.deactivate(); assert.equal(access.paid, true); assert.equal(access.full, true);
  access.update(free); assert.equal(access.full, false);
});
test('the release verifier never accepts the public E2E credential', () => {
  const config = JSON.parse(readFileSync(new URL('../review-access-config.json', import.meta.url)));
  assert.match(config.sha256, /^[a-f0-9]{64}$/);
  assert.notEqual(config.sha256, createHash('sha256').update('0123456789ABCDEF0123456789ABCDEF01234567').digest('hex'));
});
