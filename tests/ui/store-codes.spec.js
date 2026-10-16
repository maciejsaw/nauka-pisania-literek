import { test, expect } from './fixtures.js';
test.use({ hasTouch: true });

import { storeDevice as device } from './store-device.js';

async function openCodes(page) {
  await page.locator('#settingsBtn').tap();
  await page.getByRole('button', { name: 'Aktywuj kodem', exact: true }).tap();
  await expect(page.locator('#storeCodeDialog')).toBeHidden();
  expect(await page.evaluate(() => window.storeTest.urls)).toEqual([]);
  await page.getByLabel('Rok urodzenia rodzica', { exact: true }).fill('1985');
  await page.locator('#parentForm button').tap();
  await expect(page.locator('#storeCodeDialog')).toBeVisible();
}
for (const platform of ['ios', 'android']) {
  test(`${platform}: parent gate rejects a child year and cancellation never opens the store`, async ({ page }) => {
    await device(page, platform);
    await page.goto('/');
    await page.locator('#settingsBtn').tap();
    await page.locator('#redeemCodeBtn').tap();
    await expect(page.locator('#parentQuestion')).toHaveText('Rok urodzenia rodzica');
    await page.locator('#parentAnswer').fill(String(new Date().getFullYear() - 7));
    await page.locator('#parentForm button').tap();
    await expect(page.locator('#parentError')).toContainText('osoby dorosłej');
    await expect(page.locator('#storeCodeDialog')).toBeHidden();
    expect(await page.evaluate(() => window.storeTest.urls)).toEqual([]);
    await page.locator('#parentCancel').tap();
    await expect(page.locator('#parentGateDialog')).toBeHidden();
    await expect(page.locator('#parentAnswer')).toHaveValue('');
    await expect(page.locator('#storeCodeDialog')).toBeHidden();
    await page.locator('#redeemCodeBtn').tap();
    await expect(page.locator('#parentAnswer')).toHaveValue('');
    await expect(page.locator('#parentError')).toBeEmpty();
    await page.locator('#parentAnswer').fill('1985');
    await page.locator('#parentForm button').tap();
    await expect(page.locator('#storeCodeDialog')).toBeVisible();
    await expect(page.locator('#parentAnswer')).toHaveValue('');
    expect(await page.evaluate(() => window.storeTest.urls)).toEqual([]);
  });
  test(`${platform}: parent gate, store code, cancelled redemption and confirmed unlock`, async ({ page }) => {
    await device(page, platform);
    await page.goto('/');
    await expect(page.locator('.tile.locked')).toHaveCount(59);
    await openCodes(page);
    await page.locator('#storeCodeInput').fill('przyjaciel');
    await page.locator('#storeCodeSubmit').tap();
    await expect.poll(() => page.evaluate(() => window.storeTest.urls[0])).toContain(platform === 'ios' ? 'https://apps.apple.com/redeem?' : 'https://play.google.com/redeem?');
    await expect(page.locator('.tile.locked')).toHaveCount(59);
    // Returning without a redemption must not grant anything.
    await page.evaluate(() => window.storeTest.listeners.appStateChange.forEach(fn => fn({ isActive: true })));
    await expect(page.locator('#storeCodeStatus')).toContainText('nie potwierdził');
    await expect(page.locator('.tile.locked')).toHaveCount(59);
    await page.evaluate(() => { window.storeTest.paid = true; });
    await page.locator('#storeCodeCheck').tap();
    await expect(page.locator('#storeCodeStatus')).toContainText('Gotowe!');
    await expect(page.locator('.tile.locked')).toHaveCount(0);
    await expect(page.locator('#redeemCodeBtn')).toBeHidden();
    await page.locator('#storeCodeClose').tap();
    await page.locator('#closeSettingsBtn').tap();
    await page.getByRole('button', { name: 'mała literka ę', exact: true }).tap();
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
  await expect(page.locator('.tile.locked')).toHaveCount(59);
});
test('web demo does not offer store code activation', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.tile')).toHaveCount(72);
  await page.locator('#settingsBtn').tap();
  await expect(page.locator('#redeemCodeBtn')).toBeHidden();
});
