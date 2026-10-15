import { test, expect } from './fixtures.js';
test.use({ hasTouch: true });

async function device(page, platform, paid = false) {
  await page.addInitScript(({ platform, paid }) => {
    if (platform === 'android') window.androidBridge = {};
    else window.webkit = { messageHandlers: { bridge: {} } };
    window.storeTest = { paid, urls: [], listeners: {}, failOpen: false, offline: false };
    const definitions = { Preferences: ['get', 'set', 'remove'], App: ['addListener', 'removeListener'],
      AppLauncher: ['openUrl'], Purchases: ['configure', 'addCustomerInfoUpdateListener', 'getCustomerInfo', 'getProducts', 'syncPurchases', 'invalidateCustomerInfoCache'] };
    window.Capacitor = {
      PluginHeaders: Object.entries(definitions).map(([name, methods]) => ({ name, methods: methods.map(name => ({ name, rtype: name === 'addListener' || name === 'addCustomerInfoUpdateListener' ? 'callback' : 'promise' })) })),
      nativeCallback: (plugin, method, args, callback) => {
        if (plugin === 'App') (window.storeTest.listeners[args.eventName] ||= []).push(callback);
        return 'test-listener';
      },
      nativePromise: async (plugin, method, args) => {
        if (plugin === 'Preferences') return { value: null };
        if (plugin === 'AppLauncher') { window.storeTest.urls.push(args.url); return { completed: !window.storeTest.failOpen }; }
        if (plugin === 'Purchases') {
          if (method === 'syncPurchases' && window.storeTest.offline) throw new Error('offline');
          if (method === 'getCustomerInfo') return { customerInfo: { entitlements: { active: window.storeTest.paid ? { full_version: { isActive: true, productIdentifier: 'full_version' } } : {} } } };
          if (method === 'getProducts') return { products: [] };
        }
        return {};
      },
    };
  }, { platform, paid });
}
async function openCodes(page) {
  await page.locator('#settingsBtn').tap();
  await page.getByRole('button', { name: 'Aktywuj kodem', exact: true }).tap();
  await expect(page.locator('#storeCodeDialog')).toBeHidden();
  expect(await page.evaluate(() => window.storeTest.urls)).toEqual([]);
  const numbers = (await page.locator('#parentQuestion').innerText()).match(/\d+/g).map(Number);
  await page.locator('#parentAnswer').fill(String(numbers[0] * numbers[1]));
  await page.locator('#parentForm button').tap();
  await expect(page.locator('#storeCodeDialog')).toBeVisible();
}
for (const platform of ['ios', 'android']) {
  test(`${platform}: parent gate, store code, cancelled redemption and confirmed unlock`, async ({ page }) => {
    await device(page, platform);
    await page.goto('/');
    await expect(page.locator('.tile.locked')).toHaveCount(64);
    await openCodes(page);
    await page.locator('#storeCodeInput').fill('przyjaciel');
    await page.locator('#storeCodeSubmit').tap();
    await expect.poll(() => page.evaluate(() => window.storeTest.urls[0])).toContain(platform === 'ios' ? 'https://apps.apple.com/redeem?' : 'https://play.google.com/redeem?');
    await expect(page.locator('.tile.locked')).toHaveCount(64);
    // Returning without a redemption must not grant anything.
    await page.evaluate(() => window.storeTest.listeners.appStateChange.forEach(fn => fn({ isActive: true })));
    await expect(page.locator('#storeCodeStatus')).toContainText('nie potwierdził');
    await expect(page.locator('.tile.locked')).toHaveCount(64);
    await page.evaluate(() => { window.storeTest.paid = true; });
    await page.locator('#storeCodeCheck').tap();
    await expect(page.locator('#storeCodeStatus')).toContainText('Gotowe!');
    await expect(page.locator('.tile.locked')).toHaveCount(0);
    await expect(page.locator('#redeemCodeBtn')).toBeHidden();
    await page.locator('#storeCodeClose').tap();
    await page.locator('#closeSettingsBtn').tap();
    await page.getByRole('button', { name: 'wielka literka D', exact: true }).tap();
    await expect(page.locator('#game')).toBeVisible();
  });
  test(`${platform}: paid installation hides code activation`, async ({ page }) => {
    await device(page, platform, true);
    await page.goto('/');
    await expect(page.locator('.tile.locked')).toHaveCount(0);
    await page.locator('#settingsBtn').tap();
    await expect(page.locator('#redeemCodeBtn')).toBeHidden();
  });
}
test('offline or failed launch can be retried', async ({ page }) => {
  await device(page, 'ios'); await page.goto('/'); await openCodes(page);
  await page.evaluate(() => { window.storeTest.failOpen = true; });
  await page.locator('#storeCodeInput').fill('EXAMPLE');
  await page.locator('#storeCodeSubmit').tap();
  await expect(page.locator('#storeCodeStatus')).toContainText('Nie udało się otworzyć');
  await expect(page.locator('#storeCodeSubmit')).toBeEnabled();
  await page.evaluate(() => { window.storeTest.offline = true; });
  await page.locator('#storeCodeCheck').tap();
  await expect(page.locator('#storeCodeStatus')).toContainText('Nie udało się sprawdzić');
  await expect(page.locator('.tile.locked')).toHaveCount(64);
});
test('web demo does not offer store code activation', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.tile')).toHaveCount(74);
  await page.locator('#settingsBtn').tap();
  await expect(page.locator('#redeemCodeBtn')).toBeHidden();
});
