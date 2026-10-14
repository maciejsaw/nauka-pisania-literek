import { test, expect } from './fixtures.js';
import { openExercise, writeLetter, PROGRESS_KEY } from './handwriting.js';

async function expectSuccess(page) {
  await expect(page.locator('#result')).toBeVisible();
  await expect(page.locator('#resTitle')).toHaveText(/Mistrzowsko!|Super!|Brawo!|Wygrana z pająkiem!/);
  await expect(page.locator('#resAcc')).toHaveText(/\d+%/);
  expect(parseInt(await page.locator('#resAcc').textContent(), 10)).toBeGreaterThan(75);
  await expect(page.locator('#nextBtn')).toBeVisible();
  await expect(page.locator('#nextBtn')).toBeFocused();
  // The result includes the drawn example and the child's actual handwriting.
  for (const id of ['cmpA', 'cmpB', 'cmpMain']) {
    expect(await page.locator(`#${id}`).evaluate(canvas => canvas.width > 0 && canvas.height > 0)).toBe(true);
  }
}

test('write a letter with the spider, continue without it and keep progress after reload', async ({ page }) => {
  await openExercise(page, 'c');
  await writeLetter(page, 'c');
  await page.clock.runFor(2200);
  await expectSuccess(page);
  await page.locator('#nextBtn').click();
  await expect(page.locator('#result')).toBeHidden();
  await expect(page.locator('#levels .cur')).toHaveAttribute('aria-label', 'Poziom 2: Bez pająka');
  await writeLetter(page, 'c');
  // A complete letter also finishes automatically, without pressing Gotowe.
  await page.clock.runFor(2600);
  await expectSuccess(page);
  await page.locator('#homeBtn').click();
  await expect(page.locator('#menu')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'mała literka c', exact: true }).click();
  await expect(page.locator('#levels .cur')).toHaveAttribute('aria-label', 'Poziom 3: Szybszy pokaz');
});

for (const letter of ['Ą', 'ć']) {
  test(`finish every stroke of ${letter}, including its diacritic`, async ({ page }) => {
    await openExercise(page, letter);
    await writeLetter(page, letter);
    await page.clock.runFor(2200);
    await expectSuccess(page);
  });
}

test('unfinished free writing offers a retry; a completed retry can be submitted', async ({ page }) => {
  await openExercise(page, 'c', 1);
  const box = await page.locator('#cv').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 5, box.y + box.height / 2);
  await page.mouse.up();
  await page.getByRole('button', { name: 'Gotowe', exact: true }).click();
  await page.clock.runFor(1200);
  await expect(page.locator('#result')).toBeVisible();
  await expect(page.locator('#resTitle')).toHaveText('Prawie! Spróbuj jeszcze raz');
  await expect(page.locator('#nextBtn')).toBeHidden();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).prog.c, PROGRESS_KEY)).toBe(1);
  await page.locator('#retryBtn').click();
  await expect(page.locator('#result')).toBeHidden();
  await writeLetter(page, 'c');
  await page.getByRole('button', { name: 'Gotowe', exact: true }).click();
  await page.clock.runFor(1200);
  await expectSuccess(page);
});

test('winning the final race shows the high-five reward and saves the badge', async ({ page }) => {
  await openExercise(page, 'c', 10);
  await page.clock.runFor(3050);
  await writeLetter(page, 'c', { race: true, scale: 0.25, tick: 2 });
  await page.clock.runFor(1200);
  await expect(page.locator('#reward')).toBeVisible();
  await expect(page.locator('#rwMsg')).toHaveText('Przybij piątkę z pająkiem!');
  await page.getByRole('button', { name: 'Przybij piątkę z pająkiem' }).click();
  await page.clock.runFor(1500);
  await expect(page.locator('#badge')).toBeVisible();
  await page.locator('#rwHome').click();
  await expect(page.locator('#menu')).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).badges.c, PROGRESS_KEY)).toBe(true);
});
