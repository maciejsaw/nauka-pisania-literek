import test from 'node:test';
import assert from 'node:assert/strict';
import { Billing, purchaseError } from '../src/billing.js';
import { Access } from '../src/access.js';
const free = { entitlements: { active: {} } };
const paid = { entitlements: { active: { full_version: { isActive: true, productIdentifier: 'full_version', verification: 'VERIFIED' } } } };
function fixture() {
  const access = new Access();
  const sdk = {
    configure: async () => {}, addCustomerInfoUpdateListener: async listener => { sdk.listener = listener; },
    getCustomerInfo: async () => ({ customerInfo: free }),
    getProducts: async () => ({ products: [{ identifier: 'full_version', priceString: '4,99 zł' }] }),
    purchaseStoreProduct: async () => ({ customerInfo: paid }),
    restorePurchases: async () => ({ customerInfo: paid }),
  };
  return { sdk, access, billing: new Billing(sdk, access) };
}
test('localized product price, purchase, restore and live revocation', async () => {
  const { sdk, access, billing } = fixture();
  await billing.initialize({});
  assert.equal((await billing.loadProduct()).priceString, '4,99 zł');
  assert.equal(await billing.purchase(), true);
  sdk.listener(free); assert.equal(access.full, false);
  assert.equal(await billing.restore(), true);
});
test('cancelled and pending purchases do not unlock, and allow another attempt', async () => {
  for (const code of ['1','20']) {
    const { sdk, access, billing } = fixture();
    await billing.initialize({}); await billing.loadProduct();
    sdk.purchaseStoreProduct = async () => { throw { code }; };
    await assert.rejects(() => billing.purchase());
    assert.equal(access.full, false); assert.equal(billing.busy, false);
    assert.ok(purchaseError({ code }).includes(code === '1' ? 'anulowany' : 'zatwierdzenie'));
  }
});
test('offline refresh retains a previously verified cached entitlement; fresh installs stay free', async () => {
  const { sdk, access, billing } = fixture();
  sdk.getCustomerInfo = async () => ({ customerInfo: paid });
  await billing.initialize({}); assert.equal(access.full, true);
  sdk.getCustomerInfo = async () => { throw new Error('offline'); };
  await billing.refresh(); assert.equal(access.full, true);
  const fresh = fixture(); fresh.sdk.getCustomerInfo = sdk.getCustomerInfo;
  await fresh.billing.initialize({}); assert.equal(fresh.access.full, false);
});
test('duplicate purchase is blocked while awaiting store response', async () => {
  const { sdk, billing } = fixture();
  await billing.initialize({}); await billing.loadProduct();
  let resolve;
  sdk.purchaseStoreProduct = () => new Promise(r => { resolve = r; });
  const first = billing.purchase();
  await assert.rejects(() => billing.purchase(), /unavailable/);
  resolve({ customerInfo: paid }); assert.equal(await first, true);
});
test('no product and unconfigured SDK never start a transaction', async () => {
  const { sdk, billing } = fixture();
  await assert.rejects(() => billing.purchase());
  await assert.rejects(() => billing.restore());
  await billing.initialize({}); sdk.getProducts = async () => ({ products: [] });
  assert.equal(await billing.loadProduct(), undefined);
  await assert.rejects(() => billing.purchase());
});
