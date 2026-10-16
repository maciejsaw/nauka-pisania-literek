import { test, expect } from './fixtures.js';
const TEST_CODE = '0123456789ABCDEF0123456789ABCDEF01234567';
async function nativeDevice(page, platform) {
  await page.addInitScript(platform => {
    if (platform === 'android') window.androidBridge = {};
    else window.webkit = { messageHandlers: { bridge: {} } };
    const definitions = { Preferences: ['get', 'set', 'remove'], App: ['addListener', 'removeListener'], Purchases: ['configure', 'addCustomerInfoUpdateListener', 'getCustomerInfo', 'getProducts', 'restorePurchases'] };
    window.Capacitor = {
      PluginHeaders: Object.entries(definitions).map(([name, methods]) => ({ name, methods: methods.map(name => ({ name, rtype: name === 'addListener' || name === 'addCustomerInfoUpdateListener' ? 'callback' : 'promise' })) })),
      nativeCallback: () => 'test-listener',
      nativePromise: async (plugin, method, args) => {
        if (plugin === 'Preferences') {
          const key = `native-test-${args.key}`;
          if (method === 'get') return { value: localStorage.getItem(key) };
          if (method === 'set') localStorage.setItem(key, args.value);
          if (method === 'remove') localStorage.removeItem(key);
          return {};
        }
        if (plugin === 'Purchases' && (method === 'getCustomerInfo' || method === 'restorePurchases')) return { customerInfo: { entitlements: { active: {} } } };
        if (plugin === 'Purchases' && method === 'getProducts') return { products: [{ identifier: 'full_version', priceString: '4,99 zł' }] };
        return {};
      },
    };
  }, platform);
}
async function openCode(page) {
  await page.getByRole('button', { name: 'Ustawienia', exact: true }).click();
  await page.getByRole('button', { name: 'Dostęp kodem', exact: true }).click();
  await expect(page.locator('#reviewAccessDialog')).toBeHidden();
  await page.getByLabel('Rok urodzenia rodzica', { exact: true }).fill('1985');
  await page.locator('#parentForm button').click();
  await expect(page.locator('#reviewAccessDialog')).toBeVisible();
}
test('Android code access: parent gate, invalid code, all letters, restart and disable', async ({ page }) => {
  await nativeDevice(page, 'android');
  await page.goto('/');
  await expect(page.locator('.tile.locked')).toHaveCount(60);
  await openCode(page);
  await page.locator('#reviewAccessCode').fill('WRONG');
  await page.getByRole('button', { name: 'Odblokuj kodem', exact: true }).click();
  await expect(page.locator('#reviewAccessStatus')).toContainText('nie pasuje');
  await expect(page.locator('.tile.locked')).toHaveCount(60);
  await page.locator('#reviewAccessCode').fill(TEST_CODE);
  await page.getByRole('button', { name: 'Odblokuj kodem', exact: true }).click();
  await expect(page.locator('#reviewAccessStatus')).toContainText('aktywny');
  await expect(page.locator('.tile.locked')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.tile.locked')).toHaveCount(0);
  await page.getByRole('button', { name: 'wielka literka Ę', exact: true }).click();
  await expect(page.locator('#game')).toBeVisible();
  await page.getByRole('button', { name: 'Wróć do wszystkich literek', exact: true }).click();
  await openCode(page);
  await page.getByRole('button', { name: 'Wyłącz dostęp kodem', exact: true }).click();
  await expect(page.locator('.tile.locked')).toHaveCount(60);
  await page.reload();
  await expect(page.locator('.tile.locked')).toHaveCount(60);
});
for (const platform of ['web', 'ios']) {
  test(`code access is unavailable on ${platform}`, async ({ page }) => {
    if (platform === 'ios') await nativeDevice(page, platform);
    await page.goto('/');
    await page.getByRole('button', { name: 'Ustawienia', exact: true }).click();
    await expect(page.locator('#reviewAccessBtn')).toBeHidden();
    await expect(page.locator('.tile.locked')).toHaveCount(60);
  });
}
