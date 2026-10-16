import { test, expect } from './fixtures.js';
import { storeDevice } from './store-device.js';
import { openExercise, writeLetter } from './handwriting.js';
test.use({ hasTouch: true });
const beta = !!process.env.RELEASE_TAG?.includes('-beta.');

for (const platform of ['ios', 'android']) {
  test(`${platform}: rating is optional, parent-gated and never unlocks paid letters`, async ({ page }, testInfo) => {
    await storeDevice(page, platform);
    await page.goto('/');
    await expect(page.locator('.tile.locked')).toHaveCount(60);
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    expect(await page.evaluate(() => window.storeTest.urls)).toEqual([]);
    await page.locator('#settingsBtn').tap();
    await expect(page.locator('#rateAppBtn svg')).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('settings-rating.png') });
    await page.getByRole('button', { name: 'Oceń aplikację', exact: true }).tap();
    await expect(page.locator('#parentReason')).toContainText('Dodanie oceny');
    await page.locator('#parentAnswer').fill(String(new Date().getFullYear() - 7));
    await page.locator('#parentForm button').tap();
    await expect(page.locator('#parentError')).toContainText('osoby dorosłej');
    expect(await page.evaluate(() => window.storeTest.urls)).toEqual([]);
    await page.locator('#parentCancel').tap();
    await expect(page.locator('#ratingDialog')).toBeHidden();
    await page.locator('#rateAppBtn').tap();
    await page.locator('#parentAnswer').fill('1985');
    await page.locator('#parentForm button').tap();
    if (beta) {
      await expect(page.locator('#ratingStatus')).toContainText('To wersja testowa');
      expect(await page.evaluate(() => window.storeTest.urls)).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath('beta-rating.png') });
      await page.locator('#ratingDone').tap();
    } else {
      await expect.poll(() => page.evaluate(() => window.storeTest.urls)).toEqual([
        platform === 'ios' ? 'https://apps.apple.com/app/id6823056260?action=write-review'
          : 'https://play.google.com/store/apps/details?id=com.maciejsawicki.pajaczek',
      ]);
    }
    await expect(page.locator('#ratingDialog')).toBeHidden();
    await expect(page.locator('#parentAnswer')).toHaveValue('');
    await expect(page.locator('#rateAppBtn')).toBeEnabled();
    await expect(page.locator('.tile.locked')).toHaveCount(60);
  });
}
test('failed store launch has a retry and does not leave settings stuck', async ({ page }) => {
  test.skip(beta, 'Beta intentionally stays in the app.');
  await storeDevice(page, 'ios'); await page.goto('/');
  await page.evaluate(() => { window.storeTest.failOpen = true; });
  await page.locator('#settingsBtn').tap(); await page.locator('#rateAppBtn').tap();
  await page.locator('#parentAnswer').fill('1985'); await page.locator('#parentForm button').tap();
  await expect(page.locator('#ratingStatus')).toContainText('Nie udało się otworzyć App Store');
  await expect(page.locator('#ratingSpinner')).toBeHidden();
  await page.evaluate(() => { window.storeTest.failOpen = false; });
  await page.locator('#ratingRetry').tap();
  await expect(page.locator('#ratingDialog')).toBeHidden();
  await expect(page.locator('#rateAppBtn')).toBeEnabled();
  expect(await page.evaluate(() => window.storeTest.urls.length)).toBe(2);
});
test('high-five and badge never interrupt the child with a rating request', async ({ page }) => {
  await storeDevice(page, 'ios');
  await openExercise(page, 'c', 10);
  await page.clock.runFor(3050);
  await writeLetter(page, 'c', { race: true, scale: 0.25, tick: 2 });
  await page.clock.runFor(1200);
  await page.locator('#hifive').tap(); await page.clock.runFor(1500);
  await expect(page.locator('#badge')).toBeVisible();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  expect(await page.evaluate(() => window.storeTest.urls)).toEqual([]);
});
test('web demo hides store ratings', async ({ page }) => {
  await page.goto('/'); await page.locator('#settingsBtn').tap();
  await expect(page.locator('#rateAppBtn')).toBeHidden();
});
