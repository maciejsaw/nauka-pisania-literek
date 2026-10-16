import { test, expect } from './fixtures.js';
import { billingDevice } from './billing-device.js';
import { openExercise, writeLetter } from './handwriting.js';

for (const digit of ['5', '6']) {
  test(`${digit}: updated model can be traced and written independently`, async ({ page }, testInfo) => {
    await billingDevice(page, { paid: true });
    await openExercise(page, digit);
    for (let level = 0; level < 2; level++) {
      await writeLetter(page, digit);
      await page.clock.runFor(2600);
      await expect(page.locator('#result')).toBeVisible();
      await expect(page.locator('#nextBtn')).toBeVisible();
      expect(parseInt(await page.locator('#resAcc').textContent(), 10)).toBeGreaterThan(75);
      if (level === 0) {
        await page.screenshot({ path: testInfo.outputPath(`digit-${digit}.png`) });
        await page.locator('#cmpA').screenshot({ path: testInfo.outputPath(`model-${digit}.png`) });
        await page.locator('#nextBtn').click();
      }
    }
  });
}

test('ą and ę occupy the left half of a full-width group, including with old saved capitals', async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('pajak-dwulinia-v3', JSON.stringify({ prog: { 'Ą': 5, 'Ę': 11 }, badges: { 'Ę': true } })));
  await page.goto('/');
  await expect(page.locator('.tile')).toHaveCount(72);
  await expect(page.locator('.tile[data-ch="Ą"], .tile[data-ch="Ę"]')).toHaveCount(0);
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const ch of ['ą', 'ę']) {
      const tile = page.locator(`.tile[data-ch="${ch}"]`);
      const group = page.locator('.pair').filter({ has: tile });
      await expect(group.locator('button')).toHaveCount(1);
      await expect(group.locator('.tile-spacer')).toHaveAttribute('aria-hidden', 'true');
      const [outer, left, right, regular] = await Promise.all([
        group.boundingBox(), tile.boundingBox(), group.locator('.tile-spacer').boundingBox(), page.locator('.pair').first().boundingBox(),
      ]);
      expect(Math.abs(outer.width - regular.width)).toBeLessThan(1);
      expect(Math.abs(left.x - outer.x)).toBeLessThan(1);
      expect(Math.abs(left.width - outer.width / 2)).toBeLessThan(1);
      expect(Math.abs(right.x - left.x - left.width)).toBeLessThan(1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath('menu-single-letters.png') });
  await page.getByRole('button', { name: 'mała literka ą', exact: true }).click();
  await expect(page.locator('#game')).toBeVisible();
  await page.locator('#backBtn').click();
  await page.getByRole('button', { name: 'mała literka ę, pełna wersja', exact: true }).click();
  await expect(page.locator('#paywallDialog')).toBeVisible();
});
