import { test, expect } from './fixtures.js';
import { billingDevice } from './billing-device.js';
import { openExercise, writeLetter } from './handwriting.js';

for (const digit of ['5', '6', 's', 'ś']) {
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

test('ą and ę are centered on full-width guidelines, including with old saved capitals', async ({ page }, testInfo) => {
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
      const [outer, button, regular] = await Promise.all([
        group.boundingBox(), tile.boundingBox(), page.locator('.pair').first().boundingBox(),
      ]);
      expect(Math.abs(outer.width - regular.width)).toBeLessThan(1);
      expect(Math.abs(button.x - outer.x)).toBeLessThan(1);
      expect(Math.abs(button.width - outer.width)).toBeLessThan(1);
      const sheet = tile.locator('svg.sheet');
      const paper = await sheet.boundingBox();
      const standardSheet = page.locator('.pair').first().locator('svg.sheet').first();
      const standardPaper = await standardSheet.boundingBox();
      expect(Math.abs(paper.width - outer.width)).toBeLessThan(1);
      expect(Math.abs(paper.height - standardPaper.height)).toBeLessThan(1);
      const letterBounds = await sheet.locator('path').evaluateAll(paths => {
        const bounds = paths.map(path => path.getBoundingClientRect());
        return { left: Math.min(...bounds.map(b => b.left)), right: Math.max(...bounds.map(b => b.right)) };
      });
      expect(Math.abs((letterBounds.left + letterBounds.right) / 2 - outer.x - outer.width / 2)).toBeLessThan(1);
      await expect(sheet.locator('line')).toHaveCount(4);
      for (let line = 0; line < 4; line++) {
        const a = standardSheet.locator('line').nth(line), b = sheet.locator('line').nth(line);
        for (const attribute of ['y1', 'y2', 'stroke', 'stroke-width']) {
          await expect(b).toHaveAttribute(attribute, await a.getAttribute(attribute));
        }
      }
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

// An independently drawn six, deliberately not read from LETTERS. Its final
// curve closes downward, with a slightly different contour from the model.
const handwrittenSix = [{ d: 'M 87 6 C 26 6 6 55 6 132 C 6 171 24 194 50 194 C 78 194 95 170 95 138 C 95 107 76 82 52 82 C 26 82 6 103 6 132' }];

for (const level of [0, 1, 4]) {
  test(`6: a handwritten downward closure passes level ${level}`, async ({ page }) => {
    await billingDevice(page, { paid: true });
    await openExercise(page, '6', level);
    await writeLetter(page, '6', { inputStrokes: handwrittenSix });
    await page.clock.runFor(2600);
    await expect(page.locator('#result')).toBeVisible();
    await expect(page.locator('#nextBtn')).toBeVisible();
    expect(parseInt(await page.locator('#resAcc').textContent(), 10)).toBeGreaterThan(75);
  });
}
