import test from 'node:test';
import assert from 'node:assert/strict';
import { redemptionURL, StoreCodes } from '../src/store-codes.js';
import { Billing } from '../src/billing.js';
import { Access } from '../src/access.js';
const free = { entitlements: { active: {} } };
const full = { entitlements: { active: { full_version: { isActive: true, productIdentifier: 'full_version' } } } };

test('redemption URLs use only official stores and reject malformed codes', () => {
  assert.equal(redemptionURL('ios', ' przyjaciel '), 'https://apps.apple.com/redeem?ctx=offercodes&id=6823056260&code=PRZYJACIEL');
  assert.equal(redemptionURL('android', 'ab12-cd34'), 'https://play.google.com/redeem?code=AB12CD34');
  for (const code of ['', 'a', 'X'.repeat(65), 'abc&redirect=evil', 'https://elsewhere.example']) assert.throws(() => redemptionURL('ios', code));
  assert.throws(() => redemptionURL('web', 'EXAMPLE'));
});

test('opening or cancelling the store never grants access; only a verified entitlement does', async () => {
  const access = new Access();
  let info = free, syncs = 0, opened = 0;
  const sdk = { configure: async () => {}, addCustomerInfoUpdateListener: async () => {},
    syncPurchases: async () => { syncs++; }, invalidateCustomerInfoCache: async () => {}, getCustomerInfo: async () => ({ customerInfo: info }) };
  const billing = new Billing(sdk, access);
  const codes = new StoreCodes('android', { openUrl: async () => { opened++; return { completed: true }; } }, billing);
  await assert.rejects(() => codes.open('EXAMPLE'));
  assert.equal(opened, 0);
  await billing.initialize({});
  await codes.open('EXAMPLE');
  assert.equal(codes.pending, true); assert.equal(access.full, false);
  assert.equal(await codes.check(), false); assert.equal(access.full, false);
  await codes.open('EXAMPLE');
  info = full;
  assert.equal(await codes.check(), true); assert.equal(access.full, true);
  assert.equal(codes.pending, false); assert.equal(syncs, 2);
});

test('failed opening and offline checks allow retry without inventing access', async () => {
  let succeed = false;
  const codes = new StoreCodes('ios', { openUrl: async () => ({ completed: succeed }) },
    { configured: true, syncStoreCode: async () => { if (!succeed) throw new Error('offline'); return false; } });
  await assert.rejects(() => codes.open('EXAMPLE'));
  assert.equal(codes.busy, false); assert.equal(codes.pending, false);
  succeed = true; await codes.open('EXAMPLE');
  succeed = false; await assert.rejects(() => codes.check());
  assert.equal(codes.busy, false); assert.equal(codes.pending, true);
  succeed = true; assert.equal(await codes.check(), false);
});
